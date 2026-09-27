export function svgToDataUri(svg) {
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
