import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Login from './pages/Login';
// import Signup from './pages/Signup';
//import Chat from './pages/chat';
import WelcomePage from './pages/welcome';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          {/* <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} /> */}
          {/* <Route path="/chat" element={<Chat />} /> */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;