const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');


router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'Faltan campos obligatorios' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ error: 'El email ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Faltan campos obligatorios' });

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

      const isMatch = await bcrypt.compare(password, user.password); // 👈 MUY IMPORTANTE
      if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });
    

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secreto123',
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login exitoso', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(user);
});


// POST /api/users/favorites - Agregar una película favorita
router.post('/favorites', auth, async (req, res) => {
  try {
    const { movie_id, title, poster_path } = req.body;

    if (!movie_id || !title || !poster_path) {
      return res.status(400).json({ error: 'Faltan datos de la película' });
    }

    const user = await User.findById(req.userId);

    // Verificar si ya está agregada
    const exists = user.favorites.some(fav => fav.movie_id === movie_id);
    if (exists) {
      return res.status(409).json({ error: 'La película ya está en favoritos' });
    }

    user.favorites.push({
      movie_id,
      title,
      poster_path,
      added_at: new Date(),
    });

    await user.save();
    res.status(200).json({ message: 'Película agregada a favoritos', favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar la película' });
  }
});


// DELETE /api/users/favorites/:movieId - Eliminar una película favorita
router.delete('/favorites/:movieId', auth, async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId);

    const user = await User.findById(req.userId);
    const originalLength = user.favorites.length;

    user.favorites = user.favorites.filter(fav => fav.movie_id !== movieId);

    if (user.favorites.length === originalLength) {
      return res.status(404).json({ error: 'Película no encontrada en favoritos' });
    }

    await user.save();
    res.json({ message: 'Película eliminada de favoritos', favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la película' });
  }
});


// GET /api/users/favorites - Obtener todas las películas favoritas
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
});

module.exports = router;
