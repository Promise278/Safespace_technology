const express = require("express")
const { register, login, getSupporters, } = require("../controller/auth.controller")
const { authMiddleware } = require("../middleware/auth.middleware")
const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/seesupporters", authMiddleware, getSupporters)

module.exports = router