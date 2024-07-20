// chat.js
const express = require('express');
const router = express.Router();

// Define routes for chat
router.get('/', (req, res) => {
  res.send('Chat page');
});

module.exports = router;
