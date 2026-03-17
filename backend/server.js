/**
 * Importing necessary modules
 */
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const url = require('url');
const uuidv4 = require('uuid').v4;

//creating express application
const app = express();
app.use(cors());

//creating server
const server = http.createServer(app);
const wss = new WebSocketServer( { server } );
const PORT = 8000;

const connections = { }
const users = { }

const broadcast = () => {
    Object.keys(connections).forEach(uuid => {
        const connection = connections[uuid];
        const message = JSON.stringify(users);
        connection.send(message);
    });
}

const handleMessage = (input, uuid) => {
   const message = JSON.parse(input.toString());
   const user = user[uuid];
   user.state = message;

   broadcast();

    console.log(`${user.username} send a new message: ${JSON.stringify(user.state)}`);
};

const handleClose = (uuid) => {
    //Log message for disconnected clients
    console.log(`${users[uuid].username} disconnected!`);
    delete connections[uuid];
    delete users[uuid];

    broadcast();
}

//Event listener for connection event
wss.on('connection', (connection, request) => {
    //Log message for client connection confirmation

    const { username } = url.parse(request.url, true).query
    const uuid = uuidv4()
    console.log(`${username} with id=${uuid} connected!`);
    //broadcast
    connections[uuid] = connection;

    users[uuid] = {
        username: username,
        state: { }
    }



    //Event listener for message event
    connection.on('message', (message) => handleMessage(message, uuid));

    //Event Listener for close event
    connection.on('close', () => handleClose(uuid))
});

//Starting Server

server.listen(PORT, () => {
    //Log message to confirm server start
    console.log(`Server is Listening on port: ${PORT}`);
});