import { expect, type Page, test } from "@playwright/test";
import fs from "node:fs";

function getRuntimeEnv(name: string): string | undefined {
  return (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];
}

function getDeployUrl(): string | undefined {
  const value = getRuntimeEnv("FOODMAP_DEPLOY_URL")?.trim();
  if (!value) return undefined;
  const url = new URL(value);
  if (!url.pathname.endsWith("/")) url.pathname = `${url.pathname}/`;
  return url.toString();
}

async function loadRecommendations(page: Page, projectName: string) {
  if (projectName === "mobile") {
    await page.getByRole("button", { name: "更多工具" }).click();
    await page.getByRole("dialog", { name: "更多工具" }).getByRole("button", { name: "扫街榜", exact: true }).click();
    return;
  }
  await page.getByTestId("quick-scanlist-toggle").click();
}

async function importPersonalFavorites(page: Page) {
  const directImport = page.getByTestId("workspace-import");
  if (await directImport.isVisible().catch(() => false)) {
    await directImport.click();
  } else {
    await page.getByRole("button", { name: "更多工具" }).click();
    await page.getByRole("dialog", { name: "更多工具" }).getByRole("button", { name: "数据包" }).click();
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
    const openRequest = indexedDB.open("foodmap-db", 2);
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

async function readFoodMapStoreCounts(page: Page) {
  return page.evaluate(async () => {
    const openRequest = indexedDB.open("foodmap-db", 2);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => resolve(openRequest.result);
    });
    async function count(storeName: string) {
      if (!db.objectStoreNames.contains(storeName)) return 0;
      const tx = db.transaction(storeName, "readonly");
      const request = tx.objectStore(storeName).count();
      return new Promise<number>((resolve, reject) => {
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    }
    const result = {
      places: await count("places"),
      layers: await count("layers"),
      photos: await count("photos"),
      snapshots: await count("snapshots"),
      governanceJournal: await count("governanceJournal")
    };
    db.close();
    return result;
  });
}

function buildP21PortablePackage(snapshotId = `p21-share-${Date.now()}`) {
  return {
    schema: "foodmap.share",
    version: 1,
    exportedAt: "2026-06-24T00:00:00.000Z",
    snapshot: {
      id: snapshotId,
      title: "P21 只读分享地图",
      exportedAt: "2026-06-24T00:00:00.000Z",
      layers: [
        { id: "layer-p21-share", name: "P21 分享层", icon: "heart", color: "#2F8F6F", visible: true, sortOrder: 1 }
      ],
      places: [
        {
          id: "p21-share-place",
          name: "P21 分享热干面",
          longitude: 114.3036,
          latitude: 30.6072,
          city: "武汉",
          address: "武汉市江岸区 P21 分享路 1 号",
          layerId: "layer-p21-share",
          tags: ["P21分享", "热干面"],
          rating: 5,
          visitedAt: "2026-06-24",
          notes: "P21 clean profile readonly share fixture",
          photoIds: ["p21-photo-1"],
          createdAt: "2026-06-24T00:00:00.000Z",
          updatedAt: "2026-06-24T00:00:00.000Z",
          mapAccuracy: "exact"
        }
      ],
      photos: [
        {
          id: "p21-photo-1",
          placeId: "p21-share-place",
          fileName: "p21-noodle.png",
          mimeType: "image/png",
          thumbnailDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
          createdAt: "2026-06-24T00:00:00.000Z"
        }
      ]
    }
  };
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
    await page.getByRole("dialog", { name: "更多工具" }).getByRole("button", { name: "分享图" }).click();
  } else {
    await page.locator("header").getByRole("button", { name: "分享图" }).click();
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

test("imported foodmap file previews conflicts then opens the imported readonly share snapshot", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates import handoff");
  await page.goto("/#/map");
  await page.getByTestId("workspace-import").click();
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
          longitude: 114.3036,
          latitude: 30.6072,
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
  await page.getByTestId("import-governance-preview").click();
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "imported.foodmap.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(payload), "utf-8")
  });
  await expect(page.getByTestId("import-conflict-preview")).toContainText("新增 1");
  await page.getByTestId("import-conflict-preview").getByRole("button", { name: "确认导入可写项" }).click();
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
  await page.locator("header").getByRole("button", { name: "分享图" }).click();
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

test("P19 current viewport poster uses real map bounds and explicit empty state", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates viewport poster source and download");
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    await bridge.dispatch({
      action: "savePlace",
      payload: {
        id: "p19-poster-inside",
        name: "P19 视野内热干面",
        longitude: 114.31,
        latitude: 30.59,
        city: "武汉",
        rating: 5,
        visitedAt: "2026-06-23",
        tags: ["P19视野海报", "热干面"]
      }
    });
    await bridge.dispatch({
      action: "savePlace",
      payload: {
        id: "p19-poster-outside",
        name: "P19 视野外小吃",
        longitude: 116.4,
        latitude: 39.9,
        city: "北京",
        rating: 4,
        visitedAt: "2026-06-23",
        tags: ["P19视野海报", "空视野验收"]
      }
    });
    await bridge.dispatch({ action: "setFilter", payload: { tags: ["P19视野海报"], source: "personal" } });
  });

  await expect(page.getByTestId("home-filter-summary")).toContainText("2/2");
  await page.locator("header").getByRole("button", { name: "分享图" }).click();
  await expect(page.getByTestId("map-poster-dialog")).toBeVisible();
  await expect(page.getByTestId("poster-source-count")).toContainText("2 个当前筛选个人图钉");
  await page.getByTestId("poster-mode-current-viewport").click();
  await expect(page.getByTestId("poster-source-count")).toContainText("1 个当前视野个人图钉");
  await expect(page.getByTestId("map-poster-dialog")).toContainText("#热干面");
  await page.getByLabel("分享图标题").fill("P19 当前视野海报");
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-map-poster").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/P19 当前视野海报\.png$/);
  expect(await download.createReadStream()).toBeTruthy();

  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    await bridge.dispatch({ action: "setFilter", payload: { tags: ["空视野验收"], source: "personal" } });
  });
  await page.locator("header").getByRole("button", { name: "分享图" }).click();
  await page.getByTestId("poster-mode-current-viewport").click();
  await expect(page.getByTestId("poster-source-count")).toContainText("0 个当前视野个人图钉");
  await expect(page.getByTestId("poster-empty-viewport")).toBeVisible();
  await expect(page.getByTestId("export-map-poster")).toBeDisabled();
});

