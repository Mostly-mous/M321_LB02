/**
 * Frontend-functionalietes for chat app
 *
 * @author Maurice Mattle
 */


//DOM elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const userList = document.getElementById('users-list');
const connectionStatus = document.getElementById('connection-status');
const editUsername= document.getElementById('edit-username');
const updateUsernameBtn = document.getElementById('update-username');

//State
let socket;
let currentUsername = '';

/**
 * this function initializes socket.io connection
 * and connects to backend and initializes event-listener
 */
function initSocket() {
    //create socket.io connection
    socket = io();

    //establish connection
    socket.on('connect', () => {
        console.log('Connected to server.');
        connectionStatus.innerHTML = '<span class="status-dot></span> Connected';
        connectionStatus.classList.remove('disconnected');
    });

    //connection terminated
    socket.on('disconnect', () => {
        console.log('Disconnected from server.');
        connectionStatus.innerHTML = '<span class="status-dot"></span> Disconnected';
        connectionStatus.classList.add('disconnected');
    });

    //message received
    socket.on('message', (message) => {
        displayMessage(message);
    });

    //refresh active users
    socket.on('activeUsers', (users) => {
        updateUserList(users);
    });

    //new user joins chat
    socket.on('userJoined', (data) => {
        console.log(`${data.username} has joined the chat.`);
    });

    //user leaves chat
    socket.on('userLeft', (data) => {
        console.log(`${data.username} has left the chat.`);
    });

    //error handling
    socket.on('error', (error) => {
        alert(error.message);
    });
}

/**
 * this function shows messages in chat
 * @param {Object} message - message-object with sender, content, timestamp, isSystem
 */
function displayMessage(message) {
    const messageElement = document.createElement('div');
    const isOwn = message.sender === currentUsername;
    const isSystem = message.isSystem;

    messageElement.className = `message ${isOwn ? 'own' : 'other' } ${isSystem ? 'system' : '' }`;

    const time = new Date(message.timestamp);

    messageElement.innerHTML = `
    ${!isSystem ? `
    <div class="message-header">
        <span class="message-sender">${message.sender}</span>
        <span class="message-time">${time}</span>
    </div>
` : ''}
    <div class="message-content">${escapeHtml(message.content)}</div>`;

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * this function refreshes the userlist in the sidebar
 * @param {string[]} users - Array containing usernames
 */
function updateUserList(users) {
    userList.innerHTML = '';

    if (users.length === 0) {
        userList.innerHTML = '<li class="loading">No active users</li>';
        return;
    }

    users.forEach(username => {
        const li = document.createElement('li');
        li.textContent = username;

        if (username === currentUsername) {
            li.classList.add('current-user');
            li.textContent += ' (You)';
        }

        userList.appendChild(li);
    });
}

/**
 * this function loads older messages
 * @param {string} room - chatroom-name
 */
async function loadMessages(room = 'general') {
    try {
        const response = await fetch(`/api/messages?room=${room}`);
        if (response.ok) {
            const messages = await response.json();
            messages.forEach(message => displayMessage(message));
        }
    } catch (error) {
        console.error('An error occurred while trying to load messages.');
    }
}

/**
 * Event listeners
 */

//Login form - user joins chat
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();

    if(!username) {
        alert('Please enter a username');
        return;
    }

    currentUsername = username;

    //initialize socket if not yet done
    if (!socket) {
        initSocket();
    }

    //join a chatroom
    socket.emit('join',  {
        username: currentUsername,
        room: 'general'
    });

    //switch UI
    loginScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');

    //load messages
    loadMessages();
});

//send message
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = messageInput.value.trim();

    if(!content || !socket) {
        return;
    }

    socket.emit('message', {
        content: content,
        room: 'general'
    });

    messageInput.value = '';
    messageInput.focus();
});

//edit username
updateUsernameBtn.addEventListener('click', () => {
    const newUsername =  editUsername.value.trim();

    if (!newUsername || !socket) {
        return;
    }

    socket.emit('setUsername', { username: newUsername });
    currentUsername = newUsername;
    editUsername.value = '';
    alert(`Username changed to ${newUsername}`);
});

//Enter-Key in username-field
editUsername.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        updateUsernameBtn.click();
    }
});

//initialization on loading page
document.addEventListener('DOMContentLoaded', () => {
    //socket only initialized on login
});