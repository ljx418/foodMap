import { LeafletProvider } from "../leaflet/LeafletProvider";

export class AMapProvider extends LeafletProvider {
  name = "amap";

  static canUse(): boolean {
    return Boolean(import.meta.env.VITE_AMAP_KEY);
  }
}
