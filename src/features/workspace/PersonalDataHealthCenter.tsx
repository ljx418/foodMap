import { AlertTriangle, CheckCircle2, Crosshair, Filter, MapPin, Move, SkipForward } from "lucide-react";
import type { PersonalDataHealthReport } from "../../domain/locationStatus";
import type { FoodPlace } from "../../domain/types";

interface Props {
  report: PersonalDataHealthReport;
  onFocusPlace: (placeId: string) => void;
  onFilterGroup: (group: PersonalDataHealthGroupKey) => void;
  onOpenPendingWorkbench: () => void;
  onOpenGovernanceWorkbench?: () => void;
}

export type PersonalDataHealthGroupKey = "verified" | "pending" | "highRisk" | "manualAdjusted" | "skipped";

const GROUP_META: Record<PersonalDataHealthGroupKey, {
  label: string;
  description: string;
  icon: typeof CheckCircle2;
}> = {
  verified: {
    label: "已核验",
    description: "可放心用于筛选、分享和导航的个人地点。",
    icon: CheckCircle2
  },
  pending: {
    label: "待确认",
    description: "近似坐标或仍需候选确认的地点。",
    icon: AlertTriangle
  },
  highRisk: {
    label: "高风险",
    description: "位置存在明显风险，分享或导航前应优先处理。",
    icon: Crosshair
  },
  manualAdjusted: {
    label: "手动校准",
    description: "用户曾手动挪动或校准过坐标的地点。",
    icon: Move
  },
  skipped: {
    label: "已跳过",
    description: "被暂时跳过但仍保留不确定性的地点。",
    icon: SkipForward
  }
};

export function PersonalDataHealthCenter({ report, onFocusPlace, onFilterGroup, onOpenPendingWorkbench, onOpenGovernanceWorkbench }: Props) {
  const groups: Array<{ key: PersonalDataHealthGroupKey; places: FoodPlace[] }> = [
    { key: "verified", places: report.verified },
    { key: "pending", places: report.pending },
    { key: "highRisk", places: report.highRisk },
    { key: "manualAdjusted", places: report.manualAdjusted },
    { key: "skipped", places: report.skipped }
  ];
  const issueCount = report.pending.length + report.highRisk.length + report.skipped.length;

  return (
    <section className="data-health-center" data-testid="data-health-center">
      <header className="data-health-center__header">
        <span className="eyebrow">个人数据健康</span>
        <h2>{issueCount > 0 ? `${issueCount} 个地点需要关注` : "个人地点状态清晰"}</h2>
        <p>这里仅展示和导航处理路径，不会自动修改坐标、标签或笔记。</p>
        {onOpenGovernanceWorkbench ? (
          <button type="button" className="primary-button" onClick={onOpenGovernanceWorkbench} data-testid="open-governance-workbench">
            进入治理工作台
          </button>
        ) : null}
      </header>

      <div className="data-health-summary" aria-label="数据健康分组">
        {groups.map(({ key, places }) => {
          const meta = GROUP_META[key];
          const Icon = meta.icon;
          return (
            <article key={key} className={`data-health-group is-${key}`} data-testid="data-health-group">
              <div className="data-health-group__title">
                <Icon size={17} aria-hidden="true" />
                <span>{meta.label}</span>
                <strong>{places.length}</strong>
              </div>
              <p>{meta.description}</p>
              <div className="data-health-group__actions">
                <button type="button" className="ghost-button" onClick={() => onFilterGroup(key)} disabled={places.length === 0} data-testid="data-health-action">
                  <Filter size={14} /> 筛选
                </button>
                {key === "pending" || key === "highRisk" || key === "skipped" ? (
                  <button type="button" className="ghost-button" onClick={onOpenPendingWorkbench} disabled={places.length === 0} data-testid="data-health-action">
                    <AlertTriangle size={14} /> 待确认
                  </button>
                ) : null}
              </div>
              {places.length > 0 ? (
                <ul className="data-health-group__places">
                  {places.slice(0, 4).map((place) => (
                    <li key={`${key}-${place.id}`}>
                      <button type="button" onClick={() => onFocusPlace(place.id)} data-testid="data-health-action">
                        <MapPin size={14} />
                        <span>{place.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="data-health-group__empty">暂无地点</span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
