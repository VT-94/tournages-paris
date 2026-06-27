// =====================
// COULEURS
// =====================

const typeColors = {
  "Long métrage": "#FF2D55",
  "Série TV": "#0A84FF",
  "Série Web": "#BF5AF2",
  Téléfilm: "#30D158",
  Autre: "#FF9F0A",
};

function getColor(type) {
  return typeColors[type] || typeColors["Autre"];
}

function makeSvgMarker(color, innerSvg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28"><circle cx="14" cy="14" r="12.5" fill="${color}" stroke="white" stroke-width="2"/>${innerSvg}</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

const typeIconInners = {
  "Long métrage": `<rect x="7" y="12" width="14" height="9" rx="1.5" fill="none" stroke="white" stroke-width="1.5"/><rect x="7" y="9" width="14" height="4" rx="1" fill="none" stroke="white" stroke-width="1.5"/><line x1="11" y1="9" x2="9.5" y2="13" stroke="white" stroke-width="1.5"/><line x1="15" y1="9" x2="13.5" y2="13" stroke="white" stroke-width="1.5"/><line x1="19" y1="9" x2="17.5" y2="13" stroke="white" stroke-width="1.5"/>`,
  "Série TV": `<rect x="6" y="8" width="16" height="12" rx="1.5" fill="none" stroke="white" stroke-width="1.5"/><line x1="14" y1="20" x2="14" y2="22" stroke="white" stroke-width="1.5"/><line x1="11" y1="22" x2="17" y2="22" stroke="white" stroke-width="1.5"/>`,
  "Série Web": `<polygon points="10.5,8.5 10.5,19.5 21,14" fill="white"/>`,
  "Téléfilm": `<rect x="6" y="11" width="11" height="8" rx="1.5" fill="none" stroke="white" stroke-width="1.5"/><polyline points="17,12.5 22,10 22,18 17,15.5" fill="none" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>`,
  "Autre": `<polygon points="14,7 16,12 21,12 17,15.5 18.5,20.5 14,17 9.5,20.5 11,15.5 7,12 12,12" fill="white"/>`,
};

const markerStyleCache = {};

function getMarkerStyle(type) {
  if (markerStyleCache[type]) return markerStyleCache[type];
  const color = getColor(type);
  const inner = typeIconInners[type] || typeIconInners["Autre"];
  markerStyleCache[type] = new ol.style.Style({
    image: new ol.style.Icon({
      src: makeSvgMarker(color, inner),
      anchor: [0.5, 0.5],
      anchorXUnits: "fraction",
      anchorYUnits: "fraction",
    }),
  });
  return markerStyleCache[type];
}

// =====================
// SOURCE VECTEUR
// =====================

const vectorSource = new ol.source.Vector();

// =====================
// COUCHE
// =====================

const vectorLayer = new ol.layer.Vector({
  source: vectorSource,

  style: (feature) => {
    const type = feature.get("type_tournage") || "Autre";
    return getMarkerStyle(type);
  },
});

// =====================
// CARTE
// =====================

const map = new ol.Map({
  target: "map",

  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),

    vectorLayer,
  ],

  view: new ol.View({
    center: ol.proj.fromLonLat([2.3522, 48.8566]),

    zoom: 12,
  }),
});

// =====================
// CHARGEMENT DONNEES
// =====================

async function loadData() {
  try {
    const url =
      "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/lieux-de-tournage-a-paris/exports/json";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur API ${response.status}`);
    }

    const data = await response.json();

    console.log(data);

    const features = [];

    data.forEach((item) => {
      if (!item.geo_point_2d) return;

      const lon = item.geo_point_2d.lon;

      const lat = item.geo_point_2d.lat;

      const feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),

        nom_tournage: item.nom_tournage,

        type_tournage: item.type_tournage,

        adresse_lieu: item.adresse_lieu,

        annee_tournage: item.annee_tournage,
      });

      features.push(feature);
    });

    vectorSource.addFeatures(features);

    map.getView().fit(vectorSource.getExtent(), {
      padding: [50, 50, 50, 50],

      maxZoom: 15,
    });

    console.log(`${features.length} points chargés`);
  } catch (error) {
    console.error(error);

    alert(error.message);
  }
}

// =====================
// POPUP
// =====================

const popupContainer = document.getElementById("popup");

const overlay = new ol.Overlay({
  element: popupContainer,

  positioning: "bottom-center",

  offset: [0, -10],
});

map.addOverlay(overlay);

map.on("singleclick", function (event) {
  const feature = map.forEachFeatureAtPixel(event.pixel, (f) => f);

  if (!feature) {
    overlay.setPosition(undefined);

    return;
  }

  const type = feature.get("type_tournage") || "Autre";
  const color = getColor(type);

  popupContainer.innerHTML = `
    <div class="popup-header">
      <h3 class="popup-title">${feature.get("nom_tournage") || "Sans nom"}</h3>
      <span class="popup-badge" style="background:${color}">${type}</span>
    </div>
    <div class="popup-body">
      <div class="popup-row">
        <span class="popup-label">Adresse</span>
        <span class="popup-value">${feature.get("adresse_lieu") || "—"}</span>
      </div>
      <div class="popup-row">
        <span class="popup-label">Année</span>
        <span class="popup-value">${feature.get("annee_tournage") || "—"}</span>
      </div>
    </div>
  `;

  overlay.setPosition(event.coordinate);
});

// =====================
// LEGENDE
// =====================

const legend = document.createElement("div");

legend.className = "legend";

legend.innerHTML = "<strong>Type de tournage</strong>";

for (const [type, color] of Object.entries(typeColors)) {
  const inner = typeIconInners[type] || typeIconInners["Autre"];
  legend.innerHTML += `
    <div class="legend-item">
      <img src="${makeSvgMarker(color, inner)}" width="20" height="20" style="margin-right:8px;flex-shrink:0">
      ${type}
    </div>
  `;
}

document.body.appendChild(legend);

// =====================
// START
// =====================

loadData();
