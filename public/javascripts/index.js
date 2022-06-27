//get the report stored in mongodb using Axios
/**
 * Onload
 */
$(document).ready(() => {
    // get all the stories on load
    sendAxiosQuery('/stories');

    // function called when search by author button is clicked
    $('#searchBtn').click(() => {
        searchAuthorText = $('#searchAuthorBox').val();
        searchTitleText = $('#searchTitleBox').val();
        if (searchAuthorText && searchTitleText) {
            url = `/stories?author=${searchAuthorText}&title=${searchTitleText}`;
        } else if (searchAuthorText) {
            url = `/stories?author=${searchAuthorText}`;
        } else if (searchTitleText) {
            url = `/stories?title=${searchTitleText}`;
        } else {  // return all stories in case of empty search
            url = '/stories';
        }
        sendAxiosQuery(url);
    });
});

var i = 0;
var image_source = new Image();

function sendAxiosQuery(url) {

    console.log("in sendAxios call");
    roomsContainer = $('#report')
    roomsContainer.empty();
    axios.get(url)
        .then(function (response) {

            console.log("axios response:" + response.data);
            console.log("axios response[0]:" + response.data[0]);
            for (var imgReport of response.data) {
                i++;
                //image_source = 'data:image/png;base64,' + imgReport.imgBase64;
                image_source.src = imgReport.imgBase64;
                //console.log(image_source);
                roomsContainer.append(`
            <div class="card m-3 item">
            <div class="card-horizontal">
                <div class="img-thumbnail">
                    <img src=${image_source.src} alt="..." class="card-img-top" >
                </div>
                <div class="card-body">
                    <p class="h4"><strong>${imgReport.title}</strong></p>
                    <p class="">Created by ${imgReport.author}</p>
                    <p class="">Description: ${imgReport.description}</p>
                    <p class="">Created on: ${imgReport.createdDate}</p>
                    <a href="/chat/${imgReport._id}" class="btn btn-info">Join Room</a>
                </div>
                </div>
            </div>
            <br>
          `)
            }
        })
        .catch(function (error) {
            console.log(error);
        })
}
