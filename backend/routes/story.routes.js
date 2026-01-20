const express = require("express")
const { share_story, seeAllStories, deleteStories, updateStories } = require("../controller/story.controller")
const { authMiddleware } = require("../middleware/auth.middleware")
const router = express.Router()

router.post("/createstories", authMiddleware, share_story)
router.get("/seeAllstories", authMiddleware, seeAllStories)
router.put("/updatestory/:id", authMiddleware, updateStories)
router.delete("/deletestories/:id", authMiddleware, deleteStories)

module.exports = router