test("P19 data health center groups places and actions do not mutate facts", async ({ page, browserName }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop" || browserName !== "chromium", "desktop validates data health center");
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const fixtures = [
      {
        id: "p19-health-verified",
        name: "P19 已核验店",
        longitude: 114.31,
        latitude: 30.59,
        city: "武汉",
        rating: 5,
        visitedAt: "2026-06-23",
        tags: ["已核验", "精确坐标"],
        mapAccuracy: "exact"
      },
      {
        id: "p19-health-pending",
        name: "P19 待确认店",
        longitude: 114.3036,
        latitude: 30.6072,
        city: "武汉",
        rating: 4,
        visitedAt: "2026-06-23",
        tags: ["待校准", "近似坐标", "位置待确认"],
        mapAccuracy: "approximate"
      },
      {
        id: "p19-health-high-risk",
        name: "P19 高风险店",
        longitude: 114.31,
        latitude: 30.59,
        city: "武汉",
        rating: 3,
        visitedAt: "2026-06-23",
        tags: ["位置高风险", "待校准", "近似坐标"],
        mapAccuracy: "approximate"
      },
      {
        id: "p19-health-manual",
        name: "P19 手动校准店",
        longitude: 114.32,
        latitude: 30.61,
        city: "武汉",
        rating: 4,
        visitedAt: "2026-06-23",
        tags: ["已核验", "精确坐标", "手动校准"],
        mapAccuracy: "exact",
        notes: "用户手动拖动图钉校准。原坐标 114.1,30.1"
      },
      {
        id: "p19-health-skipped",
        name: "P19 已跳过店",
        longitude: 114.33,
        latitude: 30.62,
        city: "武汉",
        rating: 2,
        visitedAt: "2026-06-23",
        tags: ["暂时跳过", "位置待确认"],
        mapAccuracy: "approximate",
        notes: "待确认处理：用户暂时跳过。"
      }
    ];
    for (const payload of fixtures) {
      await bridge.dispatch({ action: "savePlace", payload });
    }
  });
  const before = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const result = await bridge.dispatch({ action: "listPlaces" });
    return result.data;
  });

  await page.getByTestId("quick-data-health").click();
  await expect(page.getByTestId("data-health-center")).toBeVisible();
  await expect(page.getByTestId("data-health-center")).toContainText("已核验");
  await expect(page.getByTestId("data-health-center")).toContainText("待确认");
  await expect(page.getByTestId("data-health-center")).toContainText("高风险");
  await expect(page.getByTestId("data-health-center")).toContainText("手动校准");
  await expect(page.getByTestId("data-health-center")).toContainText("已跳过");
  await expect(page.getByTestId("data-health-center")).toContainText("P19 高风险店");
  const highRiskGroup = page.locator(".data-health-group").nth(2);
  await highRiskGroup.getByRole("button", { name: /P19 高风险店/ }).click();
  await expect(page.getByTestId("place-detail")).toContainText("P19 高风险店");

  await page.getByLabel("收起详情").click();
  await page.getByTestId("quick-data-health").click();
  await page.locator(".data-health-group").nth(2).getByRole("button", { name: "筛选" }).click();
  await expect(page.getByTestId("home-filter-summary")).toContainText("个人地点");

  const after = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const result = await bridge.dispatch({ action: "listPlaces" });
    return result.data;
  });
  expect(after).toEqual(before);
});

test("P19 responsive keeps data health and poster controls reachable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project drives fixed viewport regression");
  fs.mkdirSync("docs/active/evidence/p19", { recursive: true });
  const viewports = [
    { name: "mobile-390", width: 390, height: 844 },
    { name: "mobile-430", width: 430, height: 932 },
    { name: "tablet-768", width: 768, height: 900 },
    { name: "desktop-1280", width: 1280, height: 820 }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/#/map");
    await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
    await page.evaluate(async (name) => {
      const bridge = (window as any).FoodMapAgentBridge;
      await bridge.dispatch({
        action: "savePlace",
        payload: {
          id: `p19-responsive-${name}`,
          name: `P19 响应式验收 ${name}`,
          longitude: 114.31,
          latitude: 30.59,
          city: "武汉",
          rating: 5,
          visitedAt: "2026-06-23",
          tags: ["P19响应式", "已核验", "精确坐标"],
          mapAccuracy: "exact"
        }
      });
    }, viewport.name);

    await expect(page.getByTestId("workspace-map")).toBeVisible();
    await expect(page.getByTestId("quick-data-health")).toBeVisible();
    await page.getByTestId("quick-data-health").click();
    await expect(page.getByTestId("data-health-center").last()).toBeVisible();
    await page.screenshot({ path: `docs/active/evidence/p19/${viewport.name}-data-health.png`, fullPage: true });
    if (viewport.width <= 900) {
      await page.getByRole("button", { name: "关闭" }).click();
    } else {
      await page.getByLabel("收起详情").click();
    }
    await expect(page.getByTestId("workspace-map")).toBeVisible();

    if (viewport.width <= 900) {
      await page.getByLabel("更多工具").click();
      await page.getByRole("dialog", { name: "更多工具" }).getByRole("button", { name: "分享图" }).click();
    } else {
      await page.locator("header").getByRole("button", { name: "分享图" }).click();
    }
    await expect(page.getByTestId("map-poster-dialog")).toBeVisible();
    await expect(page.getByTestId("poster-mode-current-filter")).toBeVisible();
    await expect(page.getByTestId("poster-mode-current-viewport")).toBeVisible();
    await page.screenshot({ path: `docs/active/evidence/p19/${viewport.name}-poster.png`, fullPage: true });
    await page.getByRole("button", { name: "关闭" }).click();
  }
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

