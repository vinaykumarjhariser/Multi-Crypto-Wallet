const router = require('express').Router();
const authanticationToken = require('../middleware/auth');
const controller = require('../controller/controller');



//SIGNUP
router.post('/signup', controller.signup);

//SEND OTP
router.post('/sendOtp/:id', controller.sendOtp);

//VERIFY OTP
router.post('/verifyOtp/:id',controller.verifyOtp);

//LOGIN
router.post('/login',controller.login);

//ACTIVATE ACCOUNT
router.post('/activateAccount/:id', controller.activateAccount)

//ETH BALANCE
router.get('/ethBalance/:id',authanticationToken, controller.ethBalance)
//BNB BALANCE
router.get('/bnbBalance/:id',authanticationToken, controller.bnbBalance)
//ETH Trasaction
router.post('/ethTrasaction/:id', controller.ethTrasaction)

// BSC TRANSACTION
router.post('/bscTrasaction/:id',controller.bscTrasaction)

//ADDRESS SHOW 
router.get('/showAddress/:id',controller.showAddress)
//USER PROFILE 
router.get('/userProfile/:id',controller.userProfile)

//ETH HISTORY
router.get('/ethHistory/:id',controller.ethHistory)

//BSCHISTORY
router.get('/bscHistory/:id',controller.bscHistory)
//Dashboard
router.get('/dashboard/:id',controller.dashboard)


module.exports = router;

