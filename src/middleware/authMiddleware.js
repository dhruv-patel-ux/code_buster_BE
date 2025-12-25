const jwt = require('jsonwebtoken');
const db = require('../config/database')

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ');

    if (!token) {
      return res.status(401).send({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token[1], process.env.JWT_SECRET);
    console.log("Token decoded:", decoded);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).send({ error: 'Invalid or expired token' });
  }
};

const adminRole = async (req, res, next) => {
  try {

    if (req.userId) {
      const user = await db.User.findOne({
        attributes: ['email', 'id'],
        where: { id: req.userId }, include: [
          {
            model: db.Role,
            as: 'role',
            attributes: ['type', 'id']
          }
        ],
      })
      if (user.role?.dataValues?.type === 'ADMIN') {
        next();
      }else{  
        return res.status(401).send({ error: "You Can'n use this route" });
      }

    }
  } catch (error) {
    console.log(error );
    
    return res.status(401).send({ error: "You Can'n use this route" });
  }
};


module.exports = { verifyToken, adminRole };
