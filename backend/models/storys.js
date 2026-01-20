'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Storys extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Storys.belongsTo(models.Users, {
        foreignKey: "UserId",
        // as: 'users'
      })
    }
  }
  Storys.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    UserId: DataTypes.UUID,
  }, {
    sequelize,
    modelName: 'Storys',
    tableName: 'stories',
  });
  return Storys;
};