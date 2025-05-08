// backend/controllers/noteController.js
const db = require('../db');

exports.getNotes = (req, res) => {
    const strategyId = req.query.strategy_id;
    const sql = `
    SELECT id, content, created_at, updated_at
      FROM notes
     WHERE user_id = ? AND strategy_id = ?
     ORDER BY created_at DESC
  `;
    db.query(sql, [req.session.userId, strategyId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Notlar alınamadı' });
        res.json(rows);
    });
};

exports.addNote = (req, res) => {
    const { strategy_id, content } = req.body;
    const sql = `INSERT INTO notes (user_id, strategy_id, content) VALUES (?, ?, ?)`;
    db.query(sql, [req.session.userId, strategy_id, content], (err, result) => {
        if (err) return res.status(500).json({ error: 'Not eklenemedi' });
        res.json({ success: true, noteId: result.insertId });
    });
};

exports.updateNote = (req, res) => {
    const noteId = req.params.id;
    const { content } = req.body;
    const sql = `
    UPDATE notes SET content = ?
     WHERE id = ? AND user_id = ?
  `;
    db.query(sql, [content, noteId, req.session.userId], err => {
        if (err) return res.status(500).json({ error: 'Not güncellenemedi' });
        res.json({ success: true });
    });
};

exports.deleteNote = (req, res) => {
    const noteId = req.params.id;
    const sql = `DELETE FROM notes WHERE id = ? AND user_id = ?`;
    db.query(sql, [noteId, req.session.userId], err => {
        if (err) return res.status(500).json({ error: 'Not silinemedi' });
        res.json({ success: true });
    });
};

exports.getAllNotes = (req, res, next) => {
    const sql = `
      SELECT 
        n.id,
        n.content,
        n.created_at,
        n.updated_at,
        n.strategy_id,
        s.strategy AS strategy_text
      FROM notes n
      JOIN strategies s ON n.strategy_id = s.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
    `;
    db.query(sql, [req.session.userId], (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
};