const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  usuario: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fechaRegistro: { type: Date, default: Date.now }
}, { timestamps: false });

// expose id as string for compatibility with front-end
UserSchema.method('toClient', function() {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.password; // never send password
  return obj;
});

module.exports = mongoose.model('User', UserSchema);
