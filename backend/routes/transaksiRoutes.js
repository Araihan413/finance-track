import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Ambil semua transaksi dengan JOIN kategori, filter & pagination (GET /api/transaksi)
router.get('/', async (req, res) => {
  const { tipe, search, kategori } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    let whereClause = ' WHERE 1=1';
    const filterParams = [];

    // Filter tipe ('masuk' / 'keluar')
    if (tipe && tipe !== 'all') {
      whereClause += ' AND LOWER(t.tipe) = ?';
      filterParams.push(tipe.toLowerCase());
    }

    // Filter kategori
    if (kategori && kategori !== 'all') {
      whereClause += ' AND (k.nama = ? OR t.kategori_id = ?)';
      filterParams.push(kategori, kategori);
    }

    // Filter search keterangan
    if (search) {
      whereClause += ' AND (t.keterangan LIKE ? OR k.nama LIKE ?)';
      filterParams.push(`%${search}%`, `%${search}%`);
    }

    // 1. Hitung total data
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM transaksi t 
      LEFT JOIN kategori k ON t.kategori_id = k.id 
      ${whereClause}
    `;
    const [countRows] = await pool.query(countQuery, filterParams);
    const total = countRows[0].total;

    // 2. Ambil data transaksi dengan nama kategori
    const dataQuery = `
      SELECT 
        t.id,
        t.user_id,
        t.kategori_id,
        COALESCE(k.nama, 'Lainnya') AS kategori,
        t.tanggal,
        t.tipe,
        t.jumlah,
        t.keterangan,
        t.created_at
      FROM transaksi t
      LEFT JOIN kategori k ON t.kategori_id = k.id
      ${whereClause} 
      ORDER BY t.tanggal DESC, t.id DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataQuery, [...filterParams, limit, offset]);

    res.json({
      success: true,
      message: 'Data transaksi berhasil diambil',
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data transaksi',
      error: error.message,
    });
  }
});

// Ringkasan Dashboard: Total Masuk, Keluar, dan Sisa Saldo (GET /api/transaksi/summary)
router.get('/summary', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN LOWER(tipe) = 'masuk' THEN jumlah ELSE 0 END), 0) AS total_masuk,
        COALESCE(SUM(CASE WHEN LOWER(tipe) = 'keluar' THEN jumlah ELSE 0 END), 0) AS total_keluar
      FROM transaksi
    `);

    const totalMasuk = Number(rows[0].total_masuk);
    const totalKeluar = Number(rows[0].total_keluar);
    const sisaSaldo = totalMasuk - totalKeluar;

    res.json({
      success: true,
      message: 'Ringkasan berhasil diambil',
      data: {
        totalMasuk,
        totalKeluar,
        sisaSaldo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil ringkasan transaksi',
      error: error.message,
    });
  }
});

// Tambah Transaksi Baru (POST /api/transaksi)
router.post('/', async (req, res) => {
  const { user_id, kategori_id, kategori, tanggal, tipe, keterangan, jumlah } = req.body;

  // Validasi input dasar
  if (!tanggal || (!kategori_id && !kategori) || !tipe || jumlah === undefined || jumlah === null) {
    return res.status(400).json({
      success: false,
      message: 'Tanggal, kategori, tipe, dan jumlah wajib diisi!',
    });
  }

  try {
    // Tentukan user_id (fallback ke user pertama id: 1 jika belum dikirim)
    const finalUserId = user_id ? Number(user_id) : 1;

    // Tentukan kategori_id
    let finalKategoriId = kategori_id ? Number(kategori_id) : null;
    if (!finalKategoriId && kategori) {
      const [katRows] = await pool.query('SELECT id FROM kategori WHERE nama = ? OR id = ? LIMIT 1', [kategori, kategori]);
      if (katRows.length > 0) {
        finalKategoriId = katRows[0].id;
      } else {
        // Jika nama kategori belum ada, ambil kategori default pertama
        const [defaultKat] = await pool.query('SELECT id FROM kategori LIMIT 1');
        finalKategoriId = defaultKat.length > 0 ? defaultKat[0].id : 1;
      }
    }

    // Tipe harus lowercase sesuai CHECK constraint: 'masuk' atau 'keluar'
    const finalTipe = String(tipe).toLowerCase() === 'masuk' ? 'masuk' : 'keluar';

    // Jumlah harus positif (> 0)
    const finalJumlah = Math.abs(Number(jumlah));
    if (finalJumlah <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah transaksi harus lebih besar dari 0!',
      });
    }

    // Format tanggal (YYYY-MM-DD)
    const finalTanggal = String(tanggal).split('T')[0];

    const [result] = await pool.query(
      'INSERT INTO transaksi (user_id, kategori_id, tanggal, tipe, jumlah, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
      [finalUserId, finalKategoriId, finalTanggal, finalTipe, finalJumlah, keterangan || '']
    );

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil ditambahkan',
      data: {
        id: result.insertId,
        user_id: finalUserId,
        kategori_id: finalKategoriId,
        tanggal: finalTanggal,
        tipe: finalTipe,
        jumlah: finalJumlah,
        keterangan: keterangan || '',
      },
    });
  } catch (error) {
    console.error('Error insert transaksi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan transaksi',
      error: error.message,
    });
  }
});

// Edit Transaksi (PUT /api/transaksi/:id)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { kategori_id, kategori, tanggal, tipe, keterangan, jumlah } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM transaksi WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan',
      });
    }

    const current = existing[0];

    // Tentukan kategori_id
    let finalKategoriId = kategori_id ? Number(kategori_id) : current.kategori_id;
    if (kategori && !kategori_id) {
      const [katRows] = await pool.query('SELECT id FROM kategori WHERE nama = ? OR id = ? LIMIT 1', [kategori, kategori]);
      if (katRows.length > 0) {
        finalKategoriId = katRows[0].id;
      }
    }

    const finalTipe = tipe ? (String(tipe).toLowerCase() === 'masuk' ? 'masuk' : 'keluar') : current.tipe;
    const finalJumlah = jumlah !== undefined ? Math.abs(Number(jumlah)) : current.jumlah;
    const finalTanggal = tanggal ? String(tanggal).split('T')[0] : current.tanggal;

    await pool.query(
      'UPDATE transaksi SET kategori_id = ?, tanggal = ?, tipe = ?, jumlah = ?, keterangan = ? WHERE id = ?',
      [
        finalKategoriId,
        finalTanggal,
        finalTipe,
        finalJumlah,
        keterangan !== undefined ? keterangan : current.keterangan,
        id,
      ]
    );

    res.json({
      success: true,
      message: 'Transaksi berhasil diperbarui',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui transaksi',
      error: error.message,
    });
  }
});

// 5. Hapus Transaksi (DELETE /api/transaksi/:id)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.query('SELECT * FROM transaksi WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan',
      });
    }

    await pool.query('DELETE FROM transaksi WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Transaksi berhasil dihapus',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus transaksi',
      error: error.message,
    });
  }
});

export default router;
