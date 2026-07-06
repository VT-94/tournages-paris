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

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function makeSvgMarker(color, innerSvg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28"><circle cx="14" cy="14" r="12.5" fill="${color}" stroke="white" stroke-width="2"/>${innerSvg}</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function makeSvgBadgeIcon(innerSvg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="20" height="20">${innerSvg}</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

const typeIconInners = {
  "Long métrage": `<rect x="7" y="12" width="14" height="9" rx="1.5" fill="none" stroke="white" stroke-width="1.5"/><rect x="7" y="9" width="14" height="4" rx="1" fill="none" stroke="white" stroke-width="1.5"/><line x1="11" y1="9" x2="9.5" y2="13" stroke="white" stroke-width="1.5"/><line x1="15" y1="9" x2="13.5" y2="13" stroke="white" stroke-width="1.5"/><line x1="19" y1="9" x2="17.5" y2="13" stroke="white" stroke-width="1.5"/>`,
  "Série TV": `<rect x="6" y="8" width="16" height="12" rx="1.5" fill="none" stroke="white" stroke-width="1.5"/><line x1="14" y1="20" x2="14" y2="22" stroke="white" stroke-width="1.5"/><line x1="11" y1="22" x2="17" y2="22" stroke="white" stroke-width="1.5"/>`,
  "Série Web": `<polygon points="10.5,8.5 10.5,19.5 21,14" fill="white"/>`,
  Téléfilm: `<rect x="6" y="11" width="11" height="8" rx="1.5" fill="none" stroke="white" stroke-width="1.5"/><polyline points="17,12.5 22,10 22,18 17,15.5" fill="none" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>`,
  Autre: `<polygon points="14,7 16,12 21,12 17,15.5 18.5,20.5 14,17 9.5,20.5 11,15.5 7,12 12,12" fill="white"/>`,
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

const activeTypes = new Set();

// =====================
// SOURCE VECTEUR
// =====================

const vectorSource = new ol.source.Vector();

const clusterSource = new ol.source.Cluster({
  distance: 40,
  source: vectorSource,
});

// =====================
// COUCHE
// =====================

const clusterStyleCache = {};

const vectorLayer = new ol.layer.Vector({
  source: clusterSource,

  style: (feature) => {
    const features = feature.get("features");
    const visible = features.filter((f) => activeTypes.has(f.get("type_tournage") || "Autre"));

    if (visible.length === 0) return null;

    if (visible.length === 1) {
      const type = visible[0].get("type_tournage") || "Autre";
      return getMarkerStyle(type);
    }

    const count = visible.length;
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
  },
});

// =====================
// CARTE
// =====================

// =====================
// FONDS DE CARTE
// =====================

const basemaps = [
  {
    id: "esri-gray",
    name: "ESRI Gris",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
  },
  {
    id: "osm",
    name: "OpenStreetMap",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
  },
  {
    id: "google-satellite",
    name: "Google Satellite",
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    attribution: "© Google",
  },
  {
    id: "ign-ortho",
    name: "IGN Ortho",
    url: "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg",
    attribution: "© IGN",
  },
];

const basemapLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: basemaps[0].url,
    attributions: basemaps[0].attribution,
  }),
});

const map = new ol.Map({
  target: "map",

  layers: [
    basemapLayer,
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

        date_debut: item.date_debut,

        date_fin: item.date_fin,

        nom_realisateur: item.nom_realisateur,
      });

      features.push(feature);
    });

    const seenTypes = new Set(data.map((item) => item.type_tournage).filter(Boolean));
    buildLegend(seenTypes);

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

let lastMoveTime = 0;
let pinnedCluster = null;
let pinnedCoordinate = null;

map.on("pointermove", function (event) {
  const now = Date.now();
  if (now - lastMoveTime < 30) return;
  lastMoveTime = now;

  if (pinnedCluster) {
    const hovered = map.forEachFeatureAtPixel(event.pixel, (f) => f);
    map.getTargetElement().style.cursor = hovered ? "pointer" : "";
    return;
  }

  const feature = map.forEachFeatureAtPixel(event.pixel, (f) => f);

  map.getTargetElement().style.cursor = feature ? "pointer" : "";

  if (!feature) {
    overlay.setPosition(undefined);
    return;
  }

  const features = feature.get("features");
  const visible = features?.filter((f) => activeTypes.has(f.get("type_tournage") || "Autre"));
  if (!visible || visible.length !== 1) {
    overlay.setPosition(undefined);
    return;
  }

  const actual = visible[0];
  const type = actual.get("type_tournage") || "Autre";
  const color = getColor(type);
  const inner = typeIconInners[type] || typeIconInners["Autre"];
  const iconSrc = makeSvgBadgeIcon(inner);

  const debut = formatDate(actual.get("date_debut"));
  const fin = formatDate(actual.get("date_fin"));
  const periode =
    debut && fin
      ? debut === fin ? `le ${debut}` : `du ${debut} au ${fin}`
      : debut
        ? `à partir du ${debut}`
        : null;

  popupContainer.innerHTML = `
    <div class="popup-header">
      <h3 class="popup-title">${actual.get("nom_tournage") || "Sans nom"}</h3>
      <span class="popup-badge" style="background:${color}">
        <img src="${iconSrc}" width="20" height="20" style="vertical-align:middle;margin-right:5px">
        ${type}
      </span>
    </div>
    <div class="popup-body">
      ${
        actual.get("nom_realisateur")
          ? `
      <div class="popup-row">
        <span class="popup-label">Réalisateur</span>
        <span class="popup-value">${actual.get("nom_realisateur")}</span>
      </div>`
          : ""
      }
      <div class="popup-row">
        <span class="popup-label">Adresse</span>
        <span class="popup-value">${actual.get("adresse_lieu") || "—"}</span>
      </div>
      ${
        periode
          ? `
      <div class="popup-row">
        <span class="popup-label">${debut === fin ? "Date" : "Dates"}</span>
        <span class="popup-value">${periode}</span>
      </div>`
          : ""
      }
    </div>
  `;

  overlay.setPosition(event.coordinate);
});

