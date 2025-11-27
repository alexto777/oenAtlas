🚀 Project Manager – Gestión de Usuarios, Proyectos, Tarifas y Tareas

Este proyecto implementa un sistema completo para administrar:

Usuarios

Proyectos

Relación Usuario–Proyecto

Tarifas configuradas por proyecto

Tareas registradas por cada usuario

Incluye base de datos SQLite, servidor Node.js con Express y una interfaz HTML simple para visualizar la información.

📌 Características Principales
👤 Usuarios

Registro y administración básica.

Un usuario puede pertenecer a múltiples proyectos.

📂 Proyectos

Creación y asignación a usuarios.

💵 Tarifas (usuario–proyecto)

Cada usuario puede tener una tarifa diferente según el proyecto.

Gestionado mediante la tabla usuarios_proyectos.

📝 Tareas

Tareas asociadas a usuario y proyecto.

Incluyen título, descripción, horas, valor fijo y fecha.

La API calcula el valor según horas × tarifa.

🗃 Modelo de Base de Datos (SQLite)

Tablas incluidas:

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
  titulo TEXT,
  descripcion TEXT NOT NULL,
  horas NUMERIC,
  valor_fijo NUMERIC,
  fecha TEXT NOT NULL,
  creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY(proyecto_id) REFERENCES proyectos(id)
);

🧩 Endpoints Principales (API)
Obtener tareas por usuario
GET /tareas/:usuarioId


Ejemplo de respuesta:

[
  {
    "tareaId": 1,
    "titulo": "Revisión de facturas",
    "descripcion": "Revisión de facturas",
    "proyecto": {
      "id": 1,
      "nombre": "Proyecto Contabilidad"
    },
    "horas": 0,
    "tarifa": 50000,
    "valorFijo": null,
    "valor": 0
  }
]

🛠 Tecnologías Utilizadas

Node.js

Express

SQLite (better-sqlite3)

HTML/CSS/JS Puros

Git & GitHub

📥 Instalación
git clone https://github.com/<TU-USUARIO>/<TU-REPO>.git
cd <TU-REPO>
npm install


Crear la base de datos ejecutando:

node seed.js

▶ Ejecutar el servidor
node server.js


La app quedará disponible en:

http://localhost:3000
