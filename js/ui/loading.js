// =====================
// BANDEAU DE CHARGEMENT
// =====================

export function hideLoading() {
  document.getElementById("loading-banner").classList.add("hidden");
}

export function showError(error) {
  console.error(error);

  alert(error.message);
}
