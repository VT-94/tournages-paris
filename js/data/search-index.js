// =====================
// INDEX DES TITRES ET RÉALISATEURS
// =====================

import { normalizeText } from "../utils/text.js";

// Regroupe les tournages par titre et par réalisateur :
// Map(clé simplifiée → { key, label, count })
export function buildSearchIndex(features) {
  const titres = new Map();
  const realisateurs = new Map();

  features.forEach((f) => {
    addEntry(titres, f.get("titre_cle"), f.get("nom_tournage"));
    addEntry(realisateurs, f.get("realisateur_cle"), f.get("nom_realisateur"));
  });

  return { titres, realisateurs };
}

function addEntry(index, key, label) {
  if (!key) return;
  const entry = index.get(key);
  if (entry) entry.count++;
  else index.set(key, { key, label: label.trim(), count: 1 });
}

// Entrées contenant le texte cherché : celles qui commencent par ce texte
// d'abord, puis les plus fréquentes
export function searchIndex(index, query, limit) {
  const q = normalizeText(query);
  if (!q) return [];
  return [...index.values()]
    .filter((entry) => entry.key.includes(q))
    .sort(
      (a, b) =>
        b.key.startsWith(q) - a.key.startsWith(q) ||
        b.count - a.count ||
        a.key.localeCompare(b.key),
    )
    .slice(0, limit);
}
