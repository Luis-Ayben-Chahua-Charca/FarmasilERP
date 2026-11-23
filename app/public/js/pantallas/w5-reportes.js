// W5 — Reportes: pestaña Del día (HU-03, #111).
// Por periodo queda como panel vacío hasta #114 (decisión del humano).

import { api } from '../api.js';

export const titulo = 'Reportes';

function elemento(tipo, texto, clase) {
  const nodo = document.createElement(tipo);
  if (texto !== undefined) nodo.textContent = texto;
  if (clase) nodo.className = clase;
  return nodo;
}

function precio(centimos) {
  return 'S/ ' + (centimos / 100).toFixed(2);
}

function fechaLocal() {
  const hoy = new Date();
  return [hoy.getFullYear(), String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0')].join('-');
}

function fechaVisible(fecha) {
  return fecha.split('-').reverse().join('/');
}

function crearTabla(tituloTabla, columnas) {
  const seccion = elemento('section');
  const titulo = elemento('h2', tituloTabla, 'reportes-subtitulo');
  const tabla = elemento('table', undefined, 'reportes-tabla');
  const cabecera = elemento('thead');
  const fila = elemento('tr');
  for (const [texto, numerica] of columnas) {
    const celda = elemento('th', texto, numerica ? 'reportes-numero' : '');
    celda.scope = 'col';
    fila.append(celda);
  }
  cabecera.append(fila);
  const cuerpo = elemento('tbody');
  tabla.append(cabecera, cuerpo);
  const desplazamiento = elemento('div', undefined, 'reportes-desplazamiento');
  desplazamiento.append(tabla);
  seccion.append(titulo, desplazamiento);
  return { seccion, cuerpo };
}

export function render(contenedor) {
  const pantalla = elemento('div', undefined, 'reportes');
  const pestanas = elemento('div', undefined, 'reportes-pestanas');
  pestanas.setAttribute('role', 'tablist');
  pestanas.setAttribute('aria-label', titulo);
  const paneles = ['del-dia', 'por-periodo'].map((id) => {
    const panel = elemento('div', undefined, 'reportes-panel');
    panel.id = 'w5-' + id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', panel.id + '-pestana');
    panel.tabIndex = 0;
    return panel;
  });
  const botones = ['Del día', 'Por periodo'].map((texto, indice) => {
    const boton = elemento('button', texto, 'reportes-pestana');
    boton.type = 'button';
    boton.id = paneles[indice].id + '-pestana';
    boton.setAttribute('role', 'tab');
    boton.setAttribute('aria-controls', paneles[indice].id);
    boton.addEventListener('click', () => seleccionar(indice));
    boton.addEventListener('keydown', (evento) => {
      const destinos = { ArrowRight: 1 - indice, ArrowLeft: 1 - indice, Home: 0, End: 1 };
      if (!(evento.key in destinos)) return;
      evento.preventDefault();
      seleccionar(destinos[evento.key]);
      botones[destinos[evento.key]].focus();
    });
    return boton;
  });

  function seleccionar(indice) {
    botones.forEach((boton, i) => {
      boton.setAttribute('aria-selected', String(i === indice));
      boton.tabIndex = i === indice ? 0 : -1;
      paneles[i].hidden = i !== indice;
    });
  }

  seleccionar(0);
  pestanas.append(...botones);
  pantalla.append(pestanas, ...paneles);
  contenedor.append(pantalla);

  const campo = elemento('div', undefined, 'campo reportes-fecha');
  const etiqueta = elemento('label', 'Fecha');
  etiqueta.htmlFor = 'w5-fecha';
  const fecha = elemento('input');
  fecha.id = 'w5-fecha';
  fecha.type = 'date';
  fecha.required = true;
  fecha.lang = 'es-PE';
  fecha.value = fechaLocal();
  // El formato del control nativo depende del navegador; esta fecha visible es DD/MM/AAAA.
  const fechaMostrada = elemento('time', undefined, 'reportes-fecha-visible');
  campo.append(etiqueta, fecha, fechaMostrada);

  const resumen = elemento('div', undefined, 'reportes-resumen');
  const valores = ['Ventas', 'Unidades vendidas', 'Monto total'].map((texto) => {
    const tarjeta = elemento('div', undefined, 'reportes-resumen-item');
    const valor = elemento('div', undefined, 'reportes-valor');
    tarjeta.append(valor, elemento('div', texto, 'reportes-etiqueta'));
    resumen.append(tarjeta);
    return valor;
  });
  const estado = elemento('p', undefined, 'reportes-estado');
  estado.setAttribute('role', 'status');
  const productos = crearTabla('Productos vendidos', [['Producto'], ['Unidades', true], ['Monto', true]]);
  const ventas = crearTabla('Detalle por venta', [['Hora'], ['Monto', true], ['Productos']]);
  paneles[0].append(campo, resumen, estado, productos.seccion, ventas.seccion);

  // Igual que W3: solo la última consulta puede actualizar los resultados.
  let numeroConsulta = 0;
  async function consultar() {
    const actual = ++numeroConsulta;
    const elegida = fecha.value;
    resumen.hidden = true;
    productos.seccion.hidden = true;
    ventas.seccion.hidden = true;
    productos.cuerpo.replaceChildren();
    ventas.cuerpo.replaceChildren();
    valores.forEach((valor) => { valor.textContent = ''; });
    estado.textContent = '';
    fechaMostrada.textContent = elegida ? fechaVisible(elegida) : '';
    fechaMostrada.dateTime = elegida;
    if (!fecha.reportValidity()) {
      paneles[0].setAttribute('aria-busy', 'false');
      return;
    }
    paneles[0].setAttribute('aria-busy', 'true');
    try {
      const reporte = await api.get('/reportes/diario?fecha=' + encodeURIComponent(elegida));
      if (actual !== numeroConsulta) return;
      valores[0].textContent = String(reporte.numero_ventas);
      valores[1].textContent = String(reporte.unidades_vendidas);
      valores[2].textContent = precio(reporte.monto_total_centimos);
      resumen.hidden = false;
      if (reporte.numero_ventas === 0) {
        estado.textContent = `No hay ventas registradas el ${fechaVisible(reporte.fecha)}.`;
        return;
      }
      for (const producto of reporte.productos) {
        const fila = elemento('tr');
        fila.append(elemento('td', producto.nombre),
          elemento('td', String(producto.unidades), 'reportes-numero'),
          elemento('td', precio(producto.monto_centimos), 'reportes-numero'));
        productos.cuerpo.append(fila);
      }
      for (const venta of reporte.ventas) {
        const fila = elemento('tr');
        const lineas = elemento('td');
        for (const linea of venta.lineas) {
          lineas.append(elemento('div',
            `${linea.nombre} × ${linea.cantidad} (${precio(linea.precio_unitario_centimos)} c/u)`));
        }
        fila.append(elemento('td', venta.hora),
          elemento('td', precio(venta.monto_total_centimos), 'reportes-numero'), lineas);
        ventas.cuerpo.append(fila);
      }
      productos.seccion.hidden = false;
      ventas.seccion.hidden = false;
    } catch (error) {
      if (actual !== numeroConsulta) return;
      resumen.hidden = true;
      estado.textContent = error.message;
    } finally {
      if (actual === numeroConsulta) paneles[0].setAttribute('aria-busy', 'false');
    }
  }

  fecha.addEventListener('change', consultar);
  consultar();
}
