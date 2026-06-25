import { expect, type Page, test } from "@playwright/test";
import fs from "node:fs";

const EVIDENCE_DIR = "docs/active/evidence/p16";
const P17_EVIDENCE_DIR = "docs/active/evidence/p17";

async function closeVisibleDialogs(page: Page) {
  const closeButtons = page.getByRole("button", { name: /关闭|完成/ });
  const count = await closeButtons.count();
  for (let index = count - 1; index >= 0; index -= 1) {
    if (await closeButtons.nth(index).isVisible()) {
      await closeButtons.nth(index).click();
      break;
    }
  }
}

async function importPersonalFavorites(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole("button", { name: "更多工具" }).click();
    await page.getByRole("dialog", { name: "更多工具" }).getByRole("button", { name: "数据包" }).click();
  } else {
    await page.getByTestId("workspace-import").click();
  }
  await expect(page.getByTestId("import-export-dialog")).toBeVisible();
  await page.getByTestId("import-personal-favorites").click();
  await expect(page.getByTestId("import-export-dialog")).toHaveCount(0);
  await page.waitForFunction(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    if (!bridge) return false;
    const result = await bridge.dispatch({ action: "listPendingPlaces" });
    return result.ok && result.data.length >= 10;
  });
}

test("captures P16 visual evidence", async ({ page }, testInfo) => {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  const isMobile = testInfo.project.name === "mobile";
  await page.setViewportSize(isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 });
  const prefix = isMobile ? "mobile-390x844" : "desktop-1440x900";

  await page.goto("/#/map");
  await expect(page.getByTestId("workspace-map")).toBeVisible();
  await page.screenshot({ path: `${EVIDENCE_DIR}/${prefix}-workspace.png`, fullPage: true });

  await page.getByRole("button", { name: "新增", exact: true }).last().click();
  await expect(page.getByTestId("place-editor")).toBeVisible();
  await page.getByPlaceholder("粘贴店铺简介、朋友推荐文本或网页链接。链接内容可由 Agent 解析后回填候选。").fill("万松小院");
  await page.getByRole("button", { name: "识别候选" }).click();
  await expect(page.getByTestId("place-candidate-list")).toContainText("万松小院");
  await page.screenshot({ path: `${EVIDENCE_DIR}/${prefix}-place-editor-candidates.png`, fullPage: true });

  const placeName = `P16 验收热干面 ${Date.now()}`;
  await page.getByTestId("place-candidate-list").getByRole("button").first().click();
  await page.getByLabel("名称").fill(placeName);
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByTestId("place-editor")).toHaveCount(0);
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await page.evaluate(async (name) => {
    const bridge = (window as any).FoodMapAgentBridge;
    const list = await bridge.dispatch({ action: "listPlaces" });
    const place = list.data.find((item: { id: string; name: string }) => item.name === name);
    if (!place) throw new Error("saved visual evidence place not found");
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: place.id } });
  }, placeName);
  await expect(page.getByTestId("external-map-actions").getByRole("link", { name: /打开地图/ })).toHaveAttribute("href", /amap\.com/);
  await page.screenshot({ path: `${EVIDENCE_DIR}/${prefix}-place-detail-map-link.png`, fullPage: true });

  if (isMobile) {
    await closeVisibleDialogs(page);
  }
  if (isMobile) {
    await page.getByRole("button", { name: "更多工具" }).click();
    await page.getByRole("dialog", { name: "更多工具" }).getByRole("button", { name: "分享图" }).click();
  } else {
    await page.locator("header").getByRole("button", { name: "分享图" }).click();
  }
  await expect(page.getByTestId("map-poster-dialog")).toBeVisible();
  await expect(page.getByTestId("export-map-poster")).toBeVisible();
  await page.screenshot({ path: `${EVIDENCE_DIR}/${prefix}-poster-export.png`, fullPage: true });
});

