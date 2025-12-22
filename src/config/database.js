const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config();
const db = {};
async function initialize() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  // const connection = await mysql.createConnection({
  //   host: DB_HOST,
  //   port: DB_PORT,
  //   user: DB_USER,
  //   password: DB_PASSWORD
  // });

  // await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  // await connection.end();

  const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
  });

  db.User = require('../model/user.model')(sequelize);
  db.Category = require('../model/category.model')(sequelize);
  db.Product = require('../model/product.model')(sequelize);

  db.User.hasMany(db.Category, { foreignKey: 'createdById' });
  db.User.hasMany(db.Product, { foreignKey: 'createdById' });
  db.Category.hasMany(db.Product, { foreignKey: 'categoryId' });
  db.Product.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });

  await sequelize.sync();

  console.log('Database & models initialized successfully');
}
initialize();
module.exports = db;
