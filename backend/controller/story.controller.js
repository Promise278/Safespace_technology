const sequelize = require("../config/connection");
const { Storys } = require("../models");
// const { Users } = require("../models");

async function share_story(req, res) {
  try {
    const { title, description, } = req.body;

    if (!title || !description ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newProduct = {
      title,
      description,
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
      message: "Error adding Srory",
      error: err.message,
    });
  }
}

async function seeAllStories(req, res) {
  try {
    const story = await Storys.findAll({
      attributes: [
        "id",
        "title",
        "description",
        "UserId",
      ],
    });

    if (story.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Story found",
      });
    }

    return res.status(200).json({
      success: true,
      data: story,
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

module.exports = { share_story, seeAllStories, updateStories, deleteStories };