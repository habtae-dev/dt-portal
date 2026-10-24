const express = require('express');
const router = express.Router();
const { 
  registerAdmin, 
  loginAdmin, 
  getAdminProfile, 
  updateAdminProfile 
} = require('../controllers/authController');
const { verifyAdmin, verifyToken } = require('../middleware/authMiddleware');

// Public route for login
router.post('/login', loginAdmin);

// Protected routes (Requires Token)
router.get('/profile', verifyToken, getAdminProfile);
router.put('/profile', verifyToken, updateAdminProfile);

// Protected route for registering new admins/editors (Only Admin can create)
router.post('/register', verifyAdmin, registerAdmin);

module.exports = router;