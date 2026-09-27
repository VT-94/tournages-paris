// =====================
// COUCHE DES TOURNAGES
// =====================

import { CLUSTER_DISTANCE } from "../../config.js";
import { getVisibleFeatures } from "../../state.js";
import { getMarkerStyle } from "../styles/markers.js";
import { getClusterStyle } from "../styles/clusters.js";

export const vectorSource = new ol.source.Vector();

const clusterSource = new ol.source.Cluster({
  distance: CLUSTER_DISTANCE,
  source: vectorSource,
});

export const vectorLayer = new ol.layer.Vector({
  source: clusterSource,

  style: (feature) => {
    const visible = getVisibleFeatures(feature);

    if (visible.length === 0) return null;

    if (visible.length === 1) {
      const type = visible[0].get("type_tournage") || "Autre";
      return getMarkerStyle(type);
    }

    return getClusterStyle(visible.length);
  },
});