map.on("singleclick", function (event) {
  const feature = map.forEachFeatureAtPixel(event.pixel, (f) => f);

  if (!feature) {
    pinnedCluster = null;
    overlay.setPosition(undefined);
    return;
  }

  const features = feature.get("features");
  const visible = features?.filter((f) => activeTypes.has(f.get("type_tournage") || "Autre"));
  if (!visible || visible.length <= 1) {
    pinnedCluster = null;
    overlay.setPosition(undefined);
    return;
  }

  pinnedCluster = feature;
  pinnedCoordinate = event.coordinate;

  renderClusterPopup(visible, event.coordinate);
});

function renderClusterPopup(visible, coordinate) {
  const listItems = [...visible]
    .sort((a, b) => {
      const da = a.get("date_debut") || "";
      const db = b.get("date_debut") || "";
      return db.localeCompare(da);
    })
    .map((f) => {
      const type = f.get("type_tournage") || "Autre";
      const color = getColor(type);
      const inner = typeIconInners[type] || typeIconInners["Autre"];
      const iconSrc = makeSvgBadgeIcon(inner);
      const debut = formatDate(f.get("date_debut"));
      const fin = formatDate(f.get("date_fin"));
      const periode =
        debut && fin
          ? debut === fin ? `le ${debut}` : `du ${debut} au ${fin}`
          : debut
            ? `à partir du ${debut}`
            : null;
      return `
        <div class="popup-list-item">
          <span class="popup-badge" style="background:${color};padding:2px 7px">
            <img src="${iconSrc}" width="14" height="14" style="vertical-align:middle;margin-right:4px">
            ${type}
          </span>
          <div class="popup-list-info">
            <span class="popup-list-title">${f.get("nom_tournage") || "Sans nom"}</span>
            ${f.get("nom_realisateur") ? `<span class="popup-list-director">${f.get("nom_realisateur")}</span>` : ""}
            ${periode ? `<span class="popup-list-year">${periode}</span>` : ""}
          </div>
        </div>
      `;
    })
    .join("");

  popupContainer.innerHTML = `
    <div class="popup-header">
      <h3 class="popup-title">${visible.length} tournage${visible.length > 1 ? "s" : ""}</h3>
    </div>
    <div class="popup-body popup-list">
      ${listItems}
    </div>
  `;

  overlay.setPosition(coordinate);
}

// =====================
// LEGENDE
// =====================

const legend = document.createElement("div");
legend.className = "legend";
legend.innerHTML = "<strong>Type de tournage</strong>";
document.body.appendChild(legend);

function buildLegend(seenTypes) {
  legend.querySelectorAll(".legend-toggle").forEach((el) => el.remove());
  activeTypes.clear();

  const knownOrder = Object.keys(typeColors).filter((t) => t !== "Autre");
  const sorted = [
    ...knownOrder.filter((t) => seenTypes.has(t)),
    ...[...seenTypes].filter((t) => !knownOrder.includes(t)),
  ];

  sorted.forEach((type) => {
    activeTypes.add(type);
    const color = getColor(type);
    const inner = typeIconInners[type] || typeIconInners["Autre"];
    const item = document.createElement("div");
    item.className = "legend-item legend-toggle";
    item.innerHTML = `<img src="${makeSvgMarker(color, inner)}" width="20" height="20" style="margin-right:8px;flex-shrink:0">${type}`;
    item.addEventListener("click", () => {
      if (activeTypes.has(type)) {
        activeTypes.delete(type);
        item.classList.add("legend-toggle--off");
      } else {
        activeTypes.add(type);
        item.classList.remove("legend-toggle--off");
      }
      Object.keys(clusterStyleCache).forEach((k) => delete clusterStyleCache[k]);
      vectorLayer.changed();
      if (pinnedCluster && pinnedCoordinate) {
        const features = pinnedCluster.get("features");
        const visible = features.filter((f) => activeTypes.has(f.get("type_tournage") || "Autre"));
        if (visible.length >= 2) {
          renderClusterPopup(visible, pinnedCoordinate);
        } else {
          pinnedCluster = null;
          pinnedCoordinate = null;
          overlay.setPosition(undefined);
        }
      }
    });
    legend.appendChild(item);
  });
}

