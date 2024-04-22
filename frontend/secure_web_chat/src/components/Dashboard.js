import React, { useState, useEffect } from 'react';
import '../App.css'; // Import CSS for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage } from '@fortawesome/free-solid-svg-icons';


const Dashboard = () => {
 const [rooms, setRooms] = useState([]);
 const [newRoomName, setNewRoomName] = useState('');
 const [newRoomDescription, setNewRoomDescription] = useState('');
 const [message, setMessage] = useState('');
 const [selectedRoom, setSelectedRoom] = useState(null);
 const [username, setUsername] = useState('');
 const [showUsernameModal, setShowUsernameModal] = useState(false);

 useEffect(() => {
    fetchRooms(); // Fetch rooms when component mounts
    const interval = setInterval(fetchRooms, 5000); // Poll rooms every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
 }, []);

 const fetchRooms = () => {
    fetch('http://127.0.0.1:5000/fetch-rooms')
      .then(response => response.json())
      .then(data => {
        setRooms(data.rooms.map(room => ({
          ...room,
          joined: false, // Add joined property
        })));
      })
      .catch(error => {
        console.error('Error fetching rooms:', error);
      });
 };

 const createRoom = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newRoomName, description: newRoomDescription }),
      });

      const data = await response.json();
      setMessage(data.message); // Update message state with success message
      setNewRoomName('');
      setNewRoomDescription('');

      fetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      setMessage('Failed to create room. Please try again.'); // Set error message
    }
 };

 const joinRoom = (roomId) => {
    // Open the username modal
    setShowUsernameModal(true);
    // Set the selected room
    setSelectedRoom(roomId);
 };

 const handleUsernameSubmit = () => {
    // Check if username is valid (e.g., not empty)
    if (username.trim() === '') {
      alert('Please enter a valid username.');
      return;
    }

    // Store username in session or local storage
    sessionStorage.setItem('username', username);
    // Close the username modal
    setShowUsernameModal(false);
    // Navigate to the ChatRoom component with the roomId as a URL parameter
    window.location.href = `/chat-room/${selectedRoom}`;
 };

 return (
    <div className="dashboard-container">
      {/* Create Room section */}
      <h2 style={{ marginTop: '20px' }}>Create Room</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Room Name"
          value={newRoomName}
          onChange={e => setNewRoomName(e.target.value)}
          style={{ borderRadius: '5px', border: '4px solid #ccc', padding: '5px', width: '300px', marginBottom: '10px', height: '50px', marginTop: '30px' }}
        />
        <input
          type="text"
          placeholder="Room Description"
          value={newRoomDescription}
          onChange={e => setNewRoomDescription(e.target.value)}
          style={{ borderRadius: '5px', border: '4px solid #ccc', padding: '5px', width: '300px', marginBottom: '10px', height: '50px'}}
        />
        <button onClick={createRoom} style={{ borderRadius: '5px', backgroundColor: '#5865F2', color: '#FFFFFF', padding: '5px 10px', marginBottom: '10px', height: '50px' }}>Create Room</button>
        <p style={{ marginBottom: '20px' }}>{message}</p> {/* Display the message here */}
      </div>

      {/* Room list section */}
      <h2 style={{ marginTop: '20px' }}>Rooms</h2>
      <div className="rooms-container">
        {rooms.length === 0 ? (
          <div className="no-rooms-message">
             <FontAwesomeIcon icon={faMessage} className="your-icon-class" />
            <p>No rooms available. Create a room to get started!</p>
          </div>
        ) : (
          rooms.map(room => (
            <div key={room.id} className="room-container" style={{ backgroundColor: room.color, padding: '20px', borderRadius: '5px', marginBottom: '20px', position: 'relative' }}>
              <div className="room-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #5865F2', paddingBottom: '10px' }}>
                <span className="room-name" style={{ fontWeight: 'bold', fontSize: '18px', color: '#FFFFFF', alignItems: 'left' }}>{room.name}</span>
                <button className="join-button" onClick={() => joinRoom(room.id)} style={{ borderRadius: '5px', backgroundColor: '#5865F2', color: '#FFFFFF', padding: '5px 10px', marginLeft: '10px' }}>
                 Join
                </button>
              </div>
              <div className="room-details" style={{ padding: '10px', alignItems: 'left' }}>
                <p style={{ marginBottom: '5px', color: '#FFFFFF' }}>{room.description}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>Created at: {room.created_at}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Username input modal */}
      {showUsernameModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Enter Your Username</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <button onClick={handleUsernameSubmit}>Submit</button>
          </div>
        </div>
      )}
    </div>
 );
};

export default Dashboard;
