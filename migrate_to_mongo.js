/**
 * Script de migración: lee los JSON en /data y los inserta en MongoDB.
 * - Convierte usuarios (hashea contraseñas con bcrypt)
 * - Inserta reportes y propuestas preservando el campo `id` (ej. REP-... / PROP-...)
 * Uso: node migrate_to_mongo.js
 * Asegúrate de tener MONGO_URI en .env y de haber ejecutado `npm install`.
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Reporte = require('./models/Reporte');
const Propuesta = require('./models/Propuesta');

const DATA_DIR = path.join(__dirname, 'data');
const USUARIOS_FILE = path.join(DATA_DIR, 'usuarios.json');
const REPORTES_FILE = path.join(DATA_DIR, 'reportes.json');
const PROPUESTAS_FILE = path.join(DATA_DIR, 'propuestas.json');

async function readJson(file) {
  try {
    const txt = await fs.readFile(file, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (err) {
    return [];
  }
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('Por favor define MONGO_URI en .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "HackClus"
  });
  console.log('Conectado a MongoDB para migración');

  // Usuarios
  const usuarios = await readJson(USUARIOS_FILE);
  console.log(`Usuarios encontrados en JSON: ${usuarios.length}`);

  for (const u of usuarios) {
    const exists = await User.findOne({ usuario: u.usuario }).lean();
    if (exists) {
      console.log(`Usuario existente, saltando: ${u.usuario}`);
      continue;
    }

    // Si la contraseña parece estar ya hasheada (no recomendado), no rehash.
    let passwordHash = u.password;
    const needHash = !/^\$2[aby]\$\d{2}\$/.test(u.password || '');
    if (needHash) {
      passwordHash = await bcrypt.hash(u.password || 'changeme', 10);
    }

    const newUser = new User({
      nombre: u.nombre || u.usuario,
      usuario: u.usuario,
      password: passwordHash,
      fechaRegistro: u.fechaRegistro ? new Date(u.fechaRegistro) : new Date()
    });

    await newUser.save();
    console.log(`Usuario migrado: ${u.usuario}`);
  }

  // Reportes
  const reportes = await readJson(REPORTES_FILE);
  console.log(`Reportes encontrados en JSON: ${reportes.length}`);

  for (const r of reportes) {
    const exists = await Reporte.findOne({ id: r.id }).lean();
    if (exists) { console.log(`Reporte existente, saltando: ${r.id}`); continue; }
    const rep = new Reporte({
      id: r.id,
      titulo: r.titulo || r.title || '',
      descripcion: r.descripcion || r.descripcion || r.description || '',
      comuna: r.comuna || r.comuna || '',
      categoria: r.categoria || '',
      tipo: r.tipo || '',
      fecha: r.fecha ? new Date(r.fecha) : new Date(),
      fechaActualizacion: r.fechaActualizacion ? new Date(r.fechaActualizacion) : undefined,
      votos: r.votos || 0,
      estado: r.estado || 'pendiente',
      autor: r.autor || r.autorUsuario || '',
      autorUsuario: r.autorUsuario || r.autor || '',
      imagen: r.imagen || null,
      ubicacion: r.ubicacion || null
    });
    await rep.save();
    console.log(`Reporte migrado: ${r.id || rep._id}`);
  }

  // Propuestas
  const propuestas = await readJson(PROPUESTAS_FILE);
  console.log(`Propuestas encontradas en JSON: ${propuestas.length}`);

  for (const p of propuestas) {
    const exists = await Propuesta.findOne({ id: p.id }).lean();
    if (exists) { console.log(`Propuesta existente, saltando: ${p.id}`); continue; }
    const pr = new Propuesta({
      id: p.id,
      titulo: p.titulo || '',
      descripcion: p.descripcion || '',
      comuna: p.comuna || '',
      categoria: p.categoria || '',
      tipo: p.tipo || '',
      fecha: p.fecha ? new Date(p.fecha) : new Date(),
      fechaActualizacion: p.fechaActualizacion ? new Date(p.fechaActualizacion) : undefined,
      votos: p.votos || 0,
      estado: p.estado || 'pendiente',
      autor: p.autor || p.autorUsuario || '',
      autorUsuario: p.autorUsuario || p.autor || '',
      imagen: p.imagen || null,
      ubicacion: p.ubicacion || null
    });
    await pr.save();
    console.log(`Propuesta migrada: ${p.id || pr._id}`);
  }

  console.log('Migración completada. Cerrar conexión a MongoDB.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Error en migración:', err);
  process.exit(1);
});
