const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const path = require('path')

const router = require('./routes/index');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(compression());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
}));

app.use('/api', router);
app.get('/api/health', (req, res) => {
  res.send({ status: 'Server is running' });
});

app.get('/', (req, res) =>{
  res.status(404).send({ message : 'Hello ....' });
})
app.use((req, res) => {
  res.status(404).send({ error: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
