import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faUserCircle, faRobot, faCoins,faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './Chat.css';

const Chat = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableTokens, setAvailableTokens] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchAvailableTokens(token);
      fetchUserId();;
    }
  }, [navigate]);

  const fetchAvailableTokens = async (token) => {
    try {
      const response = await axios.get('http://localhost:3000/tokens', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAvailableTokens(response.data.remainingTokens);
    } catch (error) {
      console.error('Error fetching available tokens:', error.response.data);
    }
  };
  const fetchUserId = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/id/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserId(response.data.userId);
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/chat',
        { prompt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages([...messages, { text: prompt, isHuman: true }, { text: response.data.response, isHuman: false }]);
      setError('');
      fetchAvailableTokens(token);
    } catch (error) {
      if (error.response.status === 403) {
        setError('Daily token limit exceeded. Please try again tomorrow.');
      } else if(error.response.status === 429){
        setError('Questions per minute exceeded!');
      }
      else {
        setError('Error communicating with the server. Please try again.');
      }
      console.error('Error:', error.response.data);
    }
    setLoading(false);
    setPrompt('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
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
        <FontAwesomeIcon
          icon={faArrowRightFromBracket}
          className="user-icon"
          onClick={() => setShowUserMenu(!showUserMenu)}
        />
        {showUserMenu && (
          <div className="user-menu">
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
        {showTooltip && (
          <div className="tooltip">
            <p>
              <span>&#8226;</span> You have 2000 tokens per day
            </p>
            <p>
              <span>&#8226;</span> You can ask max 2 questions per 2 minutes
            </p>
          </div>
        )}
        <div className="header">
        <div className="header-text">
            <h2>
              {getGreeting()} Ask your Question{' '}
              {userId ? userId : 'User ID not available'}
            </h2>
          </div>
          <div className="header-right">
            <span className="available-tokens">
              <FontAwesomeIcon icon={faCoins} className="token-icon" /> Available Tokens: {availableTokens}
            </span>
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