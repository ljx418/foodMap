import type { MapProviderAdapter } from "./MapProviderAdapter";
import { AMapProvider } from "./amap/AMapProvider";
import { LeafletProvider } from "./leaflet/LeafletProvider";

export interface ProviderSelection {
  provider: MapProviderAdapter;
  fallbackMessage?: string;
}

export function createMapProvider(): ProviderSelection {
  if (AMapProvider.canUse()) {
    return { provider: new AMapProvider() };
  }
  return {
    provider: new LeafletProvider()
  };
}
