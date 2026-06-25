import { useEffect, useMemo, useState } from "react";

function getStandaloneMode() {
  const iosStandalone = Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  const displayStandalone = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  return iosStandalone || displayStandalone;
}

export function WebAppStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(getStandaloneMode);

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

  const message = useMemo(() => {
    if (!isOnline) {
      return "离线模式：本地记录可查看；地图瓦片、外部地图和文件选择受浏览器限制。";
    }
    if (!isStandalone) {
      return "WebApp 模式：可用浏览器或系统快捷入口打开；Mate70 安装入口需真机验证。";
    }
    return "WebApp 模式：本地优先运行，数据保存在当前设备浏览器。";
  }, [isOnline, isStandalone]);

  return (
    <div
      className={`webapp-status ${isOnline ? "is-online" : "is-offline"}`}
      data-testid="webapp-status"
      data-mode={isStandalone ? "standalone" : "browser"}
      role={isOnline ? "status" : "alert"}
    >
      <span data-testid={isOnline ? "webapp-online-notice" : "webapp-offline-notice"}>{message}</span>
    </div>
  );
}
