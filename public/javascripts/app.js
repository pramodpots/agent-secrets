// service worker register
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./service-worker.js')
        .then(function () {
            console.log('Service Worker Registered');
        });
}

/**
 * If client tries to upload new stories while offline, those will be saved in indexDB
 * when client goes online, this function will read all the stories from indexDB and upload them to server
 * and delete stories to upload from indexDB
 */
async function uploadStoriesToServer() {
    let stories = await getAllStories();  // function defined in database.js
    for (let story of stories) {
        try {
            await postStory(story);
        } catch (error) {
            console.log(error);
        }
    }
}

/**
 * helper function to make axios post request for upload story
 * @param data
 * @returns {Promise<void>}
 */
async function postStory(data) {
    //data = {title:title, author:author, description:description, imgBase64: base64};
    json = JSON.stringify(data);
    url = "/stories/upload"
    axios.post(url, data).then(function (dataR) {
        console.log("post report successful!");
    }).catch(function (response) {
        console.log("Error while offline to online upload")
        console.log(response.toJSON);
    });
}

/**
 * When the client gets off-line, it shows an off line warning to the user
 * so that it is clear that the data is stale
 */
window.addEventListener('offline', function (e) {
    // Queue up events for server.
    console.log("You are offline");
    showOfflineWarning();
}, false);

/**
 * When the client gets online, it hides the off line warning
 */
window.addEventListener('online', async function (e) {
    console.log("You are online");
    hideOfflineWarning();
    await uploadStoriesToServer();
    await deleteAllStories();  // function defined in database.js
}, false);

/**
 * helper function to show offline msg div
 */
function showOfflineWarning() {
    if (document.getElementById('offline_div') != null)
        document.getElementById('offline_div').style.display = 'block';
}

/**
 * helper function to hide offline msg div
 */
function hideOfflineWarning() {
    if (document.getElementById('offline_div') != null)
        document.getElementById('offline_div').style.display = 'none';
}
