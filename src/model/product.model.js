const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uniqueId: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      unique: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    productImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: false
  });

  return Product;
};
