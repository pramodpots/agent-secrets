var express = require('express');
var router = express.Router();
var axios = require('axios');

const uploadReportController = require('../controllers/uploadreport')

/* GET upload report page. */
router.get('/', uploadReportController.getUploadReport);

module.exports = router;
