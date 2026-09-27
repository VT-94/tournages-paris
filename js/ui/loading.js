// =====================
// BANDEAU DE CHARGEMENT ET DE MESSAGES
// =====================

const banner = document.getElementById("loading-banner");
const bannerText = document.getElementById("loading-text");
let hideTimeout = null;

export function hideLoading() {
  banner.classList.add("hidden");
}

// Affiche un message d'erreur dans le bandeau.
// Sans durée, le message reste affiché.
export function showError(text, duration) {
  clearTimeout(hideTimeout);
  bannerText.textContent = text;
  banner.classList.add("error");
  banner.classList.remove("hidden");
  if (duration) hideTimeout = setTimeout(hideLoading, duration);
}
