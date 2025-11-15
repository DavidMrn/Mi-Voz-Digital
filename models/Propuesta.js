const mongoose = require('mongoose');

const PropuestaSchema = new mongoose.Schema({
  id: { type: String, index: true },
  titulo: String,
  descripcion: String,
  comuna: String,
  categoria: String,
  tipo: String,
  fecha: { type: Date, default: Date.now },
  fechaActualizacion: Date,
  votos: { type: Number, default: 0 },
  estado: { type: String, default: 'pendiente' },
  archivado: { type: Boolean, default: false },
  autor: String,
  autorUsuario: String,
  imagen: String,
  ubicacion: mongoose.Schema.Types.Mixed
}, { timestamps: false });

PropuestaSchema.method('toClient', function() {
  const obj = this.toObject();
  if (!obj.id) obj.id = obj._id.toString();
  return obj;
});

module.exports = mongoose.model('Propuesta', PropuestaSchema);
