const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');

const categoryController = require('../controllers/categoryController');
router.use('/create', verifyToken, categoryController.createCategory);
router.use('/get/:id', verifyToken, categoryController.getCategoryById);
router.use('/get', verifyToken, categoryController.getCategories);
router.use('/update/:id', verifyToken, categoryController.updateCategory);
router.use('/delete/:id', verifyToken, categoryController.deleteCategory);

module.exports = router;
