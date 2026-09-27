// =====================
// POPUP
// =====================

import { POINTER_MOVE_THROTTLE, POPUP_HIDE_DELAY } from "../config.js";
import { state } from "../state.js";
import { map } from "../map/map.js";
import { vectorLayer } from "../map/layers/tournages.js";
import { getColor, typeIconInners } from "../map/styles/types.js";
import { makeSvgBadgeIcon } from "../map/styles/markers.js";
import { formatDate, formatPeriode } from "../utils/format.js";

const popupContainer = document.getElementById("popup");

const overlay = new ol.Overlay({
  element: popupContainer,

  positioning: "bottom-center",

  offset: [0, -10],
});

let lastMoveTime = 0;
let hideTimeout = null;
let currentHoveredFeature = null;

function scheduleHide() {
  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    overlay.setPosition(undefined);
    currentHoveredFeature = null;
  }, POPUP_HIDE_DELAY);
}

function cancelHide() {
  clearTimeout(hideTimeout);
}

function onPointerMove(event) {
  const now = Date.now();
  if (now - lastMoveTime < POINTER_MOVE_THROTTLE) return;
  lastMoveTime = now;

  if (state.pinnedCluster) {
    const hovered = map.forEachFeatureAtPixel(event.pixel, (f) => f, {
      layerFilter: (l) => l === vectorLayer,
    });
    map.getTargetElement().style.cursor = hovered ? "pointer" : "";
    return;
  }

  const feature = map.forEachFeatureAtPixel(event.pixel, (f) => f, {
    layerFilter: (l) => l === vectorLayer,
  });

  map.getTargetElement().style.cursor = feature ? "pointer" : "";

  if (!feature) {
    scheduleHide();
    return;
  }

  const features = feature.get("features");
  const visible = features?.filter((f) =>
    state.activeTypes.has(f.get("type_tournage") || "Autre"),
  );
  if (!visible || visible.length !== 1) {
    scheduleHide();
    return;
  }

  cancelHide();
  if (visible[0] !== currentHoveredFeature) {
    currentHoveredFeature = visible[0];
    renderSinglePopup(visible[0], event.coordinate);
  }
}

function renderSinglePopup(actual, coordinate) {
  const type = actual.get("type_tournage") || "Autre";
  const color = getColor(type);
  const inner = typeIconInners[type] || typeIconInners["Autre"];
  const iconSrc = makeSvgBadgeIcon(inner);
  const periode = formatPeriode(actual.get("date_debut"), actual.get("date_fin"));
  const memeJour =
    formatDate(actual.get("date_debut")) === formatDate(actual.get("date_fin"));

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
        <span class="popup-label">${memeJour ? "Date" : "Dates"}</span>
        <span class="popup-value">${periode}</span>
      </div>`
          : ""
      }
    </div>
  `;

  overlay.setPosition(coordinate);
}

function onSingleClick(event) {
  const feature = map.forEachFeatureAtPixel(event.pixel, (f) => f, {
    layerFilter: (l) => l === vectorLayer,
  });

  if (!feature) {
    closePinnedPopup();
    return;
  }

  const features = feature.get("features");
  const visible = features?.filter((f) =>
    state.activeTypes.has(f.get("type_tournage") || "Autre"),
  );

  if (!visible || visible.length <= 1) {
    closePinnedPopup();
    return;
  }

  state.pinnedCluster = feature;
  state.pinnedCoordinate = event.coordinate;
  renderClusterPopup(visible, event.coordinate);
}

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
      const periode = formatPeriode(f.get("date_debut"), f.get("date_fin"));
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

function closePinnedPopup() {
  state.pinnedCluster = null;
  state.pinnedCoordinate = null;
  overlay.setPosition(undefined);
}

// Met à jour la liste ouverte après un changement de filtre dans la légende
export function refreshPinnedPopup() {
  if (state.pinnedCluster && state.pinnedCoordinate) {
    const features = state.pinnedCluster.get("features");
    const visible = features.filter((f) =>
      state.activeTypes.has(f.get("type_tournage") || "Autre"),
    );
    if (visible.length >= 2) {
      renderClusterPopup(visible, state.pinnedCoordinate);
    } else {
      closePinnedPopup();
    }
  }
}

export function initPopup() {
  map.addOverlay(overlay);

  popupContainer.addEventListener("mouseenter", cancelHide);
  popupContainer.addEventListener("mouseleave", () => {
    overlay.setPosition(undefined);
    currentHoveredFeature = null;
  });

  map.on("pointermove", onPointerMove);
  map.on("singleclick", onSingleClick);
}
