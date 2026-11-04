// W2 — Ingreso de lotes (HU-04, HU-05)
// Formulario para registrar un lote: producto, número, vencimiento y cantidad.
// Los datos inválidos y el lote duplicado se avisan junto al campo afectado.
// Si el producto no existe, «+ Nuevo producto» permite crearlo sin salir de la pantalla.

import { api } from '../api.js';

export const titulo = 'Ingreso de lotes';

const OPCION_NUEVO = '__nuevo__';

function crearCampo(id, etiqueta, entrada) {
  const grupo = document.createElement('div');
  grupo.className = 'campo';

  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = etiqueta;

  // Aviso del campo (#41): vacío hasta que el dato sea inválido
  const aviso = document.createElement('p');
  aviso.className = 'error-campo';
  aviso.id = id + '-error';

  entrada.id = id;
  entrada.setAttribute('aria-describedby', aviso.id);
  grupo.append(label, entrada, aviso);
  return grupo;
}

// Mismas reglas que el servidor (#38), para avisar sin enviar el formulario
function validar(datos) {
  const errores = {};
  if (!datos.producto_id) errores.producto_id = 'Elija un producto.';
  if (!datos.numero_lote) errores.numero_lote = 'Ingrese el número de lote.';
  if (!datos.fecha_vencimiento) errores.fecha_vencimiento = 'Ingrese la fecha de vencimiento.';
  if (!datos.cantidad_recibida) {
    errores.cantidad_recibida = 'Ingrese la cantidad.';
  } else {
    const n = Number(datos.cantidad_recibida);
    if (!Number.isInteger(n) || n <= 0) errores.cantidad_recibida = 'La cantidad debe ser mayor que cero.';
  }
  return errores;
}

// Reglas del alta rápida (mismas que POST /api/productos, #37)
function validarProducto(datos) {
  const errores = {};
  if (!datos.nombre) errores.nombre = 'Ingrese el nombre del producto.';
  if (!datos.accion_terapeutica) errores.accion_terapeutica = 'Ingrese la acción terapéutica.';
  if (!datos.precio) {
    errores.precio = 'Ingrese el precio por unidad.';
  } else {
    const n = Number(datos.precio.replace(',', '.'));
    if (!Number.isFinite(n) || n < 0) errores.precio = 'El precio debe ser un número, no negativo.';
  }
  return errores;
}

