const express = require('express');
const router = express.Router();
const Story = require('../models/Story');

const storyController = require('../controllers/stories')
/**
 * Returns list of all stories soted by date of creation
 */
router.get('/', storyController.getAll);

/**
 * Return story by id
 */
router.get('/:id', storyController.getStoryById);

/**
 * Creates new story into database
 */
router.post('/upload', storyController.saveStory);

module.exports = router;


