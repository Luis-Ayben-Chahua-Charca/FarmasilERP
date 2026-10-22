// Navegación del menú principal sin recargar la página (hash routing).
// Cada opción del menú tiene su propio módulo de pantalla (W1 a W5).

import * as w1 from './pantallas/w1-registrar-venta.js';
import * as w2 from './pantallas/w2-ingreso-lotes.js';
import * as w3 from './pantallas/w3-consultar-stock.js';
import * as w4 from './pantallas/w4-productos.js';
import * as w5 from './pantallas/w5-reportes.js';

const rutas = {
  'registrar-venta': w1,
  'ingreso-lotes': w2,
  'consultar-stock': w3,
  'productos': w4,
  'reportes': w5,
};

const RUTA_INICIAL = 'registrar-venta';

const titulo = document.getElementById('titulo-pantalla');
const contenedor = document.getElementById('pantalla');
const enlaces = document.querySelectorAll('#menu a');

function rutaActual() {
  const ruta = location.hash.replace(/^#\/?/, '');
  return rutas[ruta] ? ruta : RUTA_INICIAL;
}

function mostrar() {
  const ruta = rutaActual();
  const pantalla = rutas[ruta];

  // Sin hash o con una ruta desconocida, la URL se corrige a la pantalla mostrada
  if (location.hash !== `#/${ruta}`) {
    history.replaceState(null, '', `#/${ruta}`);
  }

  titulo.textContent = pantalla.titulo;
  document.title = `${pantalla.titulo} · Farmasil`;
  contenedor.replaceChildren();
  pantalla.render(contenedor);

  enlaces.forEach((a) => {
    const activo = a.dataset.ruta === ruta;
    a.classList.toggle('activo', activo);
    if (activo) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  titulo.focus();
}

window.addEventListener('hashchange', mostrar);
mostrar();
