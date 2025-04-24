require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const userRoutes = require('./routes/userRoutes');
const memoirRoutes = require('./routes/memoirRoutes');
const commentRoutes = require('./routes/commentRoutes');
const app = express();
let uri = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// debugging vs running in container
if (Boolean(process.env.APP_DEBUG) === true) {
  uri = process.env.MONGO_URI.replace('mongo:', 'localhost:');
}

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api/users', userRoutes);
app.use('/api/memoir', memoirRoutes);
app.use('/api/comments', commentRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
