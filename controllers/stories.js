const axios = require('axios');
const Story = require('../models/Story');

/**
 * Returns list of stories present in database
 * If filter query params are present, the list is filtered based on these parameters
 * The list is always sorted based on date add that is, newest to oldest
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getAll = async function (req, res) {
    try {
        let filters = {
            author,  // support filter by author
            title  // support filter by title
        } = req.query;

        const stories = await Story.find({...filters})
            .sort( { createdDate: -1 } );  // default load from new to old
        res.json(stories);
    } catch (err) {
        res.status(500).send('Invalid data or not found!' + JSON.stringify(err));
    }
}

/**
 * req param will contain the story id, based on id,
 * this function will return the json of the single story if found by id, else 404 not found error
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getStoryById = async function (req, res) {
    try {
        const story = await Story.findById(req.params.id);
        res.json({status: 200, story});
    } catch (err) {
        res.json({status: 404, message: err});
    }
}

/**
 * This function handles post request to save the story / report into database
 * Default created date is generated at time of saving into database
 * If data passed do not match story schema then error with 500 is returned to server
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.saveStory = async function (req, res) {
    let storyData = {
        title,
        description,
        author,
        imgBase64,
        createdDate
    } = req.body
    
    try {
        if (imgBase64.indexOf('http') > -1){ // check if the it's image url
            let img_res = await axios.get(imgBase64, {
                responseType: 'arraybuffer'
            });
            // convert img url response to buffer and from buffer to base64
            let imgBuffer = await Buffer.from(img_res.data, 'base64');
            let contentType = img_res.headers['content-type'];
            let base64 = imgBuffer.toString("base64");
            let convertedBase64 = `data:${contentType};base64,` + base64;
            storyData.imgBase64 = convertedBase64;  // update value in storyData
        }
        const story = new Story({...storyData});
        const savedStory = await story.save();
        res.json(savedStory._doc);
    } catch (err) {
        res.status(500).send('Invalid data!' + JSON.stringify(err));
    }
}