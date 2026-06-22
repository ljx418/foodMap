import { expect, type Page, test } from "@playwright/test";
import fs from "node:fs";

async function loadRecommendations(page: Page, projectName: string) {
  if (projectName === "mobile") {
    await page.getByRole("button", { name: "更多工具" }).click();
    await page.getByRole("dialog", { name: "更多工具" }).getByRole("button", { name: "扫街榜", exact: true }).click();
    return;
  }
  await page.getByTestId("quick-scanlist-toggle").click();
}

async function importPersonalFavorites(page: Page) {
  const directImport = page.getByRole("button", { name: "导入" }).first();
  if (await directImport.isVisible().catch(() => false)) {
    await directImport.click();
  } else {
    await page.getByRole("button", { name: "更多工具" }).click();
    await page.getByRole("dialog", { name: "更多工具" }).getByRole("button", { name: "导入" }).click();
  }
  await expect(page.getByTestId("import-export-dialog")).toBeVisible();
  await page.getByTestId("import-personal-favorites").click();
  await expect(page.getByTestId("import-export-dialog")).toHaveCount(0);
  await page.waitForFunction(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    if (!bridge) return false;
    const places = await bridge.dispatch({ action: "listPlaces" });
    return places.data.filter((place: { layerId: string }) => place.layerId === "layer-personal-favorites").length === 32;
  });
}

async function seedLargePersonalDataset(page: Page, size: number) {
  await page.evaluate(async (count) => {
    const openRequest = indexedDB.open("foodmap-db", 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => resolve(openRequest.result);
    });
    const tx = db.transaction("places", "readwrite");
    const store = tx.objectStore("places");
    store.clear();
    const now = "2026-06-17T00:00:00.000+08:00";
    for (let index = 0; index < count; index += 1) {
      const column = index % 80;
      const row = Math.floor(index / 80);
      store.put({
        id: `perf-place-${count}-${index}`,
        name: `P18 性能验收店 ${index + 1}`,
        layerId: "layer-personal-favorites",
        longitude: 114.05 + column * 0.006,
        latitude: 30.42 + row * 0.006,
        city: "武汉",
        district: index % 3 === 0 ? "江汉区" : "武昌区",
        address: `武汉市性能验收路 ${index + 1} 号`,
        rating: index % 2 === 0 ? 4.4 : 3.8,
        visitedAt: "2026-06-17",
        tags: index % 2 === 0 ? ["吃过", "热干面", "性能验收"] : ["想吃", "火锅", "性能验收"],
        notes: "P18 large dataset deterministic fixture",
        photoIds: [],
        createdAt: now,
        updatedAt: now,
        mapAccuracy: "exact"
      });
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  }, size);
}

test("workspace opens with core controls", async ({ page }, testInfo) => {
  await page.goto("/#/map");
  await expect(page.getByTestId("workspace-map")).toBeVisible();
  await expect(page.getByTestId("workspace-search")).toBeVisible();
  await expect(page.getByTestId("recommendation-summary")).toHaveCount(0);
  await expect(page.getByTestId("home-filter-dock")).toBeVisible();
  await expect(page.getByTestId("map-legend")).toHaveCount(0);
  await expect(page.getByTestId("map-pin-legend")).toContainText("已核验");
  await expect(page.getByTestId("map-pin-legend")).toContainText("待确认");
  await expect(page.getByTestId("map-pin-legend")).toContainText("榜单");
  await expect(page.getByTestId("map-pin-legend")).toContainText("钉图易");
  await expect(page.getByTestId("quick-scanlist-toggle")).toContainText("榜单");
  await expect(page.getByTestId("quick-dingtuyi-toggle")).toContainText("参考");
  await expect(page.getByTestId("quick-dingtuyi-toggle")).toHaveAccessibleName("参考图层：钉图易分享");
  await expect(page.getByTestId("quick-dingtuyi-toggle")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".dingtuyi-share-leaflet-marker")).toHaveCount(0);
  if (testInfo.project.name === "desktop") {
    await expect(page.getByTestId("home-share-poster")).toBeVisible();
    await expect(page.getByTestId("quick-dingtuyi-toggle")).toContainText("120");
    await page.getByTestId("quick-scanlist-toggle").click();
    await expect(page.getByTestId("quick-scanlist-toggle")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("recommendation-summary")).toHaveCount(0);
    await page.getByTestId("quick-scanlist-toggle").click();
    await expect(page.getByTestId("quick-scanlist-toggle")).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByTestId("recommendation-summary")).toHaveCount(0);
    await page.getByTestId("home-filter-expand").click();
    await expect(page.getByRole("button", { name: "想吃" })).toBeVisible();
    await page.getByRole("button", { name: "想吃" }).click();
    await expect(page.getByRole("button", { name: "想吃" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("desktop-open-layers")).toBeVisible();
    await expect(page.getByTestId("desktop-open-detail")).toBeVisible();
    await expect(page.getByTestId("layer-panel")).toHaveCount(0);
    await expect(page.getByTestId("place-detail")).toHaveCount(0);
    await page.getByTestId("desktop-open-layers").click();
    await expect(page.getByTestId("layer-panel")).toBeVisible();
    await expect(page.getByTestId("layer-panel")).toContainText("地图显示");
    await expect(page.getByTestId("layer-panel")).toContainText("榜单推荐");
    const scanlistToggle = page.getByRole("checkbox", { name: /显示榜单推荐/ });
    await scanlistToggle.check();
    await expect(scanlistToggle).toBeChecked();
    await scanlistToggle.uncheck();
    await expect(page.getByTestId("layer-panel")).toContainText("榜单显示 / 共 50");
    await expect(page.getByTestId("recommendation-summary")).toHaveCount(0);
    await page.getByTestId("desktop-open-detail").click();
    await expect(page.getByTestId("place-list")).toBeVisible();
    await expect(page.getByTestId("place-list")).toContainText("还没有美食图钉");
  } else {
    await expect(page.getByTestId("home-share-poster")).toBeHidden();
    await expect(page.getByRole("button", { name: "新增", exact: true }).last()).toBeVisible();
    await expect(page.getByTestId("mobile-action-bar").getByRole("button", { name: "筛选" })).toBeVisible();
    await expect(page.getByTestId("workspace-add-place")).toBeHidden();
  }
});

test("Dingtuyi shared Wuhan food layer loads as read-only reference pins", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates the full external reference layer path");
  await page.goto("/#/map");
  await expect(page.locator(".dingtuyi-share-leaflet-marker")).toHaveCount(0);
  await page.getByTestId("quick-dingtuyi-toggle").click();
  await expect(page.getByTestId("quick-dingtuyi-toggle")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".dingtuyi-share-leaflet-marker")).toHaveCount(120);
  await expect(page.locator(".dingtuyi-share-leaflet-marker.is-dot")).toHaveCount(120);
  await page.locator(".dingtuyi-share-leaflet-marker").first().dispatchEvent("click");
  const detail = page.getByTestId("place-detail");
  await expect(detail).toBeVisible();
  await expect(detail).toContainText("钉图易分享");
  await expect(detail).toContainText("来源：钉图易公开分享图层");
  await expect(detail.getByRole("button", { name: "加入我的收藏" })).toBeEnabled();
  await expect(detail.getByRole("button", { name: "编辑" })).toHaveCount(0);
  await page.getByRole("button", { name: "收起详情" }).click();
  await page.getByTestId("quick-dingtuyi-toggle").click();
  await expect(page.getByTestId("quick-dingtuyi-toggle")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".dingtuyi-share-leaflet-marker")).toHaveCount(0);
});

test("clean profile starts with an empty personal map", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates clean personal workspace");
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  const counts = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    return {
      total: places.data.length,
      personalFavorites: places.data.filter((place: { layerId: string }) => place.layerId === "layer-personal-favorites").length
    };
  });
  expect(counts.total).toBe(0);
  expect(counts.personalFavorites).toBe(0);
  await expect(page.locator(".personal-favorite-leaflet-marker")).toHaveCount(0);
  await page.getByTestId("desktop-open-detail").click();
  await expect(page.getByTestId("place-list")).toContainText("还没有美食图钉");
});

