// W1 — Registrar venta (HU-01.4)
// Búsqueda de producto por nombre, carrito con cantidad, precio y total.
// No llama a POST /api/ventas (HU-01.6) ni valida stock insuficiente (HU-01.5).

import { api } from '../api.js';

export const titulo = 'Registrar venta';

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
  // ---- Estado del carrito ----
  const carrito = []; // { id, nombre, precio_centimos, cantidad }
  let productoSeleccionado = null;

  // ---- Búsqueda de producto ----
  const seccionBusqueda = document.createElement('div');
  seccionBusqueda.className = 'buscador';

  const campoBusqueda = document.createElement('input');
  campoBusqueda.type = 'search';
  campoBusqueda.setAttribute('aria-label', 'Buscar producto por nombre');
  campoBusqueda.placeholder = 'Buscar producto por nombre';
  campoBusqueda.autocomplete = 'off';
  seccionBusqueda.append(campoBusqueda);

  const estadoBusqueda = document.createElement('p');
  estadoBusqueda.className = 'estado-stock';
  estadoBusqueda.setAttribute('role', 'status');

  const tablaResultados = document.createElement('table');
  tablaResultados.className = 'tabla-stock';
  const cabeceraResultados = document.createElement('thead');
  const filaCabeceraRes = document.createElement('tr');
  filaCabeceraRes.append(
    celda('th', 'Producto'),
    celda('th', 'Precio por unidad'),
    celda('th', 'Stock disponible')
  );
  cabeceraResultados.append(filaCabeceraRes);
  const cuerpoResultados = document.createElement('tbody');
  tablaResultados.append(cabeceraResultados, cuerpoResultados);
  tablaResultados.hidden = true;

  // ---- Cantidad y botón Agregar ----
  const seccionAgregar = document.createElement('div');
  seccionAgregar.className = 'fila-agregar';

  const campoCantidad = document.createElement('div');
  campoCantidad.className = 'campo';
  const etiquetaCantidad = document.createElement('label');
  etiquetaCantidad.htmlFor = 'w1-cantidad';
  etiquetaCantidad.textContent = 'Cantidad';
  const inputCantidad = document.createElement('input');
  inputCantidad.type = 'number';
  inputCantidad.id = 'w1-cantidad';
  inputCantidad.min = '1';
  inputCantidad.step = '1';
  inputCantidad.placeholder = '0';
  inputCantidad.inputMode = 'numeric';
  campoCantidad.append(etiquetaCantidad, inputCantidad);

  const botonAgregar = document.createElement('button');
  botonAgregar.type = 'button';
  botonAgregar.className = 'boton-principal boton-agregar';
  botonAgregar.textContent = 'Agregar';

  seccionAgregar.append(campoCantidad, botonAgregar);

  // ---- Carrito ----
  const estadoVacio = document.createElement('p');
  estadoVacio.className = 'pantalla-vacia';
  estadoVacio.textContent = 'Agregue productos para iniciar la venta.';

  const tablaCarrito = document.createElement('table');
  tablaCarrito.className = 'tabla-stock';
  const cabeceraCarrito = document.createElement('thead');
  const filaCabeceraCarrito = document.createElement('tr');
  filaCabeceraCarrito.append(
    celda('th', 'Producto'),
    celda('th', 'Cantidad'),
    celda('th', 'Precio por unidad'),
    celda('th', 'Subtotal'),
    celda('th', '')
  );
  cabeceraCarrito.append(filaCabeceraCarrito);
  const cuerpoCarrito = document.createElement('tbody');
  tablaCarrito.append(cabeceraCarrito, cuerpoCarrito);

  const divTotal = document.createElement('div');
  divTotal.className = 'total-venta';

  // ---- Dibujar carrito ----
  function dibujarCarrito() {
    cuerpoCarrito.replaceChildren();

    if (carrito.length === 0) {
      tablaCarrito.hidden = true;
      divTotal.textContent = '';
      estadoVacio.hidden = false;
      return;
    }

    tablaCarrito.hidden = false;
    estadoVacio.hidden = true;

    let totalCentimos = 0;
    for (const item of carrito) {
      const subtotal = item.precio_centimos * item.cantidad;
      totalCentimos += subtotal;

      const fila = document.createElement('tr');

      const botonQuitar = document.createElement('button');
      botonQuitar.type = 'button';
      botonQuitar.className = 'boton-secundario boton-quitar';
      botonQuitar.textContent = 'Quitar';
      botonQuitar.addEventListener('click', () => {
        const indice = carrito.indexOf(item);
        if (indice !== -1) carrito.splice(indice, 1);
        dibujarCarrito();
      });
      const celdaQuitar = document.createElement('td');
      celdaQuitar.append(botonQuitar);

      fila.append(
        celda('td', item.nombre),
        celda('td', String(item.cantidad)),
        celda('td', formatearPrecio(item.precio_centimos)),
        celda('td', formatearPrecio(subtotal)),
        celdaQuitar
      );
      cuerpoCarrito.append(fila);
    }

    divTotal.textContent = 'Total: ' + formatearPrecio(totalCentimos);
  }

  // ---- Agregar al carrito ----
  botonAgregar.addEventListener('click', () => {
    if (!productoSeleccionado) return;
    const cantidad = parseInt(inputCantidad.value, 10);
    if (!cantidad || cantidad < 1) return;

    const existente = carrito.find((item) => item.id === productoSeleccionado.id);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      carrito.push({
        id: productoSeleccionado.id,
        nombre: productoSeleccionado.nombre,
        precio_centimos: productoSeleccionado.precio_centimos,
        cantidad: cantidad,
      });
    }

    inputCantidad.value = '';
    productoSeleccionado = null;
    cuerpoResultados.querySelectorAll('tr').forEach((r) => r.classList.remove('fila-seleccionada'));
    dibujarCarrito();
  });

  // ---- Búsqueda con espera y control de respuestas tardías ----
  let numeroBusqueda = 0;

  async function buscar() {
    const actual = ++numeroBusqueda;
    const nombre = campoBusqueda.value.trim();
    const consulta = nombre ? '?nombre=' + encodeURIComponent(nombre) : '';

    try {
      const productos = await api.get('/stock' + consulta);
      if (actual !== numeroBusqueda) return;

      cuerpoResultados.replaceChildren();

      if (productos.length === 0) {
        tablaResultados.hidden = true;
        estadoBusqueda.textContent = 'No se encontraron productos con esa búsqueda.';
        return;
      }

      tablaResultados.hidden = false;
      estadoBusqueda.textContent = '';

      for (const p of productos) {
        const fila = document.createElement('tr');
        fila.style.cursor = 'pointer';
        fila.append(
          celda('td', p.nombre),
          celda('td', formatearPrecio(p.precio_centimos)),
          celda('td', String(p.stock_total))
        );
        fila.addEventListener('click', () => {
          productoSeleccionado = p;
          cuerpoResultados.querySelectorAll('tr').forEach((r) => r.classList.remove('fila-seleccionada'));
          fila.classList.add('fila-seleccionada');
          inputCantidad.focus();
        });
        cuerpoResultados.append(fila);
      }
    } catch (error) {
      if (actual !== numeroBusqueda) return;
      cuerpoResultados.replaceChildren();
      tablaResultados.hidden = true;
      estadoBusqueda.textContent = error.message;
    }
  }

  let temporizador;
  campoBusqueda.addEventListener('input', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(buscar, ESPERA_BUSQUEDA_MS);
  });

  // ---- Montar en el contenedor ----
  contenedor.append(
    seccionBusqueda,
    estadoBusqueda,
    tablaResultados,
    seccionAgregar,
    estadoVacio,
    tablaCarrito,
    divTotal
  );

  dibujarCarrito();
  buscar();
}
