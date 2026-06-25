import type { DuplicateDecisionPreview, GovernanceBatchPlan, ImportConflictPlan, MergePreview } from "../domain/governance";
import { applyGovernanceBatchPlan, getWritableImportItems, journalEntryForImport } from "../domain/governance";
import type { FoodPlace } from "../domain/types";
import { governanceJournalRepository } from "./governanceJournalRepository";
import { placeRepository } from "./placeRepository";
import { snapshotRepository } from "./snapshotRepository";

export const governanceRepository = {
  async saveGovernanceBatch(places: FoodPlace[], plan: GovernanceBatchPlan): Promise<void> {
    const nextPlaces = applyGovernanceBatchPlan(places, plan).filter((place, index) => place !== places[index]);
    await placeRepository.saveMany(nextPlaces);
    await Promise.all(plan.entries.map((entry) => governanceJournalRepository.append(entry)));
  },

  async mergePlaces(preview: MergePreview): Promise<void> {
    await placeRepository.save(preview.merged);
    await placeRepository.remove(preview.removed.id);
    await Promise.all(preview.journalEntries.map((entry) => governanceJournalRepository.append(entry)));
  },

  async saveDuplicateDecision(preview: DuplicateDecisionPreview): Promise<void> {
    if (preview.decision === "merge") {
      if (!preview.merged || !preview.removed) return;
      await placeRepository.save(preview.merged);
      await placeRepository.remove(preview.removed.id);
      await Promise.all(preview.journalEntries.map((entry) => governanceJournalRepository.append(entry)));
      return;
    }
    await Promise.all(preview.journalEntries.map((entry) => governanceJournalRepository.append(entry)));
  },

  async importWithConflictPlan(plan: ImportConflictPlan): Promise<void> {
    const writable = getWritableImportItems(plan);
    await placeRepository.saveMany(writable.map((item) => item.imported));
    await snapshotRepository.save(plan.snapshot);
    await Promise.all(plan.items.map((item) => governanceJournalRepository.append(journalEntryForImport(item))));
  }
};
