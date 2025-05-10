// backend/controllers/noteController.js
const pool = require('../db');

exports.getNotes = async (req, res) => {
  const strategyId = req.query.strategy_id;
  try {
    const [rows] = await pool.query(
      `SELECT id, content, created_at, updated_at
       FROM notes
       WHERE user_id = ? AND strategy_id = ?
       ORDER BY created_at DESC`,
      [req.session.userId, strategyId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Notlar alınamadı:', err);
    res.status(500).json({ error: 'Notlar alınamadı' });
  }
};

exports.addNote = async (req, res) => {
  const { strategy_id, content } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO notes (user_id, strategy_id, content) VALUES (?, ?, ?)`,
      [req.session.userId, strategy_id, content]
    );
    res.json({ success: true, noteId: result.insertId });
  } catch (err) {
    console.error('Not eklenemedi:', err);
    res.status(500).json({ error: 'Not eklenemedi' });
  }
};

exports.updateNote = async (req, res) => {
  const noteId = req.params.id;
  const { content } = req.body;
  try {
    await pool.query(
      `UPDATE notes SET content = ? WHERE id = ? AND user_id = ?`,
      [content, noteId, req.session.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Not güncellenemedi:', err);
    res.status(500).json({ error: 'Not güncellenemedi' });
  }
};

exports.deleteNote = async (req, res) => {
  const noteId = req.params.id;
  try {
    await pool.query(
      `DELETE FROM notes WHERE id = ? AND user_id = ?`,
      [noteId, req.session.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Not silinemedi:', err);
    res.status(500).json({ error: 'Not silinemedi' });
  }
};

exports.getAllNotes = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        n.id,
        n.content,
        n.created_at,
        n.updated_at,
        n.strategy_id,
        s.strategy AS strategy_text
       FROM notes n
       JOIN strategies s ON n.strategy_id = s.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC`,
      [req.session.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Tüm notlar alınamadı:', err);
    next(err);
  }
};
