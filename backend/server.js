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

//Database Configuration
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB = process.env.MONGO_DB;

let db;
let usersCollection;
let messagesCollection;

/**
 * connect and initialize collection from mongodb
 */
async function connectToDatabase() {
    try {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log("Connected to MongoDB");

        db = client.db(MONGO_DB);
        usersCollection = db.collection("users");
        messagesCollection = db.collection("messages");

        //create index for requests
        await messagesCollection.createIndex({ timestamp: -1 });
        await usersCollection.createIndex({ socketId: 1 });

        return client;
    } catch (error) {
        console.log('Connection Error while connectiong to MongoDB:', error.message);
        process.exit(1);
    }
}

//map active users
const activeUsers = new Map();

/**
 * REST API Endpoints
 */
//get all users
app.get('api/users', async (req, res) => {
    try {
        const users = await usersCollection.find({}).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//get all messages
app.get('/api/messages', async (req, res) => {
    try {
        const { room } = req.query;
        const filter = room ? { room } : {};
        const messages = await messagesCollection.find(filter).sort({ timestamp: -1 }).limit(100).toArray();
        res.json(messages.reverse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//create new user
app.post('/api/users', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username required' });
        }

        const user = {
            username,
            createdAt: new Date(),
        };

        const result = await usersCollection.insertOne(user);
        res.status(201).json({ ...user, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Checking if server is running
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timpestamp: new Date() });
});

/**
 * Event Handler with Socket.io
 */
io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    //user joins chat
    socket.on('join', async (data) => {
        const { username, room } = data;
        const userRoom = room || 'general';

        //add user to room-map
        activeUsers.set(socket.id, { username, room: userRoom });

        //add user to socket-room
        socket.join(userRoom);

        //Save new or edited user to database
        try {
            await usersCollection.updateOne({ socketId: socket.id }, { $set: { username, socketId: socket.id, room: userRoom, joinedAt: new Date() } }, { upsert: true } );
        } catch (error) {
            console.error('An error occured while trying to save user information: ', error);
        }

        //message all users in chat-room
        const usersInRoom = Array.from(activeUsers.values()).filter(u => u.room === userRoom).map(u => u.username);
        io.to(userRoom).emit('activeUsers', usersInRoom);

        //Send welcome message
        socket.emit('message', {
            sender: 'System',
            content: `Welcome to the chat ${username}!`,
            room: userRoom,
            timestamp: new Date(),
            isSystem: true
        });

        //inform other users
        socket.to(userRoom).emit('userJoinded', {
            username,
            timestamp: new Date(),
        });

        console.log(`${username} has entered the chat: ${userRoom}.`);
    });

    //send message
    socket.on('message', async (data) => {
        const { content, room } = data;
        const user = activeUsers.get(socket.id);

        if (!user) {
            socket.emit('error', { message: 'Please enter a chatroom first'});
            return;
        }

        const message = {
            sender: user.username,
            content,
            room: user.room,
            timestamp: new Date()
        };

        try {
            //save message to database
            await messagesCollection.insertOne(message);
        } catch (error) {
            console.error('An error occurred while trying to save message: ', error);
        }

        //send message to all users in chatroom
        io.to(user.room).emit('message', message);
        console.log(`user ${user.username} send the following message: ${content}`);
    });

    //user edits username
    socket.on('setUsername', async (data) => {
        const { username } = data;
        const oldUser = activeUsers.get(socket.id);

        if (oldUser) {
            activeUsers.set(socket.id, { ...oldUser, username });

            //sync database
            try {
                await usersCollection.updateOne({ socketId: socket.id }, { $set: { username } });
            } catch (error) {
                console.error('An error occurred while trying to edit username: ', error);
            }

            //refresh chatroom with active users
            const usersInRoom = Array.from(activeUsers.values()).filter(u => u.room === oldUser.room).map(u => u.username);
            io.to(oldUser.room).emit('activeUsers', usersInRoom);
        }
    });

    //disconnect
    socket.on('disconnect', async () => {
        const user = activeUsers.get(socket.id);

        if (user) {
            //remove from map
            activeUsers.delete(socket.id);

            //remove from database
            try {
                await usersCollection.deleteOne({ socketId: socket.id });
            } catch (error) {
                console.error('An error occurred while trying to delete user: ', error);
            }

            //refresh chatroom with active users
            const usersInRoom = Array.from(activeUsers.values()).filter(u => u.room === user.room).map(u => u.username);
            io.to(user.room).emit('activeUsers', usersInRoom);

            //inform other users
            io.to(user.room).emit('userLeft', {
                username: user.username,
                timestamp: new Date()
            });

            console.log(`${user.username} has left the chat.`);
        }
    });
});

//start server
const PORT = process.env.PORT || 3000;

async function startServer() {
    await connectToDatabase();

    server.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
}

startServer();
