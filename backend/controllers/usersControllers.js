const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const UnverifiedUser = require('../models/UnverifiedUserModel');
const {verifyUser} = require('../auth/authMiddleware');
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const moment = require("moment");
const Article = require("../models/Articles");
const adminModel = require('../models/adminModel');
require('dotenv').config();
const { sendVerificationEmail } = require('./emailservice');

module.exports.register = async (req, res) => {
  try {
    const { user_name, user_handle, email, isDoctor, Profile_image, password, qualification, specialization, Years_of_experience, contact_detail } = req.body;

    // Check for required fields
    if (!user_name || !user_handle || !email || !password) {
      return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Check if user already exists in User or UnverifiedUser collections
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    existingUser = await UnverifiedUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Please verify your email. Verification email already sent.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a verification token
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("Verification token : ",verificationToken);

    // Create new unverified user
    const newUnverifiedUser = new UnverifiedUser({
      user_name,
      user_handle,
      email,
      password: hashedPassword,
      isDoctor,
      contact_detail,
      Profile_image,
      verificationToken,
    });

    // Include doctor-specific fields if the user is a doctor
    if (isDoctor) {
      newUnverifiedUser.qualification = qualification;
      newUnverifiedUser.specialization = specialization;
      newUnverifiedUser.Years_of_experience = Years_of_experience;
    }

    // Save the unverified user to the database
    await newUnverifiedUser.save();

    // Send verification email
    // sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'Registration successful. Please verify your email.',token: verificationToken });
  } catch (error) {
    console.error('Error during registration:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ errors: validationErrors });
    }

    // Handle duplicate email/user handle error
    if (error.code === 11000) {
      return res.status(409).json({ error: "Email or user handle already exists" });
    }

    // Handle general server errors
    res.status(500).json({ error: "Internal server error" });
  }
};


  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  module.exports.getprofile = async (req, res) => {
    let token;
    if (req.cookies && req.cookies['token']) {
      token = req.cookies['token'];
    } else {
      token = req.headers.authorization?.split(' ')[1];
    }
  
    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }
    try {
      const email = await verifyUser(token);
      const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email not verified. Please check your email.' });
    }
      res.json({status:true,profile:user});

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
    
  };

module.exports.sendOTPForForgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(400).json({ message: 'User with this email does not exist.' });
    }
  
    const otp = generateOTP();
    const otpExpires = Date.now() + 3600000; // 1 hour
  
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
  
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: `Error sending email.`, error:`${error}` });
      }
      res.status(200).json({ message: 'OTP sent to your email.', otp: otp});
    });
  };
  
module.exports.verifyOtpForForgotPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
  
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    const isPasswordSame = await bcrypt.compare(newPassword, user.password);
    if(isPasswordSame){
      return res.status(400).json({ message: 'New password should not be same as old password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
  
    res.status(200).json({ message: 'Password reset successful.' });
  };



module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    let user = await User.findOne({ email });
  

    if (!user) {

      user = UnverifiedUser.findOne({email});
      if(!user)
        return res.status(404).json({ error: 'User not found' });
      else
      return res.status(403).json({ error: 'Email not verified. Please check your email.' });
     
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email not verified. Please check your email.' });
    }
   

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, { httpOnly: true, maxAge: 86400000 });
    res.status(200).json({ user, token, message: "Login Successful" });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message }); // Validation errors
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports.logout = (req, res) => {
    
    // Clear the JWT token cookie
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
  };

  module.exports.deleteByUser = async(req,res)=>{
    let token;
    if (req.cookies && req.cookies['token']) {
      token = req.cookies['token'];
    } else {
      token = req.headers.authorization?.split(' ')[1];
    }
  
    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }
    try {
      const {password} = req.body;
      const email = await verifyUser(token);
      const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email not verified. Please check your email.' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
      console.log("email : ",email+" password  : ",password);
      await User.deleteOne({email});
      res.json({status:true,message:"account has been removed from database"});

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }


  module.exports.deleteByAdmin = async(req,res)=>{
    try {
      const {adminEmail,adminPassword,userEmail}  =req.body;
      const admin = await adminModel.findOne({adminEmail});
      if(!admin) res.status(404).json({message:"user not found"});
      else {
      console.log(admin);
      const validAdimin  = await bcrypt.compare(adminPassword,admin.adminPassword);
      if(!validAdimin) res.status(404).json({message:"password not match"});
      else {
        const result = await User.deleteOne({email:userEmail});
        res.json({messge:"user delerted sucessfully",result});
    }
    }
    } catch (error) {
      res.json({messge:error.message});
    }
  }
