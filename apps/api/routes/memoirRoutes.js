const express = require('express');
const router = express.Router();
const Memoir = require('../models/Memoir');

const { authMiddleware, authorizeRoles } = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const memoir = new Memoir({ ...req.body, author: req.user.id });
    await memoir.save();
    res.status(201).json(memoir);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const memoirs = await Memoir.find()
      .populate('author')
      .populate('collaborators');
    res.json(memoirs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get(
  '/admin-data',
  authMiddleware,
  authorizeRoles('admin'),
  (req, res) => {
    res.json({ message: 'Welcome, admin!' });
  },
);
module.exports = router;
