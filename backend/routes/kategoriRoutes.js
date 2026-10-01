import express from 'express'
import pool from '../config/db.js'

const router = express.Router();

// ambil semua kategori (GET)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kategori ORDER BY id DESC');
    res.json({
      success: true,
      message: 'Data kategori berhasil diambil',
      total: rows.length,
      data: rows
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kategori',
      error: error.message
    })
  }
})

// tambah kategory baru
router.post('/', async (req, res) => {
  const { nama, tipe } = req.body;
  
  try {
    // validasi input
    if (!nama || !tipe) {
      return res.status(400).json({
        success: false,
        message: 'Nama dan tipe kategori wajib diisi'
      })
    }
    
    const [rows] = await pool.query('INSERT INTO kategori (nama, tipe) VALUES (?, ?)', [nama, tipe])
    res.status(201).json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      data: {
        id: rows.insertId,
        nama,
        tipe,
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan kategori',
      error: error.message
    })
    
  }
})

// edit kategori (PUT)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nama, tipe } = req.body;
  
  try {
    // cek apakah kategori ada
    const [rows] = await pool.query('SELECT * FROM kategori WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }

    await pool.query('UPDATE kategori SET nama = ?, tipe = ? WHERE id = ?', [nama ?? rows[0].nama, tipe ?? rows[0].tipe, id]);

    res.json({
      success: true,
      message: 'Kategori berhasil diupdate',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate kategori',
      error: error.message
    });
  }
});

// hapus data kategory
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM kategori WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }

    await pool.query('DELETE FROM kategori WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Kategori berhasil dihapus',
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus kategori',
      error: error.message
    })
  }
})

export default router