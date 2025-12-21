const db = require('../config/db');

module.exports = {
  User: db.User,
  Category: db.Category,
  Product: db.Product,
  sequelize: db.sequelize,
  Sequelize: db.Sequelize
};
