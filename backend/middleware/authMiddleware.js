const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require("../models/UserModel");

const verifyToken = async (req, res, next) => {
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || !user.isVerified) {
            return res.status(403).json({ error: 'Email not verified' });
        }

        req.userId = user._id;
        next();
    } catch (err) {
        console.error('Error verifying token:', err);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

const verifyUser = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || !user.isVerified) {
            throw new Error("Token expired, please login again");
        }
        return decoded.email;
    } catch (err) {
        throw err;
    }
};

module.exports = { verifyToken, verifyUser };