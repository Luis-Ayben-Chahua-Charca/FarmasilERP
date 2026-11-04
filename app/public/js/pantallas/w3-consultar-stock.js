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

function formatearFecha(iso) {
  // AAAA-MM-DD -> DD/MM/AAAA (sin Date, para evitar desfases de zona horaria)
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
}

function crearDetalle(lotes) {
  const caja = document.createElement('div');
  caja.className = 'detalle-lotes';

  if (lotes.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'sin-lotes';
    vacio.textContent = 'Sin lotes registrados.';
    caja.append(vacio);
    return caja;
  }

  const tabla = document.createElement('table');
  tabla.className = 'tabla-lotes';
  const cabecera = document.createElement('thead');
  const filaCabecera = document.createElement('tr');
  filaCabecera.append(
    celda('th', 'Lote'),
    celda('th', 'Vencimiento'),
    celda('th', 'Cantidad (unidades)')
  );
  cabecera.append(filaCabecera);

  const cuerpo = document.createElement('tbody');
  for (const l of lotes) {
    const fila = document.createElement('tr');
    fila.append(
      celda('td', l.numero_lote),
      celda('td', formatearFecha(l.fecha_vencimiento)),
      celda('td', String(l.cantidad))
    );
    cuerpo.append(fila);
  }

  tabla.append(cabecera, cuerpo);
  caja.append(tabla);
  return caja;
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

      const filaDetalle = document.createElement('tr');
      filaDetalle.id = 'lotes-' + p.id;
      filaDetalle.hidden = true;
      const celdaDetalle = document.createElement('td');
      celdaDetalle.colSpan = 3;
      celdaDetalle.append(crearDetalle(p.lotes || []));
      filaDetalle.append(celdaDetalle);

      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'boton-lotes';
      boton.textContent = p.nombre;
      boton.setAttribute('aria-expanded', 'false');
      boton.setAttribute('aria-controls', filaDetalle.id);
      boton.addEventListener('click', () => {
        const abrir = filaDetalle.hidden;
        filaDetalle.hidden = !abrir;
        boton.setAttribute('aria-expanded', String(abrir));
      });
      const celdaNombre = document.createElement('td');
      celdaNombre.append(boton);

      const stock = celda('td', String(p.stock_total));
      if (p.stock_total === 0) stock.classList.add('sin-stock');
      fila.append(celdaNombre, celda('td', formatearPrecio(p.precio_centimos)), stock);

      cuerpo.append(fila, filaDetalle);
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