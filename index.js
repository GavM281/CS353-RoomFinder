const express = require('express'); // require express
const app = express();
const path = require('path');
const { v4: uuid } = require('uuid'); // Create a unique id
// app.use(express.static('/assets'));

app.use(express.static(__dirname + '/assets'));

// Use views directory
// app.set('views', path.join(__dirname, 'views'));

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
// default route renders home page
app.get('/', async (req,res) => {
    // const rooms = await getData(); // Get data
    // console.log("Data: " + rooms); // Print
    // retrieveData();

    roomRef.once("value", function (snapshot) {
        // console.log(snapshot.val());
        var list = [];
        var roomData;
        snapshot.forEach(function (childSnapshot) {
            roomData = childSnapshot.val();
            list.push(roomData);
        });
        // let roomData = snapshot.val();
        // console.log(roomData);

        // console.log(list);
        // console.log(snap.name);
        // snap = JSON.stringify(snap);

        res.render(__dirname+"/home.ejs", { list });
    }, (errorObject) => {
        console.log('The read failed: ' + errorObject.name);
    });
    console.log("Loading home page");
    // res.render("home.ejs", {snap});
    // res.sendFile(path.join(__dirname+'/home.html'));
})

// Render newroom page
app.get('/newroom', (req,res) => {
    // res.render('newroom');
    console.log("Loading newRoom page");
    res.sendFile(path.join(__dirname+'/newroom.html'));
})

// After submitting form on newroom page, get that data and use it to create a room. Redirect to home page
app.post('/newroom', async (req,res) => {
    var userData = req.body; // Save data

    console.log("User input");
    console.log("Name: " + userData.name);
    console.log("price: " + userData.price);
    console.log("details: " + userData.details);
    console.log("imageURL: " + userData.imageURL);
    console.log("formLat: " + userData.formLat);
    console.log("formLong: " + userData.formLong);


    // Call method to create room in firebase, uuid() gives the room a unique id
    writeRoomData(uuid(),userData.name, userData.price,userData.details, userData.imageURL, userData.formLat, userData.formLong);
    res.redirect('/'); // Redirect to home page
})

// Render log in page
app.get('/log', (req,res) => {
    console.log("Loading log in page");
    res.sendFile(path.join(__dirname+'/login.html'));
})

// deletes room with id
app.get('/deleteroom/:id', async function(req, res){

    // get room id from url
    var roomID = req.params.id;
    console.log("roomID : " + roomID);

    // delete room with given id
    var deleteRoom = db.ref('rooms/' + roomID);
    deleteRoom.remove()
        .then(function() {
            console.log("Remove successful.")
        })
        .catch(function(error) {
            console.log("Remove failed: " + error.message)
        });
    res.redirect('/'); // Redirect to home page

})

// Create a room in Firebase
function writeRoomData(userId, name, price, details, imageUrl, formLat, formLong) {
    console.log("Going to add to database");
    db.ref("rooms/"+userId).set({
        name: name,
        price: price,
        details: details,
        picture: imageUrl,
        latitude: formLat,
        longitude: formLong,
        id: userId // Adding as child so that id can be found for deleting
    });
}

// // Get rooms from database
// function getData(){
//     roomRef.on('value', (snapshot) => {
//         console.log(snapshot.val());
//         return snapshot.val()
//     }, (errorObject) => {
//         console.log('The read failed: ' + errorObject.name);
//     });
// }

// Retrieve data and create a list to display
function retrieveData(doc) {
    const roomList = document.querySelector('#room-list');
    let li = document.createElement('li');
    let details = document.createElement('span');
    let latitude = document.createElement('span');
    let longitude = document.createElement('span');
    let name = document.createElement('span');
    let picture = document.createElement('span');
    let price = document.createElement('span');

    li.setAttribute('data-id', doc.id);
    details.textContent = doc.data().details;
    latitude.textContent = doc.data().latitude;
    longitude.textContent = doc.data().longtitude;
    name.textContent = doc.data().name;
    picture.textContent = doc.data().picture;
    price.textContent = doc.data().price;

    li.appendChild(details);
    li.appendChild(latitude);
    li.appendChild(longitude);
    li.appendChild(name);
    li.appendChild(picture);
    li.appendChild(price);

    roomList.appendChild(li);
}

// db.collection('rooms').get().then((snapshot) => {
//     snapshot.docs.forEach(doc => {
//         retrieveData(doc);
//     })
// })



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

/*sidebar*/
function show() {
    document.getElementById('sidebar').classList.toggle('active');
}

/*email function*/
function sendMail(params) {
    var tempParams = {
        from_name: document.getElementById("fromName").value,
        from_email:document.getElementById("fromEmail").value,
        message: document.getElementById("message").value,
    };

    emailjs.send('service_zbmfupf','template_z4zis3x',tempParams)
        .then(function(res){
            console.log();
        })
}
