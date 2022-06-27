var express = require('express');
var router = express.Router();
const homePageController = require('../controllers/home_page')
/* GET home page. */
router.get('/', homePageController.getHomePage);

module.exports = router;