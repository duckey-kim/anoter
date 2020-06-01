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
var allBoardsRef = db.collection("boards");
app.get("/", function (request, response) {
  var contents = new Map();

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
    myModules.getPostsFromCategory(allBoardsRef, request).get()
      .then((doc) => {
        var docdatauser = doc.data().postuser;
        if (!myModules.isAuthenticated(docdatauser, request.cookies.userName)) {
          response.status(400);
          return response.end("Not Authorized");
        } else {
          myModules.getPostsFromCategory(allBoardsRef, request)
            .delete();
          return response.redirect("/boards/" + request.params.category);
        }
      });
  } else if (request.query.action == "edit_post") {
    myModules.getPostsFromCategory(allBoardsRef, request).get()
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
    //posts/:postnum
    myModules.getPostsFromCategory(allBoardsRef, request).get()
      .then((doc) => {
        var docdata = doc.data();
        myModules.timeToString(docdata)
        var postuser = docdata.postuser;
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
  myModules.uploadDocRef(allBoardsRef, request)
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

  myModules.setDataFromUser(request.body, myModules.uploadCollectionRef(allBoardsRef, request).doc(), request);
  myModules.uploadCollectionRef(allBoardsRef, request)
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