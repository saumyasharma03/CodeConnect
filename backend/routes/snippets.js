const express = require('express');
const router = express.Router();
const Snippet = require('../models/Snippet');

// Create or update (if id provided)
router.post('/', async (req, res) => {
  try {
    const { id, title, language, code } = req.body;
    if (id) {
      const snippet = await Snippet.findByIdAndUpdate(id, { title, language, code, updatedAt: Date.now() }, { new: true });
      return res.json(snippet);
    }
    const newSnippet = new Snippet({ title, language, code });
    await newSnippet.save();
    res.json(newSnippet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a list
router.get('/', async (req, res) => {
  const list = await Snippet.find().sort({ updatedAt: -1 }).limit(100);
  res.json(list);
});

// Get by id
router.get('/:id', async (req, res) => {
  const snippet = await Snippet.findById(req.params.id);
  if (!snippet) return res.status(404).json({ error: 'Not found' });
  res.json(snippet);
});

// Delete
router.delete('/:id', async (req, res) => {
  await Snippet.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
