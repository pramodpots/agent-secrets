var express = require('express');
var router = express.Router();

const chatController = require('../controllers/chat')
/* GET chat page. */
router.get('/:id', chatController.getChatPage)

module.exports = router;