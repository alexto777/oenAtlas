// backend/server.js
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const RUTA_BD = path.resolve(__dirname, './data.db');
const bd = new Database(RUTA_BD, { readonly: false });

const app = express();
app.use(cors());
app.use(express.json());


function columnasDeTabla(nombreTabla) {
  try {
    const filas = bd.prepare(`PRAGMA table_info(${nombreTabla})`).all();
    return filas.map(f => f.name);
  } catch (e) {
    return [];
  }
}

function construirConsultaTareas() {
  const colsTareas = columnasDeTabla('tareas');
  const colsProyectos = columnasDeTabla('proyectos');
  const colsUsuariosProyectos = columnasDeTabla('usuarios_proyectos');

  // Columnas de tareas
  const selectTitulo = colsTareas.includes('titulo')
    ? 't.titulo AS titulo'
    : colsTareas.includes('descripcion')
      ? 't.descripcion AS titulo'
      : 'NULL AS titulo';


  const selectDescripcion = colsTareas.includes('descripcion')
    ? 't.descripcion AS descripcion'
    : colsTareas.includes('titulo')
      ? 't.titulo AS descripcion'
      : 'NULL AS descripcion';

  // horas
  const selectHoras = colsTareas.includes('horas')
    ? 't.horas AS horas'
    : '0 AS horas';

  // valor_fijo
  const selectValorFijo = colsTareas.includes('valor_fijo')
    ? 't.valor_fijo AS valor_fijo'
    : 'NULL AS valor_fijo';

  // creado_en: preferimos creado_en, sino fecha, sino created_at, sino CURRENT_TIMESTAMP
  let selectCreadoEn = 'CURRENT_TIMESTAMP AS creado_en';
  if (colsTareas.includes('creado_en')) selectCreadoEn = 't.creado_en AS creado_en';
  else if (colsTareas.includes('fecha')) selectCreadoEn = 't.fecha AS creado_en';
  else if (colsTareas.includes('created_at')) selectCreadoEn = 't.created_at AS creado_en';

  // proyecto nombre
  const selectProyectoNombre = colsProyectos.includes('nombre')
    ? 'p.nombre AS proyecto_nombre'
    : colsProyectos.includes('name')
      ? 'p.name AS proyecto_nombre'
      : 'NULL AS proyecto_nombre';

  // tarifa en usuarios_proyectos
  const selectTarifa = colsUsuariosProyectos.includes('tarifa')
    ? 'up.tarifa AS tarifa'
    : colsUsuariosProyectos.includes('tarifa_numeric') // por si hay otro nombre raro
      ? 'up.tarifa_numeric AS tarifa'
      : 'NULL AS tarifa';

  // Montamos la consulta dinámica
  const consulta = `
    SELECT
      t.id AS tarea_id,
      ${selectTitulo},
      ${selectDescripcion},
      ${selectHoras},
      ${selectValorFijo},
      p.id AS proyecto_id,
      ${selectProyectoNombre},
      ${selectTarifa},
      ${selectCreadoEn}
    FROM tareas t
    JOIN proyectos p ON p.id = t.proyecto_id
    LEFT JOIN usuarios_proyectos up ON up.proyecto_id = t.proyecto_id AND up.usuario_id = t.usuario_id
    WHERE t.usuario_id = ?
    ORDER BY creado_en DESC, t.id DESC
  `;

  return consulta;
}

// Endpoint principal
app.get('/usuarios/:usuarioId/tareas', (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  if (!usuarioId) return res.status(400).json({ error: 'ID de usuario inválido' });

  try {
    const consulta = construirConsultaTareas();
    const filas = bd.prepare(consulta).all(usuarioId);

    const resultado = filas.map(f => {
      // Normalizacion de la db
      const titulo = f.titulo ?? null;
      const descripcion = f.descripcion ?? null;
      const horas = (f.horas !== undefined && f.horas !== null) ? Number(f.horas) : 0;
      const valorFijo = (f.valor_fijo !== undefined) ? f.valor_fijo : null;
      const tarifa = (f.tarifa !== undefined && f.tarifa !== null) ? Number(f.tarifa) : null;

      let valor = null;
      if (valorFijo !== null) {
        valor = valorFijo;
      } else if (tarifa !== null) {
        valor = tarifa * horas;
      } else {
        valor = null;
      }

      return {
        tareaId: f.tarea_id,
        titulo,
        descripcion,
        proyecto: { id: f.proyecto_id, nombre: f.proyecto_nombre ?? null },
        horas,
        tarifa,
        valorFijo,
        valor
      };
    });

    res.json(resultado);
  } catch (e) {
    console.error('Error en /usuarios/:id/tareas:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Endpoint para listar usuarios
app.get('/usuarios', (req, res) => {
  try {
    const cols = columnasDeTabla('usuarios');
    const selectCorreo = cols.includes('correo') ? ', correo' : '';
    const usuarios = bd.prepare(`SELECT id, nombre${selectCorreo} FROM usuarios`).all();
    res.json(usuarios);
  } catch (e) {
    console.error('Error en /usuarios:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Endpoint para listar proyectos
app.get('/proyectos', (req, res) => {
  try {
    const cols = columnasDeTabla('proyectos');
    const selectDescripcion = cols.includes('descripcion') ? ', descripcion' : '';
    const proyectos = bd.prepare(`SELECT id, nombre${selectDescripcion} FROM proyectos`).all();
    res.json(proyectos);
  } catch (e) {
    console.error('Error en /proyectos:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});
