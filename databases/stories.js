const mongoose = require('mongoose');

// Run "mongod.exe" for this to connect
const mongoDB = 'mongodb://localhost:27017/stories';

mongoose.Promise = global.Promise;

// mongodb connection code
connection = mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    checkServerIdentity: false,
})
    .then(() => {
        console.log('Connected to mongodb database!!');
    })
    .catch((error) => {
        console.log('connection to mongodb did not work! ' + JSON.stringify(error));
    });