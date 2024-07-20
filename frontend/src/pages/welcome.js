import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, TextField } from '@mui/material';
import './welcome.css';
import backgroundImage from '../Images/background.jpg';
import axios from 'axios';

const WelcomePage = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:3000/give_url', { url });
      navigate('/chat');
    } catch (error) {
      console.error('Error sending product data:', error);
    }
  };

  return (
    <Box className="welcome-container">
      <Container maxWidth="sm" className="welcome-box">
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Welcome to Our Recommendation Service
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          Want to know the best product? Chat with us and get quick answers!
        </Typography>
        
        <Box mt={4} textAlign="center">
          <TextField
            label="Enter URL"
            variant="outlined"
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder=""
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default WelcomePage;
