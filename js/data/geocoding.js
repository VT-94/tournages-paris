// =====================
// RECHERCHE D'ADRESSE (API ADRESSE / BAN)
// =====================

import { ADRESSE_API_URL, PARIS_CENTER } from "../config.js";

export async function searchAddresses(q, limit) {
  const url = `${ADRESSE_API_URL}?q=${encodeURIComponent(q)}&limit=${limit}&lat=${PARIS_CENTER.lat}&lon=${PARIS_CENTER.lon}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.features;
}
