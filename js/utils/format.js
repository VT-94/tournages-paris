export function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Période de tournage en toutes lettres : « le … », « du … au … » ou « à partir du … »
export function formatPeriode(dateDebut, dateFin) {
  const debut = formatDate(dateDebut);
  const fin = formatDate(dateFin);
  if (debut && fin) return debut === fin ? `le ${debut}` : `du ${debut} au ${fin}`;
  if (debut) return `à partir du ${debut}`;
  return null;
}
