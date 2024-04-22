import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';


const Chatroom = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [storedUsername, setstoredUsername] = useState('');
  

  useEffect(() => {
    // Fetch user's nickname from session storage
    const fetchUserInfo = () => {
       // Use sessionStorage instead of localStorage
       const storedUsername = sessionStorage.getItem('username');
       setstoredUsername(storedUsername);
       console.log('Fetched username from session storage:', storedUsername);
    };
   
    fetchUserInfo();
   }, []);
   
  
// Define fetchMessages function
const fetchMessages = useCallback(async () => {
  try {
     const response = await fetch(`http://127.0.0.1:5000/fetch-messages/${roomId}`);
     if (response.ok) {
       const data = await response.json();
       console.log('Received data:', data); // Log the received data
       // Directly set the received messages to the state
       setMessages(data.messages);
     } else {
       throw new Error('Failed to fetch messages');
     }
  } catch (error) {
     console.error('Error fetching messages:', error);
  }
 }, [roomId]);
 

// UseEffect hook to fetch messages
useEffect(() => {
  fetchMessages();
  const interval = setInterval(fetchMessages, 5000);
  return () => clearInterval(interval);
}, [fetchMessages, roomId]);

const sendMessage = useCallback(async () => {
  try {
     // Directly send the plain text message without encryption
     const response = await fetch(`http://127.0.0.1:5000/send-message/${roomId}`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         message: newMessage, // Send the plain text message
         sender: storedUsername,
       }),
     });
 
     if (response.ok) {
       console.log('Message sent successfully');
       setNewMessage('');
     } else {
       throw new Error('Failed to send message');
     }
  } catch (error) {
     console.error('Error sending message:', error);
  }
 }, [roomId, newMessage, storedUsername]);

 const leaveRoom = () => {
  // Clear chatroom state
  setMessages([]);
  setNewMessage('');
  // Redirect to the dashboard page
  window.location.href = '/dashboard'; // Adjust the path as needed
 };
 
 
 return (
  <>
     <div className="header">
 <div className="header-content">
    <FontAwesomeIcon icon={faArrowLeft} onClick={leaveRoom} className="leave-icon" size="2x" />
    <p>Leave Room?</p>
 </div>
</div>

     <div className="chat-container">
       <h2 className="chat-title">Chat Room</h2>
       <div className="message-container">
         {messages.slice().reverse().map((message, index) => (
           <div key={index} className={`message ${message.sender === storedUsername ? 'sent' : 'received'}`}>
             <div className="sender">{message.sender === storedUsername ? 'You' : message.sender}</div>
             <div className="message-content">{message.message}</div>
           </div>
         ))}
       </div>
       <div className="input-container">
         <input
           type="text"
           value={newMessage}
           onChange={(e) => setNewMessage(e.target.value)}
           placeholder="Type your message here..."
           className="message-input"
         />
         <button onClick={sendMessage} className="send-button">Send</button>
       </div>
     </div>
  </>
 );
}; 

export default Chatroom;
