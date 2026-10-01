import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // 1. Validasi username dan password tidak boleh kosong
  if (!username || !password) {
    return res.json({
      success: false,
      message: 'Username dan password tidak boleh kosong!',
    });
  }

  try {
    // 2. Cek ke database user
    const [rows] = await pool.query(
      'SELECT id, username, nama FROM user WHERE username = ? AND password = ?',
      [username, password]
    );

    // 3. Jika salah atau user tidak cocok
    if (rows.length === 0) {
      return res.json({
        success: false,
        message: 'Username atau password salah!',
      });
    }

    // 4. Jika benar kirim data user
    const user = rows[0];
    return res.json({
      success: true,
      message: 'Login berhasil!',
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message,
    });
  }
});

export default router;
