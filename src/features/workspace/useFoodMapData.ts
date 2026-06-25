import { useCallback, useEffect, useMemo, useState } from "react";
import { EMPTY_FILTER, filterPlaces } from "../../domain/filters";
import type { FoodFilterState, FoodLayer, FoodPlace, PhotoAsset } from "../../domain/types";
import type { GovernanceJournalEntry } from "../../domain/types";
import { governanceJournalRepository } from "../../persistence/governanceJournalRepository";
import { layerRepository } from "../../persistence/layerRepository";
import { photoRepository } from "../../persistence/photoRepository";
import { placeRepository } from "../../persistence/placeRepository";
import { ensurePersonalFavoriteLayer } from "../../persistence/personalFavoriteSeed";

export function useFoodMapData() {
  const [places, setPlaces] = useState<FoodPlace[]>([]);
  const [layers, setLayers] = useState<FoodLayer[]>([]);
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [journal, setJournal] = useState<GovernanceJournalEntry[]>([]);
  const [filter, setFilter] = useState<FoodFilterState>(EMPTY_FILTER);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    await ensurePersonalFavoriteLayer();
    const [nextPlaces, nextLayers, nextPhotos, nextJournal] = await Promise.all([
      placeRepository.list(),
      layerRepository.list(),
      photoRepository.list(),
      governanceJournalRepository.list()
    ]);
    setPlaces(nextPlaces.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    setLayers(nextLayers);
    setPhotos(nextPhotos);
    setJournal(nextJournal);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const visiblePlaces = useMemo(() => filterPlaces(places, layers, filter), [places, layers, filter]);

  return {
    places,
    layers,
    photos,
    journal,
    filter,
    loading,
    visiblePlaces,
    setFilter,
    reload
  };
}
