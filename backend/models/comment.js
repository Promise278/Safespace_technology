"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.Users, {
        foreignKey: "UserId",
        as: "user",
      });
      Comment.belongsTo(models.Storys, {
        foreignKey: "StoryId",
        as: "story",
      });
      Comment.hasMany(models.CommentLikes, {
        foreignKey: "CommentId",
        as: "likes",
      });
    }
  }
  Comment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      UserId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      StoryId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      likesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Comment",
      tableName: "comments",
    },
  );
  return Comment;
};
