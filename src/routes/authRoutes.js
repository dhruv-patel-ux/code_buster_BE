const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
router.use('/login', authController.login);
router.use('/register', authController.register);
router.use('/changePassword', authMiddleware.verifyToken, authController.changePassword);

module.exports = router;
