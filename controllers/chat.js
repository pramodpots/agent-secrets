/**
 * Return chat page
 * @param req
 * @param res
 */
exports.getChatPage = function (req, res) {
    imgId = req.params.imgId
    // console.log(req.params.imgId);
    res.render('chat', {title: "Join Chat", imgId: imgId});
}