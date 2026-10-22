// W2 — Ingreso de lotes
// Pantalla vacía (Sprint 1). Se completa en HU-04 / HU-05.

export const titulo = 'Ingreso de lotes';

export function render(contenedor) {
  const aviso = document.createElement('p');
  aviso.className = 'pantalla-vacia';
  aviso.textContent = 'Esta pantalla estará disponible pronto.';
  contenedor.append(aviso);
}