test("partial personal favorite import is repaired on reload", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates local IndexedDB seed repair");
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    await bridge.dispatch({
      action: "savePlace",
      payload: {
        id: "personal-favorite:xiashi-casserole",
        name: "夏氏砂锅(总店)",
        longitude: 114.269349,
        latitude: 30.592914,
        city: "武汉",
        address: "江汉区雪松路73号",
        layerId: "layer-personal-favorites",
        tags: ["吃过", "砂锅", "湖北菜", "精确坐标"],
        rating: 5,
        visitedAt: "2026-06-09"
      }
    });
  });
  await page.reload();
  await page.waitForFunction(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    if (!bridge) return false;
    const places = await bridge.dispatch({ action: "listPlaces" });
    return places.data.filter((place: { id: string }) => place.id.startsWith("personal-favorite:")).length === 32;
  });
  await expect(page.locator(".personal-favorite-leaflet-marker")).toHaveCount(32);
  await page.getByTestId("desktop-open-detail").click();
  await expect(page.getByTestId("place-list")).toContainText("待确认 31");
  await expect(page.getByLabel("清单排序")).toHaveValue("calibration");
});

test("personal favorites import verified and calibration pins distinctly", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates the visible home filter dock and side list");
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await importPersonalFavorites(page);
  const seeded = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    const personal = places.data.filter((place: { layerId: string }) => place.layerId === "layer-personal-favorites");
    return {
      count: personal.length,
      calibrationCount: personal.filter((place: { tags: string[] }) => place.tags.includes("待校准")).length,
      exactCount: personal.filter((place: { tags: string[] }) => place.tags.includes("精确坐标")).length,
      names: personal.map((place: { name: string }) => place.name),
      xiashi: personal.find((place: { name: string }) => place.name === "夏氏砂锅(总店)"),
      benluobo: personal.find((place: { name: string }) => place.name.includes("笨萝卜")),
      crazyones: personal.find((place: { name: string }) => place.name.includes("CRAZYONES")),
      goya: personal.find((place: { name: string }) => place.name.includes("戈雅法餐厅")),
      excluded: personal.filter((place: { name: string }) => ["永信海鲜", "川胖子", "老油碟三拖一火锅"].some((name) => place.name.includes(name))).map((place: { name: string }) => place.name)
    };
  });
  expect(seeded.count).toBe(32);
  expect(seeded.exactCount).toBe(1);
  expect(seeded.calibrationCount).toBe(31);
  expect(seeded.excluded).toHaveLength(0);
  expect(seeded.names).toEqual(expect.arrayContaining(["夏氏砂锅(总店)", "上场老火锅(司门口黄鹤楼店)", "寿司郎(王家湾店)"]));
  expect(seeded.xiashi.rating).toBe(4);
  expect(seeded.xiashi.tags).toEqual(expect.arrayContaining(["吃过", "砂锅", "湖北菜"]));
  expect(seeded.xiashi.tags).not.toContain("百分制93");
  expect(seeded.xiashi.notes).toContain("核验置信度");
  expect(seeded.xiashi.notes).toContain("五分制折算：4.0 星");
  expect(seeded.benluobo.rating).toBe(3.6);
  expect(seeded.benluobo.tags).toEqual(expect.arrayContaining(["吃过", "湘菜", "待校准"]));
  expect(seeded.benluobo.tags).not.toContain("百分制90");
  expect(seeded.crazyones.address).toContain("陆地区域");
  expect(seeded.crazyones.longitude).toBe(114.3036);
  expect(seeded.crazyones.latitude).toBe(30.6072);
  expect(seeded.crazyones.tags).toEqual(expect.arrayContaining(["待校准", "近似坐标", "位置待确认", "位置高风险", "陆地点修正"]));
  expect(seeded.goya.address).toContain("公开搜索未稳定命中");
  expect(seeded.goya.tags).toEqual(expect.arrayContaining(["待校准", "近似坐标", "位置待确认", "位置高风险", "默认候选"]));
  await expect(page.locator(".personal-favorite-leaflet-marker")).toHaveCount(32);
  await expect(page.getByTestId("map-legend")).toHaveCount(0);
  await expect(page.getByTestId("quick-pending-toggle")).toContainText("31");
  await expect(page.getByTestId("map-pin-legend")).toContainText("已核验");
  await expect(page.getByTestId("map-pin-legend")).toContainText("待确认");
  await page.getByTestId("quick-pending-toggle").click();
  await expect(page.getByTestId("pending-workbench")).toBeVisible();
  await expect(page.getByTestId("pending-workbench")).toContainText("31 个待确认地点");
  await expect(page.getByTestId("pending-workbench").locator(".pending-candidate").first()).toBeVisible();
  await page.getByTestId("pending-workbench").getByRole("button", { name: /暂时跳过/ }).first().click();
  await expect(page.getByTestId("pending-workbench")).toContainText("已跳过确认");
  await expect(page.locator(".personal-favorite-leaflet-marker")).toHaveCount(31);

  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    const calibration = places.data.find((place: { name: string }) => place.name.includes("笨萝卜"));
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: calibration.id } });
  });
  const detail = page.locator(".desktop-side-panel").getByTestId("place-detail");
  await expect(detail).toContainText("待校准");
  await expect(detail.getByRole("button", { name: "待校准，暂不导航" })).toBeDisabled();
  await expect(detail.getByTestId("calibration-card")).toContainText("待确认店家");
  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: "personal-favorite:goya" } });
  });
  await expect(detail).toContainText("高风险位置");
  await expect(detail.getByTestId("coordinate-risk-card")).toBeVisible();
  await expect(detail.locator(".detail-priority-tags").getByRole("button", { name: /位置高风险/ })).toHaveCount(0);
  await expect(detail.locator(".detail-priority-tags").getByRole("button", { name: /默认候选/ })).toHaveCount(0);
  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    const calibration = places.data.find((place: { name: string }) => place.name.includes("笨萝卜"));
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: calibration.id } });
  });
  await detail.getByTestId("calibration-open-candidates").click();
  const candidates = detail.getByTestId("calibration-candidate-list");
  await expect(candidates).toBeVisible();
  await expect(candidates).toContainText("来源说明");
  await expect(candidates.locator(".candidate-card").first()).toBeVisible();
  expect(await candidates.locator(".candidate-card").count()).toBeLessThanOrEqual(10);
  await candidates.getByRole("button", { name: /确认此门店/ }).first().click();
  await expect(detail).toContainText("候选确认固化");
  await expect(detail).toContainText("仍需校准");
  await expect(detail.getByRole("button", { name: "待校准，暂不导航" })).toBeDisabled();
  const solidified = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    return places.data.find((place: { name: string }) => place.name.includes("笨萝卜"));
  });
  expect(solidified.tags).toEqual(expect.arrayContaining(["待校准", "近似坐标"]));
  expect(solidified.tags).not.toContain("暂时跳过");
  expect(solidified.notes).toContain("候选确认固化");
});

test("place detail can add and remove custom tags persistently", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates the editable detail drawer");
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await importPersonalFavorites(page);
  const target = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    const place = places.data.find((item: { id: string; name: string; tags: string[] }) => item.name === "夏氏砂锅(总店)");
    if (!place) throw new Error("target place missing");
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: place.id } });
    return { id: place.id, name: place.name };
  });

  const detail = page.locator(".desktop-side-panel").getByTestId("place-detail");
  await expect(detail).toBeVisible();
  await expect(detail).toContainText(target.name);
  await expect(detail.getByTestId("pin-move-card")).toContainText("图钉位置");
  await expect(detail.getByRole("button", { name: "手动挪动图钉" })).toBeVisible();
  await detail.getByRole("button", { name: /湖北菜/ }).click();
  await expect(detail.getByRole("button", { name: /湖北菜/ })).toHaveCount(0);
  await detail.getByLabel("添加自定义标签").fill("朋友推荐");
  await expect(detail.getByRole("button", { name: "添加" })).toBeEnabled();
  await detail.getByRole("button", { name: "添加" }).click();
  await expect(detail.getByRole("button", { name: /朋友推荐/ })).toBeVisible();

  await expect.poll(async () => page.evaluate(async (placeId) => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    const place = places.data.find((item: { id: string }) => item.id === placeId);
    return place?.tags ?? [];
  }, target.id)).toEqual(expect.arrayContaining(["朋友推荐"]));
  const tags = await page.evaluate(async (placeId) => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    return places.data.find((item: { id: string }) => item.id === placeId)?.tags ?? [];
  }, target.id);
  expect(tags).not.toContain("湖北菜");
});

