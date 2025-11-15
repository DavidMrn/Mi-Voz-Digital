require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

const conectarDB = require('./db');
const bcrypt = require('bcrypt');

// Models
const User = require('./models/User');
const Reporte = require('./models/Reporte');
const Propuesta = require('./models/Propuesta');

// Helper function para validar ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// ============= RUTAS DE AUTENTICACIÓN CIUDADANOS =============

// Registrar nuevo ciudadano (usa MongoDB)
app.post('/api/auth/registrar', async (req, res) => {
  try {
    const { nombre, usuario, password } = req.body;
    if (!nombre || !usuario || !password) return res.status(400).json({ error: 'Faltan campos requeridos' });
    if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const existing = await User.findOne({ usuario }).lean();
    if (existing) return res.status(409).json({ error: 'El usuario ya está registrado' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ nombre, usuario, password: hashed, fechaRegistro: new Date() });
    await user.save();

    res.status(201).json({ message: 'Usuario registrado exitosamente', usuario: { id: user._id.toString(), nombre: user.nombre, usuario: user.usuario } });
  } catch (error) {
    console.error('Error registrar:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login ciudadano (MongoDB + bcrypt)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;
    if (!usuario || !password) return res.status(400).json({ error: 'Faltan usuario o contraseña' });

    const user = await User.findOne({ usuario });
    if (!user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    res.json({ message: 'Login exitoso', usuario: { id: user._id.toString(), nombre: user.nombre, usuario: user.usuario } });
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// ============= RUTAS DE REPORTES =============

app.get('/api/reportes', async (req, res) => {
  try {
    const reportes = await Reporte.find({}).lean();
    res.json(reportes.map(r => (r.id ? r : { ...r, id: r._id.toString() })));
  } catch (error) {
    console.error('Error obtener reportes:', error);
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
});

app.get('/api/reportes/:id', async (req, res) => {
  try {
    const q = req.params.id;
    // Construir query evitando problemas con ObjectId casting
    const query = { id: q };
    if (isValidObjectId(q)) {
      query.$or = [{ _id: q }];
    }
    const reporte = await Reporte.findOne(query).lean();
    if (reporte) return res.json(reporte);
    res.status(404).json({ error: 'Reporte no encontrado' });
  } catch (error) {
    console.error('Error obtener reporte:', error);
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
});

app.post('/api/reportes', async (req, res) => {
  try {
    const payload = req.body || {};
    const nuevo = new Reporte({
      id: `REP-${Date.now()}`,
      titulo: payload.titulo || payload.title || '',
      descripcion: payload.descripcion || payload.description || '',
      comuna: payload.comuna || '',
      categoria: payload.categoria || '',
      tipo: payload.tipo || '',
      fecha: new Date(),
      votos: 0,
      estado: 'pendiente',
      autor: payload.autor || '',
      autorUsuario: payload.autorUsuario || '' ,
      imagen: payload.imagen || null,
      ubicacion: payload.ubicacion || null
    });
    await nuevo.save();
    res.status(201).json(nuevo.toObject());
  } catch (error) {
    console.error('Error crear reporte:', error);
    res.status(500).json({ error: 'Error al crear reporte' });
  }
});

app.post('/api/reportes/:id/votar', async (req, res) => {
  try {
    const q = req.params.id;
    // Construir query evitando problemas con ObjectId casting
    const query = { id: q };
    if (isValidObjectId(q)) {
      query.$or = [{ _id: q }];
    }
    const reporte = await Reporte.findOne(query);
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
    reporte.votos = (reporte.votos || 0) + 1;
    await reporte.save();
    res.json(reporte.toObject());
  } catch (error) {
    console.error('Error votar reporte:', error);
    res.status(500).json({ error: 'Error al votar' });
  }
});

app.put('/api/reportes/:id/estado', async (req, res) => {
  try {
    const q = req.params.id;
    // Construir query evitando problemas con ObjectId casting
    const query = { id: q };
    if (isValidObjectId(q)) {
      query.$or = [{ _id: q }];
    }
    const reporte = await Reporte.findOne(query);
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
    reporte.estado = req.body.estado || reporte.estado;
    reporte.fechaActualizacion = new Date();
    await reporte.save();
    res.json(reporte.toObject());
  } catch (error) {
    console.error('Error actualizar estado reporte:', error);
    res.status(500).json({ error: 'Error al cambiar estado' });
  }
});

// ============= RUTAS DE PROPUESTAS =============

app.get('/api/propuestas', async (req, res) => {
  try {
    const propuestas = await Propuesta.find({}).lean();
    res.json(propuestas.map(p => (p.id ? p : { ...p, id: p._id.toString() })));
  } catch (error) {
    console.error('Error obtener propuestas:', error);
    res.status(500).json({ error: 'Error al obtener propuestas' });
  }
});

app.get('/api/propuestas/:id', async (req, res) => {
  try {
    const q = req.params.id;
    // Construir query evitando problemas con ObjectId casting
    const query = { id: q };
    if (isValidObjectId(q)) {
      query.$or = [{ _id: q }];
    }
    const propuesta = await Propuesta.findOne(query).lean();
    if (propuesta) return res.json(propuesta);
    res.status(404).json({ error: 'Propuesta no encontrada' });
  } catch (error) {
    console.error('Error obtener propuesta:', error);
    res.status(500).json({ error: 'Error al obtener propuesta' });
  }
});

app.post('/api/propuestas', async (req, res) => {
  try {
    const payload = req.body || {};
    const nueva = new Propuesta({
      id: `PROP-${Date.now()}`,
      titulo: payload.titulo || '',
      descripcion: payload.descripcion || '',
      comuna: payload.comuna || '',
      categoria: payload.categoria || '',
      tipo: payload.tipo || '',
      fecha: new Date(),
      votos: 0,
      estado: 'pendiente',
      autor: payload.autor || '',
      autorUsuario: payload.autorUsuario || '',
      imagen: payload.imagen || null,
      ubicacion: payload.ubicacion || null
    });
    await nueva.save();
    res.status(201).json(nueva.toObject());
  } catch (error) {
    console.error('Error crear propuesta:', error);
    res.status(500).json({ error: 'Error al crear propuesta' });
  }
});

app.post('/api/propuestas/:id/votar', async (req, res) => {
  try {
    const q = req.params.id;
    // Construir query evitando problemas con ObjectId casting
    const query = { id: q };
    if (isValidObjectId(q)) {
      query.$or = [{ _id: q }];
    }
    const propuesta = await Propuesta.findOne(query);
    if (!propuesta) return res.status(404).json({ error: 'Propuesta no encontrada' });
    propuesta.votos = (propuesta.votos || 0) + 1;
    await propuesta.save();
    res.json(propuesta.toObject());
  } catch (error) {
    console.error('Error votar propuesta:', error);
    res.status(500).json({ error: 'Error al votar' });
  }
});

app.put('/api/propuestas/:id/estado', async (req, res) => {
  try {
    const q = req.params.id;
    // Construir query evitando problemas con ObjectId casting
    const query = { id: q };
    if (isValidObjectId(q)) {
      query.$or = [{ _id: q }];
    }
    const propuesta = await Propuesta.findOne(query);
    if (!propuesta) return res.status(404).json({ error: 'Propuesta no encontrada' });
    propuesta.estado = req.body.estado || propuesta.estado;
    propuesta.fechaActualizacion = new Date();
    await propuesta.save();
    res.json(propuesta.toObject());
  } catch (error) {
    console.error('Error actualizar estado propuesta:', error);
    res.status(500).json({ error: 'Error al cambiar estado' });
  }
});

// ============= ESTADÍSTICAS =============

app.get('/api/estadisticas', async (req, res) => {
  try {
    const totalReportes = await Reporte.countDocuments();
    const totalPropuestas = await Propuesta.countDocuments();
    const reportesPendientes = await Reporte.countDocuments({ estado: 'pendiente' });
    const reportesEnProceso = await Reporte.countDocuments({ estado: 'en-proceso' });
    const reportesResueltos = await Reporte.countDocuments({ estado: 'resuelto' });
    const propuestasPendientes = await Propuesta.countDocuments({ estado: 'pendiente' });
    const propuestasEnProceso = await Propuesta.countDocuments({ estado: 'en-proceso' });
    const propuestasResueltas = await Propuesta.countDocuments({ estado: 'resuelto' });
    const votosReportes = (await Reporte.aggregate([{ $group: { _id: null, sum: { $sum: '$votos' } } }]))[0]?.sum || 0;
    const votosPropuestas = (await Propuesta.aggregate([{ $group: { _id: null, sum: { $sum: '$votos' } } }]))[0]?.sum || 0;

    const estadisticas = {
      totalReportes,
      totalPropuestas,
      reportesPendientes,
      reportesEnProceso,
      reportesResueltos,
      propuestasPendientes,
      propuestasEnProceso,
      propuestasResueltas,
      totalVotos: votosReportes + votosPropuestas
    };

    res.json(estadisticas);
  } catch (error) {
    console.error('Error estadisticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Conectar a MongoDB y arrancar servidor
conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('No se pudo conectar a la DB, servidor no arrancado:', err);
});
