import { useEffect, useState } from "react";

export type RouteState =
  | { name: "map" }
  | { name: "share"; snapshotId: string };

function parseHash(): RouteState {
  const hash = window.location.hash || "#/map";
  const shareMatch = hash.match(/^#\/share\/(.+)$/);
  if (shareMatch) return { name: "share", snapshotId: decodeURIComponent(shareMatch[1]) };
  return { name: "map" };
}

export function useHashRoute(): RouteState {
  const [route, setRoute] = useState<RouteState>(() => parseHash());
  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return route;
}

export function navigateToMap(): void {
  window.location.hash = "#/map";
}

export function navigateToShare(snapshotId: string): void {
  window.location.hash = `#/share/${encodeURIComponent(snapshotId)}`;
}
