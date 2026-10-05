// =====================
// ÉTAT PARTAGÉ
// =====================

export const state = {
  // Types de tournage cochés dans la légende
  activeTypes: new Set(),

  // Filtres choisis : titre et réalisateur ({ key, label }), date (voir filters.js)
  filters: { titre: null, realisateur: null, date: null },

  // Tournages qui correspondent aux filtres titre / réalisateur / date
  // (null tant que les filtres n'ont pas été calculés : tout est affiché)
  matching: null,

  // Groupe de points dont la liste est affichée après un clic
  pinnedCluster: null,
  pinnedCoordinate: null,
};

// Le type du tournage est-il coché dans la légende ?
export function hasActiveType(feature) {
  return state.activeTypes.has(feature.get("type_tournage") || "Autre");
}

// Le tournage est-il affiché (type coché + filtres respectés) ?
export function isShown(feature) {
  return (
    hasActiveType(feature) &&
    (!state.matching || state.matching.has(feature))
  );
}

// Tournages affichés d'un groupe
export function getVisibleFeatures(cluster) {
  return cluster.get("features")?.filter(isShown);
}
