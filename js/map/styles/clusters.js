// =====================
// GROUPES DE POINTS (CLUSTERS)
// =====================

const clusterStyleCache = {};

export function getClusterStyle(count) {
  if (clusterStyleCache[count]) return clusterStyleCache[count];
  const radius = count < 10 ? 14 : count < 100 ? 17 : 20;
  clusterStyleCache[count] = new ol.style.Style({
    image: new ol.style.Circle({
      radius,
      fill: new ol.style.Fill({ color: "rgba(20, 60, 160, 0.85)" }),
      stroke: new ol.style.Stroke({ color: "white", width: 2 }),
    }),
    text: new ol.style.Text({
      text: count.toString(),
      fill: new ol.style.Fill({ color: "white" }),
      font: `bold ${radius - 2}px Arial, sans-serif`,
    }),
  });
  return clusterStyleCache[count];
}

export function clearClusterStyleCache() {
  Object.keys(clusterStyleCache).forEach((k) => delete clusterStyleCache[k]);
}
