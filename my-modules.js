String.prototype.string = function (len) {
  var s = "",
    i = 0;
  while (i++ < len) {
    s += this;
  }
  return s;
};
String.prototype.zf = function (len) {
  return "0".string(len - this.length) + this;
};
Number.prototype.zf = function (len) {
  return this.toString().zf(len);
};
let categories = [];
const myModules = {
  categoriesInitialize: function (allBoardsRef) {
    allBoardsRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        let name = doc.data().name;
        categories.push(name);
      });
    });
    categories.sort();
    return categories;
  },
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
    return collectionRef
      .doc(request.params.category)
      .collection("posts")
      .doc(request.params.postnum);
  },

  //postREf
  uploadCollectionRef: function (collectionRef, request) {
    return collectionRef.doc(request.body.category).collection("posts");
  },
  uploadDocRef: function (collectionRef, request) {
    return this.uploadCollectionRef(collectionRef, request).doc(
      request.body.postnum
    );
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
      categories: categories,
    });
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
    var month = (time.getMonth() + 1).zf(2);
    var day = time.getDate().zf(2);
    var hour = time.getHours().zf(2);
    var minutes = time.getMinutes().zf(2);
    snapshotData.uploadtime = `${year}-${month}-${day} ${hour}:${minutes}`;
    return snapshotData;
  },
  setDataFromUser: function (data, doc, request) {
    data.postuser = request.cookies.userName;
    data.postnum = doc.id;
    data.uploadtime = Date.now();
    data.lastmodified = Date.now();
    return data;
  },
};
module.exports = myModules;
