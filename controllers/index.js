/**
 * Render index page
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getIndex = async function (req, res) {
    res.render('index', { title: 'Home' });
}