test("pending personal favorite pins can be manually moved and audited", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates manual marker drag");
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await importPersonalFavorites(page);
  const target = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    const place = places.data.find((item: { id: string }) => item.id === "personal-favorite:xiti-steak");
    if (!place) throw new Error("manual move target missing");
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: place.id } });
    return {
      id: place.id,
      longitude: place.longitude,
      latitude: place.latitude
    };
  });

  const detail = page.locator(".desktop-side-panel").getByTestId("place-detail");
  await expect(detail).toBeVisible();
  await expect(detail).toContainText("西提牛排");
  await expect(detail.getByTestId("calibration-card")).toContainText("待确认店家");
  await detail.getByRole("button", { name: "手动挪动图钉" }).click();
  await expect(page.getByTestId("manual-move-banner")).toBeVisible();

  const marker = page.locator(".personal-favorite-leaflet-marker.is-selected.is-draggable").first();
  await expect(marker).toBeVisible();
  await page.getByTestId("workspace-map").click({ position: { x: 180, y: 220 } });

  await expect(page.getByTestId("pin-move-audit-preview")).toContainText("原");
  const previewOnly = await page.evaluate(async (placeId) => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    return places.data.find((item: { id: string }) => item.id === placeId);
  }, target.id);
  expect(previewOnly.longitude).toBe(target.longitude);
  expect(previewOnly.latitude).toBe(target.latitude);
  await page.getByRole("button", { name: "确认保存" }).click();

  await expect(page.getByTestId("manual-move-banner")).toHaveCount(0);
  await expect(detail).toContainText("手动校准");
  const moved = await page.evaluate(async (placeId) => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    return places.data.find((item: { id: string }) => item.id === placeId);
  }, target.id);
  expect(moved.mapAccuracy).toBe("exact");
  expect(moved.coordinateSystem).toBe("wgs84");
  expect(moved.tags).toEqual(expect.arrayContaining(["已核验", "精确坐标", "手动校准"]));
  expect(moved.tags).not.toContain("待校准");
  expect(moved.tags).not.toContain("近似坐标");
  expect(moved.notes).toContain("用户手动拖动图钉校准");
  expect(Math.abs(moved.longitude - target.longitude) + Math.abs(moved.latitude - target.latitude)).toBeGreaterThan(0.00001);

  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: "personal-favorite:xiashi-casserole" } });
  });
  await expect(detail).toContainText("夏氏砂锅");
  await expect(detail.getByTestId("pin-move-card")).toContainText("图钉位置");
  await expect(detail.getByRole("button", { name: "手动挪动图钉" })).toBeVisible();
});

test("place detail can search AMap candidates and move the pin to the selected POI", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates pure frontend AMap search calibration");
  await page.route("https://restapi.amap.com/v3/place/text**", async (route) => {
    const requestUrl = new URL(route.request().url());
    expect(requestUrl.searchParams.get("keywords")).toContain("西提牛排");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({
        status: "1",
        pois: [
          {
            id: "B0AMAPXITI",
            name: "西提牛排(武汉国广店)",
            address: "解放大道690号武汉国际广场C座",
            location: "114.267120,30.581200",
            cityname: "武汉市",
            adname: "江汉区",
            type: "餐饮服务"
          }
        ]
      })
    });
  });
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await importPersonalFavorites(page);
  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: "personal-favorite:xiti-steak" } });
  });

  const detail = page.locator(".desktop-side-panel").getByTestId("place-detail");
  await expect(detail.getByTestId("live-map-search-card")).toBeVisible();
  await detail.getByPlaceholder("输入你的高德 Web 服务 Key").fill("test-key");
  await detail.getByLabel("高德地点搜索关键词").fill("西提牛排 武汉国广");
  await detail.getByTestId("live-map-search-card").getByRole("button", { name: /搜索/ }).click();
  await expect(detail.getByTestId("live-map-candidate-list")).toContainText("西提牛排(武汉国广店)");
  await detail.getByRole("button", { name: /挪到此地点/ }).click();

  await expect.poll(async () => page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    return places.data.find((item: { id: string }) => item.id === "personal-favorite:xiti-steak");
  })).toMatchObject({
    name: "西提牛排(武汉国广店)",
    longitude: 114.26712,
    latitude: 30.5812,
    coordinateSystem: "gcj02",
    mapAccuracy: "exact"
  });
});

test("pending workbench candidate search exposes no-key fallback without mutating coordinates", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates P18-2 pending workbench search fallback");
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await importPersonalFavorites(page);
  const before = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    const place = places.data.find((item: { tags: string[] }) => item.tags.includes("待校准"));
    return {
      id: place.id,
      name: place.name,
      longitude: place.longitude,
      latitude: place.latitude,
      mapAccuracy: place.mapAccuracy,
      tags: place.tags
    };
  });

  await page.getByTestId("quick-pending-toggle").click();
  const workbench = page.getByTestId("pending-workbench");
  await expect(workbench).toBeVisible();
  const firstCard = workbench.getByTestId("pending-place-card").filter({ hasText: before.name }).first();
  await firstCard.getByRole("button", { name: /搜索候选/ }).click();
  await expect(firstCard.getByTestId("pending-candidate-search")).toBeVisible();
  await firstCard.getByRole("button", { name: /搜索更多候选/ }).click();
  await expect(firstCard.getByTestId("pending-candidate-search")).toContainText("未配置高德 Key");
  await expect(firstCard.getByRole("link", { name: /高德网页地图/ })).toBeVisible();
  await expect(firstCard.getByRole("link", { name: /百度地图/ })).toBeVisible();
  await expect(firstCard.getByRole("link", { name: /Apple Maps/ })).toBeVisible();
  await firstCard.getByRole("button", { name: /复制搜索词/ }).click();
  await expect(firstCard.getByTestId("pending-candidate-search")).toContainText(/已复制搜索词|未配置高德 Key/);

  const after = await page.evaluate(async (placeId) => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    const place = places.data.find((item: { id: string }) => item.id === placeId);
    return {
      longitude: place.longitude,
      latitude: place.latitude,
      mapAccuracy: place.mapAccuracy,
      tags: place.tags
    };
  }, before.id);
  expect(after.longitude).toBe(before.longitude);
  expect(after.latitude).toBe(before.latitude);
  expect(after.mapAccuracy).toBe(before.mapAccuracy);
  expect(after.tags).toEqual(before.tags);
});

