
var dataURL = null;
//var base64image = null;
var imgLocalBase64 = null;


$(document).ready(() => {

    $("#img_folder").hide();
    //$("#image_url").hide();
    fileUploadValidation();

});

/**
 * This method is calls when the upload from URL radio button is clicked
 * This hides the upload from folder option
 */
function hideFolderUploadMenu(){

    $("#img_folder").hide();
    $("#image_url").show();
    $("#image_url_label").show();
}

/**
 * This method is calls when the upload from device button is clicked
 * This hides the upload from URL option
 */
function hideURLUploadMenu(){

    $("#img_folder").show();
    $("#image_url").hide();
    $("#image_url_label").hide();
}



function uploadreport(){

    console.log("in upload report js");
    //get the values entered by the user

    title = $("#title").val();
    author = $("#author").val();
    description = $("#description").val();
    image_url = $("#image_url").val();
    console.log("image_url:" + image_url);
    
    console.log("query selector: " + document.querySelector('input[name="image_type"]:checked').value);
    
    let uploadType = document.querySelector('input[name="image_type"]:checked').value;

    console.log("uploadType:" + uploadType);
    console.log({uploadType});

    let isURL;

    //the image is to be uploaded from url
    if(uploadType === "url") {
        isURL = true;
       
        uploadToDatabase(title, author, description, image_url, isURL);

    }
    //the image is to be uploaded from the file
    else {
        isURL = false;

            uploadToDatabase(title, author, description, imgLocalBase64, isURL);

    }

}

/**
 * This method is used for validation of the file uploaded from file system
 */
function fileUploadValidation(){

    let imageFile = document.getElementById("img_folder");
    imageFile.addEventListener('change', function () {

        if (!imageFile.value) {
           //If the file is not selected, alert the user
            alert('Please select a file!');
            return;
        }

        let file = imageFile.files[0];
        //if the file selected is not of jpeg or png type then alert the user
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            alert('Invalid file format, please upload a jpeg or png format image!');
            return;
        }
        // get the file using the FileReader
        let fileReader = new FileReader();
        fileReader.onload = function(file_event) {
            imgLocalBase64 = file_event.target.result;
        };
        // read the file by dataURL(Base64) using the dataURL method
        fileReader.readAsDataURL(file);
    });

}

/**
 * This methods posts the data taken from the UI about the report using axios or
 * if the device is offline then stores the report to the indexedDb
 * @param title
 * @param author
 * @param description
 * @param image_url
 * @param isURL
 */
function uploadToDatabase(title, author, description, image_url,isURL){
    
        data = {title: title, author: author, description: description, imgBase64: image_url};

        //create the JSON object of the data variable
        json = JSON.stringify(data);

        url = "/stories/upload";

        //axios call to post the data to mongodb
        axios.post(url, data)
            .then(function (dataR) {
                // alert("post report successful!");
                window.location.href = "/"; // load homepage on success
            })
            .catch(function (response) {
                //this means the story was not stored in mongodb
                //so we'll store the story in the indexeddb
                //and service worker will upload the file to mongodb
                //after the device is online
                storeStory(data)
                    .catch(function (){
                        console.log("Story not saved in index db");}
                    )
                    //alert(response.toJSON);
                });


}

