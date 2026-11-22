'use strict';

// Fechas compartidas por lotes, ventas y reportes (#110).

// AAAA-MM-DD y que la fecha exista (rechaza, por ejemplo, 2027-02-30)
function fechaValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(texto);
}

// AAAA-MM-DD HH:MM:SS en la hora local de la laptop, no en UTC (api-ventas.md)
function fechaLocal(fecha) {
  const dos = (valor) => String(valor).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())} ` +
    `${dos(fecha.getHours())}:${dos(fecha.getMinutes())}:${dos(fecha.getSeconds())}`;
}

module.exports = { fechaValida, fechaLocal };
