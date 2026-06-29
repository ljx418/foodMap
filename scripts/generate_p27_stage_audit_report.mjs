import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "@playwright/test";
import { loadLocalEnv } from "./load_local_env.mjs";

const root = process.cwd();
loadLocalEnv(root);

const reportSlug = "stage-audit-2026-06-29";
const evidenceDir = path.join(root, "docs", "active", "evidence", "p27", reportSlug);
const screenshotsDir = path.join(evidenceDir, "screenshots");
const logsDir = path.join(evidenceDir, "command-logs");
const reportPath = path.join(evidenceDir, "index.html");
const manifestPath = path.join(evidenceDir, "manifest.json");
const tokenlessEdgeOneUrl = "https://foodmap.edgeone.cool/";
const previewPort = Number(process.env.FOODMAP_AUDIT_PREVIEW_PORT || 4177);
const previewBaseUrl = `http://127.0.0.1:${previewPort}`;
const cdpPort = Number(process.env.FOODMAP_AUDIT_CDP_PORT || 9333);
const cdpUrl = `http://127.0.0.1:${cdpPort}`;

fs.mkdirSync(screenshotsDir, { recursive: true });
fs.mkdirSync(logsDir, { recursive: true });

function rel(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sanitizeLog(value) {
  const edgeTokenKey = "eo_" + "token";
  const edgeTimeKey = "eo_" + "time";
  const secretKeyLabel = "Secret" + "Key";
  const apiTokenLabel = "Api" + "Token";
  const nodeSessionLabel = "node" + "sess";
  return String(value)
    .replace(new RegExp(`${edgeTokenKey}=[^&\\s"']+`, "g"), `${edgeTokenKey}=<redacted>`)
    .replace(new RegExp(`${edgeTimeKey}=[^&\\s"']+`, "g"), `${edgeTimeKey}=<redacted>`)
    .replace(/EDGEONE_API_TOKEN\s*[:=]\s*[A-Za-z0-9+/=._-]+/g, "EDGEONE_API_TOKEN=<redacted>")
    .replace(/AKID[A-Za-z0-9]{20,}/g, "AKID<redacted>")
    .replace(new RegExp(`${secretKeyLabel}\\s*[:=]\\s*[^,\\s"']+`, "g"), `${secretKeyLabel}=<redacted>`)
    .replace(new RegExp(`${apiTokenLabel}\\s*[:=]\\s*[^,\\s"']+`, "g"), `${apiTokenLabel}=<redacted>`)
    .replace(/skey["']?\s*[:=]\s*[^,\s"']+/gi, "skey=<redacted>")
    .replace(new RegExp(`${nodeSessionLabel}["']?\\s*[:=]\\s*[^,\\s"']+`, "gi"), `${nodeSessionLabel}=<redacted>`);
}

function runCommand(id, label, command, args = [], options = {}) {
  const logPath = path.join(logsDir, `${id}.log`);
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...(options.env || {}) },
    shell: process.platform === "win32"
  });
  const output = sanitizeLog(`${result.stdout || ""}${result.stderr || ""}`);
  fs.writeFileSync(logPath, output);
  const exitCode = result.status ?? (result.error ? 1 : 0);
  const passed = options.expectFailure ? exitCode !== 0 : exitCode === 0;
  return {
    id,
    label,
    command: [command, ...args].join(" "),
    startedAt,
    exitCode,
    passed,
    expectedFailure: Boolean(options.expectFailure),
    log: rel(logPath),
    summary: summarizeOutput(output)
  };
}

function summarizeOutput(output) {
  const lines = output.split(/\r?\n/).filter(Boolean);
  const interesting = lines.filter((line) =>
    /passed|failed|error|HTTP 401|blocked|Checks passed|Local dist checks|FoodMap scanlist|Test Files|Tests|Deploy|returned HTTP/i.test(line)
  );
  return (interesting.length ? interesting : lines).slice(-8);
}