test("mobile manual pin move uses a map-first calibration mode", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile validates the narrow manual move flow");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await importPersonalFavorites(page);
  const target = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    const place = places.data.find((item: { id: string }) => item.id === "personal-favorite:xiti-steak");
    if (!place) throw new Error("manual move target missing");
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: place.id } });
    return { id: place.id, longitude: place.longitude, latitude: place.latitude };
  });

  const detailDialog = page.getByRole("dialog", { name: "地点详情" });
  await expect(detailDialog).toBeVisible();
  await expect(detailDialog.getByTestId("place-detail")).toContainText("西提牛排");
  await detailDialog.getByRole("button", { name: "手动挪动图钉" }).click();
  await expect(detailDialog).toHaveCount(0);
  await expect(page.getByTestId("manual-move-banner")).toBeVisible();
  await expect(page.getByTestId("mobile-action-bar")).toHaveCount(0);
  await expect(page.getByTestId("home-filter-dock")).toBeHidden();

  await page.getByTestId("workspace-map").click({ position: { x: 64, y: 520 } });
  await expect(page.getByTestId("pin-move-audit-preview")).toContainText("原");
  const previewOnly = await page.evaluate(async (placeId) => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    return places.data.find((item: { id: string }) => item.id === placeId);
  }, target.id);
  expect(previewOnly.longitude).toBe(target.longitude);
  expect(previewOnly.latitude).toBe(target.latitude);
  await page.getByRole("button", { name: "确认保存" }).click();
  const updatedDialog = page.getByRole("dialog", { name: "地点详情" });
  await expect(updatedDialog).toBeVisible();
  await expect(updatedDialog.getByTestId("place-detail")).toContainText("手动校准");
  await expect(page.getByTestId("manual-move-banner")).toHaveCount(0);

  const moved = await page.evaluate(async (placeId) => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    return places.data.find((item: { id: string }) => item.id === placeId);
  }, target.id);
  expect(moved.mapAccuracy).toBe("exact");
  expect(moved.tags).toEqual(expect.arrayContaining(["已核验", "精确坐标", "手动校准"]));
  expect(Math.abs(moved.longitude - target.longitude) + Math.abs(moved.latitude - target.latitude)).toBeGreaterThan(0.00001);
});

test("closing selected detail restores mobile bottom actions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile validates bottom operation bar state");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const saved = await bridge.dispatch({
      action: "savePlace",
      payload: {
        id: "mobile-close-detail-place",
        name: "关闭详情测试店",
        longitude: 114.269349,
        latitude: 30.592914,
        city: "武汉",
        address: "江汉区雪松路73号",
        tags: ["吃过", "湖北菜"],
        rating: 5,
        visitedAt: "2026-06-11"
      }
    });
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: saved.data.id } });
  });
  await expect(page.getByRole("dialog", { name: "地点详情" })).toBeVisible();
  await expect(page.getByTestId("mobile-action-bar")).toHaveCount(0);
  await page.getByRole("dialog", { name: "地点详情" }).getByRole("button", { name: "关闭" }).click();
  await expect(page.getByRole("dialog", { name: "地点详情" })).toHaveCount(0);
  await expect(page.getByTestId("mobile-action-bar")).toBeVisible();
  await expect(page.getByTestId("home-filter-dock")).toBeVisible();
  await expect(page.getByTestId("quick-scanlist-toggle")).toBeVisible();
  await page.getByTestId("mobile-action-bar").getByRole("button", { name: "清单" }).click();
  await expect(page.getByRole("dialog", { name: "地点清单" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "地点详情" })).toHaveCount(0);
});

test("map markers show selected state without click animation flicker", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates direct marker interaction");
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await importPersonalFavorites(page);
  await expect(page.locator(".personal-favorite-leaflet-marker")).toHaveCount(32);
  const marker = page.locator(".personal-favorite-leaflet-marker.is-approximate").first();
  await expect(marker).toBeVisible();
  const beforeColor = await marker.locator("span").evaluate((element) => window.getComputedStyle(element).backgroundColor);
  await marker.click();
  await expect(marker).toHaveClass(/is-selected/);
  const selectedStyle = await marker.locator("span").evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      boxShadow: style.boxShadow,
      outlineStyle: style.outlineStyle,
      outlineColor: style.outlineColor
    };
  });
  expect(selectedStyle.backgroundColor).not.toBe(beforeColor);
  expect(selectedStyle.backgroundColor).toBe("rgb(47, 157, 126)");
  expect(selectedStyle.boxShadow).toBe("none");
  expect(selectedStyle.outlineStyle).toBe("none");
  await page.waitForTimeout(500);
  await expect(marker).toHaveClass(/is-selected/);
  await expect(marker).not.toHaveClass(/is-clicked/);
});

test("narrow homepage keeps map actions compact and opens filter sheets", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/#/map");
  const dock = page.getByTestId("home-filter-dock");
  await expect(dock).toBeVisible();
  const dockBox = await dock.boundingBox();
  expect(dockBox?.width ?? 0).toBeLessThanOrEqual(320);

  await page.getByTestId("home-filter-expand").click();
  const quickSheet = page.getByTestId("quick-filter-sheet");
  await expect(quickSheet).toBeVisible();
  await quickSheet.getByRole("button", { name: "想吃" }).click();
  await expect(quickSheet.getByRole("button", { name: "想吃" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "完成" }).click();
  await expect(quickSheet).toHaveCount(0);
  await expect(page.getByTestId("home-filter-expand")).toContainText("标签 1");
  await expect(page.getByTestId("home-filter-summary")).toContainText("想吃");

  await expect(page.getByTestId("home-full-filter")).toBeHidden();
  await page.getByTestId("mobile-action-bar").getByRole("button", { name: "筛选" }).click();
  const panel = page.getByTestId("filter-panel");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("来源");
  const panelBox = await panel.boundingBox();
  expect(panelBox?.width ?? 0).toBeLessThanOrEqual(320);
  await page.getByRole("button", { name: "完成" }).click();
  await expect(panel).toHaveCount(0);
});

test("desktop homepage filter dock keeps every quick action inside the visible bar", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop dock regression");
  for (const size of [
    { width: 2048, height: 768 },
    { width: 1280, height: 820 }
  ]) {
    await page.setViewportSize(size);
    await page.goto("/#/map");
    const dock = page.getByTestId("home-filter-dock");
    await expect(dock).toBeVisible();
    await expect(page.getByTestId("home-share-poster")).toBeVisible();
    await expect(page.getByTestId("home-filter-summary")).toContainText("个人地点");
    const result = await page.evaluate(() => {
      const dockElement = document.querySelector<HTMLElement>("[data-testid='home-filter-dock']");
      if (!dockElement) throw new Error("dock missing");
      const dockRect = dockElement.getBoundingClientRect();
      const overflowing = Array.from(dockElement.querySelectorAll<HTMLElement>(".home-filter-dock__main > *"))
        .filter((child) => {
          const style = window.getComputedStyle(child);
          return style.display !== "none" && style.visibility !== "hidden";
        })
        .filter((child) => {
          const rect = child.getBoundingClientRect();
          return rect.left < dockRect.left - 1 || rect.right > dockRect.right + 1;
        })
        .map((child) => child.textContent?.trim() || child.getAttribute("aria-label") || child.className);
      return {
        dockLeft: dockRect.left,
        dockRight: dockRect.right,
        viewportWidth: window.innerWidth,
        overflowing
      };
    });
    expect(result.dockLeft).toBeGreaterThanOrEqual(0);
    expect(result.dockRight).toBeLessThanOrEqual(result.viewportWidth);
    expect(result.overflowing).toEqual([]);
    await page.screenshot({ path: `docs/active/evidence/p16/desktop-${size.width}x${size.height}-filter-dock.png`, fullPage: true });
  }
});

test("tablet homepage uses the available width without falling back to phone chrome", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/#/map");
  await expect(page.getByTestId("home-filter-dock")).toBeVisible();
  const searchBox = page.locator(".search-box");
  const actionBar = page.getByTestId("mobile-action-bar");
  await expect(searchBox).toBeVisible();
  await expect(actionBar).toBeVisible();
  const searchBoxBounds = await searchBox.boundingBox();
  const actionBarBounds = await actionBar.boundingBox();
  expect(searchBoxBounds?.width ?? 0).toBeGreaterThanOrEqual(520);
  expect(actionBarBounds?.width ?? 0).toBeGreaterThanOrEqual(380);
  await expect(page.getByTestId("home-full-filter")).toBeHidden();
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
  await expect(page.getByTestId("place-editor")).toBeVisible();
  await expect(page.getByTestId("recommendation-summary")).toHaveCount(0);
  await expect(page.getByText("已使用地图点击位置")).toBeVisible();
  await page.getByText("位置详情").click();
  await expect(page.getByLabel("城市")).toHaveValue("武汉");
  await expect(page.getByLabel("经度")).not.toHaveValue("114.3055");
});

