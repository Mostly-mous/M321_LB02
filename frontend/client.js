/**
 * Frontend-functionalietes for chat app
 *
 * @author Maurice Mattle
 */

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