test("P20 governance workbench previews duplicate merge and writes journal only after confirmation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates P20 governance workbench");
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const base = {
      longitude: 114.266,
      latitude: 30.59,
      city: "武汉",
      layerId: "layer-personal-favorites",
      rating: 4,
      visitedAt: "2026-06-24",
      photoIds: [],
      createdAt: "2026-06-24T00:00:00.000Z",
      updatedAt: "2026-06-24T00:00:00.000Z",
      mapAccuracy: "exact"
    };
    await bridge.dispatch({ action: "savePlace", payload: { ...base, id: "p20-e2e-pending", name: "P20 治理待确认店", tags: ["待校准", "近似坐标"], notes: "P20 governance fixture", mapAccuracy: "approximate" } });
    await bridge.dispatch({ action: "savePlace", payload: { ...base, id: "p20-e2e-dup-a", name: "P20 万松小院荷花垄", tags: ["湖北菜", "已核验"], notes: "重复 A" } });
    await bridge.dispatch({ action: "savePlace", payload: { ...base, id: "p20-e2e-dup-b", name: "P20 万松小院（荷花垄店）", longitude: 114.2662, latitude: 30.5901, rating: 5, tags: ["湖北菜", "想再去"], notes: "重复 B" } });
  });

  await page.getByTestId("quick-data-health").click();
  await expect(page.getByTestId("data-health-center")).toBeVisible();
  await page.getByTestId("open-governance-workbench").click();
  await expect(page.getByTestId("governance-workbench")).toBeVisible();
  await expect(page.getByTestId("governance-workbench")).toContainText("P20 个人数据治理");
  await page.getByRole("button", { name: /重复地点建议/ }).click();
  await expect(page.getByTestId("governance-issue").filter({ hasText: "P20 万松小院" }).first()).toBeVisible();
  await page.getByTestId("duplicate-merge-button").first().click();
  await expect(page.getByTestId("duplicate-merge-preview")).toBeVisible();
  await expect(page.getByTestId("duplicate-merge-preview")).toContainText("确认合并");

  const before = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    return places.data.filter((place: { id: string }) => place.id.startsWith("p20-e2e-dup")).length;
  });
  expect(before).toBe(2);
  await page.getByTestId("duplicate-merge-preview").getByRole("button", { name: "确认合并" }).click();
  await expect(page.getByTestId("governance-history-summary")).toContainText("合并重复地点");
  const after = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    const journal = await bridge.dispatch({ action: "listGovernanceJournal" });
    return {
      duplicateCount: places.data.filter((place: { id: string }) => place.id.startsWith("p20-e2e-dup")).length,
      journalOk: journal.data.some((entry: { summary: string }) => entry.summary.includes("合并重复地点"))
    };
  });
  expect(after.duplicateCount).toBe(1);
  expect(after.journalOk).toBeTruthy();
});

test("P20 import conflict preview is shown before any import write", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates P20 import conflict preview");
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  const payload = {
    schema: "foodmap.share",
    version: 1,
    exportedAt: "2026-06-24T00:00:00.000Z",
    snapshot: {
      id: "p20-import-snapshot",
      title: "P20 导入冲突验收",
      exportedAt: "2026-06-24T00:00:00.000Z",
      layers: [],
      photos: [],
      places: [{
        id: "p20-import-preview-place",
        name: "P20 导入预览店",
        longitude: 114.3036,
        latitude: 30.6072,
        city: "武汉",
        layerId: "layer-personal-favorites",
        tags: ["导入预览"],
        rating: 4,
        visitedAt: "2026-06-24",
        notes: "P20 import preview fixture",
        photoIds: [],
        createdAt: "2026-06-24T00:00:00.000Z",
        updatedAt: "2026-06-24T00:00:00.000Z",
        mapAccuracy: "exact"
      }]
    }
  };
  await page.getByTestId("workspace-import").click();
  await expect(page.getByTestId("import-export-dialog")).toBeVisible();
  await page.setInputFiles("input[type=file]", {
    name: "p20-import.foodmap.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(payload))
  });
  await expect(page.getByTestId("import-export-dialog")).toHaveCount(0);
  await expect(page.getByTestId("governance-workbench")).toBeVisible();
  await expect(page.getByTestId("import-conflict-preview")).toContainText("新增 1");
  const before = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    return places.data.some((place: { id: string }) => place.id === "p20-import-preview-place");
  });
  expect(before).toBe(false);
  await page.getByTestId("import-conflict-preview").getByRole("button", { name: "确认导入可写项" }).click();
  const after = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const places = await bridge.dispatch({ action: "listPlaces" });
    return places.data.some((place: { id: string }) => place.id === "p20-import-preview-place");
  });
  expect(after).toBe(true);
});

test("P20-C governance completion covers batch decisions import strategy and report export", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates P20-C completion paths");
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const base = {
      longitude: 114.3036,
      latitude: 30.6072,
      city: "武汉",
      layerId: "layer-personal-favorites",
      rating: 4,
      visitedAt: "2026-06-24",
      photoIds: [],
      createdAt: "2026-06-24T00:00:00.000Z",
      updatedAt: "2026-06-24T00:00:00.000Z",
      mapAccuracy: "exact"
    };
    await bridge.dispatch({ action: "savePlace", payload: { ...base, id: "p20c-pending", name: "P20C 待确认店", tags: ["待校准", "近似坐标"], mapAccuracy: "approximate", notes: "P20-C pending" } });
    await bridge.dispatch({ action: "savePlace", payload: { ...base, id: "p20c-stale", name: "P20C 过期参考店", tags: ["过期参考"], notes: "stale-reference old evidence" } });
    await bridge.dispatch({ action: "savePlace", payload: { ...base, id: "p20c-dup-a", name: "P20C 热干面", tags: ["热干面"], notes: "重复 A" } });
    await bridge.dispatch({ action: "savePlace", payload: { ...base, id: "p20c-dup-b", name: "P20C 热干面（江岸店）", longitude: 114.3037, latitude: 30.6073, tags: ["热干面", "想再去"], notes: "重复 B" } });
  });

  await page.getByTestId("quick-data-health").click();
  await page.getByTestId("open-governance-workbench").click();
  await expect(page.getByTestId("governance-workbench")).toBeVisible();
  await expect(page.getByRole("button", { name: /过期参考/ })).toBeVisible();

  await page.getByRole("button", { name: /待确认地点/ }).click();
  await page.getByRole("button", { name: "加入处理队列" }).click();
  await expect(page.getByTestId("governance-batch-preview")).toContainText("加入处理队列");
  await page.getByTestId("governance-batch-preview").getByRole("button", { name: "取消，无写入" }).click();
  await page.getByRole("button", { name: "标记暂时跳过" }).click();
  await expect(page.getByTestId("governance-batch-preview")).toContainText("标记暂时跳过");
  await page.getByTestId("governance-batch-preview").getByRole("button", { name: "取消，无写入" }).click();
  await page.getByRole("button", { name: "应用治理标签" }).click();
  await expect(page.getByTestId("governance-batch-preview")).toContainText("应用治理标签");
  await page.getByTestId("governance-batch-preview").getByRole("button", { name: "确认写入" }).click();
  await expect(page.getByTestId("governance-history-summary")).toContainText("应用治理标签");

  await page.getByRole("button", { name: /重复地点建议/ }).click();
  await page.getByTestId("duplicate-ignore-button").first().click();
  await expect(page.getByTestId("duplicate-decision-preview")).toContainText("忽略重复建议");
  await page.getByTestId("duplicate-decision-preview").getByRole("button", { name: "确认决策" }).click();
  await expect(page.getByTestId("governance-history-summary")).toContainText("忽略重复建议");
  await page.getByTestId("duplicate-keep-button").first().click();
  await expect(page.getByTestId("duplicate-decision-preview")).toContainText("保留两条记录");
  await page.getByTestId("duplicate-decision-preview").getByRole("button", { name: "确认决策" }).click();
  await expect(page.getByTestId("governance-history-summary")).toContainText("保留两条记录");

  const reportDownload = page.waitForEvent("download");
  await page.getByTestId("governance-report-export").click();
  expect((await reportDownload).suggestedFilename()).toMatch(/foodmap-governance-report-.*\.json/);

  const payload = {
    schema: "foodmap.share",
    version: 1,
    exportedAt: "2026-06-24T00:00:00.000Z",
    snapshot: {
      id: "p20c-import-snapshot",
      title: "P20C 导入策略验收",
      exportedAt: "2026-06-24T00:00:00.000Z",
      layers: [],
      photos: [],
      places: [{
        id: "p20c-import-strategy-new",
        name: "P20C 导入策略新店",
        longitude: 114.304,
        latitude: 30.607,
        city: "武汉",
        layerId: "layer-personal-favorites",
        tags: ["导入策略"],
        rating: 4,
        visitedAt: "2026-06-24",
        notes: "P20-C import strategy",
        photoIds: [],
        createdAt: "2026-06-24T00:00:00.000Z",
        updatedAt: "2026-06-24T00:00:00.000Z",
        mapAccuracy: "exact"
      }, {
        id: "p20c-import-strategy-skip",
        name: "P20C 导入策略跳过店",
        longitude: 114.305,
        latitude: 30.608,
        city: "武汉",
        layerId: "layer-personal-favorites",
        tags: ["暂时跳过"],
        rating: 4,
        visitedAt: "2026-06-24",
        notes: "P20-C import skipped",
        photoIds: [],
        createdAt: "2026-06-24T00:00:00.000Z",
        updatedAt: "2026-06-24T00:00:00.000Z",
        mapAccuracy: "exact"
      }]
    }
  };
  await page.getByTestId("governance-open-import").click();
  await page.setInputFiles("input[type=file]", {
    name: "p20c-import.foodmap.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(payload))
  });
  await expect(page.getByTestId("import-conflict-preview")).toContainText("跳过");
  await page.getByLabel("P20C 导入策略新店 导入策略").selectOption("skip");
  await page.getByTestId("import-conflict-preview").getByRole("button", { name: "确认导入可写项" }).click();
  const importResult = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("foodmap-db");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    const places = await new Promise<Array<{ id: string }>>((resolve, reject) => {
      const request = db.transaction("places", "readonly").objectStore("places").getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as Array<{ id: string }>);
    });
    db.close();
    return places.some((place) => place.id === "p20c-import-strategy-new");
  });
  expect(importResult).toBe(false);
});

