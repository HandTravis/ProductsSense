const express = require('express');
const router = express.Router();
const give_url = require('./pages/give_url');
const chat = require('./pages/chat');




router.get('/', (req, res) => {
    res.send('Welcome to the home page!');
  });

//Page routes

router.use('/chat', chat);
router.use('/give_url', give_url);



module.exports = router;