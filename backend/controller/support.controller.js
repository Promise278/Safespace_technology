const { Supports, Storys, Comment, CommentLikes } = require("../models");
const { v4: uuidv4 } = require("uuid");

async function toggleSupport(req, res) {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    if (!storyId) {
      return res.status(400).json({
        success: false,
        message: "Story ID is required",
      });
    }

    // Check if story exists
    const story = await Storys.findByPk(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // Check if user already supported this story
    const existingSupport = await Supports.findOne({
      where: {
        UserId: userId,
        StoryId: storyId,
      },
    });

    if (existingSupport) {
      // If already supported, just return success with current state
      // This satisfies "can't like twice" while keeping UI happy
      return res.status(200).json({
        success: true,
        message: "You have already supported this story",
        supported: true,
      });
    } else {
      // Like: Add support
      const newSupport = await Supports.create({
        id: uuidv4(),
        UserId: userId,
        StoryId: storyId,
      });

      // Increment likesCount on the story
      await story.increment("likesCount");

      return res.status(201).json({
        success: true,
        message: "Support added successfully",
        supported: true,
        data: newSupport,
      });
    }
  } catch (error) {
    console.error("Support toggle error:", error);
    return res.status(500).json({
      success: false,
      message: "Error toggling support",
      error: error.message,
    });
  }
}

async function getSupportCount(req, res) {
  try {
    const { storyId } = req.params;

    if (!storyId) {
      return res.status(400).json({
        success: false,
        message: "Story ID is required",
      });
    }

    const count = await Supports.count({
      where: {
        StoryId: storyId,
      },
    });

    return res.status(200).json({
      success: true,
      count: count,
    });
  } catch (error) {
    console.error("Get support count error:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting support count",
      error: error.message,
    });
  }
}

async function checkUserSupport(req, res) {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    if (!storyId) {
      return res.status(400).json({
        success: false,
        message: "Story ID is required",
      });
    }

    const support = await Supports.findOne({
      where: {
        UserId: userId,
        StoryId: storyId,
      },
    });

    return res.status(200).json({
      success: true,
      supported: !!support,
    });
  } catch (error) {
    console.error("Check user support error:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking support",
      error: error.message,
    });
  }
}

async function toggleCommentLike(req, res) {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "Comment ID is required",
      });
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const existingLike = await CommentLikes.findOne({
      where: {
        UserId: userId,
        CommentId: commentId,
      },
    });

    if (existingLike) {
      return res.status(200).json({
        success: true,
        message: "You have already liked this comment",
        liked: true,
      });
    } else {
      const newLike = await CommentLikes.create({
        id: uuidv4(),
        UserId: userId,
        CommentId: commentId,
      });

      await comment.increment("likesCount");

      return res.status(201).json({
        success: true,
        message: "Comment liked successfully",
        liked: true,
        data: newLike,
      });
    }
  } catch (error) {
    console.error("Comment like error:", error);
    return res.status(500).json({
      success: false,
      message: "Error toggling comment like",
      error: error.message,
    });
  }
}

module.exports = {
  toggleSupport,
  getSupportCount,
  checkUserSupport,
  toggleCommentLike,
};
