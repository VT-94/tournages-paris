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
