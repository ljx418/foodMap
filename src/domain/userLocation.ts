export type UserLocationStatus = "idle" | "granted" | "denied" | "unavailable" | "timeout";

export interface UserLocationSnapshot {
  status: UserLocationStatus;
  longitude?: number;
  latitude?: number;
  observedAt?: string;
  reason?: string;
}

export const IDLE_USER_LOCATION: UserLocationSnapshot = { status: "idle" };

export async function requestUserLocation(timeoutMs = 2500): Promise<UserLocationSnapshot> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { status: "unavailable", reason: "浏览器不支持定位" };
  }

  const permissionState = await queryGeolocationPermission();
  if (permissionState === "denied") {
    return { status: "denied", reason: "已拒绝定位授权" };
  }

  return new Promise((resolve) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve({ status: "timeout", reason: "定位请求超时" });
    }, timeoutMs);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve({
          status: "granted",
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          observedAt: new Date().toISOString()
        });
      },
      (error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve({
          status: error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
          reason: error.message || (error.code === error.PERMISSION_DENIED ? "已拒绝定位授权" : "定位不可用")
        });
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: timeoutMs }
    );
  });
}

export function userLocationToPoint(snapshot: UserLocationSnapshot): { longitude: number; latitude: number } | undefined {
  if (snapshot.status !== "granted") return undefined;
  if (typeof snapshot.longitude !== "number" || typeof snapshot.latitude !== "number") return undefined;
  return { longitude: snapshot.longitude, latitude: snapshot.latitude };
}

export function describeUserLocation(snapshot: UserLocationSnapshot): string {
  switch (snapshot.status) {
    case "granted":
      return "已使用当前位置参与候选排序";
    case "denied":
      return "定位已拒绝，候选将按点击位置、历史记录和置信度排序";
    case "unavailable":
      return snapshot.reason ? `定位不可用：${snapshot.reason}` : "定位不可用，候选将按点击位置和置信度排序";
    case "timeout":
      return "定位超时，候选将按点击位置和置信度排序";
    case "idle":
    default:
      return "未使用当前位置，候选将按点击位置和置信度排序";
  }
}

async function queryGeolocationPermission(): Promise<PermissionState | undefined> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) return undefined;
  try {
    const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
    return status.state;
  } catch {
    return undefined;
  }
}
