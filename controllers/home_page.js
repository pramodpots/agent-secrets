/**
 * Controller for loading chat functionality
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getHomePage = async function (req, res) {
    try {
        res.render('home_page', { title: 'Image Browsing' });
    } catch (err) {
        res.status(500).send('Invalid data or not found!' + JSON.stringify(err));
    }
}