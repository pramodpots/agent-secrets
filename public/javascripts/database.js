//////////////////Index DATABASE //////////////////

import * as idb from './idb/index.js';

let db;

const STORY_DB_NAME= 'db_story';
const STORY_STORE_NAME= 'store_stories';
const CHAT_HIST_STORE_NAME = 'store_chat_hist';
const DRAW_HIST_STORE_NAME = 'store_draw_hist';
const KGRAPH_HIST_STORE_NAME = 'store_kgraph_hist';
const REPORT_HIST_STORE_NAME = 'store_report_hist';

/**
 * it inits the database
 */
async function initDatabase(){
    if (!db) {
        db = await idb.openDB(STORY_DB_NAME, 20, {
            upgrade(upgradeDb, oldVersion, newVersion) {

                //create store for stories
                if (!upgradeDb.objectStoreNames.contains(STORY_STORE_NAME)) {
                    let storyDB = upgradeDb.createObjectStore(STORY_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    storyDB.createIndex('id', 'id',
                        {unique: false, multiEntry: true});
                }

                //create store for storing chat history
                if (!upgradeDb.objectStoreNames.contains(CHAT_HIST_STORE_NAME)) {
                    let chatDB = upgradeDb.createObjectStore(CHAT_HIST_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    chatDB.createIndex('roomId', 'roomId',
                        {unique: false, multiEntry: true});
                }

                //create a store for storing the draw history(annotation)
                if (!upgradeDb.objectStoreNames.contains(DRAW_HIST_STORE_NAME)) {
                    let drawDB = upgradeDb.createObjectStore(DRAW_HIST_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    drawDB.createIndex('roomId', 'roomId',
                        {unique: false, multiEntry: true});
                }

                //create store for storing knowledge graph history
                if (!upgradeDb.objectStoreNames.contains(KGRAPH_HIST_STORE_NAME)) {
                    let kgraphDB = upgradeDb.createObjectStore(KGRAPH_HIST_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    kgraphDB.createIndex('roomId', 'roomId',
                        {unique: false, multiEntry: true});
                }

                //create store for storing the rooms which a user has chatted in about
                //a specific report
                if (!upgradeDb.objectStoreNames.contains(REPORT_HIST_STORE_NAME)) {
                    let reportDB = upgradeDb.createObjectStore(REPORT_HIST_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    reportDB.createIndex('reportId', 'reportId',
                        {unique: false, multiEntry: true});
                }
            }
        });
        console.log('db created');
    }
}
window.initDatabase= initDatabase;

//this function stores the chat in chat_hist_store_name for offline reference
async function storeChat(roomId, username, message) {

    console.log("in store chat!");

    //initialise the db if not done above
    if (!db) {
        await initDatabase();
    }
    if (db) {
        try {
            let txnn = await db.transaction(CHAT_HIST_STORE_NAME, "readwrite");
            let store = await txnn.objectStore(CHAT_HIST_STORE_NAME);
            await store.put({
                roomId: roomId,
                username: username,
                message: message,
            });
            await txnn.complete;
        }
        catch (error) {
            console.log("IndexDB is not available!");
        }
         }
         else {
            console.log("IndexDB is not available!");
         }
}
window.storeChat= storeChat;

/**
 * Returns the chat history of a particular roomId
 * @param roomId
 * @returns {Promise<*>}
 */
async function getChatHistory(roomId) {
    if (!db) {
        await initDatabase();
    }
    if (db) {
        try {
            let txnn = await db.transaction(CHAT_HIST_STORE_NAME, "readonly");
            let store_name = await txnn.objectStore(CHAT_HIST_STORE_NAME);
            let index = await store_name.index("roomId");
            let chat_hist = await index.getAll(IDBKeyRange.only(roomId));
            await txnn.complete;
            return chat_hist;
        } catch (error) {
            console.log(error);
            console.log("IndexDB is not available!");
        }
    } else {
        console.log("IndexDB is not available!");
    }
}
window.getChatHistory = getChatHistory;

/**
 * This function stores the draw annotation which a user has drawn over
 * an image in a particular room
 * @param roomId
 * @param draw_data
 * @returns {Promise<void>}
 */
async function storeDrawAnnotation(roomId, draw_data) {
    if (!db){
        await initDatabase();
    }
    if (db) {
        try {
            let txnn = await db.transaction(DRAW_HIST_STORE_NAME, 'readwrite');
            let draw_store = await txnn.objectStore(DRAW_HIST_STORE_NAME);
            draw_data["roomId"] = roomId
            await draw_store.put(draw_data);
            await txnn.complete;
        } catch (error) {
            console.log(error);
            console.log('IndexedDB is not available!');
        }
    } else {
        console.log('IndexedDB is not available!');
    }
}
window.storeDrawAnnotation = storeDrawAnnotation;

/**
 * This method stores the stories in the index db
 * @param storyData {title, author, description, imgBase64}
 * @returns {Promise<void>}
 */
async function storeStory(storyData) {
    if (!db){
        await initDatabase();
    }
    if (db) {
        try {
            let txnn = await db.transaction(STORY_STORE_NAME, 'readwrite');
            let story_store = await txnn.objectStore(STORY_STORE_NAME);

            //create the story object
            let story = {...storyData}

            await story_store.put(story);
            await txnn.complete;

        } catch (error) {
            console.log(error);
            console.log('IndexedDB is not available!');
        }
    } else {
        console.log('IndexedDB is not available!');
    }
}
window.storeStory = storeStory;

/**
 * This method returns all the stories from the index db
 * @returns {Promise<*>}
 */
async function getAllStories() {
    if (!db) {
        await initDatabase();
    }
    if (db) {
        try {
            let txnn = await db.transaction(STORY_STORE_NAME, "readonly");
            let store_name = await txnn.objectStore(STORY_STORE_NAME);
            let index = await store_name.index("id");
            let stories = await index.getAll();
            await txnn.complete;
            return stories;
        } catch (error) {
            console.log(error);
            console.log("IndexDB is not available!");
        }
    } else {
        console.log("IndexDB is not available!");
    }
}
window.getAllStories = getAllStories;

/**
 * This method deletes all the stories in the index db
 * @returns {Promise<void>}
 */
async function deleteAllStories() {
    let stories = await getAllStories();
    if (!db) {
        await initDatabase();
    }
    if (db) {
        for (let story of stories) {
            try {
                let txn = await db.transaction(STORY_STORE_NAME, "readwrite");
                let story_store = await txn.objectStore(STORY_STORE_NAME);
                story_store.delete(IDBKeyRange.only(story.id))
                await txn.complete;
            } catch (error) {
                console.log(error);
                console.log("IndexDB is not available!");
            }
        }
    } else {
        console.log("IndexDB is not available!");
    }
}
window.deleteAllStories = deleteAllStories;

/**
 * This function store the knowledge graph data which was
 * used in the chat room. The data is indexed using roomId
 * @param roomId
 * @param data
 * @returns {Promise<void>}
 */
async function storeKGraph(roomId, data) {
    if (!db) await initDatabase();
    if (db) {
        try {
            let tx = await db.transaction(KGRAPH_HIST_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(KGRAPH_HIST_STORE_NAME);
            data["roomId"] = roomId
            await store.put(data);
            await tx.complete;
        } catch (error) {
            console.log('IndexedDB is not available');
        }
    } else {
        console.log('IndexedDB is not available');
    }
}
window.storeKGraph = storeKGraph;

/**
 * This method returns the draw annotations for a particular roomId
 * @param roomId
 * @returns {Promise<*>}
 */
async function getDrawAnnotationHistory(roomId) {
    if (!db) await initDatabase();
    if (db) {
        try {
            let tx = await db.transaction(DRAW_HIST_STORE_NAME, 'readonly');
            let store = await tx.objectStore(DRAW_HIST_STORE_NAME);
            let index = await store.index("roomId");
            let drawAnnotation = await index.getAll(IDBKeyRange.only(roomId));
            await tx.complete;
            console.log("in getDrawAnnotationHistory");
            console.log(drawAnnotation);
            return drawAnnotation;
        } catch (error) {
            console.log(error);
            console.log('IndexedDB is not available!');
        }
    } else {
        console.log('IndexedDB is not available!');
    }
}
window.getDrawAnnotationHistory = getDrawAnnotationHistory;

/**
 * This function retrieves the knowledge graph history
 * of the particular room
 * @param roomId
 * @returns {Promise<*>}
 */
async function getKGraphHistory(roomId) {
    if (!db) await initDatabase();
    if (db) {
        try {
            let txn = await db.transaction(KGRAPH_HIST_STORE_NAME, 'readonly');
            let store = await txn.objectStore(KGRAPH_HIST_STORE_NAME);
            let index = await store.index("roomId");
            let kgraph = await index.getAll(IDBKeyRange.only(roomId));
            await txn.complete;
            return kgraph;
        } catch (error) {
            console.log(error);
            console.log('IndexedDB is not available');
        }
    } else {
        console.log('IndexedDB is not available');
    }
}
window.getKGraphHistory = getKGraphHistory;

/**
 * This method stores the report info in the report_hist store
 * for showing the user a choice of rooms if he/she has chatted in multiple rooms about the same report
 * @param report_info
 * @returns {Promise<void>}
 */
async function storeReportInfo(report_info){

    if (!db){
        await initDatabase();
    }
    if (db) {
        try {
            let txn = await db.transaction(REPORT_HIST_STORE_NAME, 'readwrite');
            let report_store = await txn.objectStore(REPORT_HIST_STORE_NAME);
            //create the report data object
            let report_data = {...report_info}

            await report_store.put(report_data);
            await txn.complete;


        } catch (error) {
            console.log(error);
            console.log('IndexedDB is not available!');
        }
    } else {
        console.log('IndexedDB is not available!');
    }

}
window.storeReportInfo = storeReportInfo;

/**
 * This method returns all the rooms which users have chatted about a particular report
 * @param report_data
 * @returns {Promise<*[]>}
 */
async function getReportInfo(report_data){
    if (!db) {
        await initDatabase();
    }
    if (db) {

        console.log("in getReportInfo " + report_data.reportId);

        try {
            let txn = await db.transaction(REPORT_HIST_STORE_NAME, "readonly");
            let report_store = await txn.objectStore(REPORT_HIST_STORE_NAME);
            let index = await report_store.index("reportId");
            let all_report_info = await index.getAll(
                IDBKeyRange.only(report_data.reportId));
            await txn.complete;

            let roomIds=[];

            if(all_report_info != null) {
                for (var report_info of all_report_info) {

                    console.log("indexedbd report_info:" + report_info.roomId + " " + report_info.user)

                    if (report_info.user === report_data.user) {

                        roomIds.push(report_info.roomId);
                    }

                }
            }

            return roomIds;

        } catch (error) {
            console.log(error);
            console.log("error: IndexDB is not available!");
        }
    } else {
        console.log("IndexDB is not available!");
    }
}
window.getReportInfo = getReportInfo;

/**
 * This method clears all the annotations stored for a particular roomId
 * @param roomId
 * @returns {Promise<void>}
 */
async function clearDrawHistory(roomId) {
    let draw_annotation = await getDrawAnnotationHistory(roomId);
    if (!db) {
        await initDatabase();
    }
    if (db) {
        for (let draw of draw_annotation) {
            try {
                let txn = await db.transaction(DRAW_HIST_STORE_NAME, "readwrite");
                let draw_store = await txn.objectStore(DRAW_HIST_STORE_NAME);
                draw_store.delete(IDBKeyRange.only(draw.id))
                await txn.complete;
            } catch (error) {
                console.log(error);
                console.log("IndexDB is not available!");
            }
        }
    } else {
        console.log("IndexDB is not available!");
    }
}
window.clearDrawHistory = clearDrawHistory;

