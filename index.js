const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const ejs = require("ejs");
var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");
var expressLayouts = require('express-ejs-layouts');
// 필요한 module require
// TODO: Replace the following with your app's Firebase project configuration
var firebaseConfig = {
  apiKey: "AIzaSyBhmErfYcpvZFwHTGNiEG6dW1xch_MnXsA",
  authDomain: "duck-craft.firebaseapp.com",
  databaseURL: "https://duck-craft.firebaseio.com",
  projectId: "duck-craft",
  storageBucket: "duck-craft.appspot.com",

};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

app.set("view engine", "ejs");
app.engine("html", ejs.renderFile);
app.use("/public", express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(expressLayouts);


//view engine을 ejs로 설정
//ejs로 render
//현재디렉토리를 static으로 설정
//render는  views폴더 안에 있는 html을 읽는다.

// "/"request "duck-craft/views/"  index.html render
app.get("/", (req, res) => {
  res.render("boards/index", {
    titlename: "Duck-Craft",
    postTitle: "postTitle",
    postUser: "postUser",
    postDate: "postDate"
  });
});
app.get("/signUp", (req, res) => {
  res.render("signUp", {
    titlename: "SIGN UP"
  });
});
app.post("/signUp/user", (req, res) => {

  var name = req.body.userNick;
  var pwd = req.body.userPassword;
  var email = req.body.userEmail;

  res.render("../public/user/user", {
    userNick: name,
    userEmail: email,
    userPassword: pwd
  });


});
// "/boards/:category"request "duck-craft/views/"+boards/category.html render
app.get("/boards/:category", (req, res) => {
  res.render("boards/" + req.params.category, {
    titlename: req.params.category.toUpperCase(),
    category: req.params.category.toUpperCase(),
    postTitle: "postTitle",
    postUser: "postUser",
    postDate: "postDate",
    postLike: "postLike"

  });
});
// "/boards/:category/posts/new"request "duck-craft/views/"+boards/new_post.html render
// category: humor , gossip
app.get("/boards/:category/posts", (req, res) => {
  res.render("boards/" + req.query.action, {
    titlename: req.params.category.toUpperCase(),
    category: req.params.category.toUpperCase(),
    postTitle: "postTitle",
    postUser: "postUser",
    postDate: "postDate",
    postLike: "postLike"
  });
});
//"boards/:catogory/posts?action=new_post" =>"boards/"+req.query.action
//"boards/:catogory/posts?action=edit_post" =? Same
//"boards/:catogory/posts?action=post ""  => Same

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}/`);
});