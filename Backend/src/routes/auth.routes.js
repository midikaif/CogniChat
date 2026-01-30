const express = require('express');
const {registerController, loginController, verifyController, logoutController, guestLogin} = require('../controllers/auth.controller');
const {authUser} = require('../middlewares/auth.middleware')


const router = express.Router();

router.post('/signup', registerController);
router.post('/login', loginController);
router.get('/verify', authUser, verifyController);
router.post('/logout', logoutController)
router.post('/guest', guestLogin)



module.exports = router;