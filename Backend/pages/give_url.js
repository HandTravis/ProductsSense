// give_url.js
const express = require('express');
const router = express.Router();

// Define routes for give_url
router.get('/', (req, res) => {
  res.send('Give URL page');
});

module.exports = router;
