const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const uploadRoutes = require('./uploadRoutes');

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;
