import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faUserCircle, faRobot, faCoins, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './chat.css';

const Chat = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableTokens, setAvailableTokens] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userId, setUserId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/chat', { prompt });
      setMessages([...messages, { text: prompt, isHuman: true }, { text: response.data.response, isHuman: false }]);
      setError('');
    } catch (error) {
      if (error.response.status === 403) {
        setError('Daily token limit exceeded. Please try again tomorrow.');
      } else if (error.response.status === 429) {
        setError('Questions per minute exceeded!');
      } else {
        setError('Error communicating with the server. Please try again.');
      }
      console.error('Error:', error.response.data);
    }
    setLoading(false);
    setPrompt('');
  };

  const [showTooltip, setShowTooltip] = useState(false);

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return "Good Morning!";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Good Afternoon!";
    } else {
      return "Good Evening!";
    }
  };

  return (
    <div className="background-container">
      <div className="chat-container">
        <FontAwesomeIcon
          icon={faInfoCircle}
          className="info-icon"
          onMouseEnter={toggleTooltip}
          onMouseLeave={toggleTooltip}
        />
        <div className="header">
          <div className="header-text">
            <h2>
              {getGreeting()} Ask your Question
            </h2>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="message-list">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.isHuman ? 'user-message' : 'bot-message'}`}>
              <span className="message-icon">
                {message.isHuman ? <FontAwesomeIcon icon={faUserCircle} /> : <FontAwesomeIcon icon={faRobot} />}
              </span>
              <span className={`message-text ${message.isHuman ? 'user-message-text' : 'bot-message-text'}`}>
                {message.text}
              </span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="message-input">
          <textarea
            placeholder="Type your message..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          ></textarea>
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
