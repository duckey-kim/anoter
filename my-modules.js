const myModules = {
  //getRef
  getPostsFromBoard: function (collectionRef, name) {
    return collectionRef
      .doc(name)
      .collection("posts")
      .orderBy("uploadtime", "desc")
      .limit(5)
      .get();
  },
  getPostsFromCategory: function (collectionRef, request) {
    return collectionRef.doc(request.params.category).collection("posts").doc(request.params.postnum);
  },

  //postREf
  uploadCollectionRef: function (collectionRef, request) {
    return collectionRef.doc(request.body.category).collection("posts");
  },
  uploadDocRef: function (collectionRef, request) {
    return this.uploadCollectionRef(collectionRef, request).doc(request.body.postnum);
  },

  //render
  renderPost: function (request, response, path, postdata) {
    response.render(path, {
      titleName: "Duck-Craft",
      category: request.params.category,
      userName: request.cookies.userName,
      userEmail: request.cookies.userEmail,
      userUid: request.cookies.userUid,
      data: postdata,
    })
  },
  isAuthenticated: function (cookiename, postuser) {
    if (cookiename == postuser) {
      return true;
    } else {
      return false;
    }
  },

  //data
  timeToString: function (snapshotData) {
    var time = new Date(snapshotData.uploadtime);
    var year = time.getFullYear();
    var month = time.getMonth() + 1;
    var day = time.getDate();
    var hour = time.getHours();
    var minutes = time.getMinutes();
    snapshotData.uploadtime = `${year}-${month}-${day} ${hour}:${minutes}`
    return snapshotData;
  },
  setDataFromUser: function (data, doc, request) {
    data.postuser = request.cookies.userName;
    data.postnum = doc.id;
    data.uploadtime = Date.now();
    data.lastmodified = Date.now();
    return data;
  }



};
module.exports = myModules;