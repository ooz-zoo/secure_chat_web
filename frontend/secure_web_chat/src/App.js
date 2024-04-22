import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chatroom from './components/Chatroom';
import './App.css';

import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat-room/:roomId" element={<Chatroom />} />
      </Routes>
    </Router>
  );
}

export default App;
