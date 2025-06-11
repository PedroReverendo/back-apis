const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  movie_id: Number,
  title: String,
  poster_path: String,
  added_at: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }, // en producción debe estar hasheada
  fecha_registro: { type: Number, default: () => Math.floor(Date.now() / 1000) },
  ultimo_acceso:  { type: Number, default: () => Math.floor(Date.now() / 1000) },
  favorites: [favoriteSchema],
});

module.exports = mongoose.model('User', userSchema);