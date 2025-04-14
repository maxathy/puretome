const express = require('express');
const router = express.Router();
const Memoir = require('../models/Memoir');

router.post('/', async (req, res) => {
    try {
        const memoir = new Memoir(req.body);
        await memoir.save();
        res.status(201).json(memoir);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const memoirs = await Memoir.find().populate('author').populate('collaborators');
        res.json(memoirs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;