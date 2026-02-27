"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CommentLikes extends Model {
    static associate(models) {
      CommentLikes.belongsTo(models.Users, {
        foreignKey: "UserId",
        as: "user",
      });
      CommentLikes.belongsTo(models.Comment, {
        foreignKey: "CommentId",
        as: "comment",
      });
    }
  }
  CommentLikes.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      UserId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      CommentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "CommentLikes",
      tableName: "comment_likes",
      indexes: [
        {
          unique: true,
          fields: ["UserId", "CommentId"],
        },
      ],
    },
  );
  return CommentLikes;
};
