const express = require('express');
const router = express.Router();
const {register, refreshToken, login, getProfile, updateBasicProfile, updateSocial, updateProfileExtras, logout} = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const uploadImage = require('../middlewares/uploadImage.middleware');



// User registration
router.post('/register', register);

// User login
router.post('/login', login);

// User logout
router.post('/logout', authMiddleware, logout);

// refresh token
router.post('/refresh-token', refreshToken);

// Get user profile
router.get('/profile', authMiddleware, getProfile);

// Update only name and password (no username/email)
router.put('/profile/basic', authMiddleware, updateBasicProfile);

// Update social links: github and linkedin
router.put('/profile/social', authMiddleware, updateSocial);

// Update profile extras: bio and avatar (avatar uploaded as multipart/form-data field 'avatar')
router.put('/profile/extras', authMiddleware, uploadImage.single('avatar'), updateProfileExtras);



module.exports = router;