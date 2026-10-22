// Módulo común para las llamadas a la API (ADR-001).
// Todas las peticiones van al mismo servidor local (Express en 127.0.0.1),
// por eso se usan rutas relativas: nunca se llama a dominios externos.

const BASE = '/api';

async function solicitar(metodo, ruta, cuerpo) {
  const opciones = {
    method: metodo,
    headers: { 'Accept': 'application/json' },
  };

  if (cuerpo !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(cuerpo);
  }

  const respuesta = await fetch(BASE + ruta, opciones);
  const datos = respuesta.status === 204 ? null : await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const mensaje = (datos && datos.error) || 'No se pudo completar la operación.';
    throw new Error(mensaje);
  }
  return datos;
}

export const api = {
  get: (ruta) => solicitar('GET', ruta),
  post: (ruta, cuerpo) => solicitar('POST', ruta, cuerpo),
  put: (ruta, cuerpo) => solicitar('PUT', ruta, cuerpo),
  delete: (ruta) => solicitar('DELETE', ruta),
};
