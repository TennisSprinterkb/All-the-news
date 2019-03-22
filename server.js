//Setting up dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");
var bodyParser = require("body-parser");

//Port set up
var PORT = process.env.PORT || 8000;

mongoose.connect("mongodb://localhost/")

//Using our express app
var app = express();

//Setting up the router
var router = express.Router();

//Gives access to images and styling and other javascript
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({
    extended: false
}));

//This will make every req go through our router midware
app.use(router);

app.listen(PORT, function() {
    console.log("We are live on port:" + PORT);
});

//Creating mongolab on ⬢ kb-news... free
// Welcome to mLab.  Your new subscription is being created and will be available shortly.  Please consult the mLab Add-on Admin UI to check on its progress.
// Created mongolab-colorful-91685 as MONGODB_URI
// Use heroku addons:docs mongolab to view documentation