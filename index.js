const express = require("express");
const port = process.env.PORT || 3000;
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
var expressLayouts = require("express-ejs-layouts");

// multipart
let multipart = require("connect-multiparty");
let multipartMiddleware = multipart();


//admin firestore

// my-modules
var myModules = require("./my-modules.js");
let database = require('./routes/database');
let boardsRouter = require('./routes/boards')
const {
  all
} = require("./routes/boards");
// const {
//   categoriesInitialize
// } = require("./my-modules.js");

const app = express();
app.set("view engine", "ejs");
app.engine("html", ejs.renderFile);
app.use("/public", express.static(__dirname + "/public"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(expressLayouts);
app.use('/boards', boardsRouter);


let collectionRef = database.db.collection("boards");
myModules.categoriesInitialize(collectionRef);

app.get("/", function (request, response) {
  database.getIndexPostCategories(request, response);
});

app.get("/account", (request, response) => {
  myModules.renderPost(request, response, "boards/account", {});
});
// // imageuploader router
app.post("/public/img/uploads", multipartMiddleware, function (
  request,
  response
) {
  database.uploadImgToStorage(request, response);

});

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}/`);
});