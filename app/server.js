'use strict';

const path = require('node:path');
const express = require('express');

const HOST = '127.0.0.1'; // solo local, nunca en la red (ADR-001)
const PORT = 3000;

const app = express();

// La interfaz son archivos estáticos locales (sin CDN ni recursos externos)
app.use(express.static(path.join(__dirname, 'public')));

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Farmasil disponible en http://localhost:${PORT}`);
  });
}

module.exports = app; // permite probarla con Supertest