let myModules = require('../my-modules')
var admin = require("firebase-admin");
var serviceAccount = require("../duck-craft-firebase-adminsdk-emrcq-1dd229402e.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://duck-craft.firebaseio.com",
  storageBucket: "duck-craft.appspot.com",
});
var db = admin.firestore();
var storageBucket = admin.storage().bucket();
let collectionRef = db.collection('boards');
const database = {
  db: db,

  getIndexPostCategories: function (request, response) {
    let contents = new Map();

    collectionRef
      .get()
      .then((snapshot) => {
        var count = 0;
        snapshot.forEach((doc) => {
          let name = doc.data().name;

          myModules.getPostsFromBoard(collectionRef, name).then((posts) => {
            let p = [];
            posts.forEach((post) => {
              var data = post.data();
              myModules.timeToString(data);
              p.push(data);
            });
            contents.set(name, p);
            count++;

            if (count == snapshot.size) {
              // Map data sort
              var contentsSorted = new Map([...contents.entries()].sort());
              console.log(contentsSorted.keys());
              myModules.renderPost(
                request,
                response,
                "boards/index",
                contentsSorted
              );
            }
          });
        });
      })
      .catch((err) => {
        console.log("Error getting documents", err);
      });
  },
  getCategoryPosts: function (request, response) {
    collectionRef
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
  },
  getPost: function (request, response) {
    myModules
      .getPostsFromCategory(collectionRef, request)
      .get()
      .then((doc) => {
        var docdata = doc.data();
        myModules.timeToString(docdata);
        var postuser = docdata.postuser;
        myModules.renderPost(request, response, "boards/post", {
          docdata: docdata,
          authorized: myModules.isAuthenticated(
            postuser,
            request.cookies.userName
          ),
        });
      })
      .catch(function (error) {
        console.log(error);
      });

  },
  deletePost: function (request, response) {
    myModules
      .getPostsFromCategory(collectionRef, request)
      .get()
      .then((doc) => {
        var docdatauser = doc.data().postuser;
        var docContent = doc.data().postcontent;
        if (!myModules.isAuthenticated(docdatauser, request.cookies.userName)) {
          response.status(400);
          return response.end("Not Authorized");
        } else {


          myModules.getPostsFromCategory(collectionRef, request).delete();
          return response.redirect("/boards/" + request.params.category);
        }
      });

  },
  editPost: function (request, response) {
    myModules
      .getPostsFromCategory(collectionRef, request)
      .get()
      .then((doc) => {
        var data = doc.data();

        myModules.renderPost(
          request,
          response,
          "boards/edit_post",
          data
        );
      })
      .catch(function (error) {
        console.log(error);
      });
  },
  updatePost: function (request, response) {
    myModules
      .uploadDocRef(collectionRef, request)
      .update({
        posttitle: request.body.posttitle,
        postcontent: request.body.postcontent,
        lastmodified: Date.now(),
      })
      .then(function () {
        response.redirect("/boards/" + request.params.category + "/posts");
      })
      .catch(function (error) {
        console.log(error);
      });
  },
  uploadPost: function (request, response) {
    let data = request.body;
    let uploadDocument = myModules.uploadCollectionRef(collectionRef, request).doc();
    myModules.uploadPostData(
      data,
      uploadDocument,
      request
    );
    myModules
      .uploadCollectionRef(collectionRef, request)
      .doc(data.postnum)
      .set(data)
      .then(function () {
        response.redirect("/boards/" + request.params.category + "/posts");
      })
      .catch(function (error) {
        console.log(error);
      });
  },
  uploadImgToStorage: function (request, response) {
    var bucketName = "duck-craft";
    var filePath = request.files.upload.path;
    var fileName = request.files.upload.name;
    var destinationName = Date.now() + fileName;

    // Creates a client
    async function uploadFile() {
      // Uploads a local file to the bucket
      await storageBucket.upload(filePath, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        // By setting the option `destination`, you can change the name of the
        gzip: true,
        destination: destinationName,
        // object you are uploading to a bucket.
        metadata: {
          // Enable long-lived HTTP caching headers
          // Use only if the contents of the file will never change
          // (If the contents will change, use cacheControl: 'no-cache')
          cacheControl: "public, max-age=31536000",
        },
      });

      console.log(`${fileName} uploaded to ${bucketName}.`);
      response.send({
        url: `https://storage.cloud.google.com/${bucketName}.appspot.com/${destinationName}`,
      });
    }

    uploadFile().catch(console.error);
  },
  //



}

module.exports = database;