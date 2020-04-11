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
app.get("/nav1", (req, res) => {
  res.render("nav1");
});
app.get("/nav2", (req, res) => {
  res.render("nav2");
});
app.get("/nav3", (req, res) => {
  res.render("nav3");
});
app.get("/nav4", (req, res) => {
  res.render("nav4");
});
app.get("/signUp", (req, res) => {
  res.render("signUp");
});
app.get("/write", (req, res) => {
  res.render("write");
});

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}/`);
});