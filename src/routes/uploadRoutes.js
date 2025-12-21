const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');
const uploadController = require('../controllers/uploadController');
const { uploadBulkFile } = require('../middleware/multer.middleware');

router.use('/bulkUpload', verifyToken, uploadBulkFile.single('file'),uploadController.bulkUpload);
router.use('/exportProducts', verifyToken, uploadController.exportProducts);

module.exports = router;
