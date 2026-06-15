import { useEffect, useMemo } from "react";
import { DEFAULT_LAYERS } from "../domain/sampleData";
import type { FoodFilterState, FoodLayer, FoodPlace, PhotoAsset, ShareSnapshot } from "../domain/types";
import { DEFAULT_CENTER } from "../domain/types";
import { searchPlaceCandidates } from "../domain/placeSearch";
import { tagsFromGroups } from "../domain/tagGroups";
import { createId, nowIso, validatePlaceDraft } from "../domain/validators";
import { createSnapshot, encodeSnapshot } from "../persistence/importExportCodec";
import { placeRepository } from "../persistence/placeRepository";
import { snapshotRepository } from "../persistence/snapshotRepository";
import { AMAP_WUHAN_SCANLIST } from "../recommendations/amapWuhanScanlist";
import { recommendationToFoodPlace } from "../recommendations/recommendationUtils";
import { evaluateRecommendation } from "../recommendations/verification";

export type FoodMapAgentAction =
  | "getContext"
  | "listPlaces"
  | "getPlace"
  | "createPlaceDraft"
  | "savePlace"
  | "updatePlace"
  | "deletePlace"
  | "setFilter"
  | "focusPlace"
  | "createSnapshot"
  | "exportSnapshot"
  | "loadRecommendations"
  | "listRecommendations"
  | "focusRecommendation"
  | "saveRecommendationAsPlace"
  | "recognizePlaceCandidates"
  | "submitPlaceCandidates"
  | "getPlaceCandidateContext";

export interface FoodMapAgentCommand {
  action: FoodMapAgentAction;
  payload?: unknown;
}

export interface FoodMapAgentResult<T = unknown> {
  ok: boolean;
  action: FoodMapAgentAction;
  data?: T;
  error?: string;
  errorCode?: AgentErrorCode;
}

export type AgentErrorCode =
  | "INVALID_PAYLOAD"
  | "PLACE_NOT_FOUND"
  | "UNVERIFIED_RECOMMENDATION"
  | "POI_CONFLICT"
  | "IMPORT_VALIDATION_FAILED"
  | "EXPORT_FAILED"
  | "RECOGNITION_FAILED"
  | "UNSUPPORTED_ACTION";

export interface FoodMapAgentEvent {
  type: "stateChanged" | "command" | "result";
  payload: unknown;
}

export interface FoodMapAgentContext {
  route: "#/map";
  counts: {
    places: number;
    visiblePlaces: number;
    layers: number;
    photos: number;
  };
  selectedPlaceId?: string;
  filter: FoodFilterState;
  candidateContext: {
    city: string;
    clickedPoint?: { longitude: number; latitude: number };
    scanlistVisible: boolean;
  };
}

export interface FoodMapAgentBridge {
  getContext(): Promise<FoodMapAgentContext>;
  dispatch(command: FoodMapAgentCommand): Promise<FoodMapAgentResult>;
  subscribe(handler: (event: FoodMapAgentEvent) => void): () => void;
}

interface UseBridgeOptions {
  places: FoodPlace[];
  visiblePlaces: FoodPlace[];
  layers: FoodLayer[];
  photos: PhotoAsset[];
  filter: FoodFilterState;
  selectedPlaceId?: string;
  setFilter: (filter: FoodFilterState) => void;
  selectPlace: (placeId: string) => void;
  createDraft: (point: { longitude: number; latitude: number }) => void;
  reload: () => Promise<void>;
  loadRecommendations?: () => void;
  focusRecommendation?: (sourceId: string) => void;
  saveRecommendation?: (sourceId: string) => Promise<void>;
  clickedPoint?: { longitude: number; latitude: number };
  scanlistVisible?: boolean;
}

declare global {
  interface Window {
    FoodMapAgentBridge?: FoodMapAgentBridge;
  }
}

export function useFoodMapAgentBridge(options: UseBridgeOptions) {
  const bridge = useMemo(() => createBridge(options), [options]);

  useEffect(() => {
    window.FoodMapAgentBridge = bridge;
    window.dispatchEvent(new CustomEvent("foodmap:state-changed", { detail: bridge }));
    return () => {
      if (window.FoodMapAgentBridge === bridge) {
        delete window.FoodMapAgentBridge;
      }
    };
  }, [bridge]);
}

