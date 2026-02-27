"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Supports extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Supports.belongsTo(models.Users, {
        foreignKey: "UserId",
      });
      Supports.belongsTo(models.Storys, {
        foreignKey: "StoryId",
      });
    }
  }
  Supports.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      UserId: DataTypes.UUID,
      StoryId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "Supports",
      tableName: "supports",
      indexes: [
        {
          unique: true,
          fields: ["UserId", "StoryId"],
        },
      ],
    },
  );
  return Supports;
};
