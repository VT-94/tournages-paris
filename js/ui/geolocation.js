// =====================
// GÉOLOCALISATION
// =====================

import { LOCATE_ZOOM, ANIMATION_DURATION, MESSAGE_DURATION } from "../config.js";
import { map } from "../map/map.js";
import { userSource } from "../map/layers/user.js";
import { showError } from "./loading.js";

export function initGeolocation() {
  const locateBtn = document.getElementById("locate-btn");

  locateBtn.addEventListener("click", function () {
    if (!navigator.geolocation) {
      showError(
        "La géolocalisation n'est pas supportée par votre navigateur.",
        MESSAGE_DURATION,
      );
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

        map.getView().animate({
          center: coords,
          zoom: LOCATE_ZOOM,
          duration: ANIMATION_DURATION,
        });

        locateBtn.classList.add("active");
      },
      function () {
        showError("Impossible d'obtenir votre position.", MESSAGE_DURATION);
      },
    );
  });
}
