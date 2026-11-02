// W3 — Consultar stock (HU-08)
// Búsqueda por nombre, con precio por unidad y stock total de cada producto.

import { api } from '../api.js';

export const titulo = 'Consultar stock';

const ESPERA_BUSQUEDA_MS = 300;

function formatearPrecio(centimos) {
  return 'S/ ' + (centimos / 100).toFixed(2);
}

export function render(contenedor) {
  // Caja de búsqueda
  const buscador = document.createElement('div');
  buscador.className = 'buscador';

  const etiqueta = document.createElement('label');
  etiqueta.htmlFor = 'w3-buscar';
  etiqueta.textContent = 'Buscar producto por nombre';

  const caja = document.createElement('input');
  caja.type = 'search';
  caja.id = 'w3-buscar';
  caja.placeholder = 'Escriba el nombre del producto';
  caja.autocomplete = 'off';

  buscador.append(etiqueta, caja);

  // Resultados
  const estado = document.createElement('p');
  estado.className = 'estado-stock';
  estado.setAttribute('role', 'status');

  const lista = document.createElement('ul');
  lista.className = 'lista-stock';

  contenedor.append(buscador, estado, lista);

  function dibujar(productos) {
    lista.replaceChildren();

    if (productos.length === 0) {
      estado.textContent = 'No se encontraron productos con ese nombre.';
      return;
    }
    estado.textContent = '';

    for (const p of productos) {
      const fila = document.createElement('li');
      fila.className = 'producto-stock';

      const nombre = document.createElement('span');
      nombre.className = 'producto-nombre';
      nombre.textContent = p.nombre;

      const precio = document.createElement('span');
      precio.className = 'producto-precio';
      precio.textContent = formatearPrecio(p.precio_centimos) + ' por unidad';

      const stock = document.createElement('span');
      stock.className = 'producto-stock-total';
      stock.textContent = 'Stock: ' + p.stock_total + ' unidades';
      if (p.stock_total === 0) stock.classList.add('sin-stock');

      fila.append(nombre, precio, stock);
      lista.append(fila);
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
      lista.replaceChildren();
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