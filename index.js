// Creating. Routes for home and new room.

const express = require('express'); // require express
const app = express();
const path = require('path');
const { v4: uuid } = require('uuid'); // Create a unique id

// Use EJS, like HTML but allows use of Javascript
app.set('view engine', 'ejs');
// Use views directory
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended:false}))

// Connect to Firebase
const admin=require('firebase-admin');
var serviceAccount = require('./admin.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "https://cs353-roomfinder.firebaseio.com",
    databaseURL: "https://cs353-roomfinder-default-rtdb.europe-west1.firebasedatabase.app/",
    authDomain: "cs353-roomfinder.firebaseapp.com",
});
// Connect to database
var db=admin.database();
var roomRef=db.ref("rooms");


// default route renders home page
app.get('/', async (req,res) => {
    const rooms = await getData(); // Get data
    console.log("Data: " + rooms); // Print
    res.render('home'); // Render home page
})

// Render newroom page
app.get('/newroom', (req,res) => {
    res.render('newroom');
})

// After submitting form on newroom page, get that data and use it to create a room. Redirect to home page
app.post('/newroom', async (req,res) => {
    var userData = req.body; // Save data

    console.log("User input");
    console.log("Name: " + userData.name);
    console.log("price: " + userData.price);
    console.log("details: " + userData.details);
    console.log("imageURL: " + userData.imageURL);

    // Call method to create room in firebase, uuid() gives the room a unique id
    writeRoomData(uuid(),userData.name, userData.price,userData.details, userData.imageURL);
    res.redirect('/'); // Redirect to home page
})

app.get('/deleteroom', async function(req, res){
    var roomID = "cb831c00-95e1-48c7-bb11-4a9b8f949bb7"; // Id for the room to delete TODO: Get automatically from room
    var deleteRoom = db.ref('rooms/' + roomID);
    deleteRoom.remove()
        .then(function() {
            console.log("Remove succeeded.")
        })
        .catch(function(error) {
            console.log("Remove failed: " + error.message)
        });
    res.redirect('/'); // Redirect to home page

})

// Create a room in Firebase
function writeRoomData(userId, name, price, details, imageUrl) {
    db.ref("rooms/"+userId).set({
        name: name,
        price: price,
        details: details,
        picture: imageUrl
    });
}

// Get rooms from database
function getData(){
    roomRef.on('value', (snapshot) => {
        console.log(snapshot.val());
        return snapshot.val()
    }, (errorObject) => {
        console.log('The read failed: ' + errorObject.name);
    });
}

// Retrieve data and create a list to display
function retrieveData(data) {

    // TODO: Create ul in HTML with id = room-List
    const roomList = document.querySelector('#room-list');

    var roomListings = selectAll('.roomListing');
    for (var i = 0; i < roomListings.length; i++) {
        roomListings[i].remove();
    }

    var rooms = data.val();
    var keys = Object.keys(rooms);

    for(var i = 0; i < keys.length; i++) {
        var k = keys [i];
        var details = rooms [k].details;
        var name = rooms [k].name;
        var picture = rooms [k].picture;
        var price = rooms [k].price;

        var li = createElement('li', details + ' ' + name + ' ' + picture + ' ' + price);
        li.class('roomListing');
        li.parent('room-list');
    }
}

// Update data
function updateData (colName, docID, det, name, pic, price) {
    db.collection(colName).doc(docID).set({
        details: det,
        name: name,
        picture: pic,
        price: price
    })
}

// listen on port 3000
app.listen(3000, ()=>{
    console.log('Listening on port 3000');
})


function display() {
    propertyForm.style.display = "block";
}

function hide() {
    propertyForm.style.display = "none";
}
