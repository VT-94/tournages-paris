// Neutralise les caractères spéciaux HTML d'un texte venant de l'extérieur
// avant de l'insérer dans la page
export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
