const Database = require('better-sqlite3');

// Crea la base de datos
const db = new Database('./backend/data.db');

// Limpia tablas si ya existían
db.exec(`
  DROP TABLE IF EXISTS tareas;
  DROP TABLE IF EXISTS usuarios_proyectos;
  DROP TABLE IF EXISTS proyectos;
  DROP TABLE IF EXISTS usuarios;
`);

// Crea tablas
db.exec(`
  CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
  );

  CREATE TABLE proyectos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
  );

  CREATE TABLE usuarios_proyectos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    proyecto_id INTEGER NOT NULL,
    tarifa NUMERIC NOT NULL,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY(proyecto_id) REFERENCES proyectos(id)
  );

  CREATE TABLE tareas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    proyecto_id INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    fecha TEXT NOT NULL,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY(proyecto_id) REFERENCES proyectos(id)
  );
`);

// Inserta usuarios
db.prepare(`INSERT INTO usuarios (nombre) VALUES (?)`).run("Alexander");
db.prepare(`INSERT INTO usuarios (nombre) VALUES (?)`).run("Carolina");

// Inserta proyectos
db.prepare(`INSERT INTO proyectos (nombre) VALUES (?)`).run("Proyecto Contabilidad");
db.prepare(`INSERT INTO proyectos (nombre) VALUES (?)`).run("Proyecto Web");

// Relación usuarios - proyectos con tarifas
db.prepare(`
  INSERT INTO usuarios_proyectos (usuario_id, proyecto_id, tarifa) VALUES (?, ?, ?)
`).run(1, 1, 50000); // Alexander - Proyecto Contabilidad

db.prepare(`
  INSERT INTO usuarios_proyectos (usuario_id, proyecto_id, tarifa) VALUES (?, ?, ?)
`).run(1, 2, 60000); // Alexander - Proyecto Web

db.prepare(`
  INSERT INTO usuarios_proyectos (usuario_id, proyecto_id, tarifa) VALUES (?, ?, ?)
`).run(2, 2, 45000); // Carolina - Proyecto Web

// Inserta tareas
db.prepare(`
  INSERT INTO tareas (usuario_id, proyecto_id, descripcion, fecha)
  VALUES (?, ?, ?, ?)
`).run(1, 1, "Revisión de facturas", "2025-11-20");

db.prepare(`
  INSERT INTO tareas (usuario_id, proyecto_id, descripcion, fecha)
  VALUES (?, ?, ?, ?)
`).run(1, 2, "Construcción de endpoint", "2025-11-21");

db.prepare(`
  INSERT INTO tareas (usuario_id, proyecto_id, descripcion, fecha)
  VALUES (?, ?, ?, ?)
`).run(2, 2, "Corrección de interfaz", "2025-11-22");

db.close();
console.log("Base de datos creada y poblada correctamente.");
