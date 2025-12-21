const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');
const { uploadProductImage } = require('../middleware/multer.middleware');

router.use('/create', verifyToken, uploadProductImage.single('image'), productController.createProduct);
router.use('/get/:id', verifyToken, productController.getProductById);
router.use('/get', verifyToken, productController.getProducts);
router.use('/update/:id', verifyToken, uploadProductImage.single('image'),productController.updateProduct);
router.use('/delete/:id', verifyToken, productController.deleteProduct);

module.exports = router;
