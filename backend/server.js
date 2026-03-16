/**
 * Importing necessary modules
 */
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

//creating express application
const app = express();
app.use(cors());

//creating server
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

//Event listener for connection event
wss.on('connection', (ws) => {
    //Log message for client connection confirmation
    console.log(`${ws.id} connected!`);
    //Event listener for message event
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        //Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                //Ensure the message is sent as a string
                client.send(message.toString());
            }
        });
    });
    //Event Listener for close event
    ws.on('close', () => {
        //Log message for disconnected clients
        console.log('Client disconnected!');
    });
});

//Starting Server
const PORT = 5000;
server.listen(PORT, () => {
    //Log message to confirm server start
    console.log(`Server is Listening on port: ${PORT}`);
});