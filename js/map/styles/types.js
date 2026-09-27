// =====================
// COULEURS ET PICTOGRAMMES PAR TYPE
// =====================

export const typeColors = {
  "Long métrage": "#FF2D55",
  "Série TV": "#0A84FF",
  "Série Web": "#BF5AF2",
  Téléfilm: "#30D158",
  Autre: "#FF9F0A",
};

export function getColor(type) {
  return typeColors[type] || typeColors["Autre"];
}

export const typeIconInners = {
  "Long métrage": `<rect x="7" y="12" width="14" height="9" rx="1.5" fill="none" stroke="white" stroke-width="1.5"/><rect x="7" y="9" width="14" height="4" rx="1" fill="none" stroke="white" stroke-width="1.5"/><line x1="11" y1="9" x2="9.5" y2="13" stroke="white" stroke-width="1.5"/><line x1="15" y1="9" x2="13.5" y2="13" stroke="white" stroke-width="1.5"/><line x1="19" y1="9" x2="17.5" y2="13" stroke="white" stroke-width="1.5"/>`,
  "Série TV": `<rect x="6" y="8" width="16" height="12" rx="1.5" fill="none" stroke="white" stroke-width="1.5"/><line x1="14" y1="20" x2="14" y2="22" stroke="white" stroke-width="1.5"/><line x1="11" y1="22" x2="17" y2="22" stroke="white" stroke-width="1.5"/>`,
  "Série Web": `<polygon points="10.5,8.5 10.5,19.5 21,14" fill="white"/>`,
  Téléfilm: `<rect x="6" y="11" width="11" height="8" rx="1.5" fill="none" stroke="white" stroke-width="1.5"/><polyline points="17,12.5 22,10 22,18 17,15.5" fill="none" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>`,
  Autre: `<polygon points="14,7 16,12 21,12 17,15.5 18.5,20.5 14,17 9.5,20.5 11,15.5 7,12 12,12" fill="white"/>`,
};
