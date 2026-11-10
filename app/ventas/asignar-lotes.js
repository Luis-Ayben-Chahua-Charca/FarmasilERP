'use strict';

/**
 * Reparte una venta por vencimiento ascendente y, en empate, por menor id.
 * No modifica la entrada. Incluye lotes vencidos; solo omite los agotados.
 * Precondición: cantidad es un entero mayor que cero, validado por quien llama.
 * El resultado para una cantidad inválida no está definido.
 * @param {Array<{id: number, numero_lote: string, fecha_vencimiento: string, disponible: number}>} lotes
 * @param {number} cantidad
 * @returns {Array<{lote_id: number, numero_lote: string, cantidad: number}>|null}
 */
function asignarLotes(lotes, cantidad) {
  const ordenados = [...lotes].sort((a, b) => {
    if (a.fecha_vencimiento < b.fecha_vencimiento) return -1;
    if (a.fecha_vencimiento > b.fecha_vencimiento) return 1;
    return a.id - b.id;
  });
  const asignaciones = [];
  let pendiente = cantidad;

  for (const lote of ordenados) {
    if (lote.disponible === 0) continue;
    const asignada = Math.min(lote.disponible, pendiente);
    asignaciones.push({ lote_id: lote.id, numero_lote: lote.numero_lote, cantidad: asignada });
    pendiente -= asignada;
    if (pendiente === 0) return asignaciones;
  }

  return null;
}

module.exports = { asignarLotes };
