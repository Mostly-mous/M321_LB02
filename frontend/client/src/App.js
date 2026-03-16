import React, { useState, useEffect } from "react";
import './App.css';

function App() {
  //Array to store messages
  const [messages, setMessages] = useState([]);
  //Array to store user inputs
  const [input, setInput] = useState('');
  //Websocket instance to handle websocket connection
  const [socket, setSocket] = useState(null);

  //Setting up Websocket connection
  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:6000");
    setSocket(newSocket);

    //Event Listener for onOpen-Event
    newSocket.onopen = () => {
      //Logging established Websocket connection
      console.log("WebSocket connection established");
    };

    //Handling incoming messages from server
    newSocket.onmessage = (event) => {
      const message = event.data.toString(); //Ensure the message is received as a string
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    //Handling closing of connection
    newSocket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    //Handling errors
    newSocket.onerror = (error) => {
      console.log("WebSocket error: ", error );
    };

    //cleanup function for dismount
    return () => {
      newSocket.close();
    };
  }, []);

  //function for sending messages to the server
  const sendMessage = () => {
    //checking input value and WebSocked connection
    if (input.trim() && socket && socket.readyState === WebSocket.OPEN) {
      //sending input message
      socket.send(input);
      //clearing input-field
      setInput('');
    }
  };

  //rendering chat interface
  return (
      <div className="App">
        <div className="chat-window">
          {messages.map((message, index) => (
              <div key={index} className="message">
                {message}
              </div>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && sendMessage()}
          />
        <button onClick={sendMessage}>Send</button>
      </div>
  );
}
export default App;