test("place editor recognizes intro text and share poster dialog opens separately", async ({ page }, testInfo) => {
  await page.goto("/#/map");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "新增", exact: true }).last().click();
  } else {
    await page.getByTestId("workspace-add-place").click();
  }
  await expect(page.getByTestId("place-editor")).toBeVisible();
  await page.getByPlaceholder("粘贴店铺简介、朋友推荐文本或网页链接。链接内容可由 Agent 解析后回填候选。").fill("店名：小院炭烤\n地址：武汉市江汉区中山公园附近\n夯，下次还来");
  await page.getByRole("button", { name: "识别候选" }).click();
  await expect(page.getByTestId("place-candidate-list")).toContainText("小院炭烤");
  await page.getByTestId("place-candidate-list").getByRole("button").first().click();
  await expect(page.getByLabel("名称")).toHaveValue("小院炭烤");
  await expect(page.getByRole("button", { name: "夯", exact: true })).toHaveClass(/is-active/);
  await page.getByLabel("名称").fill(`小院炭烤 ${Date.now()}`);
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByTestId("place-editor")).toHaveCount(0);
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "更多工具" }).click();
    await page.getByRole("dialog", { name: "更多工具" }).getByRole("button", { name: "导出分享图" }).click();
  } else {
    await page.getByRole("button", { name: "导出" }).click();
  }
  await expect(page.getByTestId("map-poster-dialog")).toBeVisible();
  await expect(page.getByTestId("export-map-poster")).toBeVisible();
});

test("search text can start a new place draft", async ({ page }, testInfo) => {
  await page.goto("/#/map");
  await page.getByTestId("workspace-search").fill("夏氏砂锅");
  await page.getByTestId("search-add-place").click();
  await expect(page.getByTestId("place-editor")).toBeVisible();
  await expect(page.getByLabel("名称")).toHaveValue("夏氏砂锅");
  if (testInfo.project.name === "mobile") {
    await expect(page.getByTestId("mobile-action-bar")).toHaveCount(0);
  }
});

test("place can be created with a photo, protected during edit and deleted", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates full edit/delete detail workflow");
  await page.goto("/#/map");
  await page.getByTestId("workspace-add-place").click();
  await expect(page.getByTestId("place-editor")).toBeVisible();
  const placeName = `照片编辑验收 ${Date.now()}`;
  await page.getByLabel("名称").fill(placeName);
  await page.locator('input[type="file"]').setInputFiles({
    name: "noodle.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=", "base64")
  });
  await expect(page.getByText("noodle.png")).toBeVisible();
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByTestId("place-editor")).toHaveCount(0);

  await page.getByTestId("desktop-open-detail").click();
  const detail = page.getByTestId("place-detail");
  await expect(detail).toContainText(placeName);
  await expect(detail.locator(".detail-hero-photos img")).toHaveCount(1);

  await detail.getByRole("button", { name: "编辑" }).click();
  const editedName = `${placeName} 已编辑`;
  await page.getByLabel("名称").fill(editedName);
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("当前记录还没有保存");
    await dialog.dismiss();
  });
  await page.getByLabel("关闭").click();
  await expect(page.getByTestId("place-editor")).toBeVisible();
  await page.getByRole("button", { name: "保存" }).click();
  await expect(detail).toContainText(editedName);

  await detail.getByRole("button", { name: "删除" }).click();
  await expect(page.getByTestId("place-list")).toContainText("还没有美食图钉");
});

test("imported foodmap file opens the imported readonly share snapshot", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates import handoff");
  await page.goto("/#/map");
  await page.getByRole("button", { name: "导入" }).click();
  await expect(page.getByTestId("import-export-dialog")).toBeVisible();
  const snapshotId = `snapshot-e2e-${Date.now()}`;
  const payload = {
    schema: "foodmap.share",
    version: 1,
    exportedAt: "2026-06-11T00:00:00.000+08:00",
    snapshot: {
      id: snapshotId,
      title: "导入验收地图",
      places: [
        {
          id: "imported-place-1",
          name: "导入验收热干面",
          longitude: 114.31,
          latitude: 30.59,
          city: "武汉",
          layerId: "layer-personal-favorites",
          tags: ["导入验收"],
          rating: 5,
          visitedAt: "2026-06-11",
          notes: "导入后应进入分享页",
          photoIds: [],
          createdAt: "2026-06-11T00:00:00.000+08:00",
          updatedAt: "2026-06-11T00:00:00.000+08:00"
        }
      ],
      layers: [
        { id: "layer-personal-favorites", name: "我的收藏", icon: "heart", color: "#2F8F6F", visible: true, sortOrder: 60 }
      ],
      photos: [],
      exportedAt: "2026-06-11T00:00:00.000+08:00"
    }
  };
  await page.locator('input[type="file"]').setInputFiles({
    name: "imported.foodmap.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(payload), "utf-8")
  });
  await expect(page).toHaveURL(new RegExp(`#/share/${snapshotId}`));
  await expect(page.getByTestId("share-view")).toContainText("导入验收地图");
  await expect(page.getByTestId("share-view")).toContainText("导入验收热干面");
});

test("map poster export downloads a png for the current filtered personal pins", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates browser download");
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    await bridge.dispatch({
      action: "savePlace",
      payload: {
        name: "海报导出验收",
        longitude: 114.31,
        latitude: 30.59,
        city: "武汉",
        rating: 5,
        visitedAt: "2026-06-11",
        tags: ["海报验收", "热干面"]
      }
    });
  });
  await page.getByRole("button", { name: "导出" }).click();
  await expect(page.getByTestId("map-poster-dialog")).toContainText("当前筛选个人图钉");
  await expect(page.getByTestId("map-poster-dialog")).toContainText("#海报验收");
  await page.getByLabel("分享图标题").fill("海报导出验收图");
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-map-poster").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/海报导出验收图\.png$/);
  const stream = await download.createReadStream();
  expect(stream).toBeTruthy();
});

test("place editor can use current location for P16 candidate ranking", async ({ page, context }, testInfo) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ longitude: 114.266, latitude: 30.588 });
  await page.goto("/#/map");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "新增", exact: true }).last().click();
  } else {
    await page.getByTestId("workspace-add-place").click();
  }
  await expect(page.getByTestId("place-editor")).toBeVisible();
  await page.getByRole("button", { name: "使用当前位置排序" }).click();
  await expect(page.getByTestId("user-location-status")).toContainText("已使用当前位置参与候选排序");
  await page.getByPlaceholder("粘贴店铺简介、朋友推荐文本或网页链接。链接内容可由 Agent 解析后回填候选。").fill("万松小院");
  await page.getByRole("button", { name: "识别候选" }).click();
  await expect(page.getByTestId("place-candidate-list")).toContainText("距离你约");
});

test("place editor keeps candidate flow usable when geolocation is denied", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "permissions", {
      value: {
        query: async () => ({ state: "denied" })
      },
      configurable: true
    });
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) => {
          error({ code: 1, message: "denied", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
        }
      },
      configurable: true
    });
  });
  await page.goto("/#/map");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "新增", exact: true }).last().click();
  } else {
    await page.getByTestId("workspace-add-place").click();
  }
  await page.getByRole("button", { name: "使用当前位置排序" }).click();
  await expect(page.getByTestId("user-location-status")).toContainText("定位已拒绝");
  await page.getByPlaceholder("粘贴店铺简介、朋友推荐文本或网页链接。链接内容可由 Agent 解析后回填候选。").fill("店名：拒绝定位也能新增\n地址：武汉市江汉区中山公园附近");
  await page.getByRole("button", { name: "识别候选" }).click();
  await expect(page.getByTestId("place-candidate-list")).toContainText("拒绝定位也能新增");
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
  await expect(page.getByTestId("external-map-actions").getByRole("link", { name: /打开地图/ })).toHaveAttribute("href", /amap\.com/);
});

