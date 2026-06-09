// =====================
// COULEURS
// =====================

const typeColors = {
  "Long métrage": "#E63946",
  "Série TV": "#457B9D",
  "Série Web": "#9D4EDD",
  Téléfilm: "#2A9D8F",
  Autre: "#6C757D",
};

function getColor(type) {
  return typeColors[type] || typeColors["Autre"];
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

    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,

        fill: new ol.style.Fill({
          color: getColor(type),
        }),

        stroke: new ol.style.Stroke({
          color: "#222",
          width: 1,
        }),
      }),
    });
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

  popupContainer.innerHTML = `
            <h3>
                ${feature.get("nom_tournage") || "Sans nom"}
            </h3>

            <strong>Type :</strong>
            ${feature.get("type_tournage") || ""}
            <br>

            <strong>Adresse :</strong>
            ${feature.get("adresse_lieu") || ""}
            <br>

            <strong>Année :</strong>
            ${feature.get("annee_tournage") || ""}
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
  legend.innerHTML += `
        <div class="legend-item">
            <div
                class="legend-color"
                style="
                    background:${color}
                "
            ></div>

            ${type}
        </div>
    `;
}

document.body.appendChild(legend);

// =====================
// START
// =====================

loadData();
