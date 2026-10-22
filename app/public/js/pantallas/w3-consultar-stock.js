// W3 — Consultar stock
// Pantalla vacía (Sprint 1). Se completa en HU-08.

export const titulo = 'Consultar stock';

export function render(contenedor) {
  const aviso = document.createElement('p');
  aviso.className = 'pantalla-vacia';
  aviso.textContent = 'Esta pantalla estará disponible pronto.';
  contenedor.append(aviso);
}