test("desktop detail panel stays inside compact browser viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop layout regression");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  const placeName = `CRAZYONES克芮旺斯西班牙餐厅XXBUFF 详情布局验收 ${Date.now()}`;
  await page.evaluate(async (name) => {
    const bridge = (window as any).FoodMapAgentBridge;
    const saved = await bridge.dispatch({
      action: "savePlace",
      payload: {
        name,
        longitude: 114.29,
        latitude: 30.58,
        city: "武汉",
        address: "武汉市江汉区长标题布局验收地址，避免右侧详情被撑出屏幕",
        rating: 4,
        visitedAt: "2026-06-15",
        tags: ["吃过", "评分待补", "牛排", "西餐", "长标题验收", "待确认位置"]
      }
    });
    if (!saved.ok) throw new Error(saved.error);
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: saved.data.id } });
  }, placeName);

  const detail = page.locator(".desktop-side-panel").getByTestId("place-detail");
  await expect(detail).toContainText("详情布局验收");
  await expect(page.locator(".leaflet-popup:visible")).toHaveCount(0);
  await page.screenshot({ path: "docs/active/evidence/p16/desktop-1280x900-detail-layout.png", fullPage: true });
  const metrics = await page.evaluate(() => {
    const panel = document.querySelector<HTMLElement>(".desktop-side-panel");
    const drawer = document.querySelector<HTMLElement>(".desktop-side-panel .detail-drawer");
    if (!panel || !drawer) throw new Error("detail panel missing");
    const panelRect = panel.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      panelLeft: panelRect.left,
      panelRight: panelRect.right,
      panelWidth: panelRect.width,
      drawerClientWidth: drawer.clientWidth,
      drawerScrollWidth: drawer.scrollWidth,
      bodyScrollWidth: document.documentElement.scrollWidth
    };
  });
  expect(metrics.panelWidth).toBeGreaterThanOrEqual(300);
  expect(metrics.panelLeft).toBeGreaterThanOrEqual(0);
  expect(metrics.panelRight).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.drawerScrollWidth).toBeLessThanOrEqual(metrics.drawerClientWidth + 1);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
});

test("place detail follows P17 information architecture order", async ({ page }, testInfo) => {
  const isMobile = testInfo.project.name === "mobile";
  await page.setViewportSize(isMobile ? { width: 390, height: 844 } : { width: 1280, height: 900 });
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  const placeName = `P17详情信息架构验收 ${Date.now()}`;
  await page.evaluate(async (name) => {
    const bridge = (window as any).FoodMapAgentBridge;
    const saved = await bridge.dispatch({
      action: "savePlace",
      payload: {
        name,
        longitude: 114.289,
        latitude: 30.582,
        city: "武汉",
        address: "武汉市江汉区详情信息架构验收长地址，用于验证换行和层级顺序",
        rating: 4.4,
        visitedAt: "2026-06-16",
        tags: ["吃过", "朋友推荐", "牛排", "西餐", "待校准", "近似坐标"],
        notes: "P17 详情页应先展示状态、标签和核心操作，再展示照片、评分、地址、校准和笔记。"
      }
    });
    if (!saved.ok) throw new Error(saved.error);
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: saved.data.id } });
  }, placeName);

  const detail = isMobile
    ? page.getByRole("dialog", { name: "地点详情" }).getByTestId("place-detail")
    : page.locator(".desktop-side-panel").getByTestId("place-detail");
  await expect(detail).toBeVisible();
  await expect(detail.getByTestId("detail-status-source")).toContainText("待确认");
  await expect(detail.getByTestId("detail-core-actions")).toContainText("手动挪动图钉");

  const order = await detail.evaluate((root) => {
    const top = (selector: string) => {
      const element = root.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`missing ${selector}`);
      return element.getBoundingClientRect().top;
    };
    return {
      status: top("[data-testid='detail-status-source']"),
      title: top(".detail-drawer__identity"),
      tags: top(".detail-tags-editor"),
      core: top("[data-testid='detail-core-actions']"),
      record: top(".detail-record-section"),
      calibration: top(".detail-calibration-section"),
      notes: top("[data-testid='detail-notes-disclosure']")
    };
  });
  expect(order.status).toBeLessThan(order.title);
  expect(order.title).toBeLessThan(order.tags);
  expect(order.tags).toBeLessThan(order.core);
  expect(order.core).toBeLessThan(order.record);
  expect(order.record).toBeLessThan(order.calibration);
  expect(order.calibration).toBeLessThan(order.notes);

  const widths = await detail.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth
  }));
  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth + 1);
});

test("mobile P17 main path reaches detail tags, map fallback and share poster", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile main path acceptance");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await importPersonalFavorites(page);

  await page.getByTestId("quick-pending-toggle").click();
  const pendingDialog = page.getByRole("dialog", { name: "待确认工作台" });
  await expect(pendingDialog.getByTestId("pending-workbench")).toBeVisible();
  await pendingDialog.getByTestId("pending-place-card").first().locator(".pending-card__main").click();

  const detailDialog = page.getByRole("dialog", { name: "地点详情" });
  const detail = detailDialog.getByTestId("place-detail");
  await expect(detail).toBeVisible();
  await expect(detail.getByTestId("detail-status-source")).toContainText("待确认");
  await expect(detail.getByTestId("detail-core-actions")).toContainText("复制地址/坐标");
  await expect(detail.getByTestId("pin-move-card")).toContainText("手动挪动图钉");

  await detail.getByLabel("添加自定义标签").fill("移动主路径验收");
  await detail.getByRole("button", { name: "添加" }).click();
  await expect(detail.locator(".detail-priority-tags")).toContainText("移动主路径验收");

  await detail.getByTestId("detail-share-poster").click();
  await expect(detailDialog).toHaveCount(0);
  await expect(page.getByTestId("map-poster-dialog")).toBeVisible();
  await expect(page.getByTestId("export-map-poster")).toBeVisible();
  await page.screenshot({ path: "docs/active/evidence/p17/mobile-390x844-main-path.png", fullPage: true });
});

test("mobile place detail drawer scrolls within the sheet", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile sheet scroll regression");
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  const placeName = `移动详情滚动验收 ${Date.now()}`;
  await page.evaluate(async (name) => {
    const bridge = (window as any).FoodMapAgentBridge;
    const longNotes = Array.from({ length: 18 }, (_, index) => `第 ${index + 1} 条记录：这里是用于验证详情页滚动的长文本内容。`).join("\n");
    const saved = await bridge.dispatch({
      action: "savePlace",
      payload: {
        name,
        longitude: 114.31,
        latitude: 30.59,
        city: "武汉",
        address: "武汉市江汉区滚动验收路 1 号",
        rating: 5,
        visitedAt: "2026-06-10",
        tags: ["吃过", "滚动验收", "火锅", "朋友聚餐", "长备注"],
        notes: longNotes
      }
    });
    if (!saved.ok) throw new Error(saved.error);
    const list = await bridge.dispatch({ action: "listPlaces" });
    const place = list.data.find((item: { id: string; name: string }) => item.name === name);
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: place.id } });
  }, placeName);

  const mobileDetail = page.getByRole("dialog", { name: "地点详情" }).getByTestId("place-detail");
  await expect(mobileDetail).toBeVisible();
  await mobileDetail.getByTestId("detail-notes-disclosure").locator("summary").click();
  const before = await mobileDetail.evaluate((element) => ({
    scrollTop: element.scrollTop,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight
  }));
  expect(before.scrollHeight).toBeGreaterThan(before.clientHeight + 80);
  await mobileDetail.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  const after = await mobileDetail.evaluate((element) => element.scrollTop);
  expect(after).toBeGreaterThan(before.scrollTop + 60);
  await expect(mobileDetail.getByText("第 18 条记录")).toBeVisible();
});