test("P20 agent governance APIs are read-only and reject unsafe writes", async ({ page }) => {
  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  const result = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    await bridge.dispatch({
      action: "savePlace",
      payload: {
        id: "p20-agent-governance",
        name: "P20 Agent 治理只读店",
        longitude: 114.3,
        latitude: 30.6,
        city: "武汉",
        layerId: "layer-personal-favorites",
        tags: ["待校准", "近似坐标"],
        rating: 4,
        visitedAt: "2026-06-24",
        notes: "P20 agent governance fixture",
        photoIds: [],
        mapAccuracy: "approximate"
      }
    });
    const summary = await bridge.dispatch({ action: "getGovernanceSummary" });
    const duplicates = await bridge.dispatch({ action: "listDuplicateSuggestions" });
    const journal = await bridge.dispatch({ action: "listGovernanceJournal" });
    const blockedBatch = await bridge.dispatch({ action: "applyGovernanceBatch", payload: { placeIds: ["p20-agent-governance"] } });
    const blockedMerge = await bridge.dispatch({ action: "mergePlaces", payload: { placeIds: ["a", "b"] } });
    const blockedImport = await bridge.dispatch({ action: "commitImportPlan", payload: {} });
    const blockedRisk = await bridge.dispatch({ action: "hideGovernanceRisk", payload: { placeId: "p20-agent-governance" } });
    const blockedFinal = await bridge.dispatch({ action: "finalizeCoordinates", payload: { placeId: "p20-agent-governance" } });
    return { summary, duplicates, journal, blockedBatch, blockedMerge, blockedImport, blockedRisk, blockedFinal };
  });
  expect(result.summary.ok).toBeTruthy();
  expect(result.summary.data.note).toContain("Agent 只能读取");
  expect(result.duplicates.ok).toBeTruthy();
  expect(result.journal.ok).toBeTruthy();
  for (const item of [result.blockedBatch, result.blockedMerge, result.blockedImport, result.blockedRisk, result.blockedFinal]) {
    expect(item.ok).toBeFalsy();
    expect(item.errorCode).toBe("GOVERNANCE_CONFIRMATION_REQUIRED");
  }
});

const P20_RESPONSIVE_VIEWPORTS = [
  { name: "mobile-390-governance", width: 390, height: 844, mode: "governance" },
  { name: "mobile-430-duplicate-compare", width: 430, height: 932, mode: "duplicate" },
  { name: "tablet-768-import-conflict", width: 768, height: 900, mode: "import" },
  { name: "desktop-1280-governance", width: 1280, height: 820, mode: "governance" }
] as const;