// =====================
// RECHERCHE ADRESSE
// =====================

const searchSource = new ol.source.Vector();

const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 52 64" width="40" height="55"><defs><filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.45)"/></filter></defs><path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 28 16 28S32 28 32 16C32 7.163 24.837 0 16 0z" fill="#E63946" stroke="white" stroke-width="3" filter="url(#s)"/><circle cx="16" cy="16" r="6" fill="white"/></svg>`;

const searchLayer = new ol.layer.Vector({
  source: searchSource,
  style: new ol.style.Style({
    image: new ol.style.Icon({
      src: "data:image/svg+xml," + encodeURIComponent(pinSvg),
      anchor: [0.5, 1],
      anchorXUnits: "fraction",
      anchorYUnits: "fraction",
    }),
  }),
});

map.addLayer(searchLayer);

const searchInput = document.getElementById("search-input");
const searchResultsList = document.getElementById("search-results");
let searchTimeout = null;

searchInput.addEventListener("input", function () {
  clearTimeout(searchTimeout);
  const q = searchInput.value.trim();
  if (q.length < 3) {
    searchResultsList.innerHTML = "";
    searchResultsList.classList.remove("visible");
    return;
  }
  searchTimeout = setTimeout(() => fetchAddresses(q), 300);
});

searchInput.addEventListener("blur", function () {
  setTimeout(() => searchResultsList.classList.remove("visible"), 150);
});

async function fetchAddresses(q) {
  try {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=8&lat=48.8566&lon=2.3522`;
    const res = await fetch(url);
    const data = await res.json();

    searchResultsList.innerHTML = "";
    if (data.features.length === 0) {
      searchResultsList.classList.remove("visible");
      return;
    }

    data.features.forEach((feature) => {
      const li = document.createElement("li");
      li.textContent = feature.properties.label;
      li.addEventListener("click", () => selectAddress(feature));
      searchResultsList.appendChild(li);
    });

    searchResultsList.classList.add("visible");
  } catch (e) {
    console.error("Erreur BAN :", e);
  }
}

function selectAddress(feature) {
  const [lon, lat] = feature.geometry.coordinates;
  const coords = ol.proj.fromLonLat([lon, lat]);

  searchSource.clear();
  searchSource.addFeature(new ol.Feature({ geometry: new ol.geom.Point(coords) }));

  map.getView().animate({ center: coords, zoom: 16, duration: 800 });

  searchInput.value = feature.properties.label;
  searchResultsList.innerHTML = "";
  searchResultsList.classList.remove("visible");
}

// =====================
// GEOLOCALISATION
// =====================

const userSource = new ol.source.Vector();

const userLayer = new ol.layer.Vector({
  source: userSource,
  style: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 8,
      fill: new ol.style.Fill({ color: "#4285F4" }),
      stroke: new ol.style.Stroke({ color: "white", width: 2.5 }),
    }),
  }),
});

map.addLayer(userLayer);

const locateBtn = document.getElementById("locate-btn");

locateBtn.addEventListener("click", function () {
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée par votre navigateur.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const coords = ol.proj.fromLonLat([
        position.coords.longitude,
        position.coords.latitude,
      ]);

      userSource.clear();
      userSource.addFeature(
        new ol.Feature({ geometry: new ol.geom.Point(coords) }),
      );

      map.getView().animate({ center: coords, zoom: 14, duration: 800 });

      locateBtn.classList.add("active");
    },
    function () {
      alert("Impossible d'obtenir votre position.");
    },
  );
});

// =====================
// SÉLECTEUR DE FOND DE CARTE
// =====================

const basemapBtn = document.getElementById("basemap-btn");
const basemapPanel = document.getElementById("basemap-panel");

basemaps.forEach((bm, i) => {
  const item = document.createElement("div");
  item.className = "basemap-item" + (i === 0 ? " basemap-item--active" : "");
  item.dataset.id = bm.id;
  item.textContent = bm.name;
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    basemapLayer.setSource(
      new ol.source.XYZ({ url: bm.url, attributions: bm.attribution }),
    );
    basemapPanel.querySelectorAll(".basemap-item").forEach((el) =>
      el.classList.remove("basemap-item--active"),
    );
    item.classList.add("basemap-item--active");
  });
  basemapPanel.appendChild(item);
});

basemapBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  basemapPanel.classList.toggle("basemap-panel--open");
});

document.addEventListener("click", () => {
  basemapPanel.classList.remove("basemap-panel--open");
});

// =====================
// START
// =====================

loadData();