function createBridge(options: UseBridgeOptions): FoodMapAgentBridge {
  const listeners = new Set<(event: FoodMapAgentEvent) => void>();
  const emit = (event: FoodMapAgentEvent) => {
    listeners.forEach((listener) => listener(event));
    const eventName =
      event.type === "stateChanged"
        ? "foodmap:state-changed"
        : event.type === "command"
          ? "foodmap:agent-command"
          : "foodmap:agent-result";
    window.dispatchEvent(new CustomEvent(eventName, { detail: event.payload }));
  };

  const getContext = async (): Promise<FoodMapAgentContext> => ({
    route: "#/map",
    counts: {
      places: options.places.length,
      visiblePlaces: options.visiblePlaces.length,
      layers: options.layers.length,
      photos: options.photos.length
    },
    selectedPlaceId: options.selectedPlaceId,
    filter: options.filter,
    candidateContext: {
      city: options.filter.city || "武汉",
      clickedPoint: options.clickedPoint,
      scanlistVisible: Boolean(options.scanlistVisible)
    }
  });

  const dispatch = async (command: FoodMapAgentCommand): Promise<FoodMapAgentResult> => {
    emit({ type: "command", payload: { action: command.action, payload: command.payload } });
    try {
      const data = await runCommand(command, options, getContext);
      const result = { ok: true, action: command.action, data };
      emit({ type: "result", payload: result });
      emit({ type: "stateChanged", payload: await getContext() });
      return result;
    } catch (error) {
      const result = {
        ok: false,
        action: command.action,
        error: error instanceof Error ? error.message : "Agent command failed",
        errorCode: error instanceof AgentCommandError ? error.code : "UNSUPPORTED_ACTION" as AgentErrorCode
      };
      emit({ type: "result", payload: result });
      return result;
    }
  };

  return {
    getContext,
    dispatch,
    subscribe(handler) {
      listeners.add(handler);
      return () => listeners.delete(handler);
    }
  };
}

async function runCommand(
  command: FoodMapAgentCommand,
  options: UseBridgeOptions,
  getContext: () => Promise<FoodMapAgentContext>
) {
  switch (command.action) {
    case "getContext":
      return getContext();
    case "listPlaces":
      return placeRepository.list();
    case "getPlace": {
      const { placeId } = asPayload<{ placeId: string }>(command.payload);
      if (!placeId) throw new AgentCommandError("INVALID_PAYLOAD", "缺少 placeId");
      const place = await placeRepository.get(placeId);
      if (!place) throw new AgentCommandError("PLACE_NOT_FOUND", "地点不存在");
      return place;
    }
    case "createPlaceDraft": {
      const payload = asPayload<Partial<{ longitude: number; latitude: number }>>(command.payload);
      const point = {
        longitude: payload.longitude ?? DEFAULT_CENTER.longitude,
        latitude: payload.latitude ?? DEFAULT_CENTER.latitude
      };
      options.createDraft(point);
      return point;
    }
    case "savePlace": {
      const payload = asPayload<Partial<FoodPlace>>(command.payload);
      const place = buildPlace(payload, options.layers);
      const errors = validatePlaceDraft(place);
      if (errors.length > 0) throw new AgentCommandError("INVALID_PAYLOAD", errors.join("，"));
      await placeRepository.save(place);
      await options.reload();
      return place;
    }
    case "updatePlace": {
      const payload = asPayload<Partial<FoodPlace> & { id: string }>(command.payload);
      const existing = await placeRepository.get(payload.id);
      if (!payload.id) throw new AgentCommandError("INVALID_PAYLOAD", "缺少 id");
      if (!existing) throw new AgentCommandError("PLACE_NOT_FOUND", "地点不存在");
      const next = { ...existing, ...payload, updatedAt: nowIso() };
      const errors = validatePlaceDraft(next);
      if (errors.length > 0) throw new AgentCommandError("INVALID_PAYLOAD", errors.join("，"));
      await placeRepository.save(next);
      await options.reload();
      return next;
    }
    case "deletePlace": {
      const { placeId } = asPayload<{ placeId: string }>(command.payload);
      if (!placeId) throw new AgentCommandError("INVALID_PAYLOAD", "缺少 placeId");
      await placeRepository.remove(placeId);
      await options.reload();
      return { placeId };
    }
    case "setFilter": {
      const next = { ...options.filter, ...asPayload<Partial<FoodFilterState>>(command.payload) };
      options.setFilter(next);
      return next;
    }
    case "focusPlace": {
      const { placeId } = asPayload<{ placeId: string }>(command.payload);
      if (!placeId) throw new AgentCommandError("INVALID_PAYLOAD", "缺少 placeId");
      if (!(await placeRepository.get(placeId))) throw new AgentCommandError("PLACE_NOT_FOUND", "地点不存在");
      options.selectPlace(placeId);
      return { placeId };
    }
    case "createSnapshot": {
      const snapshot = createSnapshot("Agent 生成的美食地图", options.visiblePlaces, options.layers, options.photos);
      await snapshotRepository.save(snapshot);
      return snapshot;
    }
    case "exportSnapshot": {
      const snapshot: ShareSnapshot = createSnapshot("Agent 导出的美食地图", options.visiblePlaces, options.layers, options.photos);
      try {
        return { snapshot, text: encodeSnapshot(snapshot) };
      } catch (error) {
        throw new AgentCommandError("EXPORT_FAILED", error instanceof Error ? error.message : "导出失败");
      }
    }
    case "loadRecommendations": {
      options.loadRecommendations?.();
      return { source: "amap-scanlist", count: AMAP_WUHAN_SCANLIST.length };
    }
    case "listRecommendations":
      return AMAP_WUHAN_SCANLIST;
    case "focusRecommendation": {
      const { sourceId } = asPayload<{ sourceId: string }>(command.payload);
      if (!sourceId) throw new AgentCommandError("INVALID_PAYLOAD", "缺少 sourceId");
      options.focusRecommendation?.(sourceId);
      return { sourceId };
    }
    case "saveRecommendationAsPlace": {
      const { sourceId } = asPayload<{ sourceId: string }>(command.payload);
      if (!sourceId) throw new AgentCommandError("INVALID_PAYLOAD", "缺少 sourceId");
      if (options.saveRecommendation) {
        try {
          await options.saveRecommendation(sourceId);
        } catch (error) {
          throw toRecommendationError(error);
        }
        return { sourceId };
      }
      const recommendation = AMAP_WUHAN_SCANLIST.find((item) => item.sourceId === sourceId);
      if (!recommendation) throw new AgentCommandError("INVALID_PAYLOAD", "推荐项不存在");
      if (!evaluateRecommendation(recommendation).mappable) {
        throw new AgentCommandError(
          recommendation.verification.status === "conflict" ? "POI_CONFLICT" : "UNVERIFIED_RECOMMENDATION",
          "推荐项未通过坐标核验，不能收藏为地图地点"
        );
      }
      const place = recommendationToFoodPlace(recommendation, options.layers[0]?.id ?? DEFAULT_LAYERS[0].id);
      await placeRepository.save(place);
      await options.reload();
      return place;
    }
    case "recognizePlaceCandidates": {
      const payload = asPayload<{
        text?: string;
        url?: string;
        point?: { longitude: number; latitude: number };
        clickedPoint?: { longitude: number; latitude: number };
        candidates?: unknown[];
      }>(command.payload);
      const point = payload.clickedPoint ?? payload.point ?? options.clickedPoint;
      const result = searchPlaceCandidates({
        text: payload.text,
        url: payload.url,
        point,
        clickedPoint: point,
        historyPlaces: options.places,
        agentPayload: { candidates: payload.candidates ?? [] }
      });
      const ranked = result.candidates;
      if (ranked.length === 0) throw new AgentCommandError("RECOGNITION_FAILED", "没有识别到可用地点候选");
      return { candidates: ranked, blockedCandidates: result.blockedCandidates };
    }
    case "submitPlaceCandidates": {
      const payload = asPayload<{ candidates?: unknown[]; sourceNote?: string }>(command.payload);
      if (!Array.isArray(payload.candidates)) throw new AgentCommandError("INVALID_PAYLOAD", "缺少 candidates");
      const result = searchPlaceCandidates({
        agentPayload: { candidates: payload.candidates },
        point: options.clickedPoint,
        historyPlaces: options.places
      });
      const ranked = result.candidates;
      if (ranked.length === 0) throw new AgentCommandError("INVALID_PAYLOAD", "没有可用结构化候选");
      return { candidates: ranked, blockedCandidates: result.blockedCandidates, sourceNote: payload.sourceNote };
    }
    case "getPlaceCandidateContext":
      return {
        city: options.filter.city || "武汉",
        clickedPoint: options.clickedPoint,
        scanlistVisible: Boolean(options.scanlistVisible),
        visiblePersonalPlaceCount: options.visiblePlaces.length,
        historySummary: options.places.slice(0, 10).map((place) => ({
          id: place.id,
          name: place.name,
          city: place.city,
          address: place.address,
          tags: place.tags.slice(0, 6)
        }))
      };
    default:
      throw new AgentCommandError("UNSUPPORTED_ACTION", "不支持的 Agent action");
  }
}

