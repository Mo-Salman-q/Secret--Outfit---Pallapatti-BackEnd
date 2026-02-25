const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getUserProfile } = require('../controllers/authController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', authMiddleware, getUserProfile);
router.get('/check', optionalAuth, (req, res) => {
  res.json({
    authenticated: !!req.user,
    user: req.user || null,
  });
});

module.exports = router;
