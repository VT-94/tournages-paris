// =====================
// RÉGLAGES DU PROJET
// =====================

// Adresses des données
export const TOURNAGES_URL =
  "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/lieux-de-tournage-a-paris/exports/json";
export const ARRONDISSEMENTS_URL =
  "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/arrondissements/exports/geojson";
export const COMMUNES_URL =
  "https://geo.api.gouv.fr/communes?codeRegion=11&format=geojson&geometry=contour";
export const ADRESSE_API_URL = "https://api-adresse.data.gouv.fr/search/";

// Clé du fond de carte gris CARTO.
export const CARTO_API_KEY = "cb1_40bw_1_68f72b31a577d3582fd70e05";

// Carte
export const PARIS_CENTER = { lon: 2.3522, lat: 48.8566 };
export const INITIAL_ZOOM = 12;
export const FIT_PADDING = [50, 50, 50, 50];
export const FIT_MAX_ZOOM = 15;
export const CLUSTER_DISTANCE = 40;

// Déplacements animés
export const ANIMATION_DURATION = 800;
export const SEARCH_ZOOM = 16;
export const LOCATE_ZOOM = 14;

// Recherche d'adresse
export const SEARCH_MIN_CHARS = 3;
export const SEARCH_RESULTS_LIMIT = 8;
export const SEARCH_DEBOUNCE_DELAY = 300;
export const SEARCH_BLUR_DELAY = 150;

// Durée d'affichage d'un message temporaire dans le bandeau
export const MESSAGE_DURATION = 4000;

// Popup
export const POINTER_MOVE_THROTTLE = 30;
export const POPUP_HIDE_DELAY = 400;