test("mobile scanlist detail uses a single scroll layer", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile scanlist detail scroll regression");
  await page.goto("/#/map");
  await loadRecommendations(page, testInfo.project.name);
  const panel = page.getByRole("dialog", { name: "扫街榜清单" }).getByTestId("recommendation-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByText("刘聋子牛肉粉馆(汉阳龙兴东街店)").first()).toBeVisible();
  await panel.getByText("刘聋子牛肉粉馆(汉阳龙兴东街店)").first().click();
  await expect(panel.getByTestId("recommendation-detail")).toBeVisible();

  const toolbarPosition = await panel.locator(".recommendation-toolbar").evaluate((element) => window.getComputedStyle(element).position);
  const sheetOverflow = await page.getByRole("dialog", { name: "扫街榜清单" }).evaluate((element) => window.getComputedStyle(element).overflowY);
  expect(toolbarPosition).toBe("static");
  expect(sheetOverflow).toBe("hidden");

  const before = await panel.evaluate((element) => ({
    scrollTop: element.scrollTop,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight
  }));
  expect(before.scrollHeight).toBeGreaterThan(before.clientHeight + 80);
  await panel.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  const after = await panel.evaluate((element) => element.scrollTop);
  expect(after).toBeGreaterThan(before.scrollTop + 60);
});

test("P17 real data performance smoke records map interactions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop records real-data performance smoke");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await importPersonalFavorites(page);

  await page.getByTestId("quick-scanlist-toggle").click();
  await expect(page.locator(".recommendation-leaflet-marker")).toHaveCount(50);
  await page.getByTestId("quick-dingtuyi-toggle").click();
  await expect(page.locator(".dingtuyi-share-leaflet-marker")).toHaveCount(120);

  const counts = {
    personal: await page.locator(".personal-favorite-leaflet-marker").count(),
    scanlist: await page.locator(".recommendation-leaflet-marker").count(),
    dingtuyi: await page.locator(".dingtuyi-share-leaflet-marker").count()
  };

  const pendingStart = Date.now();
  await page.getByTestId("quick-pending-toggle").click();
  await expect(page.getByTestId("pending-workbench")).toBeVisible();
  const pendingOpenMs = Date.now() - pendingStart;

  const detailStart = Date.now();
  await page.getByTestId("pending-place-card").first().locator(".pending-card__main").click();
  await expect(page.locator(".desktop-side-panel").getByTestId("place-detail")).toBeVisible();
  const detailOpenMs = Date.now() - detailStart;

  const zoomStart = Date.now();
  await page.locator(".leaflet-control-zoom-in").click();
  await page.waitForFunction(() => !document.querySelector(".leaflet-map.is-zooming"));
  const zoomMs = Date.now() - zoomStart;

  expect(counts.personal).toBe(32);
  expect(counts.scanlist).toBe(50);
  expect(counts.dingtuyi).toBe(120);
  expect(pendingOpenMs).toBeLessThan(3000);
  expect(detailOpenMs).toBeLessThan(3000);
  expect(zoomMs).toBeLessThan(3000);

  fs.mkdirSync("docs/active/evidence/p17", { recursive: true });
  fs.writeFileSync(
    "docs/active/evidence/p17/p17-real-data-performance-smoke.json",
    JSON.stringify({
      viewport: "1440x900",
      counts,
      timingsMs: { pendingOpenMs, detailOpenMs, zoomMs },
      thresholdMs: 3000,
      capturedAt: new Date().toISOString()
    }, null, 2)
  );
});

test("P18 large deterministic dataset performance smoke", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop records large dataset smoke");
  test.setTimeout(180_000);
  const datasetSizes = [500, 1000, 3000];
  const results: Array<{
    size: number;
    reloadMs: number;
    markerRenderMs: number;
    filterMs: number;
    detailOpenMs: number;
    posterOpenMs: number;
  }> = [];

  for (const size of datasetSizes) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#/map");
    await seedLargePersonalDataset(page, size);
    const reloadStart = Date.now();
    await page.reload();
    await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
    const reloadMs = Date.now() - reloadStart;

    const markerStart = Date.now();
    await expect(page.locator(".personal-favorite-leaflet-marker")).toHaveCount(size, { timeout: 30_000 });
    const markerRenderMs = Date.now() - markerStart;

    await page.getByTestId("home-filter-expand").click();
    const filterStart = Date.now();
    await page.getByRole("button", { name: "热干面" }).click();
    await expect(page.getByTestId("home-filter-summary")).toContainText("热干面");
    const filterMs = Date.now() - filterStart;

    const posterStart = Date.now();
    await page.getByTestId("home-share-poster").click();
    await expect(page.getByTestId("map-poster-dialog")).toBeVisible();
    const posterOpenMs = Date.now() - posterStart;
    await page.getByRole("button", { name: "关闭" }).click();

    const detailStart = Date.now();
    await page.evaluate(() => {
      const markers = Array.from(document.querySelectorAll<HTMLElement>(".personal-favorite-leaflet-marker"));
      const target = markers.find((marker) => {
        const rect = marker.getBoundingClientRect();
        return rect.left >= 0 && rect.top >= 0 && rect.right <= window.innerWidth && rect.bottom <= window.innerHeight;
      }) ?? markers[0];
      if (!target) throw new Error("no personal marker available");
      target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    });
    await expect(page.locator(".desktop-side-panel").getByTestId("place-detail")).toBeVisible();
    const detailOpenMs = Date.now() - detailStart;

    expect(reloadMs).toBeLessThan(10_000);
    expect(markerRenderMs).toBeLessThan(30_000);
    expect(filterMs).toBeLessThan(5_000);
    expect(detailOpenMs).toBeLessThan(5_000);
    expect(posterOpenMs).toBeLessThan(5_000);

    results.push({ size, reloadMs, markerRenderMs, filterMs, detailOpenMs, posterOpenMs });
  }

  fs.mkdirSync("docs/active/evidence/p18", { recursive: true });
  fs.writeFileSync(
    "docs/active/evidence/p18/p18-large-dataset-performance-smoke.json",
    JSON.stringify({
      viewport: "1440x900",
      thresholdsMs: {
        reloadMs: 10_000,
        markerRenderMs: 30_000,
        filterMs: 5_000,
        detailOpenMs: 5_000,
        posterOpenMs: 5_000
      },
      results,
      capturedAt: new Date().toISOString()
    }, null, 2)
  );
});

test("loads scanlist recommendations and shows all 50 verified pins", async ({ page }, testInfo) => {
  await page.goto("/#/map");
  await loadRecommendations(page, testInfo.project.name);
  if (testInfo.project.name === "desktop") {
    await expect(page.getByTestId("quick-scanlist-toggle")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("quick-scanlist-toggle")).toContainText("50");
    await expect(page.getByTestId("recommendation-summary")).toHaveCount(0);
    await expect(page.getByTestId("map-pin-legend")).toContainText("榜单");
    await expect(page.locator(".recommendation-leaflet-marker")).toHaveCount(50);
  } else {
    await expect(page.getByTestId("recommendation-summary")).toHaveCount(0);
  }
  if (testInfo.project.name === "desktop") {
    await page.getByTestId("desktop-open-detail").click();
  }
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
  await expect(panel.getByRole("button", { name: "加入我的收藏" })).toBeEnabled();
  await expect(panel.getByTestId("recommendation-map-actions").getByRole("link", { name: /打开地图/ })).toHaveAttribute("href", /amap\.com/);

  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  if (testInfo.project.name === "desktop") {
    await page.evaluate(async () => {
      const bridge = (window as any).FoodMapAgentBridge;
      const list = await bridge.dispatch({ action: "listRecommendations" });
      const target = list.data.find((item: { rank: number }) => item.rank > 20);
      await bridge.dispatch({ action: "focusRecommendation", payload: { sourceId: target.sourceId } });
    });
    await expect(page.locator(".recommendation-leaflet-marker.is-selected").first()).toBeVisible();
  }
  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const list = await bridge.dispatch({ action: "listRecommendations" });
    const target = list.data.find((item: { name: string }) => item.name === "山饭子特色餐厅(汉阳国博新城店)");
    await bridge.dispatch({ action: "focusRecommendation", payload: { sourceId: target.sourceId } });
  });
  await expect(panel.getByText("近似位置，建议收藏后手动校准")).toBeVisible();
  await expect(panel.getByRole("button", { name: "加入我的收藏" })).toBeEnabled();
});

