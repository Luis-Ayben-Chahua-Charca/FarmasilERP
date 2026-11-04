// W2 — Ingreso de lotes (HU-04, HU-05)
// Formulario para registrar un lote: producto, número, vencimiento y cantidad.
// Los datos inválidos y el lote duplicado se avisan junto al campo afectado.

import { api } from '../api.js';

export const titulo = 'Ingreso de lotes';

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

  // Campos del lote
  const numero = document.createElement('input');
  numero.type = 'text';
  numero.name = 'numero_lote';
  numero.autocomplete = 'off';

  const vencimiento = document.createElement('input');
  vencimiento.type = 'date';
  vencimiento.name = 'fecha_vencimiento';

  const cantidad = document.createElement('input');
  cantidad.type = 'number';
  cantidad.name = 'cantidad_recibida';
  cantidad.min = '1';
  cantidad.step = '1';
  cantidad.inputMode = 'numeric';

  // Mensaje de resultado (confirmación o error)
  const mensaje = document.createElement('p');
  mensaje.className = 'mensaje';
  mensaje.setAttribute('role', 'status');

  const boton = document.createElement('button');
  boton.type = 'submit';
  boton.className = 'boton-principal';
  boton.textContent = 'Registrar ingreso';

  formulario.append(
    crearCampo('w2-producto', 'Producto', selector),
    crearCampo('w2-lote', 'Número de lote', numero),
    crearCampo('w2-vencimiento', 'Fecha de vencimiento', vencimiento),
    crearCampo('w2-cantidad', 'Cantidad (unidades)', cantidad),
    boton,
    mensaje
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
  for (const entrada of Object.values(campos)) {
    entrada.addEventListener('input', () => limpiarError(entrada));
    entrada.addEventListener('change', () => limpiarError(entrada));
  }

  async function cargarProductos() {
    try {
      const productos = await api.get('/productos');
      selector.replaceChildren();

      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Seleccione un producto';
      selector.append(placeholder);

      for (const p of productos) {
        const opcion = document.createElement('option');
        opcion.value = String(p.id);
        opcion.textContent = p.nombre;
        selector.append(opcion);
      }
      selector.disabled = false;
    } catch (error) {
      mostrar(error.message, true);
    }
  }

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mostrar('', false);
    for (const entrada of Object.values(campos)) limpiarError(entrada);

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

    boton.disabled = true;
    try {
      await api.post('/lotes', datos);
      mostrar('Ingreso registrado correctamente.', false);
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