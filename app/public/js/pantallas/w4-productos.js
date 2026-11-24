// W4 — Productos (HU-06)
// Listado de productos con búsqueda por nombre (#106). El listado se pide una sola
// vez a la API y la búsqueda filtra en la pantalla, sin volver a llamar.
// Alta (#107) y edición (#108) con validación compartida.

import { api } from '../api.js';
import { validarProducto, crearCampo, marcarError, limpiarError } from '../productos.js';

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
    columnaPrecio,
    celda('th', 'Acciones')
  );
  cabecera.append(filaCabecera);
  const cuerpo = document.createElement('tbody');
  tabla.append(cabecera, cuerpo);
  tabla.hidden = true;

  const nota = document.createElement('p');
  nota.className = 'nota-stock';
  nota.textContent = 'Precios siempre por unidad.';

  const botonNuevo = document.createElement('button');
  botonNuevo.type = 'button';
  botonNuevo.className = 'boton-principal';
  botonNuevo.textContent = '+ Nuevo producto';
  botonNuevo.disabled = true;

  const formulario = document.createElement('form');
  formulario.className = 'alta-producto';
  formulario.id = 'w4-alta';
  formulario.noValidate = true;
  formulario.hidden = true;
  botonNuevo.setAttribute('aria-controls', formulario.id);
  botonNuevo.setAttribute('aria-expanded', 'false');

  const tituloAlta = document.createElement('h2');
  tituloAlta.className = 'alta-titulo';
  tituloAlta.textContent = 'Nuevo producto';

  const nombre = document.createElement('input');
  nombre.type = 'text';
  const accion = document.createElement('input');
  accion.type = 'text';
  const tipo = document.createElement('select');
  for (const [valor, etiqueta] of [['', 'Elija el tipo'], ...Object.entries(ETIQUETAS_TIPO)]) {
    const opcion = document.createElement('option');
    opcion.value = valor;
    opcion.textContent = etiqueta;
    tipo.append(opcion);
  }
  const precio = document.createElement('input');
  precio.type = 'text';
  precio.inputMode = 'decimal';
  const campos = { nombre, accion_terapeutica: accion, tipo, precio };

  const guardar = document.createElement('button');
  guardar.type = 'submit';
  guardar.className = 'boton-principal';
  guardar.textContent = 'Guardar producto';
  const cancelar = document.createElement('button');
  cancelar.type = 'button';
  cancelar.className = 'boton-secundario';
  cancelar.textContent = 'Cancelar';
  const botones = document.createElement('div');
  botones.className = 'fila-campos';
  botones.append(guardar, cancelar);

  formulario.append(
    tituloAlta,
    crearCampo('w4-nuevo-nombre', 'Nombre', nombre),
    crearCampo('w4-nuevo-accion', 'Acción terapéutica', accion),
    crearCampo('w4-nuevo-tipo', 'Tipo', tipo),
    crearCampo('w4-nuevo-precio', 'Precio por unidad (S/)', precio),
    botones
  );
  const mensaje = document.createElement('p');
  mensaje.className = 'mensaje';
  mensaje.setAttribute('role', 'status');

  contenedor.append(buscador, botonNuevo, formulario, mensaje, estado, tabla, nota);

  let productos = [];
  let guardando = false;
  let edicion = null;

  function actualizarAcciones() {
    botonNuevo.disabled = Boolean(edicion) || !formulario.hidden;
    caja.disabled = Boolean(edicion);
    for (const boton of cuerpo.querySelectorAll('[data-editar]')) {
      boton.disabled = Boolean(edicion) || !formulario.hidden;
    }
  }

  function abrirEdicion(producto, fila, botonEditar) {
    if (edicion || !formulario.hidden) return;
    mensaje.textContent = '';
    const filaEdicion = document.createElement('tr');
    const espacio = document.createElement('td');
    espacio.colSpan = 5;
    const editor = document.createElement('form');
    editor.className = 'edicion-producto';
    editor.noValidate = true;
    editor.setAttribute('aria-label', `Editar ${producto.nombre}`);
    const titulo = document.createElement('h3');
    titulo.textContent = `Editar ${producto.nombre}`;
    const entradas = {};
    const etiquetas = {
      nombre: 'Nombre', accion_terapeutica: 'Acción terapéutica',
      tipo: 'Tipo', precio: 'Precio por unidad (S/)',
    };
    editor.append(titulo);
    for (const [clave, etiqueta] of Object.entries(etiquetas)) {
      const entrada = document.createElement(clave === 'tipo' ? 'select' : 'input');
      if (clave === 'tipo') {
        for (const [valor, texto] of [['', 'Elija el tipo'], ...Object.entries(ETIQUETAS_TIPO)]) {
          const opcion = document.createElement('option');
          opcion.value = valor;
          opcion.textContent = texto;
          entrada.append(opcion);
        }
      } else {
        entrada.type = 'text';
        if (clave === 'precio') entrada.inputMode = 'decimal';
      }
      entrada.value = clave === 'precio' ? (producto.precio_centimos / 100).toFixed(2) : (producto[clave] ?? '');
      editor.append(crearCampo(`w4-editar-${clave}`, etiqueta, entrada));
      entrada.addEventListener('input', () => limpiarError(entrada));
      entradas[clave] = entrada;
    }
    const guardarEdicion = document.createElement('button');
    guardarEdicion.type = 'submit';
    guardarEdicion.className = 'boton-principal';
    guardarEdicion.textContent = 'Guardar';
    const cancelarEdicion = document.createElement('button');
    cancelarEdicion.type = 'button';
    cancelarEdicion.className = 'boton-secundario';
    cancelarEdicion.textContent = 'Cancelar';
    const acciones = document.createElement('div');
    acciones.className = 'fila-campos';
    acciones.append(guardarEdicion, cancelarEdicion);
    const aviso = document.createElement('p');
    aviso.className = 'mensaje mensaje-error';
    aviso.setAttribute('role', 'alert');
    editor.append(acciones, aviso);
    espacio.append(editor);
    filaEdicion.append(espacio);
    fila.after(filaEdicion);
    edicion = { enviando: false };
    actualizarAcciones();
    entradas.precio.focus();
    entradas.precio.select(); // Escribir reemplaza el precio sin una acción extra.

    cancelarEdicion.addEventListener('click', () => {
      if (edicion.enviando) return;
      filaEdicion.remove();
      edicion = null;
      actualizarAcciones();
      botonEditar.focus();
    });
    editor.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      if (edicion.enviando) return;
      aviso.textContent = '';
      for (const entrada of Object.values(entradas)) limpiarError(entrada);
      const datos = Object.fromEntries(Object.entries(entradas).map(([clave, entrada]) => [clave, entrada.value.trim()]));
      const errores = validarProducto(datos);
      const invalidos = Object.keys(errores);
      if (invalidos.length) {
        for (const clave of invalidos) marcarError(entradas[clave], errores[clave]);
        entradas[invalidos[0]].focus();
        return;
      }
      edicion.enviando = true;
      guardarEdicion.disabled = true;
      cancelarEdicion.disabled = true;
      for (const entrada of Object.values(entradas)) entrada.disabled = true;
      let campoInvalido = null;
      try {
        const actualizado = await api.put(`/productos/${producto.id}`, datos);
        productos = productos.map((p) => p.id === producto.id ? actualizado : p);
        productos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        if (!actualizado.nombre.toLocaleLowerCase('es').includes(caja.value.trim().toLocaleLowerCase('es'))) caja.value = '';
        edicion = null;
        dibujar();
        mensaje.textContent = `Precio actualizado: ${actualizado.nombre}, ${formatearPrecio(actualizado.precio_centimos)}. Rige para las ventas nuevas.`;
        mensaje.className = 'mensaje mensaje-ok';
        cuerpo.querySelector(`[data-editar="${producto.id}"]`)?.focus();
      } catch (error) {
        campoInvalido = entradas[error.campo];
        if (campoInvalido) marcarError(campoInvalido, error.message);
        else aviso.textContent = error.message;
      } finally {
        if (edicion) edicion.enviando = false;
        guardarEdicion.disabled = false;
        cancelarEdicion.disabled = false;
        for (const entrada of Object.values(entradas)) entrada.disabled = false;
        campoInvalido?.focus();
      }
    });
  }

  function cerrarAlta() {
    formulario.reset();
    for (const campo of Object.values(campos)) limpiarError(campo);
    formulario.hidden = true;
    botonNuevo.setAttribute('aria-expanded', 'false');
    botonNuevo.disabled = false;
    actualizarAcciones();
    botonNuevo.focus();
  }

  botonNuevo.addEventListener('click', () => {
    mensaje.textContent = '';
    formulario.hidden = false;
    botonNuevo.setAttribute('aria-expanded', 'true');
    botonNuevo.disabled = true;
    actualizarAcciones();
    nombre.focus();
  });
  cancelar.addEventListener('click', cerrarAlta);
  for (const campo of Object.values(campos)) {
    campo.addEventListener('input', () => limpiarError(campo));
  }

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (guardando) return;
    mensaje.textContent = '';
    mensaje.className = 'mensaje';
    for (const campo of Object.values(campos)) limpiarError(campo);
    const datos = Object.fromEntries(Object.entries(campos).map(([clave, campo]) => [clave, campo.value.trim()]));
    const errores = validarProducto(datos);
    const invalidos = Object.keys(errores);
    if (invalidos.length) {
      for (const clave of invalidos) marcarError(campos[clave], errores[clave]);
      campos[invalidos[0]].focus();
      return;
    }

    guardando = true;
    guardar.disabled = true;
    cancelar.disabled = true;
    for (const campo of Object.values(campos)) campo.disabled = true;
    try {
      const creado = await api.post('/productos', datos);
      productos.push(creado);
      productos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      // El producto nuevo debe ser visible aunque la búsqueda anterior lo ocultara.
      caja.value = '';
      dibujar();
      cerrarAlta();
      mensaje.textContent = `Producto «${creado.nombre}» registrado.`;
      mensaje.classList.add('mensaje-ok');
    } catch (error) {
      const campo = campos[error.campo];
      if (campo) {
        marcarError(campo, error.message);
      } else {
        mensaje.textContent = error.message;
        mensaje.classList.add('mensaje-error');
      }
    } finally {
      guardando = false;
      guardar.disabled = false;
      cancelar.disabled = false;
      for (const campo of Object.values(campos)) campo.disabled = false;
    }
  });

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
      const botonEditar = document.createElement('button');
      botonEditar.type = 'button';
      botonEditar.className = 'boton-secundario';
      botonEditar.textContent = 'Editar';
      botonEditar.dataset.editar = String(p.id);
      botonEditar.setAttribute('aria-label', `Editar ${p.nombre}`);
      botonEditar.addEventListener('click', () => abrirEdicion(p, fila, botonEditar));
      const acciones = document.createElement('td');
      acciones.append(botonEditar);
      fila.append(
        celda('td', p.nombre),
        celda('td', p.accion_terapeutica),
        celda('td', etiquetaTipo(p.tipo)),
        precio,
        acciones
      );
      cuerpo.append(fila);
    }
    actualizarAcciones();
  }

  // El filtro es local: la API ya entrega todos los productos, ordenados por nombre
  caja.addEventListener('input', dibujar);

  async function cargar() {
    try {
      productos = await api.get('/productos');
      dibujar();
      botonNuevo.disabled = false;
    } catch (error) {
      cuerpo.replaceChildren();
      tabla.hidden = true;
      estado.textContent = error.message;
    }
  }

  cargar();
}
