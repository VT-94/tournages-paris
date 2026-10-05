// Texte simplifié pour comparer sans tenir compte des majuscules,
// des accents et des espaces en trop : « HERVÉ  Hadmar » → « herve hadmar »
export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