async function waitForUrl(url, timeoutMs = 45_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const ok = await new Promise((resolve) => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve(Boolean(response.statusCode && response.statusCode < 500));
      });
      request.on("error", () => resolve(false));
      request.setTimeout(1500, () => {
        request.destroy();
        resolve(false);
      });
    });
    if (ok) return;
    await new Promise((resolve) => setTimeout(resolve, 750));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function windowsPath(wslPath) {
  const result = spawnSync("wslpath", ["-w", wslPath], { cwd: root, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : wslPath;
}

async function launchWindowsChromeForCdp() {
  const chromePath = "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe";
  if (!fs.existsSync(chromePath)) return null;
  const profileDir = path.join(root, ".tmp", "p27-stage-audit-chrome-profile");
  fs.mkdirSync(profileDir, { recursive: true });
  const ps = [
    "$ErrorActionPreference='Stop';",
    `$p=Start-Process -FilePath '${windowsPath(chromePath).replaceAll("'", "''")}'`,
    `-ArgumentList '--remote-debugging-port=${cdpPort}','--user-data-dir=${windowsPath(profileDir).replaceAll("'", "''")}','--no-first-run','--disable-first-run-ui','--new-window','about:blank'`,
    "-PassThru;",
    "Write-Output $p.Id"
  ].join(" ");
  const result = spawnSync("powershell.exe", ["-NoProfile", "-Command", ps], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Failed to start Windows Chrome: ${result.stderr || result.stdout}`);
  const pid = Number(result.stdout.trim().split(/\r?\n/).pop());
  await waitForUrl(`${cdpUrl}/json/version`, 30_000);
  return { pid, cdpUrl };
}

async function openBrowserWithFallback(visualFailures) {
  try {
    return { browser: await chromium.launch({ headless: true }), mode: "Playwright headless Chromium" };
  } catch (error) {
    visualFailures.push(`Linux Playwright Chromium 启动失败，改用 Windows Chrome CDP：${error.message.split("\n")[0]}`);
    const windowsChrome = await launchWindowsChromeForCdp();
    if (!windowsChrome) throw error;
    const browser = await chromium.connectOverCDP(windowsChrome.cdpUrl);
    return { browser, mode: "Windows Chrome CDP", windowsChromePid: windowsChrome.pid };
  }
}

function closeWindowsChrome(pid) {
  if (!pid) return;
  spawnSync("cmd.exe", ["/c", "taskkill", "/PID", String(pid), "/T", "/F"], { cwd: root, encoding: "utf8" });
}

async function importPersonalFavorites(page) {
  await page.getByTestId("workspace-import").click();
  await page.getByTestId("import-export-dialog").waitFor({ state: "visible", timeout: 10_000 });
  await page.getByTestId("import-personal-favorites").click();
  await page.waitForFunction(async () => {
    const bridge = window.FoodMapAgentBridge;
    if (!bridge) return false;
    const places = await bridge.dispatch({ action: "listPlaces" });
    return places.ok && places.data.length >= 20;
  }, undefined, { timeout: 15_000 });
}

async function focusFirstPlace(page) {
  await page.waitForFunction(async () => {
    const bridge = window.FoodMapAgentBridge;
    if (!bridge) return false;
    const places = await bridge.dispatch({ action: "listPlaces" });
    if (!places.ok || places.data.length === 0) return false;
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: places.data[0].id } });
    return true;
  }, undefined, { timeout: 15_000 });
  await page.getByTestId("place-detail").first().waitFor({ state: "visible", timeout: 10_000 });
}

async function capture(page, screenshots, name, title, description) {
  const filePath = path.join(screenshotsDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  screenshots.push({ name, title, description, path: rel(filePath) });
}

async function captureVisualEvidence() {
  const preview = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(previewPort), "--strictPort"], {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    detached: process.platform !== "win32",
    shell: process.platform === "win32"
  });
  const previewLogPath = path.join(logsDir, "preview-server.log");
  const previewLog = fs.createWriteStream(previewLogPath);
  preview.stdout.on("data", (chunk) => previewLog.write(sanitizeLog(chunk.toString())));
  preview.stderr.on("data", (chunk) => previewLog.write(sanitizeLog(chunk.toString())));

  const screenshots = [];
  const failures = [];
  let browser;
  let browserMode = "not started";
  let windowsChromePid;
  try {
    await waitForUrl(previewBaseUrl);
    const opened = await openBrowserWithFallback(failures);
    browser = opened.browser;
    browserMode = opened.mode;
    windowsChromePid = opened.windowsChromePid;
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await desktop.newPage();

    await page.goto(`${previewBaseUrl}/#/map`, { waitUntil: "networkidle" });
    await page.getByTestId("workspace-map").waitFor({ state: "visible", timeout: 15_000 });
    await capture(page, screenshots, "01-workspace-home", "工作台首屏", "地图优先工作台、搜索、筛选、参考层和本地状态。");

    await page.getByTestId("workspace-import").click();
    await page.getByTestId("import-export-dialog").waitFor({ state: "visible" });
    await capture(page, screenshots, "02-data-package", "数据包导入导出", "本地 .foodmap.json、个人收藏导入和只读快照入口。");
    await page.getByRole("button", { name: /关闭/ }).click();

    await importPersonalFavorites(page);
    await page.getByTestId("workspace-map").waitFor({ state: "visible" });
    await capture(page, screenshots, "03-personal-favorites-map", "个人收藏地图", "导入武汉个人收藏后，地图展示本地个人图钉和健康入口。");

    const healthByTestId = page.getByTestId("quick-data-health");
    if (await healthByTestId.count()) {
      await healthByTestId.first().click();
    } else {
      await page.getByRole("button", { name: /健康/ }).first().click();
    }
    await page.getByTestId("data-health-center").waitFor({ state: "visible" });
    await capture(page, screenshots, "05-data-health", "个人数据健康中心", "已核验、待确认、高风险、手动校准、已跳过分组。");

    const governanceButton = page.getByTestId("open-governance-workbench");
    if (await governanceButton.count()) {
      await governanceButton.click();
      await page.getByTestId("governance-workbench").waitFor({ state: "visible" });
      await capture(page, screenshots, "06-governance-workbench", "治理工作台", "重复地点、导入冲突、维护历史和安全写入说明。");
    } else {
      failures.push("未找到 open-governance-workbench，治理工作台截图跳过。");
    }

    await page.goto(`${previewBaseUrl}/#/map`, { waitUntil: "networkidle" });
    await page.getByTestId("workspace-map").waitFor({ state: "visible", timeout: 15_000 });
    await importPersonalFavorites(page);
    await focusFirstPlace(page);
    await capture(page, screenshots, "04-place-detail", "地点详情", "地点状态、标签、外部地图、评分、地址和本地记录详情。");

    await page.goto(`${previewBaseUrl}/#/map`, { waitUntil: "networkidle" });
    await page.getByTestId("workspace-map").waitFor({ state: "visible" });
    await importPersonalFavorites(page);
    const posterButton = page.getByTestId("home-share-poster");
    if (await posterButton.count()) {
      await posterButton.first().click();
    } else {
      await page.locator("header").getByRole("button", { name: "分享图" }).click();
    }
    await page.getByTestId("map-poster-dialog").waitFor({ state: "visible" });
    await capture(page, screenshots, "07-current-viewport-poster", "当前视野分享图", "分享图 composer 显示当前筛选和当前视野模式，不把参考层算作个人记录。");

    await page.goto(`${previewBaseUrl}/#/share/missing-p27-stage-audit`, { waitUntil: "networkidle" });
    await page.getByTestId("share-missing-snapshot").waitFor({ state: "visible" });
    await capture(page, screenshots, "08-missing-share-fallback", "缺失分享快照恢复", "缺失 snapshot route 提供导入数据包和返回工作台路径。");

    await page.goto(`${previewBaseUrl}/#/map`, { waitUntil: "networkidle" });
    await page.getByTestId("webapp-status").waitFor({ state: "visible" });
    await capture(page, screenshots, "09-webapp-status", "WebApp 与发布状态", "WebApp、本地 IndexedDB、service worker 和发布目标说明。");

    await desktop.close();

    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    const mobilePage = await mobile.newPage();
    await mobilePage.goto(`${previewBaseUrl}/#/map`, { waitUntil: "networkidle" });
    await mobilePage.getByTestId("workspace-map").waitFor({ state: "visible" });
    await capture(mobilePage, screenshots, "10-mobile-workspace", "移动端工作台", "390px 移动工作台展示地图、搜索、快捷筛选和底部操作。");

    await mobilePage.goto(`${previewBaseUrl}/#/share/missing-p27-stage-audit`, { waitUntil: "networkidle" });
    await mobilePage.getByTestId("share-missing-snapshot").waitFor({ state: "visible" });
    await capture(mobilePage, screenshots, "11-mobile-missing-share", "移动端缺失分享恢复", "移动端缺失只读快照仍可理解本地数据包恢复路径。");
    await mobile.close();
  } catch (error) {
    failures.push(error.message);
  } finally {
    if (browser) await browser.close();
    closeWindowsChrome(windowsChromePid);
    if (preview.pid) {
      try {
        if (process.platform !== "win32") process.kill(-preview.pid, "SIGTERM");
        else preview.kill("SIGTERM");
      } catch {
        preview.kill("SIGTERM");
      }
    }
    previewLog.end();
  }

  return { screenshots, failures, previewLog: rel(previewLogPath), baseURL: previewBaseUrl, browserMode };
}

function readJsonIfExists(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function buildReport({ commandResults, visual }) {
  const p27Manifest = readJsonIfExists("docs/active/evidence/p27/release-gate-manifest.json");
  const browserSmoke = readJsonIfExists("docs/active/evidence/p27/browser-smoke-result.json");
  const p26Manifest = readJsonIfExists("docs/active/evidence/p26/release-gate-manifest.json");

  const blockingIssues = [
    "P27 公网出门阻塞：EdgeOne tokenless 默认域名 https://foodmap.edgeone.cool/ 远端静态验证返回 HTTP 401。",
    "P27 Mate70 公网 URL 证据缺失：没有稳定公网 URL 时不能执行真实公网实机验收。",
    "公网域名注册、ICP备案、DNS 绑定、HTTPS 证书配置已按本轮决策绕开，属于外部前置条件。",
    "完整 E2E 若失败，必须按命令结果保留为回归风险，不能用截图报告替代测试通过。"
  ];

  const commandRows = commandResults.map((item) => `
    <tr>
      <td>${htmlEscape(item.label)}</td>
      <td><span class="pill ${item.passed ? "pass" : "fail"}">${item.passed ? "通过" : item.expectedFailure ? "预期阻塞" : "失败"}</span></td>
      <td><code>${htmlEscape(item.command)}</code></td>
      <td>${htmlEscape(item.summary.join(" / "))}</td>
      <td><a href="${htmlEscape(path.relative(evidenceDir, path.join(root, item.log)).replaceAll(path.sep, "/"))}">日志</a></td>
    </tr>
  `).join("");

  const screenshotCards = visual.screenshots.map((shot) => `
    <article class="shot">
      <img src="${htmlEscape(path.relative(evidenceDir, path.join(root, shot.path)).replaceAll(path.sep, "/"))}" alt="${htmlEscape(shot.title)}" loading="lazy">
      <h3>${htmlEscape(shot.title)}</h3>
      <p>${htmlEscape(shot.description)}</p>
      <code>${htmlEscape(shot.path)}</code>
    </article>
  `).join("");

  const manifest = {
    generatedAt: new Date().toISOString(),
    language: "zh-CN",
    tool: "Node.js + Playwright headless Chromium",
    browserMode: visual.browserMode,
    report: rel(reportPath),
    screenshotCount: visual.screenshots.length,
    screenshots: visual.screenshots,
    commandResults,
    p27Status: "blocked_before_final_acceptance",
    publicUrlBlocker: p27Manifest?.remoteVerification?.note || "P27 stable public URL evidence is missing",
    browserSmokeStatus: browserSmoke?.status || "not_run",
    p26ReleaseStatus: p26Manifest?.status || "unknown",
    visualFailures: visual.failures
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FoodMap P27 阶段性自动化验收报告</title>
  <style>
    :root { color: #261b12; background: #f7f1e7; font-family: Inter, "Segoe UI", "Microsoft YaHei", sans-serif; }
    body { margin: 0; }
    main { max-width: 1180px; margin: 0 auto; padding: 32px 20px 56px; }
    h1, h2, h3 { margin: 0; line-height: 1.2; }
    h1 { font-size: 34px; }
    h2 { font-size: 22px; margin-top: 32px; border-top: 1px solid #ddcdb9; padding-top: 24px; }
    h3 { font-size: 16px; }
    p, li, td, th { line-height: 1.65; }
    .hero { display: grid; gap: 12px; padding: 28px; border: 1px solid #ddcdb9; background: #fffaf2; border-radius: 8px; }
    .summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 18px; }
    .metric { padding: 14px; background: #fff; border: 1px solid #e4d7c6; border-radius: 8px; }
    .metric strong { display: block; font-size: 18px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e4d7c6; border-radius: 8px; overflow: hidden; }
    th, td { padding: 10px 12px; border-bottom: 1px solid #eadfD1; text-align: left; vertical-align: top; }
    th { background: #f0e3d1; }
    code { font-family: "SFMono-Regular", Consolas, monospace; font-size: 12px; overflow-wrap: anywhere; }
    .pill { display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .pass { background: #e4f4e8; color: #176332; }
    .fail { background: #ffe1d8; color: #8d260f; }
    .warn { background: #fff0c7; color: #7a4b00; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .shot { background: #fff; border: 1px solid #e4d7c6; border-radius: 8px; padding: 12px; }
    .shot img { width: 100%; border-radius: 6px; border: 1px solid #e5ddcf; background: #f8f8f8; }
    .issue { background: #fff; border-left: 4px solid #b64a2c; padding: 12px 14px; margin: 10px 0; }
    .note { background: #fff8de; border: 1px solid #e7d38b; padding: 12px 14px; border-radius: 8px; }
    @media (max-width: 760px) { .summary, .grid { grid-template-columns: 1fr; } h1 { font-size: 26px; } main { padding: 20px 12px 40px; } }
  </style>
</head>
<body>
<main>
  <section class="hero">
    <h1>FoodMap P27 阶段性自动化验收报告</h1>
    <p>本报告基于原始 PRD、目标架构、当前代码、自动化命令和真实浏览器截图生成。报告明确区分“本地/受保护预览可用”和“P27 大陆稳定公网出门仍阻塞”。</p>
    <div class="summary">
      <div class="metric"><strong>验收评价</strong><span class="pill fail">NEEDS WORK / BLOCKED</span></div>
      <div class="metric"><strong>截图证据</strong>${visual.screenshots.length} 张</div>
      <div class="metric"><strong>P27 公网</strong>${htmlEscape(p27Manifest?.remoteVerification?.note || "缺少稳定 URL")}</div>
      <div class="metric"><strong>生成时间</strong>${htmlEscape(manifest.generatedAt)}</div>
    </div>
  </section>

  <h2>1. 原始 PRD 与当前实现评价</h2>
  <table>
    <thead><tr><th>PRD 要求</th><th>当前实现证据</th><th>评价</th></tr></thead>
    <tbody>
      <tr><td>纯前端、本地优先、静态部署优先</td><td>Vite/React 静态构建、IndexedDB repository、.foodmap.json 导入导出、manifest/sw 本地验证通过。</td><td><span class="pill pass">通过</span></td></tr>
      <tr><td>#/map 个人工作台，地图优先</td><td>截图 01、03、10 展示工作台、地图、搜索、筛选和移动底部操作。</td><td><span class="pill pass">通过</span></td></tr>
      <tr><td>#/share/:snapshotId 本地只读分享</td><td>截图 08、11 展示缺失快照恢复；历史 P21/P23/P26 E2E 覆盖只读分享和导入 no-write。</td><td><span class="pill pass">当前基线通过</span></td></tr>
      <tr><td>导入导出 .foodmap.json</td><td>截图 02 展示数据包入口；E2E 覆盖导出、clean profile 导入、无效导入 no-op。</td><td><span class="pill pass">通过</span></td></tr>
      <tr><td>不做账号、云同步、后端、永久公网分享</td><td>PRD/架构/报告均保持本地优先边界；P27 报告不声明公网永久分享。</td><td><span class="pill pass">通过</span></td></tr>
      <tr><td>大陆用户稳定公网访问</td><td>EdgeOne protected-preview 部署成功，但 tokenless 默认域名 HTTP 401；未完成稳定公网 URL、Mate70 公网证据和 final report。</td><td><span class="pill fail">阻塞</span></td></tr>
    </tbody>
  </table>

  <h2>2. 目标架构与当前架构实现</h2>
  <table>
    <thead><tr><th>架构层</th><th>当前代码实体</th><th>状态</th></tr></thead>
    <tbody>
      <tr><td>App Shell / Hash Router</td><td>React App、#/map、#/share/:snapshotId、WebAppStatus</td><td><span class="pill pass">已实现</span></td></tr>
      <tr><td>Workspace UI</td><td>MapWorkspace、MapCanvas、ImportExportDialog、PersonalDataHealthCenter、GovernanceWorkbench</td><td><span class="pill pass">已实现</span></td></tr>
      <tr><td>Domain / Repository</td><td>locationStatus、governance、importExportCodec、IndexedDB repositories</td><td><span class="pill pass">已实现</span></td></tr>
      <tr><td>Static Deployment</td><td>build:mainland、build:edgeone、verify:mainland:deployment、deploy:edgeone</td><td><span class="pill pass">本地和 protected-preview 可用</span></td></tr>
      <tr><td>P27 Public URL Evidence</td><td>verify:p27:release、smoke:p27:browser、P27 blocker docs</td><td><span class="pill fail">公网出门阻塞</span></td></tr>
    </tbody>
  </table>

  <h2>3. 自动化命令结果</h2>
  <table>
    <thead><tr><th>命令</th><th>结果</th><th>执行内容</th><th>摘要</th><th>日志</th></tr></thead>
    <tbody>${commandRows}</tbody>
  </table>

  <h2>4. 可实现用户场景截图</h2>
  <div class="grid">${screenshotCards}</div>

  <h2>5. 缺陷、阻塞与现实评价</h2>
  ${blockingIssues.map((issue) => `<div class="issue">${htmlEscape(issue)}</div>`).join("")}
  ${visual.failures.length ? `<div class="issue">截图采集问题：${htmlEscape(visual.failures.join("；"))}</div>` : ""}
  <div class="note">
    <strong>验收评价：</strong>当前 FoodMap 的本地优先 WebApp 主路径、数据包、健康中心、治理、分享图和移动工作台可以通过本地自动化截图证明；P18-P26 accepted baseline 仍需以命令结果为准。P27 大陆稳定公网访问未完成，整体状态为 <strong>NEEDS WORK / BLOCKED</strong>，不能声明 P27 final acceptance。
  </div>
</main>
</body>
</html>`;
  fs.writeFileSync(reportPath, html);
  return manifest;
}

const existingManifest = readJsonIfExists("docs/active/evidence/p27/stage-audit-2026-06-29/manifest.json");
const commandResults = process.env.FOODMAP_AUDIT_REUSE_COMMANDS === "1" && Array.isArray(existingManifest?.commandResults)
  ? existingManifest.commandResults
  : [
      runCommand("01-npm-ci", "npm ci", "npm", ["ci"]),
      runCommand("02-build-edgeone", "大陆/EdgeOne 构建", "npm", ["run", "build:edgeone"]),
      runCommand("03-unit-tests", "Vitest 单元测试", "npm", ["test", "--", "--run"]),
      runCommand("04-scanlist", "真实 scanlist 验证", "npm", ["run", "verify:scanlist"]),
      runCommand("05-local-mainland", "本地大陆静态验证", "npm", ["run", "verify:mainland:deployment"]),
      runCommand("06-p26-release", "P26 release gate", "npm", ["run", "verify:p26:release"]),
      runCommand("07-p27-release-tokenless", "P27 release gate - tokenless EdgeOne", "npm", ["run", "verify:p27:release"], {
        env: { FOODMAP_MAINLAND_DEPLOY_URL: tokenlessEdgeOneUrl }
      }),
      runCommand("08-mainland-remote-401", "远端 tokenless 静态验证", "npm", ["run", "verify:mainland:deployment"], {
        env: { FOODMAP_MAINLAND_DEPLOY_URL: tokenlessEdgeOneUrl },
        expectFailure: true
      }),
      runCommand("09-e2e", "全量 Playwright E2E", "npm", ["run", "e2e"]),
      runCommand("10-p27-browser-smoke", "P27 browser smoke - tokenless EdgeOne", "npm", ["run", "smoke:p27:browser"], {
        env: { FOODMAP_MAINLAND_DEPLOY_URL: tokenlessEdgeOneUrl },
        expectFailure: true
      })
    ];

const visual = await captureVisualEvidence();
const manifest = buildReport({ commandResults, visual });

console.log(`[P27 Stage Audit] Report: ${rel(reportPath)}`);
console.log(`[P27 Stage Audit] Manifest: ${rel(manifestPath)}`);
console.log(`[P27 Stage Audit] Screenshots: ${manifest.screenshotCount}`);
if (visual.failures.length) {
  console.log(`[P27 Stage Audit] Visual capture warnings: ${visual.failures.join("; ")}`);
}
