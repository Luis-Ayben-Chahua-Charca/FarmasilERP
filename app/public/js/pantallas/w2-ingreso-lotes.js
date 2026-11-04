// W2 — Ingreso de lotes (HU-04)
// Formulario para registrar un lote: producto, número, vencimiento y cantidad.

import { api } from '../api.js';

export const titulo = 'Ingreso de lotes';

function crearCampo(id, etiqueta, entrada) {
  const grupo = document.createElement('div');
  grupo.className = 'campo';

  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = etiqueta;

  entrada.id = id;
  grupo.append(label, entrada);
  return grupo;
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
    boton.disabled = true;
    try {
      await api.post('/lotes', {
        producto_id: Number(selector.value),
        numero_lote: numero.value.trim(),
        fecha_vencimiento: vencimiento.value,
        cantidad_recibida: Number(cantidad.value),
      });
      mostrar('Ingreso registrado correctamente.', false);
      numero.value = '';
      vencimiento.value = '';
      cantidad.value = '';
      selector.value = '';
    } catch (error) {
      // Los datos escritos se conservan; el aviso junto a cada campo es de #41.
      mostrar(error.message, true);
    } finally {
      boton.disabled = false;
    }
  });

  cargarProductos();
}