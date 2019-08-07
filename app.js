var expressSanitizer = require('express-sanitizer');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var express = require('express');
var app = express();

// Applicaton Configuration
mongoose.connect("mongodb://localhost/blog_app", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//Schema 
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

//Models the Schema into a MongoDB Model
var Blog = mongoose.model("Blog", blogSchema);

//RESTful Routes
app.get("/", function(req, res){
    res.redirect("/blogs");
});

// Index Route
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

//New Route
app.get("/blogs/new", function(req, res){
    res.render("new");
});

//Create Route
app.post("/blogs", function(req, res){
    // Create Blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

// Show Route
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

//Edit Route
app.get("/blogs/:id/edit", function(req, res){
    // Edit Blog
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

//Update Route
app.put("/blogs/:id", function(req, res){
    // Update blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err) {
            res.redirect("/blogs");
        } else {
            // Redirect to Show Route
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// Delete Route
app.delete("/blogs/:id", function(req, res){
    // Destroy Blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.listen("3030", function(){
    console.log("The Blog App Server has started!!");
});