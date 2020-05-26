const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const ejs = require("ejs");
var expressLayouts = require("express-ejs-layouts");
var myModules = require("./my-modules.js");
var firebase = require("firebase/app");
// const stream = require("stream");
var admin = require("firebase-admin");
require("firebase/auth");
require("firebase/firestore");
// const {
//   Storage
// } = require("@google-cloud/storage");
//amdin sdk firebase
var serviceAccount = require("./duck-craft-firebase-adminsdk-emrcq-1dd229402e");
var firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://duck-craft.firebaseio.com",

});

var db = admin.firestore();
var firebaseConfig = {
  apiKey: "AIzaSyBhmErfYcpvZFwHTGNiEG6dW1xch_MnXsA",
  authDomain: "duck-craft.firebaseapp.com",
  databaseURL: "https://duck-craft.firebaseio.com",
  projectId: "duck-craft",
  storageBucket: "duck-craft.appspot.com",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// const googleCloud = new Storage({
//   keyFilename: "duck-craft-3f07f59e4eee.json",
//   projectId: 'duck-craft'
// });
// googleCloud.getBuckets().then(x => console.log(x));
app.set("view engine", "ejs");
app.engine("html", ejs.renderFile);
app.use("/public", express.static(__dirname + "/public"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(expressLayouts);

// router get '/' render index.ejs
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
            var time = new Date(data.uploadtime);
            data.uploadtime = time.toString();
            p.push(data);
          });
          contents.set(name, p);
          count++;
          if (count == snapshot.size) {
            response.render("boards/index", {
              titlename: "Duck-Craft",
              contents: contents,
            });
          }
        });
      });
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
});

app.get("/account", (request, response) => {
  response.render("account", {
    titlename: "SIGN UP",
  });
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
        childData.postnum = doc.id;
        var time = new Date(childData.uploadtime);
        childData.uploadtime = time.toString();

        rows.push(childData);
      });
      response.render("boards/category", {
        category: request.params.category,
        titlename: "Duck-Craft",
        rows: rows,
      });
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
});
// request /boards/:category/posts?action =edit_post,new_post
///boards/:category/posts?action=delete
app.get("/boards/:category/posts", (request, response) => {
  console.log(request.user)
  console.log(request.query.action, request.query.number);
  if (request.query.action == "new_post") {
    response.render("boards/new_post", {
      category: request.params.category,
      titlename: "Duck-Craft",
    });
  } else if (request.query.action == "delete") {
    db.collection("boards")
      .doc(request.params.category)
      .collection("posts")
      .doc(request.query.number)
      .delete();

    return response.redirect("/boards/" + request.params.category);
  } else {
    //post,edit_post
    db.collection("boards")
      .doc(request.params.category)
      .collection("posts")
      .doc(request.query.number)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          console.log("No such document!");
        } else {
          console.log("Document data:", doc.data());
        }
        var data = doc.data();
        var time = new Date(data.uploadtime);
        data.uploadtime = time.toString();
        response.render("boards/" + request.query.action, {
          category: request.params.category,
          titlename: "Duck-Craft",
          row: data,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
});
// TODO : edit_post의 form에서 받은 데이터를 firestore에 저장하기!
app.post("/edit", (request, response) => {
  console.log(request.body);
  console.log(request.body.postimage);
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
  console.log(request.body);
  var doc = db
    .collection("boards")
    .doc(request.body.category)
    .collection("posts")
    .doc();
  //TODO : get doc.id and push the data
  //TODO current userdisplayname push

  data.postnum = doc.id;
  data.uploadtime = Date.now();
  data.lastmodified = Date.now();
  console.log(data);
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