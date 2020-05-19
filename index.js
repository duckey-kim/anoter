const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const ejs = require("ejs");
var fs = require("fs");
var expressLayouts = require("express-ejs-layouts");

// firebase
var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");
var admin = require("firebase-admin");

var serviceAccount = require("./duck-craft-firebase-adminsdk-emrcq-1dd229402e");
var firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://duck-craft.firebaseio.com",
});

var db = admin.firestore();

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
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(expressLayouts);

app.get("/", function (request, response) {
  db.collection("boards")
    .doc("humor")
    .collection("posts")
    .orderBy("uploadtime", "desc")
    .limit(5)
    .get()
    .then((snapshot) => {
      var rows = [];
      snapshot.forEach((doc) => {
        var childData = doc.data();
        childData.postnum = doc.id;
        rows.push(childData);
      });
      response.render("boards/index", {
        titlename: "Duck-Craft",
        postTitle: "postTitle",
        postUser: "postUser",
        postDate: "postDate",
        rows: rows,
      });
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });

  //gossip board 5개 post render ..
});
app.get("/account", (request, response) => {
  response.render("account", {
    titlename: "SIGN UP",
  });
});
// "/boards/:category"request "duck-craft/views/"+boards/category.html render
app.get("/boards/:category", (request, response) => {
  db.collection("boards")
    .doc(request.params.category)
    .collection("posts")
    .get()
    .then((snapshot) => {
      var rows = [];
      snapshot.forEach((doc) => {
        var childData = doc.data();
        childData.postnum = doc.id;
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
    response.redirect("/boards/" + request.params.category);
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

        response.render("boards/" + request.query.action, {
          category: request.params.category,
          titlename: "Duck-Craft",
          row: doc.data(),
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
});
// TODO : edit_post의 form에서 받은 데이터를 firestore에 저장하기!
app.post("/boards/edit", (request, response) => {
  console.log(request.body);
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
app.post("/boards/post", (request, response) => {
  var data = request.body;
  var doc = db
    .collection("boards")
    .doc(request.body.category)
    .collection("posts")
    .doc();
  data.postnum = doc.id;

  db.collection("boards")
    .doc(request.body.category)
    .collection("posts")
    .doc(data.postnum)
    .add(data)
    .then(function () {
      response.redirect("/boards/" + request.body.category);
    })
    .catch(function (error) {
      console.log(error);
    });
});

//'/boards/humor/posts?action=post&number=<%= rows[i].postnum%>'
// app.get("/boards/:category:/posts", (request, response) => {
//   db.collection("boards")
//     .doc(request.params.category)
//     .collection("posts")
//     .doc(request.query.number)
//     .get()
//     .then(doc => {
//       console.log(request.query.number)
//       var data = doc.data()

//       response.render("boards/post", {
//         category: request.params.category,
//         titlename: "Duck-Craft",
//         row: data

//       })
//     })
//     .catch(err => {
//       console.log('Error getting document', err);
//     });
// })
//"boards/:catogory/posts?action=new_post" =>"boards/"+req.query.action
//"boards/:catogory/posts?action=edit_post" =? Same
//"boards/:catogory/posts?action=post ""  => Same

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}/`);
});
