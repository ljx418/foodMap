import { useEffect, useMemo, useState } from "react";

type ServiceWorkerState = "checking" | "unsupported" | "controlled" | "registered" | "unregistered";

function getStandaloneMode() {
  const iosStandalone = Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  const displayStandalone = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  return iosStandalone || displayStandalone;
}

function getReleaseTargetLabel() {
  const { hostname, pathname } = window.location;
  if (hostname.endsWith("github.io") && pathname.startsWith("/foodMap")) return "固定 URL";
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "") return "本地预览";
  return "静态站点";
}

export function WebAppStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(getStandaloneMode);
  const [serviceWorkerState, setServiceWorkerState] = useState<ServiceWorkerState>("checking");

  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    const media = window.matchMedia?.("(display-mode: standalone)");
    const updateStandalone = () => setIsStandalone(getStandaloneMode());

    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    media?.addEventListener?.("change", updateStandalone);

    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
      media?.removeEventListener?.("change", updateStandalone);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setServiceWorkerState("unsupported");
      return;
    }
    let cancelled = false;
    const updateServiceWorker = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (cancelled) return;
        if (navigator.serviceWorker.controller) {
          setServiceWorkerState("controlled");
          return;
        }
        setServiceWorkerState(registrations.length > 0 ? "registered" : "unregistered");
      } catch {
        if (!cancelled) setServiceWorkerState("unsupported");
      }
    };
    const handleControllerChange = () => void updateServiceWorker();
    void updateServiceWorker();
    navigator.serviceWorker.addEventListener?.("controllerchange", handleControllerChange);
    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener?.("controllerchange", handleControllerChange);
    };
  }, []);

  const message = useMemo(() => {
    if (!isOnline) {
      return "离线模式：本地记录可查看；地图瓦片、外部地图和文件选择受浏览器限制，不会同步或删除本地数据。";
    }
    if (!isStandalone) {
      return "WebApp 模式：可用浏览器或系统快捷入口打开；数据保存在当前设备浏览器。";
    }
    return "WebApp 模式：本地优先运行，数据保存在当前设备浏览器。";
  }, [isOnline, isStandalone]);
  const releaseTarget = getReleaseTargetLabel();
  const serviceWorkerLabel = serviceWorkerState === "controlled"
    ? "离线壳已接管"
    : serviceWorkerState === "registered"
      ? "离线壳已注册"
      : serviceWorkerState === "unregistered"
        ? "离线壳待发布构建启用"
        : serviceWorkerState === "unsupported"
          ? "浏览器不支持离线壳"
          : "离线壳检查中";

  return (
    <div
      className={`webapp-status ${isOnline ? "is-online" : "is-offline"}`}
      data-testid="webapp-status"
      data-mode={isStandalone ? "standalone" : "browser"}
      data-release-target={releaseTarget}
      data-service-worker={serviceWorkerState}
      role={isOnline ? "status" : "alert"}
    >
      <span data-testid={isOnline ? "webapp-online-notice" : "webapp-offline-notice"}>{message}</span>
      <span className="webapp-status__meta" aria-label="发布与本地状态">
        <span data-testid="webapp-release-target">{releaseTarget}</span>
        <span data-testid="webapp-storage-status">本地 IndexedDB</span>
        <span data-testid="webapp-service-worker-status">{serviceWorkerLabel}</span>
      </span>
    </div>
  );
}
