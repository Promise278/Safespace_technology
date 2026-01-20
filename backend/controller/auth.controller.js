const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("../config/connection");
const { v4: uuidv4 } = require("uuid");
const{ Users } = require("../models");
const { Op } = require("sequelize");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

async function register(req, res) {
  try {
    const { username, email, password, roles } = req.body;

    if (!username || !email || !password ||!Array.isArray(roles)) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Roles must be an array with at least one role (e.g., ['sharer'] or ['supporter'] or ['sharer', 'supporter'])",
      });
    }

    const ALLOWED_ROLES = ['sharer', 'supporter'];

    const invalidRoles = roles.filter(role => !ALLOWED_ROLES.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid role(s) specified",
      });
    }

    if (username.length < 4 || password.length < 5) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be at least 4 characters and Password at least 5 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      roles,
    };

    await Users.create(newUser);

    return res.status(201).json({
      success: true,
      data: newUser,
      message: "User Registered successfully",
    });
  } catch (error) {
    console.error("Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await Users.findOne({
      where: { email },
      attributes: ["id", "username", "email", "password", "roles"],
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      time: Date.now(),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    return res.status(200).json({
      success: true,
      token,
      user: payload,
      message: "User Login successfully",
    });
  } catch (error) {
    console.error("Logining Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function getSupporters(req, res) {
  try {
    const supporters = await Users.findAll({
      where: { 
        roles: {
          [Op.contains]: ['supporter'],
        },
      },
      attributes: ["id", "username", "email"]
    });

    return res.status(200).json({
      success: true,
      data: supporters,
      message: "Supporters retrieved successfully",
    });
  } catch (error) {
    console.error("Get Supporters Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

module.exports = { register, login, getSupporters };