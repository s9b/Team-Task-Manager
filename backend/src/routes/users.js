const router = require('express').Router();
const authenticate = require('../middleware/authenticate');
const { listUsers } = require('../controllers/userController');

router.get('/', authenticate, listUsers);

module.exports = router;
