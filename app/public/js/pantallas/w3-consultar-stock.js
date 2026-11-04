// W3 — Consultar stock (HU-08)
// Búsqueda por nombre y filtros por categoría y tipo; tabla con precio por unidad
// y stock total de cada producto.

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

// Selector con la opción «Todos» (valor vacío = sin filtro)
function crearFiltro(id, texto, opciones) {
  const grupo = document.createElement('div');
  grupo.className = 'filtro';

  const etiqueta = document.createElement('label');
  etiqueta.htmlFor = id;
  etiqueta.textContent = texto;

  const selector = document.createElement('select');
  selector.id = id;
  selector.append(new Option('Todos', ''));
  for (const [valor, nombre] of opciones) selector.append(new Option(nombre, valor));

  grupo.append(etiqueta, selector);
  return { grupo, selector };
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

  // Filtros por categoría (acción terapéutica) y tipo (#47, HU-08 CA3)
  const categoria = crearFiltro('w3-categoria', 'Categoría', []);
  const tipo = crearFiltro('w3-tipo', 'Tipo', [['generico', 'Genérico'], ['comercial', 'Comercial']]);

  const filtros = document.createElement('div');
  filtros.className = 'filtros-stock';
  filtros.append(categoria.grupo, tipo.grupo);

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

  contenedor.append(buscador, filtros, estado, tabla, nota);

  // Las categorías salen del primer listado sin filtros, para que la lista
  // no se achique al filtrar
  let categoriasCargadas = false;

  function cargarCategorias(productos) {
    const nombres = [...new Set(productos.map((p) => p.accion_terapeutica))]
      .sort((a, b) => a.localeCompare(b, 'es'));
    for (const nombre of nombres) categoria.selector.append(new Option(nombre, nombre));
    categoriasCargadas = true;
  }

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
    // Solo se envían los filtros que tienen valor; «Todos» no se envía
    const parametros = new URLSearchParams();
    const valores = {
      nombre: caja.value.trim(),
      categoria: categoria.selector.value,
      tipo: tipo.selector.value,
    };
    for (const [clave, valor] of Object.entries(valores)) {
      if (valor) parametros.set(clave, valor);
    }
    const texto = parametros.toString();
    const consulta = texto ? '?' + texto : '';
    try {
      const productos = await api.get('/stock' + consulta);
      if (actual !== numeroBusqueda) return;
      if (!categoriasCargadas && !consulta) cargarCategorias(productos);
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

  // Al cambiar un filtro se busca de inmediato
  for (const { selector } of [categoria, tipo]) {
    selector.addEventListener('change', () => {
      clearTimeout(temporizador);
      buscar();
    });
  }

  buscar(); // al abrir la pantalla se muestra el listado completo
}