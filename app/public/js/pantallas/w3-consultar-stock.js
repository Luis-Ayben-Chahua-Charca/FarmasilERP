// W3 — Consultar stock (HU-08)
// Búsqueda por nombre y filtros por categoría y tipo, con precio por unidad
// y stock total de cada producto.

import { api } from '../api.js';

export const titulo = 'Consultar stock';

const ESPERA_BUSQUEDA_MS = 300;

function formatearPrecio(centimos) {
  return 'S/ ' + (centimos / 100).toFixed(2);
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

  // Filtros por categoría (acción terapéutica) y tipo (#47, HU-08 CA3)
  const categoria = crearFiltro('w3-categoria', 'Categoría', []);
  const tipo = crearFiltro('w3-tipo', 'Tipo', [['generico', 'Genérico'], ['comercial', 'Comercial']]);

  const filtros = document.createElement('div');
  filtros.className = 'filtros-stock';
  filtros.append(categoria.grupo, tipo.grupo);

  // Resultados
  const estado = document.createElement('p');
  estado.className = 'estado-stock';
  estado.setAttribute('role', 'status');

  const lista = document.createElement('ul');
  lista.className = 'lista-stock';

  contenedor.append(buscador, filtros, estado, lista);

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
    lista.replaceChildren();

    if (productos.length === 0) {
      estado.textContent = 'No se encontraron productos con esa búsqueda.';
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
      lista.replaceChildren();
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