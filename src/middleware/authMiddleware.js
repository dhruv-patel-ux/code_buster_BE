const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token[1], process.env.JWT_SECRET);
    console.log("Token decoded:", decoded);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { verifyToken };
