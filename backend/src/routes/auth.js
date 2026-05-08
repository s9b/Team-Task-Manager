const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, logout, me } = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.post('/logout', logout);
router.get('/me', authenticate, me);

module.exports = router;
