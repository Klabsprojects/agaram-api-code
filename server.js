const mongoose = require('mongoose')
const path = require('path');
const dotenv = require('dotenv');
const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
require("dotenv").config({ path: path.join(__dirname, ".env") });
const routes = require('./src/routes/index.routes');

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/profileImages', express.static(path.join(__dirname, 'profileImages')));
app.use('/uploadNew', express.static(path.join(__dirname, 'src/controllers/employee/uploadsImages')));
app.use('/CommonFileFolders', express.static(path.join(__dirname, 'CommonFileFolders')));
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = process.env.PORT;
const MONGO_URI = 'mongodb://127.0.0.1:27017/agaram';
//const MONGO_URI = 'mongodb://localhost:27017/agaram';
console.log(MONGO_URI);

mongoose
	.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
	.then(() => console.log('DB connected!'))
	.catch(err => console.error('DB connection failed', err));

  app.use(express.urlencoded({ limit: "2mb", extended: true }));
  app.use(express.json({ limit: "3mb" }));
  
  //app.use(cors());
  app.use(cors({
    origin: ['http://localhost:4200', 'https://agaram.a2zweb.in'],
    //, 'https://agaram.a2zweb.in/'], // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT' , 'DELETE'],      // Allow only GET and POST requests
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow only specific headers
}));

  
  app.use(express.static(__dirname + '/view'));
  app.get('/home/', function (req, res) {
      res.sendFile(path.join(__dirname, '/view/', 'index.html'));
  });

  app.use('/api/', routes);

  let server = app.listen(port, () => {
    let host = server.address().address;
    let port = server.address().port;
    console.log('App listening at ', host, port);
});

module.exports = { server };