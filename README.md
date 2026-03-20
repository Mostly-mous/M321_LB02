# M321-LB02 Realtime Chat-App
This realtime chat app serves to demonstrate the utilisation of a distributed system.

## Installation and Start
 - Clone Repository
 - start container with docker-compose up --build
 - open your local browser and run the app via https://loclahost:8001

## Project structure

M321_LB02/
├── docker-compose.yml                      # container orchestration
├── README.md                               # current file
├── backend/
│   ├── package.json                        # Node.js dependencies
│   ├── server.js                           # JavaScript backend-server: express + socket.io
│   ├── Dockerfile                          # backend container
├── frontend/
│   ├── index.html                          # HTML Frontend
│   ├── style.css                           # CSS Stylesheet
│   ├── client.js                           # JavaScript frontend-client
│   ├── Dockerfile                          # Frontent container
├── nginx/
│   ├── nginx.conf                          # Nginx configuration
```

## Components

### Frontend
- HTML/CSS/JavaScript
- Socket.io Client
- Functionalities:
    - Enter/edit username
    - Join chat-room
    - send/receive messages
    - see active users

### Backend
- Node.js + Express
- Socket.io for WebSocket
- REST-API Endpoints:
    - 'GET /api/users' - all users
    - 'GET /api/messages' - messages
    - 'POST /api/users' - create user
    
### Database
- MongoDB
- Collections: 
    - 'users' for userdata
    - 'messages' for chat-messages
    
