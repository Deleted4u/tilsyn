// Standard hurtige kommentarer. Lægges ind én gang første gang appen åbnes.
// Slettede standardkommentarer kommer ikke tilbage.
import { addQuickComment } from "./db";

export const DEFAULT_QUICK_COMMENTS = [
  "Løs Pullert",
  "Løs Fundament",
  "Skæv Udstyr",
  "Mangler Reetablering",
  "Mangler Græsfrø",
  "Mangler Sand",
  "Mangler Oprydning",
];

const FLAG = "tilsyn-plus-quick-seeded";
let seeding = null;

export function ensureDefaultQuickComments() {
  try {
    if (localStorage.getItem(FLAG) === "1") return Promise.resolve();
  } catch {
    /* fortsæt */
  }
  if (!seeding) {
    seeding = (async () => {
      for (const text of DEFAULT_QUICK_COMMENTS) {
        await addQuickComment(text); // springer over, hvis den allerede findes
        // lille pause, så rækkefølgen bevares (sorteres efter oprettelsestid)
        await new Promise((r) => setTimeout(r, 4));
      }
      try {
        localStorage.setItem(FLAG, "1");
      } catch {
        /* ikke kritisk */
      }
    })().finally(() => {
      seeding = null;
    });
  }
  return seeding;
}
