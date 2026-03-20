/**
 * This file contains all code for the Backend Server using REST-API and WebSocket
 *
 * @author Maurice Mattle
 */

//loading env-variable
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const server = http.createServer(app);

//Socket.io configuration with cors
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

