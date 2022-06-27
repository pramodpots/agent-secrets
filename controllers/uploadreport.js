/**
 * Render upload report view
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getUploadReport = async function (req, res) {
    res.render('uploadreport');
}