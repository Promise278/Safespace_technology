// 'use strict';
// const {
//   Model
// } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class Conversation extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//     }
//   }
//   Conversation.init({
//     id: DataTypes.UUID,
//     username: DataTypes.STRING,
//     email: DataTypes.STRING
//   }, {
//     sequelize,
//     modelName: 'Conversation',
//   });
//   return Conversation;
// };
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
