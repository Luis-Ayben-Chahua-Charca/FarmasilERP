// W1 — Registrar venta
// Pantalla vacía (Sprint 1). Se completa en una historia posterior.

export const titulo = 'Registrar venta';

export function render(contenedor) {
  const aviso = document.createElement('p');
  aviso.className = 'pantalla-vacia';
  aviso.textContent = 'Esta pantalla estará disponible pronto.';
  contenedor.append(aviso);
}
