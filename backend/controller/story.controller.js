const sequelize = require("../config/connection");
const { Storys, Supports, Users } = require("../models");
const { Sequelize } = require("sequelize");

async function share_story(req, res) {
  try {
    const { title, description, isAnonymous } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newProduct = {
      title,
      description,
      isAnonymous: isAnonymous || false,
      date: new Date(),
      UserId: req.user.id,
    };

    const Story = await Storys.create(newProduct);

    return res.status(201).json({
      success: true,
      data: Story,
      message: "Story added successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error adding Story",
      error: err.message,
    });
  }
}

async function seeAllStories(req, res) {
  try {
    const userId = req.user?.id;

    const stories = await Storys.findAll({
      attributes: [
        "id",
        "title",
        "description",
        "UserId",
        "isAnonymous",
        "createdAt",
        "updatedAt",
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM supports
            WHERE supports."StoryId" = "Storys"."id"
          )`),
          "supportsCount",
        ],
      ],
      include: [
        {
          model: Users,
          as: "author",
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (stories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Story found",
      });
    }

    // Check if current user has supported each story
    const storiesWithSupportStatus = await Promise.all(
      stories.map(async (story) => {
        const storyData = story.toJSON();
        let isSupported = false;

        if (userId) {
          const support = await Supports.findOne({
            where: {
              UserId: userId,
              StoryId: story.id,
            },
          });
          isSupported = !!support;
        }

        return {
          ...storyData,
          supportsCount: parseInt(storyData.supportsCount) || 0,
          isSupported,
          username: storyData.isAnonymous
            ? "Anonymous"
            : storyData.author?.username || "Anonymous",
          userId: storyData.UserId,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: storiesWithSupportStatus,
      message: "Story retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

async function updateStories(req, res) {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const story = await Storys.findByPk(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    if (story.UserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this story",
      });
    }

    await story.update({
      title: title || story.title,
      description: description || story.description,
    });

    return res.status(200).json({
      success: true,
      data: story,
      message: "Story updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

async function deleteStories(req, res) {
  try {
    const { id } = req.params;
    const story = await Storys.findByPk(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    if (story.UserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this story",
      });
    }

    await story.destroy();

    return res.status(200).json({
      success: true,
      data: story,
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

async function getUserStories(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    const stories = await Storys.findAll({
      where: {
        UserId: userId,
        // Optional: If you want to hide anonymous stories from public profile
        // isAnonymous: false
      },
      attributes: [
        "id",
        "title",
        "description",
        "UserId",
        "isAnonymous",
        "createdAt",
        "updatedAt",
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM supports
            WHERE supports."StoryId" = "Storys"."id"
          )`),
          "supportsCount",
        ],
      ],
      include: [
        {
          model: Users,
          as: "author",
          attributes: ["id", "username"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const storiesWithStatus = await Promise.all(
      stories.map(async (story) => {
        const storyData = story.toJSON();
        let isSupported = false;
        if (currentUserId) {
          const support = await Supports.findOne({
            where: { UserId: currentUserId, StoryId: story.id },
          });
          isSupported = !!support;
        }
        return {
          ...storyData,
          supportsCount: parseInt(storyData.supportsCount) || 0,
          isSupported,
          username: storyData.isAnonymous
            ? "Anonymous"
            : storyData.author?.username || "Anonymous",
        };
      }),
    );

    return res.status(200).json({ success: true, data: storiesWithStatus });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  share_story,
  seeAllStories,
  updateStories,
  deleteStories,
  getUserStories,
};
