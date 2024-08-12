const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // console.log(req.cookies.token);
  const token = req.cookies.token || req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = authenticateToken;
