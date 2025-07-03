// models/user.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const favoriteSchema = new Schema({
  movieId: Number,
  title: String,
  posterPath: String,
  addedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fechaRegistro: { type: Date, default: Date.now },
  ultimoAcceso:  { type: Date, default: Date.now },
  favorites: [favoriteSchema],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
