//Setting up dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");
var bodyParser = require("body-parser");
var Article = require("./models/Article.js");
var Note = require("./models/Note.js");

//Port set up
var PORT = process.env.PORT || 8000;

//Using our express app
var app = express();

//Gives access to images and styling and other javascript
app.use(express.static("public"));

//Setting up the router
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//Connecting handlebars to express
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//Saying once deployed use database, otherwise use the local article database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/kbmongoHeadlines";

//Connecting mongoose to our database
mongoose.connect(MONGODB_URI, {useNewUrlParser: true }, function(error){
    if (error) {
        console.log(error);
    }
    else {
        console.log("connected mongoose")
    }
});

app.delete("/articles/:id", function(req, res) {
    var id = req.params.id;
    Article.findByIdAndRemove(id).then(() => res.status(200).json({result:"success"}));
  });
  
  app.post("/articles", async function(req, res) {
    const newArticle = new Article(req.body);
    const duplicateArticles = await Article.find({headline:req.body.headline}).select('headline');
    if (duplicateArticles && duplicateArticles.length !== 0) {
      return res.status(400).json({result:"failed"});
    }
    newArticle.save().then(() => res.status(200).json({result:"success"}));
  });
  
  app.post("/articles/:articleId/notes", function(req, res) {
    const newNote = new Note(req.body);
    newNote.save().then((noteDoc) => {
      var articleId = req.params.articleId;
      Article.findById(articleId).then((articleDocument) => {
        articleDocument.notes.push(noteDoc._id);
        articleDocument.save().then(() => res.status(200).json({result:"success"}));
      });
    });
  });
  
  app.delete("/articles/:articleId/notes/:id", function(req, res) {
    var id = req.params.id;
    var articleId = req.params.articleId;
    Article.findById(articleId).then((articleDoc) => {
      articleDoc.notes.pull(id);
      articleDoc.save();
    });
    Note.findByIdAndRemove(id).then(() => {
      res.status(200).json({result:"success"})
    });
  });
  
  app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://observer.com/").then(function(response) {
      var $ = cheerio.load(response.data);

        var results = [];
      
      $("article.type-post").each(function(i, element) {
      var cheerioElement = $(element);
      var a = cheerioElement.find("a.module-entry-full-anchor");
      var link = a.attr("href");
    
      var headline = (a.contents()[0].data || "").trim();
      console.log(headline);
      var descElement = cheerioElement.find("h2.module-entry-title");
      console.log(descElement);
      var summary = (descElement.contents()[0].data || "").trim();
      console.log(summary);

      results.push({
        headline: headline,
        link: link,
        summary: summary
      });
    });
    res.render("scrape", {articles:results})
  });
});

app.get("/saved", async function(req, res) {
    const articles = await Article.find().select('headline summary link').populate('notes');
    res.render("saved", {articles:articles});
  });
  
app.get("/", function(req, res) {
    res.render("index");
  });

app.listen(PORT, function() {
    console.log("We are live on port:" + PORT);
});