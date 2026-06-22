import { AlertTriangle, CheckCircle2, Copy, ExternalLink, MapPin, Move, Search, SkipForward } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { assessCoordinateRisk } from "../../domain/coordinateRisk";
import { buildExternalMapSearchFallback } from "../../domain/externalMapLinks";
import { getStoredAmapWebServiceKey, storeAmapWebServiceKey } from "../../domain/liveMapSearch";
import { getLocationStatusBadges } from "../../domain/locationStatus";
import type { PlaceCandidate } from "../../domain/placeRecognition";
import type { FoodLayer, FoodPlace } from "../../domain/types";

interface Props {
  places: FoodPlace[];
  layers: FoodLayer[];
  selectedId?: string;
  getCandidates: (place: FoodPlace) => PlaceCandidate[];
  onSelect: (placeId: string) => void;
  onConfirmCandidate: (placeId: string, candidate: PlaceCandidate) => void | Promise<void>;
  onSearchMapCandidates: (placeId: string, query: string, apiKey: string) => Promise<PlaceCandidate[]>;
  onStartMovePin: (placeId: string) => void;
  onSkipPlace: (placeId: string) => void | Promise<void>;
  onShowAll: () => void;
}

export function PendingPlaceWorkbench({
  places,
  layers,
  selectedId,
  getCandidates,
  onSelect,
  onConfirmCandidate,
  onSearchMapCandidates,
  onStartMovePin,
  onSkipPlace,
  onShowAll
}: Props) {
  const highRiskCount = places.filter((place) => place.tags.includes("位置高风险")).length;
  const [openSearchPlaceId, setOpenSearchPlaceId] = useState<string | undefined>();
  const [amapKey, setAmapKey] = useState(() => getStoredAmapWebServiceKey());
  const [queries, setQueries] = useState<Record<string, string>>({});
  const [liveCandidates, setLiveCandidates] = useState<Record<string, PlaceCandidate[]>>({});
  const [loadingPlaceId, setLoadingPlaceId] = useState<string | undefined>();
  const [statusByPlace, setStatusByPlace] = useState<Record<string, string>>({});
  const [copiedPlaceId, setCopiedPlaceId] = useState<string | undefined>();

  useEffect(() => {
    setQueries((current) => {
      const next = { ...current };
      for (const place of places) {
        if (!next[place.id]) next[place.id] = buildDefaultSearchQuery(place);
      }
      return next;
    });
  }, [places]);

  const liveCandidateIds = useMemo(
    () => new Set(Object.values(liveCandidates).flat().map((candidate) => candidate.id)),
    [liveCandidates]
  );

  function getMergedCandidates(place: FoodPlace): PlaceCandidate[] {
    const live = liveCandidates[place.id] ?? [];
    const staticCandidates = getCandidates(place).filter((candidate) => !liveCandidateIds.has(candidate.id));
    return [...live, ...staticCandidates].slice(0, 10);
  }

  async function copySearchText(place: FoodPlace) {
    const fallback = buildExternalMapSearchFallback({
      name: place.name,
      address: place.address,
      city: place.city
    });
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(fallback.copyText);
      setCopiedPlaceId(place.id);
      setStatusByPlace((current) => ({ ...current, [place.id]: "已复制搜索词，可粘贴到地图 App 或网页地图核对。" }));
    } catch {
      setStatusByPlace((current) => ({ ...current, [place.id]: fallback.copyText }));
    }
  }

  async function searchPlace(place: FoodPlace) {
    const query = queries[place.id] ?? buildDefaultSearchQuery(place);
    if (!amapKey.trim()) {
      setStatusByPlace((current) => ({ ...current, [place.id]: "未配置高德 Key。请复制搜索词、打开网页地图搜索，或手动挪动图钉。" }));
      setOpenSearchPlaceId(place.id);
      return;
    }
    setLoadingPlaceId(place.id);
    setStatusByPlace((current) => ({ ...current, [place.id]: "" }));
    try {
      storeAmapWebServiceKey(amapKey);
      const candidates = await onSearchMapCandidates(place.id, query, amapKey);
      setLiveCandidates((current) => ({ ...current, [place.id]: candidates }));
      setStatusByPlace((current) => ({
        ...current,
        [place.id]: candidates.length > 0 ? `找到 ${candidates.length} 个地图候选，确认前不会改坐标。` : "没有找到可用候选，请补充分店/商圈/道路或使用网页地图。"
      }));
    } catch (error) {
      setLiveCandidates((current) => ({ ...current, [place.id]: [] }));
      setStatusByPlace((current) => ({
        ...current,
        [place.id]: error instanceof Error ? `${error.message}。可继续使用网页地图或手动挪动。` : "地图搜索失败，可继续使用网页地图或手动挪动。"
      }));
    } finally {
      setLoadingPlaceId(undefined);
    }
  }

  return (
    <section className="pending-workbench" data-testid="pending-workbench">
      <header className="pending-workbench__header">
        <div>
          <span className="eyebrow">待确认工作台</span>
          <h2>{places.length} 个待确认地点</h2>
          <p>{highRiskCount > 0 ? `${highRiskCount} 个高风险坐标需要优先处理。` : "逐个确认候选、手动挪动或暂时跳过。"}</p>
        </div>
        <button type="button" className="ghost-button" onClick={onShowAll}>查看全部地点</button>
      </header>

      <div className="pending-workbench__list">
        {places.map((place) => {
          const layer = layers.find((item) => item.id === place.layerId);
          const risk = assessCoordinateRisk(place);
          const statusBadges = getLocationStatusBadges(place);
          const candidates = getMergedCandidates(place);
          const selected = selectedId === place.id;
          const searchOpen = openSearchPlaceId === place.id;
          const fallback = buildExternalMapSearchFallback({
            name: place.name,
            address: place.address,
            city: place.city
          });

          return (
            <article key={place.id} className={selected ? "pending-card is-selected" : "pending-card"} data-testid="pending-place-card">
              <button type="button" className="pending-card__main" onClick={() => onSelect(place.id)}>
                <span className="pending-card__stripe" style={{ background: layer?.color }} />
                <span className="pending-card__body">
                  <strong>{place.name}</strong>
                  <small><MapPin size={14} /> {[place.city, place.address].filter(Boolean).join(" · ") || "武汉"}</small>
                  <span className="pending-card__badges">
                    {statusBadges.map((badge) => (
                      <em key={`${place.id}-${badge.label}`} className={`location-status-badge is-${badge.tone}`}>{badge.label}</em>
                    ))}
                    {risk.level !== "ok" ? <em className={risk.level === "blocked" ? "location-status-badge is-danger" : "location-status-badge is-warning"}>{risk.reasons[0]}</em> : null}
                  </span>
                </span>
              </button>

              <div className="pending-card__candidates">
                <span className="pending-card__label">候选门店</span>
                {candidates.length > 0 ? candidates.slice(0, searchOpen ? 10 : 3).map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    className="pending-candidate"
                    onClick={() => void onConfirmCandidate(place.id, candidate)}
                  >
                    <span>
                      <strong>{candidate.name}</strong>
                      <small>{candidate.address || "缺少候选地址"}</small>
                      <small>{candidate.sourceLabel} · {coordinateAccuracyLabel(candidate.coordinateAccuracy)} · {Math.round(candidate.confidence * 100)}%</small>
                      <CandidateEvidenceSummary candidate={candidate} />
                      {candidate.evidenceUrl ? <small>证据：{candidate.evidenceLabel ?? "网页地图搜索"}</small> : null}
                    </span>
                    <em><CheckCircle2 size={14} /> {candidate.coordinateAccuracy === "exact" ? "确认" : "保留待校准"}</em>
                  </button>
                )) : (
                  <p className="pending-card__empty"><AlertTriangle size={15} /> 暂无候选，请手动挪动或补充分店信息。</p>
                )}
              </div>

              {searchOpen ? (
                <div className="pending-card__search" data-testid="pending-candidate-search">
                  <label>
                    高德 Web 服务 Key
                    <input
                      value={amapKey}
                      onChange={(event) => setAmapKey(event.target.value)}
                      placeholder="无 Key 时使用复制/网页地图 fallback"
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    搜索词
                    <input
                      value={queries[place.id] ?? fallback.query}
                      onChange={(event) => setQueries((current) => ({ ...current, [place.id]: event.target.value }))}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void searchPlace(place);
                        }
                      }}
                      placeholder="店名 / 分店 / 商圈 / 道路"
                    />
                  </label>
                  <div className="pending-card__search-actions">
                    <button type="button" className="primary-button" onClick={() => void searchPlace(place)} disabled={loadingPlaceId === place.id}>
                      <Search size={15} /> {loadingPlaceId === place.id ? "搜索中" : "搜索更多候选"}
                    </button>
                    <button type="button" className="ghost-button" onClick={() => void copySearchText(place)}>
                      <Copy size={15} /> {copiedPlaceId === place.id ? "已复制" : "复制搜索词"}
                    </button>
                    {fallback.links.map((link) => (
                      <a key={link.label} className="ghost-button" href={link.href} target="_blank" rel="noreferrer">
                        <ExternalLink size={15} /> {link.label}
                      </a>
                    ))}
                  </div>
                  {statusByPlace[place.id] ? <p className="pending-card__search-status">{statusByPlace[place.id]}</p> : null}
                </div>
              ) : null}

              <div className="pending-card__actions">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setOpenSearchPlaceId((current) => current === place.id ? undefined : place.id)}
                >
                  <Search size={15} /> {searchOpen ? "收起搜索" : "搜索候选"}
                </button>
                <button type="button" className="ghost-button" onClick={() => onStartMovePin(place.id)}>
                  <Move size={15} /> 手动挪动
                </button>
                <button type="button" className="ghost-button" onClick={() => void onSkipPlace(place.id)}>
                  <SkipForward size={15} /> 暂时跳过
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function buildDefaultSearchQuery(place: FoodPlace): string {
  return [place.name, place.address, place.city ?? "武汉"].filter(Boolean).join(" ");
}

function coordinateAccuracyLabel(value: PlaceCandidate["coordinateAccuracy"]): string {
  if (value === "exact") return "精确";
  if (value === "approximate") return "近似";
  if (value === "inferred") return "推断";
  return "未知";
}

function CandidateEvidenceSummary({ candidate }: { candidate: PlaceCandidate }) {
  const signals = candidate.matchSignals?.slice(0, 2) ?? [];
  const risks = candidate.riskReasons?.slice(0, 2) ?? [];
  if (signals.length === 0 && risks.length === 0 && !candidate.lastCheckedAt) return null;
  return (
    <small className="candidate-card__evidence-summary">
      {signals.length > 0 ? `匹配：${signals.join(" / ")}` : ""}
      {risks.length > 0 ? `${signals.length > 0 ? " · " : ""}风险：${risks.join(" / ")}` : ""}
      {candidate.lastCheckedAt ? `${signals.length > 0 || risks.length > 0 ? " · " : ""}核验：${candidate.lastCheckedAt.slice(0, 10)}` : ""}
    </small>
  );
}
