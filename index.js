const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const ejs = require("ejs");
// 필요한 module require

app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.use(express.static(__dirname));
//view engine을 html로 설정
//ejs로 render
//현재디렉토리를 static으로 설정
//render는  views폴더 안에 있는 html을 읽는다.

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/boards/humor", (req, res) => {
  res.render("board1");
});
app.get("/boards/gossip", (req, res) => {
  res.render("board2");
});
app.get("boards/humor/posts/new", (req, res) => {
  res.render("new_post");
});
app.get("/write", (req, res) => {
  res.render("write");
});

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}/`);
});