const express = require("express");
const port = process.env.PORT || 3000;
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
var expressLayouts = require("express-ejs-layouts");
var myModules = require("./my-modules.js");

//admin firestore
var admin = require("firebase-admin");
var serviceAccount = require("./duck-craft-firebase-adminsdk-emrcq-1dd229402e");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://duck-craft.firebaseio.com",
});
var db = admin.firestore();

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

app.get("/", function (request, response) {
  var contents = new Map();
  var allBoardsRef = db.collection("boards");
  allBoardsRef
    .get()
    .then((snapshot) => {
      var count = 0;
      snapshot.forEach((doc) => {
        let name = doc.data().name;
        myModules.getPostsFromBoard(allBoardsRef, name).then((posts) => {
          let p = [];
          posts.forEach((post) => {
            var data = post.data();
            myModules.timeToString(data);
            p.push(data);
          });
          contents.set(name, p);
          count++;
          if (count == snapshot.size) {
            myModules.renderPost(request, response, "boards/index", contents);
          }
        });
      });
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
});

app.get("/account", (request, response) => {
  myModules.renderPost(request, response, "account", {});
});

// "/boards/:category"request "duck-craft/views/"+boards/category.ejs render
app.get("/boards/:category", (request, response) => {
  db.collection("boards")
    .doc(request.params.category)
    .collection("posts")
    .orderBy("uploadtime", "desc")
    .get()
    .then((snapshot) => {
      var rows = [];
      snapshot.forEach((doc) => {
        var childData = doc.data();
        myModules.timeToString(childData);
        rows.push(childData);
      });
      myModules.renderPost(request, response, "boards/category", rows);
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
});
///boards/:category/posts/?action=new_post
app.get("/boards/:category/posts/", (request, response) => {
  myModules.renderPost(request, response, "boards/new_post", {});
});
// new make router for post
//boards/:category/posts/:postnum?action=**
app.get("/boards/:category/posts/:postnum", (request, response) => {

  if (request.query.action == "delete") {
    db.collection("boards")
      .doc(request.params.category)
      .collection("posts")
      .doc(request.params.postnum)
      .get()
      .then((doc) => {
        var docdatauser = doc.data().postuser;
        if (!myModules.isAuthenticated(docdatauser, request.cookies.userName)) {
          response.status(400);
          return response.end("Not Authorized");
        } else {
          db.collection("boards")
            .doc(request.params.category)
            .collection("posts")
            .doc(request.params.postnum)
            .delete();
          return response.redirect("/boards/" + request.params.category);
        }
      });
  } else if (request.query.action == "edit_post") {
    db.collection("boards")
      .doc(request.params.category)
      .collection("posts")
      .doc(request.params.postnum)
      .get()
      .then((doc) => {
        var data = doc.data();

        myModules.renderPost(
          request,
          response,
          "boards/" + request.query.action,
          data
        );
      })
      .catch(function (error) {
        console.log(error);
      });
  } else {
    db.collection("boards")
      .doc(request.params.category)
      .collection("posts")
      .doc(request.params.postnum)
      .get()
      .then((doc) => {
        var docdata = doc.data();
        var postuser = docdata.postuser;
        var time = new Date(docdata.uploadtime);

        docdata.uploadtime = time.toString();
        myModules.renderPost(
          request,
          response,
          "boards/post", {
            data: docdata,
            authorized: myModules.isAuthenticated(
              postuser,
              request.cookies.userName
            ),
          }
        );
      })
      .catch(function (error) {
        console.log(error);
      });
  }
});
// TODO : edit_post의 form에서 받은 데이터를 firestore에 저장하기!
app.post("/edit", (request, response) => {
  db.collection("boards")
    .doc(request.body.category)
    .collection("posts")
    .doc(request.body.postnum)
    .update({
      posttitle: request.body.posttitle,
      postcontent: request.body.postcontent,
      lastmodified: Date.now(),
    })
    .then(function () {
      response.redirect("/boards/" + request.body.category);
    })
    .catch(function (error) {
      console.log(error);
    });
});
//TODO new_post.ejs 에서 온 form 형태의 데이터 저장하기
app.post("/post", (request, response) => {
  console.log(request.body);
  var data = request.body;

  var doc = db
    .collection("boards")
    .doc(request.body.category)
    .collection("posts")
    .doc();
  data.postuser = request.cookies.userName;
  data.postnum = doc.id;
  data.uploadtime = Date.now();
  data.lastmodified = Date.now();
  db.collection("boards")
    .doc(request.body.category)
    .collection("posts")
    .doc(data.postnum)
    .set(data)
    .then(function () {
      response.redirect("/boards/" + request.body.category);
    })
    .catch(function (error) {
      console.log(error);
    });
});
app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}/`);
});