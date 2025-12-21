const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
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
    tableName: 'categories',
    timestamps: true,
    underscored: false
  });

  return Category;
};
