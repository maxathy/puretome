const express = require('express');
const router = express.Router();
const Memoir = require('../models/Memoir');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const memoir = new Memoir({ ...req.body, author: req.user.id });
    await memoir.save();
    res.status(201).json(memoir);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const memoirs = await Memoir.find()
      .populate('author')
      .populate('collaborators');
    res.json(memoirs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
