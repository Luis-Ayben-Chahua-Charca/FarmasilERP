// W4 — Productos (HU-06)
// Listado de productos con búsqueda por nombre (#106). El listado se pide una sola
// vez a la API y la búsqueda filtra en la pantalla, sin volver a llamar. El alta (#107)
// y la edición (#108) se integran después en este mismo archivo.

import { api } from '../api.js';

export const titulo = 'Productos';

const ETIQUETAS_TIPO = { generico: 'Genérico', comercial: 'Comercial' };

function formatearPrecio(centimos) {
  return 'S/ ' + (centimos / 100).toFixed(2);
}

// Productos creados antes de que el tipo fuera obligatorio (#81) no tienen tipo
function etiquetaTipo(tipo) {
  return ETIQUETAS_TIPO[tipo] || 'Sin tipo';
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
  const columnaPrecio = celda('th', 'Precio por unidad');
  columnaPrecio.className = 'col-precio';
  filaCabecera.append(
    celda('th', 'Producto'),
    celda('th', 'Acción terapéutica'),
    celda('th', 'Tipo'),
    columnaPrecio
  );
  cabecera.append(filaCabecera);
  const cuerpo = document.createElement('tbody');
  tabla.append(cabecera, cuerpo);
  tabla.hidden = true;

  const nota = document.createElement('p');
  nota.className = 'nota-stock';
  nota.textContent = 'Precios siempre por unidad.';

  contenedor.append(buscador, estado, tabla, nota);

  let productos = [];

  function dibujar() {
    cuerpo.replaceChildren();

    if (productos.length === 0) {
      tabla.hidden = true;
      estado.textContent = 'Aún no hay productos registrados.';
      return;
    }

    const texto = caja.value.trim().toLocaleLowerCase('es');
    const visibles = productos.filter((p) => p.nombre.toLocaleLowerCase('es').includes(texto));

    if (visibles.length === 0) {
      tabla.hidden = true;
      estado.textContent = 'No se encontraron productos con esa búsqueda.';
      return;
    }

    tabla.hidden = false;
    estado.textContent = '';
    for (const p of visibles) {
      const fila = document.createElement('tr');
      const precio = celda('td', formatearPrecio(p.precio_centimos));
      precio.className = 'col-precio';
      fila.append(
        celda('td', p.nombre),
        celda('td', p.accion_terapeutica),
        celda('td', etiquetaTipo(p.tipo)),
        precio
      );
      cuerpo.append(fila);
    }
  }

  // El filtro es local: la API ya entrega todos los productos, ordenados por nombre
  caja.addEventListener('input', dibujar);

  async function cargar() {
    try {
      productos = await api.get('/productos');
      dibujar();
    } catch (error) {
      cuerpo.replaceChildren();
      tabla.hidden = true;
      estado.textContent = error.message;
    }
  }

  cargar();
}
