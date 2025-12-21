const multer = require('multer');
const path = require('path');
require('dotenv').config();

const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE || 10 * 1024 * 1024; // 10MB
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Configure storage for product images
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(UPLOAD_DIR, 'products'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// Configure storage for bulk upload files
const bulkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(UPLOAD_DIR, 'bulk'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `bulk-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// File filter for CSV/XLSX only
const bulkFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed'), false);
  }
};

// Multer instances
const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: imageFilter
});

const uploadBulkFile = multer({
  storage: bulkStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: bulkFileFilter
});

module.exports = {
  uploadProductImage,
  uploadBulkFile
};
