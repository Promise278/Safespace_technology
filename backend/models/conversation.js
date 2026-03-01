"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      // A conversation has many messages
      Conversation.hasMany(models.Message, {
        foreignKey: "conversationId",
        as: "messages",
        onDelete: "CASCADE",
      });

      // Conversation belongs to two users
      Conversation.belongsTo(models.Users, {
        foreignKey: "senderId",
        as: "sender",
      });

      Conversation.belongsTo(models.Users, {
        foreignKey: "receiverId",
        as: "receiver",
      });
    }
  }

  Conversation.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      receiverId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected"),
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "Conversation",
      tableName: "Conversations",
      timestamps: true,
    },
  );

  return Conversation;
};
