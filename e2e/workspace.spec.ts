import { expect, test } from "@playwright/test";

test("workspace opens with core controls", async ({ page }, testInfo) => {
  await page.goto("/#/map");
  await expect(page.getByTestId("workspace-map")).toBeVisible();
  await expect(page.getByTestId("workspace-search")).toBeVisible();
  if (testInfo.project.name === "desktop") {
    await expect(page.getByTestId("desktop-open-layers")).toBeVisible();
    await expect(page.getByTestId("desktop-open-detail")).toBeVisible();
    await expect(page.getByTestId("layer-panel")).toHaveCount(0);
    await expect(page.getByTestId("place-detail")).toHaveCount(0);
    await page.getByTestId("desktop-open-layers").click();
    await expect(page.getByTestId("layer-panel")).toBeVisible();
    await expect(page.getByTestId("layer-panel")).toContainText("地图显示");
    await expect(page.getByTestId("layer-panel")).toContainText("高德扫街榜");
    await page.getByRole("checkbox", { name: /高德扫街榜/ }).uncheck();
    await expect(page.getByTestId("recommendation-summary")).toContainText("已核验图钉 0 个");
    await page.getByTestId("desktop-open-detail").click();
    await expect(page.getByTestId("place-list")).toBeVisible();
  } else {
    await expect(page.getByRole("button", { name: "新增", exact: true }).last()).toBeVisible();
  }
});

test("share missing snapshot shows readonly import guidance", async ({ page }) => {
  await page.goto("/#/share/not-found");
  await expect(page.getByTestId("share-view")).toBeVisible();
  await expect(page.getByText("没有找到这个本地分享快照")).toBeVisible();
  await expect(page.getByTestId("workspace-add-place")).toHaveCount(0);
});

test("clicking Wuhan map opens place editor with real coordinates", async ({ page }) => {
  await page.goto("/#/map");
  await page.getByTestId("workspace-map").click({ position: { x: 120, y: 160 } });
  await expect(page.getByTestId("map-create-popover")).toBeVisible();
  await page.getByTestId("map-create-popover").getByRole("button", { name: "新增" }).click();
  await expect(page.getByTestId("place-editor")).toBeVisible();
  await expect(page.getByText("已使用地图点击位置")).toBeVisible();
  await page.getByText("位置详情").click();
  await expect(page.getByLabel("城市")).toHaveValue("武汉");
  await expect(page.getByLabel("经度")).not.toHaveValue("114.3055");
});

test("agent bridge can save, list and focus a place", async ({ page }) => {
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  const placeName = `Agent 热干面 ${Date.now()}`;
  const result = await page.evaluate(async (name) => {
    const bridge = (window as any).FoodMapAgentBridge;
    if (!bridge) throw new Error("bridge missing");
    const saved = await bridge.dispatch({
      action: "savePlace",
      payload: {
        name,
        longitude: 114.31,
        latitude: 30.59,
        city: "武汉",
        rating: 5,
        visitedAt: "2026-06-04",
        tags: ["agent"]
      }
    });
    const list = await bridge.dispatch({ action: "listPlaces" });
    if (!saved.ok) throw new Error(saved.error);
    const place = (list.data as Array<{ id: string; name: string }>).find((item) => item.name === name);
    if (!place) throw new Error("place not listed");
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: place.id } });
    return place.name;
  }, placeName);
  await expect(page.getByRole("heading", { name: result }).first()).toBeVisible();
});

test("loads scanlist recommendations and shows all 50 verified pins", async ({ page }, testInfo) => {
  await page.goto("/#/map");
  await page.getByTestId("load-recommendations").click();
  await expect(page.getByTestId("recommendation-summary")).toContainText("扫街榜 50 条");
  await expect(page.getByTestId("recommendation-summary")).toContainText("已核验图钉 50 个");
  await expect(page.getByTestId("recommendation-summary")).toContainText("待核验 0 个");
  const panel = page.getByTestId("recommendation-panel").last();
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId("recommendation-list-toggle")).toBeVisible();
  await expect(panel.getByText("刘聋子牛肉粉馆(汉阳龙兴东街店)").first()).toHaveCount(1);
  await expect(panel.getByText("山饭子特色餐厅(汉阳国博新城店)").first()).toHaveCount(0);
  await panel.getByTestId("recommendation-list-toggle").click();
  await expect(panel.getByText("刘聋子牛肉粉馆(汉阳龙兴东街店)").first()).toBeVisible();
  await panel.getByText("刘聋子牛肉粉馆(汉阳龙兴东街店)").first().click();
  await expect(panel.getByTestId("recommendation-detail")).toBeVisible();
  await expect(panel.getByRole("img", { name: "刘聋子牛肉粉馆(汉阳龙兴东街店)" })).toBeVisible();
  await expect(panel.getByText("精确坐标，可上图")).toBeVisible();
  await expect(panel.getByRole("button", { name: "收藏为个人记录" })).toBeEnabled();

  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  if (testInfo.project.name === "desktop") {
    await expect(page.locator(".recommendation-leaflet-marker.is-secondary-rank.is-adaptive-pin")).toHaveCount(0);
    await page.evaluate(async () => {
      const bridge = (window as any).FoodMapAgentBridge;
      const list = await bridge.dispatch({ action: "listRecommendations" });
      const target = list.data.find((item: { rank: number }) => item.rank > 20);
      await bridge.dispatch({ action: "focusRecommendation", payload: { sourceId: target.sourceId } });
    });
    await expect(page.locator(".recommendation-leaflet-marker.is-secondary-rank.is-adaptive-pin").first()).toBeVisible();
  }
  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const list = await bridge.dispatch({ action: "listRecommendations" });
    const target = list.data.find((item: { name: string }) => item.name === "山饭子特色餐厅(汉阳国博新城店)");
    await bridge.dispatch({ action: "focusRecommendation", payload: { sourceId: target.sourceId } });
  });
  await expect(panel.getByText("近似位置，建议收藏后手动校准")).toBeVisible();
  await expect(panel.getByRole("button", { name: "收藏为个人记录" })).toBeEnabled();
});

test("agent bridge can load and save an approximate scanlist recommendation", async ({ page }) => {
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  const saved = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    await bridge.dispatch({ action: "loadRecommendations" });
    const list = await bridge.dispatch({ action: "listRecommendations" });
    const target = list.data.find((item: { name: string }) => item.name === "山饭子特色餐厅(汉阳国博新城店)");
    await bridge.dispatch({ action: "focusRecommendation", payload: { sourceId: target.sourceId } });
    const result = await bridge.dispatch({ action: "saveRecommendationAsPlace", payload: { sourceId: target.sourceId } });
    const places = await bridge.dispatch({ action: "listPlaces" });
    const exists = places.data.some((place: { name: string; tags: string[] }) => place.name === target.name && place.tags.includes("高德扫街榜"));
    return { name: target.name, ok: result.ok, error: result.error, exists };
  });
  expect(saved.ok).toBeTruthy();
  expect(saved.exists).toBeTruthy();
});
