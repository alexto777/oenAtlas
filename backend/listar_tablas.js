const Database = require('better-sqlite3');
const path = require('path');

const RUTA = path.resolve(__dirname, './data.db');
const bd = new Database(RUTA, { readonly: true });

const filas = bd.prepare("SELECT name, type FROM sqlite_master WHERE type IN ('table','view')").all();
console.log('Archivo BD:', RUTA);
console.log('Tablas / Vistas encontradas:');
filas.forEach(f => console.log('-', f.name));
bd.close();
