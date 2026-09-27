// =====================
// ÉTAT PARTAGÉ
// =====================

export const state = {
  // Types de tournage cochés dans la légende
  activeTypes: new Set(),

  // Groupe de points dont la liste est affichée après un clic
  pinnedCluster: null,
  pinnedCoordinate: null,
};

// Tournages d'un groupe dont le type est coché dans la légende
export function getVisibleFeatures(cluster) {
  return cluster
    .get("features")
    ?.filter((f) => state.activeTypes.has(f.get("type_tournage") || "Autre"));
}
