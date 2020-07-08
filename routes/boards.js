let express = require('express');
let router = express.Router();
let myModules = require('../my-modules')
let database = require('./database');
//get method router 
router.get("/:category", (request, response) => {
  response.redirect("/boards/" + request.params.category + "/posts");
})
//category ejs router
router.get("/:category/posts", (request, response) => {
  database.getCategoryPosts(request, response);
});
//new post router 
router.get("/:category/posts/new", (request, response) => {
  myModules.renderPost(request, response, "boards/new_post", {});
});

//post router 
router.get("/:category/posts/:postnum/", (request, response) => {
  database.getPost(request, response);
})

//edit_post router
router.get("/:category/posts/:postnum/edit_post", (request, response) => {
  database.editPost(request, response);
})
//delete post router
router.get("/:category/posts/:postnum/delete", (request, response) => {
  database.deletePost(request, response);
})
//post method router

//update router
router.post("/:category/posts/:postnum/update", (request, response) => {
  database.updatePost(request, response);
})

router.post("/:category/posts/new", (request, response) => {
  database.uploadPost(request, response);
})

module.exports = router;