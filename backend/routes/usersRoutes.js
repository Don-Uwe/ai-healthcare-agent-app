const express = require('express');
const router = express.Router();

const {
    register, login, logout,
    sendOTPForForgotPassword, verifyOtpForForgotPassword,
    deleteByUser, deleteByAdmin,getprofile,
    follow,
    unfollow,
    updateReadArticles,
    collectMonthlyRecordsForReading,
    collectMonthlyRecordsForWriting
} = require("../controllers/usersControllers");

const { verifyEmail, sendVerificationEmail, Sendverifymail } = require('../controllers/emailservice');
const authenticateToken = require('../middleware/authentcatetoken');

router.get("/hello", (req, res) => {
    console.log("Hello World Route Executed");
    res.send("Hello World");
});

// Register New User
router.post("/user/register", register);

// Login User Route
router.post("/user/login", login);

// Get profile
router.get('/user/getprofile',getprofile)
// Follow and Unfollow Routes
router.post('/user/follow',authenticateToken, follow);
router.post('/user/unfollow', authenticateToken , unfollow);

// Forget password
router.post("/user/forgotpassword", sendOTPForForgotPassword);

// verify password
router.post("/user/verifypassword", verifyOtpForForgotPassword);

router.post('/user/deleteUser', deleteByUser);
router.post('/admin/deleteUser', deleteByAdmin);

router.get('/user/verifyEmail',verifyEmail );
router.post('/user/verifyEmail',Sendverifymail);

// Update read articles
router.post('/user/update-read-articles', updateReadArticles);

// Collect monthly records for reading
router.get('/user/collect-monthly-records-for-reading', collectMonthlyRecordsForReading);

// Collect monthly records for writing
router.get('/user/collect-monthly-records-for-writing',collectMonthlyRecordsForWriting);



router.post("/user/logout", logout);

module.exports = router;
