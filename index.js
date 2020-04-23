const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const ejs = require("ejs");
// 필요한 module require

app.set("view engine", "html");
app.engine("html", ejs.renderFile);
app.use("/public", express.static(__dirname + "/public"));
//view engine을 html로 설정
//ejs로 render
//현재디렉토리를 static으로 설정
//render는  views폴더 안에 있는 html을 읽는다.

// "/"request "duck-craft/views/"  index.html render
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/signUp", (req, res) => {
  res.render("boards/signUp");
});

// "/boards/:category"request "duck-craft/views/"+boards/category.html render
app.get("/boards/:category", (req, res) => {
  res.render("boards/" + req.params.category);
});
// "/boards/:category/posts/new"request "duck-craft/views/"+boards/new_post.html render
// category: humor , gossip
app.get("/boards/:category/posts", (req, res) => {
  res.render("boards/" + req.query.action);
});
//"boards/:catogory/posts?action=new_post" =>"boards/"+req.query.action
//"boards/:catogory/posts?action=edit_post" =? Same
//"boards/:catogory/posts?action=post ""  => Same

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}/`);
});
