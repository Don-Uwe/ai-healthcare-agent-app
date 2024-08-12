const nodemailer = require('nodemailer');
require('dotenv').config();
const { verifyToken, verifyUser } = require("../auth/authMiddleware");
const jwt = require('jsonwebtoken');
const UnverifiedUser = require("../models/UnverifiedUserModel");
const User = require("../models/UserModel");


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationEmail = (email, token) => {

    const url = `http://localhost:3025/api/user/verifyEmail?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        html: `<h3>Please verify your email by clicking the link below:</h3><a href="${url}">Verify Email</a>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
        } else {
            console.log('Verification email sent:', info.response);
        }
    });
};

const Sendverifymail= async (req, res) => {
    const { email, token } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email and token are required' });
    }

    const unverifiedUser = await UnverifiedUser.findOne({email: email});

    if(!unverifiedUser){
        return res.status(400).json({ message: 'User not found' });
    }

    if(!token){

        const verificationToken =  jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        sendVerificationEmail(email, verificationToken);
    }
    else{
      
     sendVerificationEmail(email, token);
    }
    
    res.status(200).json({ message: 'Verification email sent' });
}

//verify email functionality
const verifyEmail=async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'Token is missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const unverifiedUser = await UnverifiedUser.findOne({ email: decoded.email});

        if (!unverifiedUser) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Move user from UnverifiedUser to User collection
        const newUser = new User({
            user_name: unverifiedUser.user_name,
            user_handle: unverifiedUser.user_handle,
            email: unverifiedUser.email,
            password: unverifiedUser.password,
            isDoctor: unverifiedUser.isDoctor,
            specialization: unverifiedUser.specialization,
            qualification: unverifiedUser.qualification,
            Years_of_experience: unverifiedUser.Years_of_experience,
            contact_detail: unverifiedUser.contact_detail,
            Profile_image: unverifiedUser.Profile_image,
            isVerified: true
        });

        await newUser.save();
        await UnverifiedUser.deleteOne({ email: unverifiedUser.email });

        // Respond with an HTML page
        res.send(`
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verified</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f8ff;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 40px;
            text-align: center;
            max-width: 500px;
            width: 100%;
        }
        .logo {
            width: 100px;
        }
        h1 {
            color: #007BFF;
            margin-top: 0px;
        }
        p {
            font-size: 16px;
            color: #666;
        }
        .button {
            background-color: #007BFF;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            font-size: 16px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://imgur.com/I5lDXoI.png" alt="Logo" class="logo">
        <h1>Welcome ✅</h1>
        <p>Your account has been verified successfully.</p>
        <button onclick="openApp()">Open Your App</button>
    </div>

    <script>
        function openApp() {
            var appScheme = 'your-app-scheme://';
            var appStoreUrl = 'your-app-store-url';

            var start = new Date().getTime();
            var timeout;

            function checkOpen() {
                var end = new Date().getTime();
                if (end - start < 1500) { // Adjust the timeout duration as needed
                    window.location.href = appStoreUrl;
                }
            }

            window.location = appScheme;
            timeout = setTimeout(checkOpen, 1000);
        }
    </script>
</body>
</html>
        `);
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports = { sendVerificationEmail,verifyEmail,Sendverifymail };