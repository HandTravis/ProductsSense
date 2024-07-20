import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import './welcome.css';
import backgroundImage from '../Images/background.jpg';

const WelcomePage = () => {


  return (
    <Box className="welcome-container">
      <Container maxWidth="sm" className="welcome-box">
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Welcome to Our Chat Service
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          Have questions? Chat with us and get quick answers!
        </Typography>
        {/* <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 4 }}>
          <Button variant="contained" color="primary" component={Link} to="/login" sx={{ mr: 2 }}>
            Log In
          </Button>
          <Button variant="contained" color="primary" component={Link} to="/signup">
            Sign Up
          </Button>
        </Box> */}
      </Container>
    </Box>
  );
};

export default WelcomePage;