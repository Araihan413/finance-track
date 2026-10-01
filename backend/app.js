import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import transaksiRoutes from './routes/transaksiRoutes.js';
import kategoriRoutes from './routes/kategoriRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes); // POST /api/login
app.use('/api/transaksi', transaksiRoutes); // CRUD /api/transaksi & /api/transaksi/summary
app.use('/api/kategori', kategoriRoutes); // CRUD /api/kategori

app.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});