for (const viewport of P20_RESPONSIVE_VIEWPORTS) {
  test(`P20 responsive ${viewport.name}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop project captures deterministic P20 responsive viewports");
    fs.mkdirSync("docs/active/evidence/p20", { recursive: true });
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/#/map");
    await seedP20ResponsivePlaces(page);
    await openP20GovernanceWorkbench(page);
    if (viewport.mode === "duplicate") {
      await page.getByRole("button", { name: /重复地点建议/ }).last().click();
      await page.getByTestId("duplicate-merge-button").last().click();
      await expect(page.getByTestId("duplicate-merge-preview").last()).toBeVisible();
    }
    if (viewport.mode === "import") {
      await openP20ImportPreview(page);
      await expect(page.getByTestId("import-conflict-preview").last()).toBeVisible();
    }
    await page.screenshot({ path: `docs/active/evidence/p20/${viewport.name}.png`, fullPage: true });
  });
}

async function seedP20ResponsivePlaces(page: Page) {
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const base = {
      longitude: 114.3036,
      latitude: 30.6072,
      city: "武汉",
      layerId: "layer-personal-favorites",
      rating: 4,
      visitedAt: "2026-06-24",
      photoIds: [],
      createdAt: "2026-06-24T00:00:00.000Z",
      updatedAt: "2026-06-24T00:00:00.000Z",
      mapAccuracy: "exact"
    };
    await bridge.dispatch({ action: "savePlace", payload: { ...base, id: "p20-responsive-pending", name: "P20 响应式待确认店", tags: ["待校准", "近似坐标"], mapAccuracy: "approximate", notes: "P20 responsive fixture" } });
    await bridge.dispatch({ action: "savePlace", payload: { ...base, id: "p20-responsive-dup-a", name: "P20 响应式热干面", tags: ["热干面", "已核验"], notes: "重复 A" } });
    await bridge.dispatch({ action: "savePlace", payload: { ...base, id: "p20-responsive-dup-b", name: "P20 响应式热干面（江岸店）", longitude: 114.3037, latitude: 30.6073, tags: ["热干面", "想再去"], notes: "重复 B" } });
  });
}

async function openP20GovernanceWorkbench(page: Page) {
  if (await page.getByTestId("quick-data-health").isVisible().catch(() => false)) {
    await page.getByTestId("quick-data-health").click();
  } else {
    await page.getByRole("button", { name: "更多工具" }).click();
    await page.getByRole("dialog", { name: "更多工具" }).getByRole("button", { name: "数据健康" }).click();
  }
  await expect(page.getByTestId("data-health-center").last()).toBeVisible();
  await page.getByTestId("open-governance-workbench").last().click();
  await expect(page.getByTestId("governance-workbench").last()).toBeVisible();
}

async function openP20ImportPreview(page: Page) {
  const payload = {
    schema: "foodmap.share",
    version: 1,
    exportedAt: "2026-06-24T00:00:00.000Z",
    snapshot: {
      id: "p20-responsive-import",
      title: "P20 响应式导入",
      exportedAt: "2026-06-24T00:00:00.000Z",
      layers: [],
      photos: [],
      places: [{
        id: "p20-responsive-import-place",
        name: "P20 响应式导入店",
        longitude: 114.304,
        latitude: 30.607,
        city: "武汉",
        layerId: "layer-personal-favorites",
        tags: ["导入预览"],
        rating: 4,
        visitedAt: "2026-06-24",
        notes: "P20 responsive import",
        photoIds: [],
        createdAt: "2026-06-24T00:00:00.000Z",
        updatedAt: "2026-06-24T00:00:00.000Z",
        mapAccuracy: "exact"
      }]
    }
  };
  await page.getByTestId("governance-open-import").last().click();
  await page.setInputFiles("input[type=file]", {
    name: "p20-responsive-import.foodmap.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(payload))
  });
}

test("P21 share portability generates reviewed snapshot and export package", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates P21 share portability");
  fs.mkdirSync("docs/active/evidence/p21", { recursive: true });
  await page.goto("/#/map");
  await importPersonalFavorites(page);
  await page.evaluate(async () => {
    const openRequest = indexedDB.open("foodmap-db", 2);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => resolve(openRequest.result);
    });
    const readTx = db.transaction("places", "readonly");
    const places = await new Promise<any[]>((resolve, reject) => {
      const request = readTx.objectStore("places").getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    const target = places.find((place) => place.layerId === "layer-personal-favorites");
    const writeTx = db.transaction(["places", "photos"], "readwrite");
    writeTx.objectStore("photos").put({
      id: "p21-export-photo",
      placeId: target.id,
      fileName: "p21-export.png",
      mimeType: "image/png",
      blob: new Blob(["p21"], { type: "image/png" }),
      thumbnailDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
      createdAt: "2026-06-24T00:00:00.000Z"
    });
    writeTx.objectStore("places").put({ ...target, photoIds: ["p21-export-photo"] });
    await new Promise<void>((resolve, reject) => {
      writeTx.oncomplete = () => resolve();
      writeTx.onerror = () => reject(writeTx.error);
      writeTx.onabort = () => reject(writeTx.error);
    });
    db.close();
  });
  await page.reload();
  await page.getByRole("button", { name: "快照", exact: true }).click();
  await expect(page.getByTestId("share-snapshot-dialog")).toBeVisible();
  await page.getByLabel("快照标题").fill("P21 武汉分享包");
  await expect(page.getByTestId("snapshot-portability-summary")).toContainText("32 个");
  await expect(page.getByTestId("snapshot-portability-summary")).toContainText("1 张");
  await page.getByRole("button", { name: "确认生成本地只读快照" }).click();
  await expect(page.getByTestId("snapshot-portability-summary")).toContainText("已生成本地只读快照");
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-foodmap-json").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/P21 武汉分享包\.foodmap\.json$/);
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const exported = JSON.parse(fs.readFileSync(filePath!, "utf-8"));
  expect(exported.schema).toBe("foodmap.share");
  expect(exported.version).toBe(1);
  expect(exported.snapshot.title).toBe("P21 武汉分享包");
  expect(exported.snapshot.places).toHaveLength(32);
  expect(exported.snapshot.photos).toHaveLength(1);
  expect(exported.snapshot.photos[0].thumbnailDataUrl).toContain("data:image/png");
  await page.screenshot({ path: "docs/active/evidence/p21/p21-share-portability.png", fullPage: true });
});

test("P21 import safety clean profile imports readonly snapshot without editable writes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates P21 import safety");
  fs.mkdirSync("docs/active/evidence/p21", { recursive: true });
  await page.goto("/#/map");
  const before = await readFoodMapStoreCounts(page);
  expect(before.places).toBe(0);
  const payload = buildP21PortablePackage("p21-clean-profile-snapshot");
  await page.getByTestId("workspace-import").click();
  await expect(page.getByTestId("import-export-dialog")).toBeVisible();
  await page.getByTestId("import-readonly-snapshot").click();
  await page.locator('input[type="file"]').nth(1).setInputFiles({
    name: "p21-clean.foodmap.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(payload), "utf-8")
  });
  await expect(page).toHaveURL(/#\/share\/p21-clean-profile-snapshot/);
  await expect(page.getByTestId("share-view")).toContainText("P21 只读分享地图");
  await expect(page.getByTestId("layer-panel")).toBeVisible();
  await expect(page.getByTestId("share-place-detail")).toBeVisible();
  await expect(page.getByTestId("share-place-detail")).toContainText("P21 分享热干面");
  await expect(page.getByTestId("share-place-detail")).toContainText("P21 clean profile readonly share fixture");
  const after = await readFoodMapStoreCounts(page);
  expect(after.places).toBe(0);
  expect(after.photos).toBe(0);
  expect(after.governanceJournal).toBe(0);
  expect(after.snapshots).toBe(1);
  await page.screenshot({ path: "docs/active/evidence/p21/p21-clean-profile-share.png", fullPage: true });
});

test("P21 read only share guard and invalid import no-op are enforced", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates P21 read only share");
  fs.mkdirSync("docs/active/evidence/p21", { recursive: true });
  await page.goto("/#/map");
  const before = await readFoodMapStoreCounts(page);
  await page.getByTestId("workspace-import").click();
  await page.getByTestId("import-readonly-snapshot").click();
  await page.locator('input[type="file"]').nth(1).setInputFiles({
    name: "invalid.foodmap.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ schema: "foodmap.share", version: 99, snapshot: {} }), "utf-8")
  });
  await expect(page.getByTestId("import-error-message")).toContainText("version 1");
  const afterInvalid = await readFoodMapStoreCounts(page);
  expect(afterInvalid).toEqual(before);

  const payload = buildP21PortablePackage("p21-readonly-guard-snapshot");
  await page.locator('input[type="file"]').nth(1).setInputFiles({
    name: "p21-readonly.foodmap.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(payload), "utf-8")
  });
  await expect(page).toHaveURL(/#\/share\/p21-readonly-guard-snapshot/);
  await expect(page.getByTestId("share-readonly-notice")).toContainText("本地只读快照");
  await expect(page.getByTestId("layer-panel")).toBeVisible();
  await expect(page.getByTestId("share-layer-toggle").first()).toBeVisible();
  await expect(page.getByTestId("share-place-detail")).toBeVisible();
  await expect(page.getByTestId("share-place-detail")).toContainText("P21 分享热干面");
  await expect(page.getByTestId("share-place-detail").locator(".detail-hero-photos img")).toHaveAttribute("alt", "p21-noodle.png");
  await expect(page.getByTestId("share-view").getByRole("button", { name: "新增" })).toHaveCount(0);
  await expect(page.getByTestId("share-view").getByRole("button", { name: "编辑" })).toHaveCount(0);
  await expect(page.getByTestId("share-view").getByRole("button", { name: "删除" })).toHaveCount(0);
  await expect(page.getByTestId("share-view").getByRole("button", { name: /保存|上传|账号|云|公网/ })).toHaveCount(0);
  await page.getByTestId("share-layer-toggle").first().click();
  const afterToggle = await readFoodMapStoreCounts(page);
  expect(afterToggle.places).toBe(0);
  expect(afterToggle.photos).toBe(0);
  expect(afterToggle.governanceJournal).toBe(0);
  await page.goto("/#/share/missing-p21-snapshot");
  await expect(page.getByTestId("share-missing-snapshot")).toContainText(".foodmap.json");
  await expect(page.getByTestId("share-missing-snapshot").getByRole("button", { name: /导入 .*foodmap\.json/ })).toBeVisible();
  await page.screenshot({ path: "docs/active/evidence/p21/p21-readonly-and-fallback.png", fullPage: true });

  await page.goto("/#/map");
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  const agentResult = await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    const createSnapshot = await bridge.dispatch({ action: "createSnapshot" });
    const exportSnapshot = await bridge.dispatch({ action: "exportSnapshot" });
    return { createSnapshot, exportSnapshot };
  });
  expect(agentResult.createSnapshot.ok).toBeFalsy();
  expect(agentResult.createSnapshot.errorCode).toBe("GOVERNANCE_CONFIRMATION_REQUIRED");
  expect(agentResult.exportSnapshot.ok).toBeTruthy();
  expect(JSON.parse(agentResult.exportSnapshot.data.text).schema).toBe("foodmap.share");
});

test("P22 workspace shell keeps governance and mobile controls readable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project validates deterministic responsive shell");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/#/map");
  await importPersonalFavorites(page);
  await page.getByTestId("quick-data-health").click();
  await expect(page.getByTestId("data-health-center")).toBeVisible();
  await expect.poll(async () => {
    return page.getByTestId("data-health-center").evaluate((element) => element.getBoundingClientRect().width);
  }).toBeGreaterThanOrEqual(470);
  await expect(page.getByTestId("data-health-center")).toContainText("待确认");

  await page.getByTestId("data-health-center").getByRole("button", { name: /治理工作台|打开治理/ }).first().click();
  await expect(page.getByTestId("governance-workbench")).toBeVisible();
  await expect.poll(async () => {
    return page.getByTestId("governance-workbench").evaluate((element) => element.getBoundingClientRect().width);
  }).toBeGreaterThanOrEqual(470);
  const hasVerticalActionText = await page.getByTestId("governance-workbench").evaluate((root) => {
    return [...root.querySelectorAll("button")].some((button) => {
      const rect = button.getBoundingClientRect();
      const text = button.textContent?.trim() ?? "";
      return text.length >= 4 && rect.height > rect.width * 1.8;
    });
  });
  expect(hasVerticalActionText).toBeFalsy();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/map");
  await expect(page.getByTestId("home-filter-dock")).toBeVisible();
  const dockMetrics = await page.getByTestId("home-filter-dock").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const summary = element.querySelector<HTMLElement>("[data-testid='home-filter-summary']");
    return {
      height: rect.height,
      bottom: rect.bottom,
      summaryVisible: summary ? getComputedStyle(summary).display !== "none" : false
    };
  });
  expect(dockMetrics.height).toBeLessThanOrEqual(54);
  expect(dockMetrics.bottom).toBeLessThan(128);
  expect(dockMetrics.summaryVisible).toBeFalsy();
});

test("P23 mobile readonly share opens map marker into unobstructed detail summary", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project drives deterministic P23 mobile viewport");
  fs.mkdirSync("docs/active/evidence/p23", { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/map");
  await page.getByRole("button", { name: "更多工具" }).click();
  await page.getByRole("dialog", { name: "更多工具" }).getByRole("button", { name: "数据包" }).click();
  await expect(page.getByTestId("import-export-dialog")).toBeVisible();
  await page.getByTestId("import-readonly-snapshot").click();
  await page.locator('input[type="file"]').nth(1).setInputFiles({
    name: "p23-mobile-share.foodmap.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(buildP21PortablePackage("p23-mobile-share")), "utf-8")
  });
  await expect(page.getByTestId("share-view")).toContainText("P21 分享热干面");
  await expect(page.locator(".food-leaflet-marker")).toBeVisible();
  await page.locator(".food-leaflet-marker").first().click();
  await expect(page.getByTestId("share-mobile-detail-summary")).toBeVisible();
  await expect(page.getByTestId("share-mobile-detail-summary")).toContainText("P21 分享热干面");
  await expect(page.getByRole("navigation", { name: "只读分享导航" })).toBeHidden();
  const summaryMetrics = await page.getByTestId("share-mobile-panel").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth
    };
  });
  expect(summaryMetrics.width).toBeGreaterThanOrEqual(360);
  expect(summaryMetrics.bottom).toBeLessThanOrEqual(summaryMetrics.viewportHeight);
  expect(summaryMetrics.top).toBeGreaterThan(300);
  await page.screenshot({ path: "docs/active/evidence/p23/01-mobile-share-marker-summary.png", fullPage: true });

  await page.getByTestId("share-mobile-detail-expand").click();
  await expect(page.getByRole("dialog", { name: "地点详情" }).getByTestId("share-place-detail")).toBeVisible();
  await expect(page.getByRole("dialog", { name: "地点详情" }).getByTestId("share-place-detail")).toContainText("P21 clean profile readonly share fixture");
  await expect(page.getByTestId("share-mobile-detail-collapse")).toBeVisible();
  await page.screenshot({ path: "docs/active/evidence/p23/02-mobile-share-expanded-detail.png", fullPage: true });
});

test("P23 compact mobile workspace keeps quick filters and map actions readable at 320px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project drives deterministic P23 narrow viewport");
  fs.mkdirSync("docs/active/evidence/p23", { recursive: true });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/#/map");
  await expect(page.getByTestId("home-filter-dock")).toBeVisible();
  await expect(page.getByTestId("mobile-action-bar")).toBeVisible();
  await page.getByTestId("home-filter-expand").click();
  const sheet = page.getByTestId("quick-filter-sheet");
  await expect(sheet).toBeVisible();
  await sheet.getByRole("button", { name: "想吃" }).click();
  await expect(sheet.getByRole("button", { name: "想吃" })).toHaveAttribute("aria-pressed", "true");
  const overflow = await page.evaluate(() => {
    const offenders = [...document.querySelectorAll<HTMLElement>("[data-testid='home-filter-dock'], [data-testid='quick-filter-sheet'], [data-testid='mobile-action-bar']")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > window.innerWidth + 1;
      })
      .map((element) => element.dataset.testid ?? element.className);
    return offenders;
  });
  expect(overflow).toEqual([]);
  await page.screenshot({ path: "docs/active/evidence/p23/03-mobile-320-quick-filter.png", fullPage: true });
});

test("P23 health and governance panels are readable and action text is not clipped", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project validates P23 panel readability");
  fs.mkdirSync("docs/active/evidence/p23", { recursive: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/#/map");
  await importPersonalFavorites(page);
  await page.getByTestId("quick-data-health").click();
  await expect(page.getByTestId("data-health-center")).toBeVisible();
  await expect.poll(async () => page.getByTestId("data-health-center").evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThanOrEqual(470);
  await page.screenshot({ path: "docs/active/evidence/p23/04-data-health-readable.png", fullPage: true });
  await page.getByTestId("data-health-center").getByRole("button", { name: /治理工作台|打开治理/ }).first().click();
  await expect(page.getByTestId("governance-workbench")).toBeVisible();
  await expect.poll(async () => page.getByTestId("governance-workbench").evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThanOrEqual(470);
  const clippedButtons = await page.getByTestId("governance-workbench").evaluate((root) => {
    return [...root.querySelectorAll("button")].map((button) => {
      const rect = button.getBoundingClientRect();
      return {
        text: button.textContent?.trim() ?? "",
        width: rect.width,
        height: rect.height,
        clipped: button.scrollWidth > button.clientWidth + 1 || button.scrollHeight > button.clientHeight + 1
      };
    }).filter((button) => button.text.length > 0 && (button.clipped || button.height > button.width * 1.8));
  });
  expect(clippedButtons).toEqual([]);
  await page.screenshot({ path: "docs/active/evidence/p23/05-governance-readable.png", fullPage: true });
});

test("P24 WebApp metadata, offline notice and hash routes are present", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project validates deterministic P24 browser metadata");
  fs.mkdirSync("docs/active/evidence/p24", { recursive: true });
  await page.goto("/#/map");
  await expect(page.getByTestId("webapp-status")).toBeVisible();
  await expect(page.getByTestId("webapp-status")).toContainText("WebApp 模式");
  await expect(page.getByTestId("webapp-status")).toHaveAttribute("data-mode", "browser");

  const metadata = await page.evaluate(() => ({
    manifest: document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.getAttribute("href"),
    themeColor: document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content,
    viewport: document.querySelector<HTMLMetaElement>('meta[name="viewport"]')?.content,
    mobileCapable: document.querySelector<HTMLMetaElement>('meta[name="mobile-web-app-capable"]')?.content,
    description: document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content
  }));
  expect(metadata.manifest).toContain("manifest.webmanifest");
  expect(metadata.themeColor).toBe("#C76A32");
  expect(metadata.viewport).toContain("viewport-fit=cover");
  expect(metadata.mobileCapable).toBe("yes");
  expect(metadata.description).toContain("移动端浏览器");

  const manifestResponse = await page.request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBeTruthy();
  const manifest = await manifestResponse.json();
  expect(manifest.name).toBe("FoodMap 美食地图");
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toContain("#/map");
  expect(manifest.icons.some((icon: { src: string }) => icon.src.includes("foodmap-icon.svg"))).toBeTruthy();

  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.getByTestId("webapp-offline-notice")).toBeVisible();
  await expect(page.getByTestId("webapp-offline-notice")).toContainText("本地记录可查看");
  await page.screenshot({ path: "docs/active/evidence/p24/01-webapp-offline-notice.png", fullPage: true });
  await page.context().setOffline(false);

  await page.goto("/#/share/missing-p24-snapshot");
  await expect(page.getByTestId("share-missing-snapshot")).toContainText(".foodmap.json");
});

test("P24 mobile WebApp shell keeps controls inside the Mate-style viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project drives deterministic P24 mobile viewport");
  fs.mkdirSync("docs/active/evidence/p24", { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/map");
  await expect(page.getByTestId("home-filter-dock")).toBeVisible();
  await expect(page.getByTestId("mobile-action-bar")).toBeVisible();
  await expect(page.getByTestId("webapp-status")).toBeVisible();

  const offenders = await page.evaluate(() => {
    return [...document.querySelectorAll<HTMLElement>("[data-testid='home-filter-dock'], [data-testid='mobile-action-bar'], [data-testid='webapp-status']")]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          testid: element.dataset.testid ?? element.className,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom
        };
      })
      .filter((rect) => rect.left < -1 || rect.right > window.innerWidth + 1 || rect.top < -1 || rect.bottom > window.innerHeight + 1);
  });
  expect(offenders).toEqual([]);
  await page.screenshot({ path: "docs/active/evidence/p24/02-mobile-webapp-shell.png", fullPage: true });
});

test("P24 mobile readonly share and local data remain usable after refresh", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project drives deterministic P24 mobile viewport");
  fs.mkdirSync("docs/active/evidence/p24", { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/map");
  await importPersonalFavorites(page);
  await expect(page.locator(".personal-favorite-leaflet-marker")).toHaveCount(32);
  await page.reload();
  await expect(page.getByTestId("workspace-map")).toBeVisible();
  await expect(page.locator(".personal-favorite-leaflet-marker")).toHaveCount(32);

  await page.getByRole("button", { name: "更多工具" }).click();
  await page.getByRole("dialog", { name: "更多工具" }).getByRole("button", { name: "数据包" }).click();
  await expect(page.getByTestId("import-export-dialog")).toBeVisible();
  await page.getByTestId("import-readonly-snapshot").click();
  await page.locator('input[type="file"]').nth(1).setInputFiles({
    name: "p24-mobile-share.foodmap.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(buildP21PortablePackage("p24-mobile-share")), "utf-8")
  });
  await expect(page.getByTestId("share-view")).toContainText("P21 分享热干面");
  await expect(page.getByRole("navigation", { name: "只读分享导航" })).toBeVisible();
  await page.getByRole("navigation", { name: "只读分享导航" }).getByRole("button", { name: "详情" }).click();
  await expect(page.getByTestId("share-mobile-detail-summary")).toBeVisible();
  await expect(page.getByTestId("share-mobile-detail-summary")).toContainText("P21 分享热干面");
  await page.screenshot({ path: "docs/active/evidence/p24/03-mobile-share-and-refresh.png", fullPage: true });
});

test("P25 deployed GitHub Pages stable URL supports map, real data and readonly share", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validates P25 deployed release path");
  const deployUrl = getDeployUrl();
  test.skip(!deployUrl, "FOODMAP_DEPLOY_URL is required for deployed-origin P25 acceptance");

  fs.mkdirSync("docs/active/evidence/p25", { recursive: true });

  const mapUrl = new URL(deployUrl!);
  mapUrl.hash = "/map";
  await page.goto(mapUrl.toString());
  await expect(page.getByTestId("workspace-map")).toBeVisible();
  await expect(page.getByTestId("webapp-status")).toBeVisible();
  await expect(page.getByTestId("webapp-status")).toContainText("WebApp 模式");

  await importPersonalFavorites(page);
  await expect(page.locator(".personal-favorite-leaflet-marker")).toHaveCount(32);
  await page.waitForFunction(() => Boolean((window as any).FoodMapAgentBridge));
  await page.evaluate(async () => {
    const bridge = (window as any).FoodMapAgentBridge;
    await bridge.dispatch({ action: "focusPlace", payload: { placeId: "personal-favorite:xiashi-casserole" } });
  });
  const detail = page.locator(".desktop-side-panel").getByTestId("place-detail");
  await expect(detail).toBeVisible();
  await expect(detail).toContainText("夏氏砂锅");
  await page.screenshot({ path: "docs/active/evidence/p25/github-pages-workspace.png", fullPage: true });

  await page.reload();
  await expect(page.getByTestId("workspace-map")).toBeVisible();
  await expect(page.locator(".personal-favorite-leaflet-marker")).toHaveCount(32);

  await page.getByTestId("workspace-import").click();
  await expect(page.getByTestId("import-export-dialog")).toBeVisible();
  await page.getByTestId("import-readonly-snapshot").click();
  await page.locator('input[type="file"]').nth(1).setInputFiles({
    name: "p25-deployed-share.foodmap.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(buildP21PortablePackage("p25-deployed-share")), "utf-8")
  });
  await expect(page).toHaveURL(/#\/share\/p25-deployed-share/);
  await expect(page.getByTestId("share-view")).toContainText("P21 分享热干面");
  await expect(page.getByTestId("share-readonly-notice")).toContainText("本地只读快照");
  await expect(page.getByTestId("share-view").getByRole("button", { name: /新增|编辑|删除|上传|账号|云|公网/ })).toHaveCount(0);
  await page.screenshot({ path: "docs/active/evidence/p25/github-pages-share.png", fullPage: true });

  await page.reload();
  await expect(page.getByTestId("share-view")).toContainText("P21 分享热干面");
  await expect(page.getByTestId("share-readonly-notice")).toContainText("本地只读快照");
  await page.screenshot({ path: "docs/active/evidence/p25/hash-route-refresh.png", fullPage: true });
});

const P21_RESPONSIVE_VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 900 },
  { name: "desktop-1280", width: 1280, height: 820 }
] as const;

for (const viewport of P21_RESPONSIVE_VIEWPORTS) {
  test(`P21 responsive ${viewport.name} import share and fallback`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop project captures deterministic P21 responsive viewports");
    fs.mkdirSync("docs/active/evidence/p21", { recursive: true });
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/#/map");
    if (await page.getByTestId("workspace-import").isVisible().catch(() => false)) {
      await page.getByTestId("workspace-import").click();
    } else {
      await page.getByRole("button", { name: "更多工具" }).click();
      await page.getByRole("dialog", { name: "更多工具" }).getByRole("button", { name: "数据包" }).click();
    }
    await expect(page.getByTestId("import-export-dialog")).toBeVisible();
    await page.getByTestId("import-readonly-snapshot").click();
    await page.locator('input[type="file"]').nth(1).setInputFiles({
      name: `${viewport.name}.foodmap.json`,
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(buildP21PortablePackage(`p21-${viewport.name}`)), "utf-8")
    });
    await expect(page.getByTestId("share-view")).toContainText("P21 分享热干面");
    if (viewport.width <= 900) {
      await expect(page.getByRole("navigation", { name: "只读分享导航" })).toBeVisible();
      await page.getByRole("navigation", { name: "只读分享导航" }).getByRole("button", { name: "详情" }).click();
      await expect(page.getByTestId("share-mobile-detail-summary")).toBeVisible();
      await expect(page.getByTestId("share-mobile-detail-summary")).toContainText("P21 分享热干面");
      await page.getByTestId("share-mobile-detail-expand").click();
      await expect(page.getByRole("dialog", { name: "地点详情" }).getByTestId("share-place-detail")).toBeVisible();
      await expect(page.getByRole("dialog", { name: "地点详情" }).getByTestId("share-place-detail")).toContainText("P21 分享热干面");
    } else {
      await expect(page.getByTestId("share-readonly-notice")).toBeVisible();
      await expect(page.getByTestId("layer-panel")).toBeVisible();
      await expect(page.getByTestId("share-place-detail")).toBeVisible();
    }
    await page.screenshot({ path: `docs/active/evidence/p21/p21-responsive-${viewport.name}-share.png`, fullPage: true });
    await page.goto("/#/share/missing-p21-responsive");
    await expect(page.getByTestId("share-missing-snapshot")).toContainText(".foodmap.json");
    await page.screenshot({ path: `docs/active/evidence/p21/p21-responsive-${viewport.name}-missing.png`, fullPage: true });
  });
}