export function render(contenedor) {
  const formulario = document.createElement('form');
  formulario.className = 'formulario-lote';
  formulario.noValidate = true;

  // Selector de producto
  const selector = document.createElement('select');
  selector.name = 'producto_id';
  selector.disabled = true;
  const cargando = document.createElement('option');
  cargando.value = '';
  cargando.textContent = 'Cargando productos…';
  selector.append(cargando);

  // Alta rápida de producto (#40): se muestra al elegir «+ Nuevo producto»
  const nuevoNombre = document.createElement('input');
  nuevoNombre.type = 'text';
  nuevoNombre.name = 'nombre';
  nuevoNombre.placeholder = 'Ej.: Ibuprofeno 400 mg';
  nuevoNombre.autocomplete = 'off';

  const nuevoAccion = document.createElement('input');
  nuevoAccion.type = 'text';
  nuevoAccion.name = 'accion_terapeutica';
  nuevoAccion.placeholder = 'Ej.: Analgésico';
  nuevoAccion.autocomplete = 'off';

  const nuevoPrecio = document.createElement('input');
  nuevoPrecio.type = 'text';
  nuevoPrecio.name = 'precio';
  nuevoPrecio.placeholder = '0.00';
  nuevoPrecio.inputMode = 'decimal';
  nuevoPrecio.autocomplete = 'off';

  const alta = document.createElement('div');
  alta.className = 'alta-producto';
  alta.hidden = true;

  const tituloAlta = document.createElement('p');
  tituloAlta.className = 'alta-titulo';
  tituloAlta.textContent = 'Nuevo producto';

  const filaAlta = document.createElement('div');
  filaAlta.className = 'fila-campos';
  filaAlta.append(
    crearCampo('w2-nuevo-accion', 'Acción terapéutica', nuevoAccion),
    crearCampo('w2-nuevo-precio', 'Precio por unidad (S/)', nuevoPrecio)
  );

  const guardarProductoBoton = document.createElement('button');
  guardarProductoBoton.type = 'button';
  guardarProductoBoton.className = 'boton-principal';
  guardarProductoBoton.textContent = 'Guardar producto';

  const cancelarBoton = document.createElement('button');
  cancelarBoton.type = 'button';
  cancelarBoton.className = 'boton-secundario';
  cancelarBoton.textContent = 'Cancelar';

  alta.append(
    tituloAlta,
    crearCampo('w2-nuevo-nombre', 'Nombre', nuevoNombre),
    filaAlta,
    guardarProductoBoton,
    cancelarBoton
  );

  // Campos del lote
  const numero = document.createElement('input');
  numero.type = 'text';
  numero.name = 'numero_lote';
  numero.placeholder = 'Ej.: L-2309';
  numero.autocomplete = 'off';

  const vencimiento = document.createElement('input');
  vencimiento.type = 'date';
  vencimiento.name = 'fecha_vencimiento';

  const cantidad = document.createElement('input');
  cantidad.type = 'number';
  cantidad.name = 'cantidad_recibida';
  cantidad.placeholder = '0';
  cantidad.min = '1';
  cantidad.step = '1';
  cantidad.inputMode = 'numeric';

  const filaLote = document.createElement('div');
  filaLote.className = 'fila-campos';
  filaLote.append(
    crearCampo('w2-lote', 'Número de lote', numero),
    crearCampo('w2-vencimiento', 'Fecha de vencimiento', vencimiento),
    crearCampo('w2-cantidad', 'Cantidad (unidades)', cantidad)
  );

  // Mensaje de resultado (confirmación o error)
  const mensaje = document.createElement('p');
  mensaje.className = 'mensaje';
  mensaje.setAttribute('role', 'status');

  const boton = document.createElement('button');
  boton.type = 'submit';
  boton.className = 'boton-principal';
  boton.textContent = 'Registrar ingreso';

  const nota = document.createElement('p');
  nota.className = 'nota-unidades';
  nota.textContent = 'La cantidad va siempre en unidades: una caja de 30 se registra como 30.';

  formulario.append(
    crearCampo('w2-producto', 'Producto', selector),
    alta,
    filaLote,
    boton,
    mensaje,
    nota
  );
  contenedor.append(formulario);

  function mostrar(texto, esError) {
    mensaje.textContent = texto;
    mensaje.classList.toggle('mensaje-error', esError);
    mensaje.classList.toggle('mensaje-ok', !esError);
  }

  // Campo de la API → elemento del formulario
  const campos = {
    producto_id: selector,
    numero_lote: numero,
    fecha_vencimiento: vencimiento,
    cantidad_recibida: cantidad,
  };

  const camposAlta = {
    nombre: nuevoNombre,
    accion_terapeutica: nuevoAccion,
    precio: nuevoPrecio,
  };

  function marcarError(entrada, texto) {
    document.getElementById(entrada.id + '-error').textContent = texto;
    entrada.classList.add('campo-invalido');
    entrada.setAttribute('aria-invalid', 'true');
  }

  function limpiarError(entrada) {
    document.getElementById(entrada.id + '-error').textContent = '';
    entrada.classList.remove('campo-invalido');
    entrada.removeAttribute('aria-invalid');
  }

  // Al corregir un campo desaparece su aviso
  for (const entrada of [...Object.values(campos), ...Object.values(camposAlta)]) {
    entrada.addEventListener('input', () => limpiarError(entrada));
    entrada.addEventListener('change', () => limpiarError(entrada));
  }

  function cerrarAlta() {
    alta.hidden = true;
    for (const entrada of Object.values(camposAlta)) {
      entrada.value = '';
      limpiarError(entrada);
    }
  }

  async function cargarProductos() {
    try {
      const productos = await api.get('/productos');
      selector.replaceChildren();

      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Elegir producto...';
      selector.append(placeholder);

      for (const p of productos) {
        const opcion = document.createElement('option');
        opcion.value = String(p.id);
        opcion.textContent = p.nombre;
        selector.append(opcion);
      }

      const nuevo = document.createElement('option');
      nuevo.value = OPCION_NUEVO;
      nuevo.textContent = '+ Nuevo producto';
      selector.append(nuevo);

      selector.disabled = false;
    } catch (error) {
      mostrar(error.message, true);
    }
  }

  // Elegir «+ Nuevo producto» despliega el alta; elegir otro producto la cierra
  selector.addEventListener('change', () => {
    if (selector.value === OPCION_NUEVO) {
      alta.hidden = false;
      nuevoNombre.focus();
    } else if (!alta.hidden) {
      cerrarAlta();
    }
  });

  cancelarBoton.addEventListener('click', () => {
    cerrarAlta();
    selector.value = '';
    selector.focus();
  });

  async function guardarProducto() {
    mostrar('', false);
    for (const entrada of Object.values(camposAlta)) limpiarError(entrada);

    const datos = {
      nombre: nuevoNombre.value.trim(),
      accion_terapeutica: nuevoAccion.value.trim(),
      precio: nuevoPrecio.value.trim(),
    };

    const errores = validarProducto(datos);
    const invalidos = Object.keys(errores);
    if (invalidos.length) {
      for (const clave of invalidos) marcarError(camposAlta[clave], errores[clave]);
      camposAlta[invalidos[0]].focus();
      return;
    }

    guardarProductoBoton.disabled = true;
    try {
      const creado = await api.post('/productos', datos);
      await cargarProductos();
      selector.value = String(creado.id); // queda seleccionado (CA2)
      cerrarAlta();
      mostrar(`Producto «${creado.nombre}» guardado y seleccionado.`, false);
      numero.focus();
    } catch (error) {
      const entrada = camposAlta[error.campo];
      if (entrada) {
        marcarError(entrada, error.message);
        entrada.focus();
      } else {
        mostrar(error.message, true);
      }
    } finally {
      guardarProductoBoton.disabled = false;
    }
  }

  guardarProductoBoton.addEventListener('click', guardarProducto);

  // Enter dentro del alta guarda el producto, no registra el lote
  alta.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      guardarProducto();
    }
  });

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mostrar('', false);
    for (const entrada of Object.values(campos)) limpiarError(entrada);

    // Con «+ Nuevo producto» elegido, primero hay que guardar el producto
    if (selector.value === OPCION_NUEVO) {
      marcarError(selector, 'Guarde el producto nuevo o elija otro.');
      selector.focus();
      return;
    }

    // Se envían tal cual: el servidor distingue «falta el dato» de «dato inválido»
    const datos = {
      producto_id: selector.value,
      numero_lote: numero.value.trim(),
      fecha_vencimiento: vencimiento.value,
      cantidad_recibida: cantidad.value,
    };

    // Con datos faltantes o cantidad ≤ 0 no se envía; se marca cada campo
    const errores = validar(datos);
    const invalidos = Object.keys(errores);
    if (invalidos.length) {
      for (const clave of invalidos) marcarError(campos[clave], errores[clave]);
      campos[invalidos[0]].focus();
      return;
    }

    const nombreProducto = selector.selectedOptions[0].textContent;

    boton.disabled = true;
    try {
      await api.post('/lotes', datos);
      mostrar(
        `Ingreso registrado: lote ${datos.numero_lote} de ${nombreProducto}, ${datos.cantidad_recibida} unidades.`,
        false
      );
      numero.value = '';
      vencimiento.value = '';
      cantidad.value = '';
      selector.value = '';
    } catch (error) {
      // 400 o 409 con campo: aviso junto a ese campo. Los datos escritos se conservan.
      const entrada = campos[error.campo];
      if (entrada) {
        marcarError(entrada, error.message);
        entrada.focus();
      } else {
        mostrar(error.message, true);
      }
    } finally {
      boton.disabled = false;
    }
  });

  cargarProductos();
}