const myModules = {
  getPostsFromBoard: function (collectionRef, name) {
    return collectionRef
      .doc(name)
      .collection("posts")
      .orderBy("uploadtime", "asc")
      .limit(5)
      .get();
  },
  millisecondstoString: function (milliseconds) {
    var time = new Date(milliseconds);
    milliseconds = time.toString();
    return;
  },
};
module.exports = myModules;
