// W1 — Registrar venta (HU-01.4, HU-01.5, HU-01.6)
// Búsqueda de producto por nombre, carrito con cantidad, precio y total.
// Valida la cantidad y el stock disponible al agregar (HU-01.5).
// Confirmar y cancelar la venta (HU-01.6).

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

  const avisoCantidad = document.createElement('p');
  avisoCantidad.className = 'error-campo';
  avisoCantidad.id = 'w1-cantidad-error';
  avisoCantidad.setAttribute('role', 'alert');
  inputCantidad.setAttribute('aria-describedby', avisoCantidad.id);
  campoCantidad.append(avisoCantidad);

  function marcarError(texto) {
    avisoCantidad.textContent = texto;
    inputCantidad.classList.add('campo-invalido');
    inputCantidad.setAttribute('aria-invalid', 'true');
  }

  function limpiarError() {
    avisoCantidad.textContent = '';
    inputCantidad.classList.remove('campo-invalido');
    inputCantidad.removeAttribute('aria-invalid');
  }

  inputCantidad.addEventListener('input', limpiarError);

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

  // ---- Botones Confirmar y Cancelar (HU-01.6) ----
  const seccionBotones = document.createElement('div');
  seccionBotones.className = 'botones-venta';

  const botonConfirmar = document.createElement('button');
  botonConfirmar.type = 'button';
  botonConfirmar.className = 'boton-principal';
  botonConfirmar.textContent = 'Confirmar venta';
  botonConfirmar.disabled = true;

  const botonCancelar = document.createElement('button');
  botonCancelar.type = 'button';
  botonCancelar.className = 'boton-secundario';
  botonCancelar.textContent = 'Cancelar venta';
  botonCancelar.disabled = true;

  seccionBotones.append(botonConfirmar, botonCancelar);

  const mensajeVenta = document.createElement('p');
  mensajeVenta.className = 'mensaje';
  mensajeVenta.setAttribute('role', 'status');

  // ---- Dibujar carrito ----
  function dibujarCarrito() {
    cuerpoCarrito.replaceChildren();
    mensajeVenta.textContent = '';
    mensajeVenta.className = 'mensaje';

    if (carrito.length === 0) {
      tablaCarrito.hidden = true;
      divTotal.textContent = '';
      estadoVacio.hidden = false;
      botonConfirmar.disabled = true;
      botonCancelar.disabled = true;
      return;
    }

    tablaCarrito.hidden = false;
    estadoVacio.hidden = true;
    botonConfirmar.disabled = false;
    botonCancelar.disabled = false;

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
      fila.dataset.productoId = String(item.id);
      cuerpoCarrito.append(fila);
    }

    divTotal.textContent = 'Total: ' + formatearPrecio(totalCentimos);
  }

  // ---- Agregar al carrito ----
  botonAgregar.addEventListener('click', () => {
    if (!productoSeleccionado) return;
    const texto = inputCantidad.value.trim();
    const cantidad = Number(texto);
    if (texto === '' || !Number.isInteger(cantidad) || cantidad < 1) {
      marcarError('La cantidad debe ser mayor que cero.');
      return;
    }

    const existente = carrito.find((item) => item.id === productoSeleccionado.id);
    const disponible = productoSeleccionado.stock_total - (existente ? existente.cantidad : 0);
    if (cantidad > disponible) {
      marcarError(disponible === 1
        ? 'Solo hay 1 unidad disponible.'
        : `Solo hay ${disponible} unidades disponibles.`);
      return;
    }

    limpiarError();
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
          limpiarError();
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

  // ---- Confirmar venta (HU-01.6) ----
  botonConfirmar.addEventListener('click', async () => {
    botonConfirmar.disabled = true;
    mensajeVenta.textContent = '';
    mensajeVenta.className = 'mensaje';

    const lineas = carrito.map((item) => ({
      producto_id: item.id,
      cantidad: item.cantidad,
    }));

    try {
      const venta = await api.post('/ventas', { lineas });
      carrito.length = 0;
      dibujarCarrito();
      mensajeVenta.textContent = 'Venta registrada: ' + formatearPrecio(venta.monto_total_centimos) + '.';
      mensajeVenta.classList.add('mensaje-ok');
      buscar();
    } catch (error) {
      if (error.status === 409 && error.producto_id != null) {
        // Mostrar el error junto a la línea del producto afectado
        const filaAfectada = cuerpoCarrito.querySelector(
          `tr[data-producto-id="${error.producto_id}"]`
        );
        if (filaAfectada) {
          const filaError = document.createElement('tr');
          const celdaError = document.createElement('td');
          celdaError.colSpan = 5;
          celdaError.className = 'error-campo';
          celdaError.textContent = error.message;
          filaError.append(celdaError);
          filaAfectada.after(filaError);
        } else {
          mensajeVenta.textContent = error.message;
          mensajeVenta.classList.add('mensaje-error');
        }
      } else {
        mensajeVenta.textContent = error.message;
        mensajeVenta.classList.add('mensaje-error');
      }
      botonConfirmar.disabled = false;
    }
  });

  // ---- Cancelar venta (HU-01.6) ----
  botonCancelar.addEventListener('click', () => {
    carrito.length = 0;
    dibujarCarrito();
  });

  // ---- Montar en el contenedor ----
  const seccion = document.createElement('div');
  seccion.className = 'seccion-venta';
  seccion.append(
    seccionBusqueda,
    estadoBusqueda,
    tablaResultados,
    seccionAgregar,
    estadoVacio,
    tablaCarrito,
    divTotal,
    seccionBotones,
    mensajeVenta
  );
  contenedor.append(seccion);

  dibujarCarrito();
  buscar();
}
