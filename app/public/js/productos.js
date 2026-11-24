// Funciones compartidas de productos (HU-06.4, #107).
// Las usan W2 (alta rápida) y W4 (alta completa) para no duplicar código.

// Reglas del alta de producto (mismas que POST /api/productos)
export function validarProducto(datos) {
  const errores = {};
  if (!datos.nombre) errores.nombre = 'Ingrese el nombre del producto.';
  if (!datos.accion_terapeutica) errores.accion_terapeutica = 'Ingrese la acción terapéutica.';
  if (!datos.tipo) errores.tipo = 'Elija si el producto es genérico o comercial.';
  if (!datos.precio) {
    errores.precio = 'Ingrese el precio por unidad.';
  } else {
    const n = Number(datos.precio.replace(',', '.'));
    if (!Number.isFinite(n) || n < 0) errores.precio = 'El precio debe ser un número, no negativo.';
    else if (Math.round(n * 100) > 1_000_000) {
      errores.precio = 'El precio no puede superar S/ 10 000 por unidad.';
    }
  }
  return errores;
}

// Campo con label y aviso de error accesible
export function crearCampo(id, etiqueta, entrada) {
  const grupo = document.createElement('div');
  grupo.className = 'campo';

  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = etiqueta;

  const aviso = document.createElement('p');
  aviso.className = 'error-campo';
  aviso.id = id + '-error';

  entrada.id = id;
  entrada.setAttribute('aria-describedby', aviso.id);
  grupo.append(label, entrada, aviso);
  return grupo;
}

export function marcarError(entrada, texto) {
  document.getElementById(entrada.id + '-error').textContent = texto;
  entrada.classList.add('campo-invalido');
  entrada.setAttribute('aria-invalid', 'true');
}

export function limpiarError(entrada) {
  document.getElementById(entrada.id + '-error').textContent = '';
  entrada.classList.remove('campo-invalido');
  entrada.removeAttribute('aria-invalid');
}
