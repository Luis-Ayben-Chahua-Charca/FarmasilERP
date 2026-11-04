// W3 — Consultar stock (HU-08)
// Búsqueda por nombre; tabla con precio por unidad y stock total de cada producto.

import { api } from '../api.js';

export const titulo = 'Consultar stock';

const ESPERA_BUSQUEDA_MS = 300;

function formatearPrecio(centimos) {
  return 'S/ ' + (centimos / 100).toFixed(2);
}

function celda(tipo, texto) {
  const c = document.createElement(tipo);
  c.textContent = texto;
  return c;
}

export function render(contenedor) {
  const buscador = document.createElement('div');
  buscador.className = 'buscador';

  const caja = document.createElement('input');
  caja.type = 'search';
  caja.setAttribute('aria-label', 'Buscar producto por nombre');
  caja.placeholder = 'Buscar producto por nombre';
  caja.autocomplete = 'off';
  buscador.append(caja);

  const estado = document.createElement('p');
  estado.className = 'estado-stock';
  estado.setAttribute('role', 'status');

  const tabla = document.createElement('table');
  tabla.className = 'tabla-stock';
  const cabecera = document.createElement('thead');
  const filaCabecera = document.createElement('tr');
  filaCabecera.append(
    celda('th', 'Producto'),
    celda('th', 'Precio por unidad'),
    celda('th', 'Stock total (unidades)')
  );
  cabecera.append(filaCabecera);
  const cuerpo = document.createElement('tbody');
  tabla.append(cabecera, cuerpo);

  const nota = document.createElement('p');
  nota.className = 'nota-stock';
  nota.textContent = 'Precios y cantidades siempre por unidad.';

  contenedor.append(buscador, estado, tabla, nota);

  function dibujar(productos) {
    cuerpo.replaceChildren();

    if (productos.length === 0) {
      tabla.hidden = true;
      estado.textContent = 'No se encontraron productos con esa búsqueda.';
      return;
    }
    tabla.hidden = false;
    estado.textContent = '';

    for (const p of productos) {
      const fila = document.createElement('tr');
      const stock = celda('td', String(p.stock_total));
      if (p.stock_total === 0) stock.classList.add('sin-stock');
      fila.append(celda('td', p.nombre), celda('td', formatearPrecio(p.precio_centimos)), stock);
      cuerpo.append(fila);
    }
  }

  // Evita que una respuesta lenta pise a una búsqueda más reciente
  let numeroBusqueda = 0;

  async function buscar() {
    const actual = ++numeroBusqueda;
    const consulta = '?nombre=' + encodeURIComponent(caja.value.trim());
    try {
      const productos = await api.get('/stock' + consulta);
      if (actual !== numeroBusqueda) return;
      dibujar(productos);
    } catch (error) {
      if (actual !== numeroBusqueda) return;
      cuerpo.replaceChildren();
      tabla.hidden = true;
      estado.textContent = error.message;
    }
  }

  let temporizador;
  caja.addEventListener('input', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(buscar, ESPERA_BUSQUEDA_MS);
  });

  buscar(); // al abrir la pantalla se muestra el listado completo
}