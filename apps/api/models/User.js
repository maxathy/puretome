const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['author', 'agent', 'publisher', 'admin'], default: 'author' },
});

module.exports = mongoose.model('User', UserSchema);