 const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const auth = require('../middleware/auth');

// GET /api/comments/mine - Ver mis comentarios
router.get('/mine', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ user: req.userId });
    // No populamos 'movie' porque no hay modelo Movie
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tus comentarios' });
  }
});

// GET /api/comments/:movieId - Obtener comentarios públicos de una película
router.get('/:movieId', async (req, res) => {
  try {
    const comments = await Comment.find({ movie: req.params.movieId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

// POST /api/comments/:movieId - Agregar comentario público (requiere auth)
router.post('/:movieId', auth, async (req, res) => {
  try {
    const { content, movieTitle } = req.body;

    if (!content || !movieTitle) {
      return res.status(400).json({ error: 'Faltan campos: contenido o título' });
    }

    const comment = new Comment({
      user: req.userId,
      movie: req.params.movieId,
      movieTitle,
      content,
      createdAt: new Date()
    });

    await comment.save();
    const populated = await comment.populate('user', 'username');
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar comentario' });
  }
});

module.exports = router;
