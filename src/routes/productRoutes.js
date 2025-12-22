const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');
const { uploadProductImage } = require('../middleware/multer.middleware');

router.post('/create', verifyToken, uploadProductImage.single('image'), productController.createProduct);
router.get('/get/:id', verifyToken, productController.getProductById);
router.get('/get', verifyToken, productController.getProducts);
router.put('/update/:id', verifyToken, uploadProductImage.single('image'),productController.updateProduct);
router.delete('/delete/:id', verifyToken, productController.deleteProduct);

module.exports = router;
