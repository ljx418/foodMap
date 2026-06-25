import type { GovernanceJournalEntry } from "../domain/types";
import { getAllFromStore, putInStore } from "./db";

export const governanceJournalRepository = {
  list: async () => {
    const entries = await getAllFromStore<GovernanceJournalEntry>("governanceJournal");
    return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  append: (entry: GovernanceJournalEntry) => putInStore("governanceJournal", entry)
};