function buildPlace(payload: Partial<FoodPlace>, layers: FoodLayer[]): FoodPlace {
  const now = nowIso();
  const availableLayers = layers.length > 0 ? layers : DEFAULT_LAYERS;
  return {
    id: payload.id ?? createId("place"),
    name: payload.name ?? "",
    longitude: payload.longitude ?? DEFAULT_CENTER.longitude,
    latitude: payload.latitude ?? DEFAULT_CENTER.latitude,
    coordinateSystem: payload.coordinateSystem ?? "wgs84",
    address: payload.address,
    city: payload.city ?? "武汉",
    layerId: payload.layerId ?? availableLayers.find((layer) => layer.visible)?.id ?? availableLayers[0]?.id ?? "",
    tags: tagsFromGroups(payload.tagGroups, payload.tags ?? []),
    rating: payload.rating ?? 4,
    visitedAt: payload.visitedAt ?? now.slice(0, 10),
    notes: payload.notes ?? "",
    photoIds: payload.photoIds ?? [],
    tagGroups: payload.tagGroups,
    createdAt: payload.createdAt ?? now,
    updatedAt: now
  };
}

function asPayload<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") return {} as T;
  return payload as T;
}

class AgentCommandError extends Error {
  constructor(public code: AgentErrorCode, message: string) {
    super(message);
  }
}

function toRecommendationError(error: unknown): AgentCommandError {
  if (error instanceof AgentCommandError) return error;
  const message = error instanceof Error ? error.message : "推荐项未通过坐标核验，不能收藏为地图地点";
  if (/冲突/.test(message)) return new AgentCommandError("POI_CONFLICT", message);
  if (/未通过|未核验|核验/.test(message)) return new AgentCommandError("UNVERIFIED_RECOMMENDATION", message);
  return new AgentCommandError("INVALID_PAYLOAD", message);
}
