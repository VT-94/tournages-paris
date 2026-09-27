// =====================
// COUCHE DE LA POSITION DE L'UTILISATEUR
// =====================

export const userSource = new ol.source.Vector();

export const userLayer = new ol.layer.Vector({
  source: userSource,
  style: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 8,
      fill: new ol.style.Fill({ color: "#4285F4" }),
      stroke: new ol.style.Stroke({ color: "white", width: 2.5 }),
    }),
  }),
});
