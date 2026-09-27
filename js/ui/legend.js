// =====================
// LÉGENDE
// =====================

import { state } from "../state.js";
import { vectorLayer } from "../map/layers/tournages.js";
import { typeColors, getColor, typeIconInners } from "../map/styles/types.js";
import { makeSvgMarker } from "../map/styles/markers.js";
import { clearClusterStyleCache } from "../map/styles/clusters.js";
import { refreshPinnedPopup } from "./popup.js";

let legend = null;

export function initLegend() {
  legend = document.createElement("div");
  legend.className = "legend";
  legend.innerHTML = "<strong>Type de tournage</strong>";
  document.body.appendChild(legend);
}

export function buildLegend(seenTypes) {
  legend.querySelectorAll(".legend-toggle").forEach((el) => el.remove());
  state.activeTypes.clear();

  const knownOrder = Object.keys(typeColors).filter((t) => t !== "Autre");
  const sorted = [
    ...knownOrder.filter((t) => seenTypes.has(t)),
    ...[...seenTypes].filter((t) => !knownOrder.includes(t)),
  ];

  sorted.forEach((type) => {
    state.activeTypes.add(type);
    const color = getColor(type);
    const inner = typeIconInners[type] || typeIconInners["Autre"];
    const item = document.createElement("div");
    item.className = "legend-item legend-toggle";
    item.innerHTML = `<img src="${makeSvgMarker(color, inner)}" width="20" height="20" style="margin-right:8px;flex-shrink:0">${type}`;
    item.addEventListener("click", () => {
      if (state.activeTypes.has(type)) {
        state.activeTypes.delete(type);
        item.classList.add("legend-toggle--off");
      } else {
        state.activeTypes.add(type);
        item.classList.remove("legend-toggle--off");
      }
      clearClusterStyleCache();
      vectorLayer.changed();
      refreshPinnedPopup();
    });
    legend.appendChild(item);
  });
}
