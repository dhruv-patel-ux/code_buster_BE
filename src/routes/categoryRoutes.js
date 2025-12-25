const express = require('express');
const router = express.Router();
const {verifyToken, adminRole} = require('../middleware/authMiddleware');

const categoryController = require('../controllers/categoryController');
router.post('/create', verifyToken, categoryController.createCategory);
router.get('/get/:id', verifyToken, categoryController.getCategoryById);
router.get('/get', verifyToken, categoryController.getCategories);
router.put('/update/:id', verifyToken, categoryController.updateCategory);
router.delete('/delete/:id', verifyToken, adminRole, categoryController.deleteCategory);

module.exports = router;
