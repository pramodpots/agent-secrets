const mongoose = require('mongoose');

/**
 * Story / Report schema.
 * Default value for createdDate is current date time.
 */
const StorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    imgBase64: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Story', StorySchema);