test("captures P17 pending workbench visual evidence", async ({ page }, testInfo) => {
  fs.mkdirSync(P17_EVIDENCE_DIR, { recursive: true });
  const isMobile = testInfo.project.name === "mobile";
  await page.setViewportSize(isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 });

  await page.goto("/#/map");
  await expect(page.getByTestId("workspace-map")).toBeVisible();
  await importPersonalFavorites(page, isMobile);
  await page.getByTestId("quick-pending-toggle").click();
  const pendingWorkbench = isMobile
    ? page.getByRole("dialog", { name: "待确认工作台" }).getByTestId("pending-workbench")
    : page.getByTestId("pending-workbench").first();
  await expect(pendingWorkbench).toBeVisible();
  await expect(pendingWorkbench).toContainText("待确认工作台");
  await expect(pendingWorkbench.locator(".pending-candidate").first()).toBeVisible();

  const path = isMobile
    ? `${P17_EVIDENCE_DIR}/mobile-390x844-pending-workbench.png`
    : `${P17_EVIDENCE_DIR}/desktop-1440x900-pending-workbench.png`;
  await page.screenshot({ path, fullPage: true });
});

test("captures P17 detail information architecture evidence", async ({ page }, testInfo) => {
  fs.mkdirSync(P17_EVIDENCE_DIR, { recursive: true });
  const isMobile = testInfo.project.name === "mobile";
  await page.setViewportSize(isMobile ? { width: 390, height: 844 } : { width: 1280, height: 900 });

  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await page.evaluate(async (isMobileViewport) => {
    const bridge = (window as any).FoodMapAgentBridge;
    const saved = await bridge.dispatch({
      action: "savePlace",
      payload: {
        name: isMobileViewport ? "P17移动详情长店名牛排家万象城验收" : "P17桌面详情长店名牛排家万象城验收",
        longitude: 114.289,
        latitude: 30.582,
        city: "武汉",
        address: "武汉市江汉区详情截图验收长地址，验证状态、标签、核心操作和记录分区不会横向截断",
        rating: 4.4,
        visitedAt: "2026-06-16",
        tags: ["吃过", "朋友推荐", "牛排", "西餐", "待校准", "近似坐标", "详情验收"],
        notes: "P17-3 视觉证据：详情页优先展示状态、标签和核心操作，再展示照片、评分、地址、校准和笔记。"
      }
    });
    if (!saved.ok) throw new Error(saved.error);
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: saved.data.id } });
  }, isMobile);

  const detail = isMobile
    ? page.getByRole("dialog", { name: "地点详情" }).getByTestId("place-detail")
    : page.locator(".desktop-side-panel").getByTestId("place-detail");
  await expect(detail).toBeVisible();
  await expect(detail.getByTestId("detail-status-source")).toContainText("待确认");
  await expect(detail.getByTestId("detail-core-actions")).toContainText("手动挪动图钉");

  const path = isMobile
    ? `${P17_EVIDENCE_DIR}/mobile-390x844-place-detail-ia.png`
    : `${P17_EVIDENCE_DIR}/desktop-1280x900-place-detail-ia.png`;
  await page.screenshot({ path, fullPage: true });
});

test("captures P17 filter command bar and selected pin evidence", async ({ page }, testInfo) => {
  fs.mkdirSync(P17_EVIDENCE_DIR, { recursive: true });
  const isMobile = testInfo.project.name === "mobile";

  if (isMobile) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#/map");
    await expect(page.getByTestId("home-filter-dock")).toBeVisible();
    await page.screenshot({ path: `${P17_EVIDENCE_DIR}/mobile-390x844-filter-command-bar.png`, fullPage: true });
    return;
  }

  await page.setViewportSize({ width: 2048, height: 768 });
  await page.goto("/#/map");
  await expect(page.getByTestId("home-filter-dock")).toBeVisible();
  await page.screenshot({ path: `${P17_EVIDENCE_DIR}/desktop-2048x768-filter-command-bar.png`, fullPage: true });

  await importPersonalFavorites(page, false);
  const marker = page.locator(".personal-favorite-leaflet-marker").first();
  await expect(marker).toBeVisible();
  await marker.click();
  await expect(marker).toHaveClass(/is-selected/);
  await page.screenshot({ path: `${P17_EVIDENCE_DIR}/desktop-2048x768-selected-pin.png`, fullPage: true });
});
