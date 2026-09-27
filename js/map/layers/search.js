// =====================
// COUCHE DE L'ADRESSE RECHERCHÉE
// =====================

export const searchSource = new ol.source.Vector();

export const searchLayer = new ol.layer.Vector({
  source: searchSource,
  style: new ol.style.Style({
    image: new ol.style.Icon({
      src: "assets/icons/pin.svg",
      anchor: [0.5, 1],
      anchorXUnits: "fraction",
      anchorYUnits: "fraction",
    }),
  }),
});
