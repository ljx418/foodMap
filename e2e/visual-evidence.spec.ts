import { expect, type Page, test } from "@playwright/test";
import fs from "node:fs";

const EVIDENCE_DIR = "docs/active/evidence/p16";

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
    await page.getByRole("dialog", { name: "更多工具" }).getByRole("button", { name: "导出分享图" }).click();
  } else {
    await page.getByRole("button", { name: "导出" }).click();
  }
  await expect(page.getByTestId("map-poster-dialog")).toBeVisible();
  await expect(page.getByTestId("export-map-poster")).toBeVisible();
  await page.screenshot({ path: `${EVIDENCE_DIR}/${prefix}-poster-export.png`, fullPage: true });
});