// follow a user

module.exports.follow = async (req, res) => {
  try {
      const { userId, followUserId } = req.body;

      // Check if user is trying to follow themselves
      if (userId === followUserId) {
          return res.status(400).json({ message: "You cannot follow yourself" });
      }

      // Find the user who is following
      const user = await User.findOne({ user_id: userId });
      if (!user) return res.status(404).json({ message: "User not found" });

      // Find the user to be followed
      const followUser = await User.findOne({ user_id: followUserId });
      if (!followUser) return res.status(404).json({ message: "User to follow not found" });

      // Check if the user already follows the followUser
      if (user.followings.includes(followUserId)) {
          return res.status(400).json({ message: "You already follow this user" });
      }

      // Add followUserId to user's followings and userId to followUser's followers
      user.followings.push(followUserId);
      user.followingCount += 1;
      await user.save();

      followUser.followers.push(userId);
      followUser.followerCount += 1;
      await followUser.save();

      res.json({ message: "Followed successfully" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


// Unfollow a user
module.exports.unfollow = async (req, res) => {
  try {
      const { userId, unfollowUserId } = req.body;

      // Check if user is trying to unfollow themselves
      if (userId === unfollowUserId) {
          return res.status(400).json({ message: "You cannot unfollow yourself" });
      }

      // Find the user who is unfollowing
      const user = await User.findOne({ user_id: userId });
      if (!user) return res.status(404).json({ message: "User not found" });

      // Find the user to be unfollowed
      const unfollowUser = await User.findOne({ user_id: unfollowUserId });
      if (!unfollowUser) return res.status(404).json({ message: "User to unfollow not found" });

      // Check if the user already does not follow the unfollowUser
      if (!user.followings.includes(unfollowUserId)) {
          return res.status(400).json({ message: "You do not follow this user" });
      }

      // Remove unfollowUserId from user's followings and userId from unfollowUser's followers
      user.followings = user.followings.filter(id => id.toString() !== unfollowUserId);
      user.followingCount = Math.max(0, user.followingCount - 1);
      await user.save();

      unfollowUser.followers = unfollowUser.followers.filter(id => id.toString() !== userId);
      unfollowUser.followerCount = Math.max(0, unfollowUser.followerCount - 1);
      await unfollowUser.save();

      res.json({ message: "Unfollowed successfully" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};
//update read article 
module.exports.updateReadArticles = async (req, res) => {
  try {
    const { userId, articleId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.readArticles.push({ articleId: Number(articleId), readingDate: new Date() });
    await user.save();

    res.status(200).json({ message: 'Article read recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating read articles', details: error.message });
  }
};
//This endpoint returns the number of articles read by the user daily for a given month.
module.exports.collectMonthlyRecordsForReading = async (req, res) => {
  try {
    const { userId, month } = req.query;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const startOfMonth = moment(month, 'MM-YYYY').startOf('month');
    const endOfMonth = moment(month, 'MM-YYYY').endOf('month');

    const records = user.readArticles.filter((record) => 
      moment(record.readingDate).isBetween(startOfMonth, endOfMonth)
    );

    const dailyRecords = {};
    records.forEach((record) => {
      const date = moment(record.readingDate).format('DD-MM-YY');
      if (dailyRecords[date]) {
        dailyRecords[date]++;
      } else {
        dailyRecords[date] = 1;
      }
    });

    res.status(200).json({
      status: true,
      data: Object.keys(dailyRecords).map(date => ({
        articleReadCount: dailyRecords[date],
        date
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reading records', details: error.message });
  }
};

//This endpoint returns the list of articles written by the user in a given month.


module.exports.collectMonthlyRecordsForWriting = async (req, res) => {
  try {
    const { userId, month } = req.query;

    const startOfMonth = moment(month, 'MM-YYYY').startOf('month');
    const endOfMonth = moment(month, 'MM-YYYY').endOf('month');

    const articles = await Article.find({
      authorId: userId,
      published_date: { $gte: startOfMonth, $lt: endOfMonth }
    });

    const dailyRecords = {};
    articles.forEach((article) => {
      const date = moment(article.published_date).format('DD-MM-YY');
      if (dailyRecords[date]) {
        dailyRecords[date]++;
      } else {
        dailyRecords[date] = 1;
      }
    });

    res.status(200).json({
      status: true,
      data: Object.keys(dailyRecords).map(date => ({
        articlePostCount: dailyRecords[date],
        date
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching writing records', details: error.message });
  }
};
