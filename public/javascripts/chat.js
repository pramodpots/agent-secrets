

let name = null;
let roomNo = null;
let socket=io();

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';
    //@todo here is where you should initialise the socket operations as described in the lectures (room joining, chat message receipt etc.)
    // called when someone joins the room. If it is someone else it notifies the joining of the room

    socket.on('joined', function (room, userId) {
        // notifies that someone has joined the room
        writeOnHistory('<b>'+userId+'</b>' + ' joined room ' + room);
        //
        getChatHistoryDb(room, name);
    });

    // called when a message is received
    socket.on('catch-chat', async function (userId, chatText) {
        let who = userId
        if (userId === name){
            who = 'Me';

            //store the chat from the user who has sent it, so no duplicates get created in the idb
            await storeChat(room, userId, chatText);
        }
        writeOnHistory('<b>' + who + ':</b> ' + chatText);
    });

    //Adding the caller of knowledgeGraph functions here.
    //knowledgeGraph(knowledgeGraphSelected);
}


socket.on('catch-knowledge', async function(data){
    console.log("Getting data here from broadcast")
    addKnowledgeGraph(data);
    await storeKGraph(room, data)
})


/**
 * Fetch the chat history from idb using the roomId
 */
async function getChatHistoryDb(roomId, name) {

    console.log("getChatHistoryDb called!");

    let chat_histories = await getChatHistory(roomId);

    for (let history of chat_histories) {
        if (history.username === name) {
            who = "Me";
        }
        else {
            who = history.username;
        }
        writeOnHistory('<b>' + who + ':</b>' + history.message);

    }}




/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */
function generateRoom() {
    roomNo = Math.round(Math.random() * 10000);
    document.getElementById('roomNo').value = 'R' + roomNo;
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    let chatText = document.getElementById('chat_input').value;
    // @todo send the chat message
    socket.emit('throw-chat', roomNo, name, chatText);
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
async function connectToRoom() {
    console.log("in connectToRoom");
    roomNo = document.getElementById('roomNo').value;
    name = document.getElementById('name').value;
    let imageUrl= covertBase64();
    if (!name) name = 'Unknown-' + Math.random();

    //get the object id from parsing the url
    let reportId_key = window.location.pathname.split('/')[2];

    //check if the user has chatted about the report in some
    //other room as well, if yes, then show a dialog box containing
    //room ids of all the rooms where the user has chatted about the report

    let report_info = {

        user : name,
        reportId : reportId_key,
        roomId : roomNo
    }
    console.log("report_info: " + report_info.user + " " + report_info.roomId);

    await storeReportInfo(report_info);

    let roomID_list = await getReportInfo(report_info);
    console.log("roomID_list: " + roomID_list.length);

    //create a set to remove duplicates from the roomID_list
    var room_list_set = new Set(roomID_list);
    //console.log(room_list_set.size);

    //this means the user is chatting about the report
    //for the first time in a room
    if(room_list_set.size === 1){

        //@todo join the room
        socket.emit('create or join', roomNo, name);
        initCanvas(socket, roomNo, imageUrl);
        hideLoginInterface(roomNo, name);
        knowledgeGraph(knowledgeGraphSelected);
    }
        //this means the user has chatted about the room
        //in multiple rooms and we need to show the user
    //an option of which room to join
    else{

        console.log(roomID_list);



        //iterate over the set to create a dropdown and add the roomIds to it for the user to choose the room
        for(var roomId of room_list_set) {

            var option = document.createElement("option", roomId);
            option.value = roomId;
            option.innerHTML = roomId;
            console.log("roomID: " + roomId);
            document.getElementById("roomList").append(option);
        }

        document.getElementById("roomListModal").style.display='block';


    }

    /*//@todo join the room
    socket.emit('create or join', roomNo, name);
    initCanvas(socket, roomNo, imageUrl);
    hideLoginInterface(roomNo, name);*/
}

function joinRoom(roomId){
    console.log("in joinRoom: " + roomId);
    socket.emit('create or join', roomId, name);
    let imageUrl = covertBase64();
    initCanvas(socket, roomId, imageUrl);
    //also need to close the dialog box
    hideLoginInterface(roomId, name);
    knowledgeGraph(knowledgeGraphSelected);

}

/**
 * it appends the given html text to the history div
 * this is to be called when the socket receives the chat message (socket.on ('message'...)
 * @param text: the text to append
 */
function writeOnHistory(text) {
    if (text==='') return;
    console.log("In history")
    let history = document.getElementById('history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    history.scrollTop = history.scrollHeight;
    document.getElementById('chat_input').value = '';
}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'flex';
    document.getElementById('who_you_are').innerHTML= userId;
    document.getElementById('in_room').innerHTML= ' '+room;
}


async function  covertBase64() {
    const result = window.location.pathname.split('/')[2];
    axios.get("/stories/"+result)
        .then( function (res) {

            //base64= res.data.story.imgBase64;
            document.getElementById('image').setAttribute("src", res.data.story.imgBase64);
            //console.log(base64)
        }).catch( function (res){
        console.log(res)
    })
}


function knowledgeGraphSelected(event){
    // console.log("Inside knowledgeGraphSelected")
    let eventRow = event.row
    let data = {eventRow}
    addKnowledgeGraph(data)

    //add throw event here
    socket.emit('throw-knowledge', roomNo, data);
}

