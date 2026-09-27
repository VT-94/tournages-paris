// =====================
// SÉLECTEUR DE FOND DE CARTE
// =====================

import { basemaps, setBasemap } from "../map/basemaps.js";

export function initBasemapPicker() {
  const basemapBtn = document.getElementById("basemap-btn");
  const basemapPanel = document.getElementById("basemap-panel");

  basemaps.forEach((bm, i) => {
    const item = document.createElement("div");
    item.className = "basemap-item" + (i === 0 ? " basemap-item--active" : "");
    item.dataset.id = bm.id;
    item.textContent = bm.name;
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      setBasemap(bm);
      basemapPanel
        .querySelectorAll(".basemap-item")
        .forEach((el) => el.classList.remove("basemap-item--active"));
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
}