test("scanlist detail can add a recommendation to my favorites and open saved detail", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates the full side-panel save path");
  await page.goto("/#/map");
  await loadRecommendations(page, testInfo.project.name);
  await page.getByTestId("desktop-open-detail").click();
  const panel = page.getByTestId("recommendation-panel").last();
  await panel.getByTestId("recommendation-list-toggle").click();
  await panel.getByText("刘聋子牛肉粉馆(汉阳龙兴东街店)").first().click();
  await panel.getByRole("button", { name: "加入我的收藏" }).click();
  const detail = page.getByTestId("place-detail");
  await expect(detail).toBeVisible();
  await expect(detail).toContainText("我的收藏");
  await expect(detail).toContainText("刘聋子牛肉粉馆(汉阳龙兴东街店)");
  await expect(detail.getByTestId("external-map-actions").getByRole("link", { name: /打开地图/ })).toBeVisible();
});

test("homepage cuisine tags filter scanlist recommendation pins", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop homepage filter dock has the persistent expanded tag row");
  await page.goto("/#/map");
  await loadRecommendations(page, testInfo.project.name);
  await page.getByTestId("home-filter-expand").click();
  await page.getByRole("button", { name: "牛肉粉", exact: true }).click();
  await expect(page.getByRole("button", { name: "牛肉粉", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("desktop-open-detail").click();
  const panel = page.getByTestId("recommendation-panel").last();
  await panel.getByTestId("recommendation-list-toggle").click();
  await expect(panel.getByText("刘聋子牛肉粉馆(汉阳龙兴东街店)").first()).toBeVisible();
  await expect(panel.getByText("蟹神(拦江路店)").first()).toHaveCount(0);
});

test("homepage visit status filters hide scanlist recommendation pins", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop homepage filter dock has the persistent expanded tag row");
  await page.goto("/#/map");
  await loadRecommendations(page, testInfo.project.name);
  await page.getByTestId("home-filter-expand").click();
  await page.getByRole("button", { name: "避雷", exact: true }).click();
  await expect(page.getByRole("button", { name: "避雷", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("desktop-open-detail").click();
  const panel = page.getByTestId("recommendation-panel").last();
  await panel.getByTestId("recommendation-list-toggle").click();
  await expect(panel.getByText("刘聋子牛肉粉馆(汉阳龙兴东街店)").first()).toHaveCount(0);
  await expect(page.locator(".recommendation-leaflet-marker")).toHaveCount(0);
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

test("agent bridge returns structured errors, emits events and does not write invalid data", async ({ page }) => {
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  const result = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const events: Array<{ type: string; action?: string; ok?: boolean; errorCode?: string }> = [];
    window.addEventListener("foodmap:agent-command", (event: Event) => {
      const detail = (event as CustomEvent).detail;
      events.push({ type: "command", action: detail.action });
    });
    window.addEventListener("foodmap:agent-result", (event: Event) => {
      const detail = (event as CustomEvent).detail;
      events.push({ type: "result", action: detail.action, ok: detail.ok, errorCode: detail.errorCode });
    });

    const before = await bridge.dispatch({ action: "listPlaces" });
    const missingPlace = await bridge.dispatch({ action: "getPlace", payload: { placeId: "missing-place" } });
    const invalidSave = await bridge.dispatch({
      action: "savePlace",
      payload: {
        name: "",
        longitude: Number.NaN,
        latitude: Number.NaN,
        rating: 8
      }
    });
    const invalidRecommendation = await bridge.dispatch({
      action: "saveRecommendationAsPlace",
      payload: { sourceId: "missing-recommendation" }
    });
    const exported = await bridge.dispatch({ action: "exportSnapshot" });
    const candidateContext = await bridge.dispatch({ action: "getPlaceCandidateContext" });
    const pendingSeed = await bridge.dispatch({
      action: "savePlace",
      payload: {
        id: "agent-pending-place",
        name: "Agent 待确认地点",
        longitude: 114.3036,
        latitude: 30.6072,
        city: "武汉",
        address: "武汉市江岸区候选地址",
        layerId: "layer-personal-favorites",
        tags: ["待校准", "近似坐标", "位置待确认"],
        mapAccuracy: "approximate",
        rating: 3,
        visitedAt: "2026-06-16",
        notes: "Agent negative path fixture"
      }
    });
    const pendingList = await bridge.dispatch({ action: "listPendingPlaces" });
    const pendingContext = await bridge.dispatch({ action: "getPendingPlaceContext", payload: { placeId: "agent-pending-place" } });
    const blockedPendingUpdate = await bridge.dispatch({
      action: "updatePlace",
      payload: {
        id: "agent-pending-place",
        longitude: 114.31,
        latitude: 30.59,
        mapAccuracy: "exact",
        tags: ["已核验", "精确坐标"]
      }
    });
    const blockedPendingDelete = await bridge.dispatch({ action: "deletePlace", payload: { placeId: "agent-pending-place" } });
    const submittedCandidates = await bridge.dispatch({
      action: "submitPlaceCandidates",
      payload: {
        sourceNote: "e2e",
        candidates: [
          {
            name: "Agent 候选完整店",
            address: "武汉市江汉区示例路 1 号",
            city: "武汉",
            longitude: 114.31,
            latitude: 30.59,
            confidence: 0.82,
            reasons: ["E2E 结构化候选"]
          },
          {
            name: "Agent 候选缺字段",
            confidence: 0.8,
            reasons: ["E2E 缺字段候选"]
          }
        ]
      }
    });
    const after = await bridge.dispatch({ action: "listPlaces" });

    const invalidPlaceExists = after.data.some((place: { name: string; longitude: number; latitude: number; rating: number }) => (
      !place.name || Number.isNaN(place.longitude) || Number.isNaN(place.latitude) || place.rating > 5
    ));

    return {
      beforeCount: before.data.length,
      afterCount: after.data.length,
      invalidPlaceExists,
      missingPlace,
      invalidSave,
      invalidRecommendation,
      exportedOk: exported.ok,
      exportedText: exported.data.text,
      candidateContext,
      pendingSeed,
      pendingList,
      pendingContext,
      blockedPendingUpdate,
      blockedPendingDelete,
      submittedCandidates,
      events
    };
  });

  expect(result.missingPlace.ok).toBeFalsy();
  expect(result.missingPlace.errorCode).toBe("PLACE_NOT_FOUND");
  expect(result.invalidSave.ok).toBeFalsy();
  expect(result.invalidSave.errorCode).toBe("INVALID_PAYLOAD");
  expect(result.invalidRecommendation.ok).toBeFalsy();
  expect(result.invalidRecommendation.errorCode).toBe("INVALID_PAYLOAD");
  expect(result.invalidPlaceExists).toBe(false);
  expect(result.exportedOk).toBeTruthy();
  expect(JSON.parse(result.exportedText).schema).toBe("foodmap.share");
  expect(result.candidateContext.ok).toBeTruthy();
  expect(result.candidateContext.data.city).toBe("武汉");
  expect(result.pendingSeed.ok).toBeTruthy();
  expect(result.pendingList.ok).toBeTruthy();
  expect(result.pendingList.data.some((place: { id: string }) => place.id === "agent-pending-place")).toBeTruthy();
  expect(result.pendingContext.ok).toBeTruthy();
  expect(result.pendingContext.data.candidateRequest.note).toContain("不能直接固化坐标");
  expect(result.blockedPendingUpdate.ok).toBeFalsy();
  expect(result.blockedPendingUpdate.errorCode).toBe("PENDING_CONFIRMATION_REQUIRED");
  expect(result.blockedPendingDelete.ok).toBeFalsy();
  expect(result.blockedPendingDelete.errorCode).toBe("PENDING_CONFIRMATION_REQUIRED");
  expect(result.submittedCandidates.ok).toBeTruthy();
  expect(result.submittedCandidates.data.candidates).toHaveLength(1);
  expect(result.submittedCandidates.data.blockedCandidates).toHaveLength(1);
  expect(result.events.some((event) => event.type === "command" && event.action === "exportSnapshot")).toBeTruthy();
  expect(result.events.some((event) => event.type === "result" && event.action === "savePlace" && event.errorCode === "INVALID_PAYLOAD")).toBeTruthy();
});
