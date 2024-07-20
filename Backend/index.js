//require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const route = require('./route');
const path = require('path');
const app = express();
const cors = require('cors');


app.use(cors());


app.use(bodyParser.json());


app.use('/', route);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});