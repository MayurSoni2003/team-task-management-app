const express = require('express');
const { signup, login } = require('../controllers/authController');
const validate = require('../middlewares/validate.middleware');
const { signupSchema, loginSchema } = require('../utils/validators');

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

module.exports = router;
