const express = require('express');
const {registerController, loginController, verifyController, logoutController} = require('../controllers/auth.controller');
const {authUser} = require('../middlewares/auth.middleware')


const router = express.Router();

router.post('/signup', registerController);
router.post('/login', loginController);
router.get('/verify', authUser, verifyController);
router.get('logout', logoutController)



module.exports = router;