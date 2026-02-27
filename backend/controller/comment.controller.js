const { Comment, Users, CommentLikes } = require("../models");

async function addComment(req, res) {
  try {
    const { storyId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    // Check if story exists
    const { Storys } = require("../models");
    const story = await Storys.findByPk(storyId);
    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Comment message is required" });
    }

    const comment = await Comment.create({
      content: message,
      UserId: userId,
      StoryId: storyId,
    });

    const populatedComment = await Comment.findByPk(comment.id, {
      include: [{ model: Users, as: "user", attributes: ["username"] }],
    });

    // Initialize with isLiked false and 0 likes
    const commentData = populatedComment.toJSON();
    commentData.isLiked = false;

    res.status(201).json({ success: true, data: commentData });
  } catch (error) {
    console.error("Add comment error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
}

async function getComments(req, res) {
  try {
    const { storyId } = req.params;
    const userId = req.user?.id;

    if (!storyId) {
      return res
        .status(400)
        .json({ success: false, message: "Story ID is required" });
    }

    const comments = await Comment.findAll({
      where: { StoryId: storyId },
      include: [{ model: Users, as: "user", attributes: ["username"] }],
      order: [["createdAt", "ASC"]],
    });

    const commentsWithLikes = await Promise.all(
      comments.map(async (comment) => {
        const commentData = comment.toJSON();
        let isLiked = false;

        if (userId) {
          const like = await CommentLikes.findOne({
            where: {
              UserId: userId,
              CommentId: comment.id,
            },
          });
          isLiked = !!like;
        }

        return {
          ...commentData,
          isLiked,
        };
      }),
    );

    res.status(200).json({ success: true, data: commentsWithLikes });
  } catch (error) {
    console.error("Get comments error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
}

module.exports = { addComment, getComments };
