const myModules = {
  getPostsFromBoard: function (collectionRef, name) {
    return collectionRef
      .doc(name)
      .collection("posts")
      .orderBy("uploadtime", "desc")
      .limit(5)
      .get();
  },
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


  timeToString: function (snapshotData) {
    var time = new Date(snapshotData.uploadtime);
    snapshotData.uploadtime = time.toString();
    return snapshotData;
  }
};
module.exports = myModules;