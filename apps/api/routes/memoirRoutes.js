const express = require('express');
const { ObjectId } = require('mongoose').Types;
const router = express.Router();

const Memoir = require('../models/Memoir');

const { authMiddleware, authorizeRoles } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const { id, ...memoirData } = req.body;

    const updatedMemoir = await Memoir.findOneAndUpdate(
      { _id: id || new ObjectId() },
      { ...memoirData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(!id?201:200).json({ message: 'Memoir saved', memoir: updatedMemoir });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ message: 'Error saving memoir', error: err });
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
