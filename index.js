require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Configurar CORS ANTES de otras configuraciones
app.use(cors({
    origin: [
        'http://localhost:5500', 
        'http://127.0.0.1:5500', 
        'http://localhost:3000',
        'http://localhost:3001'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Para que pueda recibir JSON

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch((err) => console.error('❌ Error conectando a MongoDB:', err));

// Ruta base
app.get('/', (req, res) => {
  res.send('¡API de películas funcionando!');
});

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});