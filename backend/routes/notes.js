// backend/routes/notes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  getNotes,
  addNote,
  updateNote,
  deleteNote,
  getAllNotes   
} = require('../controllers/noteController');

router.get('/', auth, getNotes);
router.post('/', auth, addNote);
router.put('/:id', auth, updateNote);
router.delete('/:id', auth, deleteNote);
router.get('/all',    auth, getAllNotes);  
module.exports = router;
