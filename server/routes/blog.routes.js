const express = require("express");
const router = express.Router();

const blogController = require("../controllers/blog.controller");
const uploadBlogImages = require("../middleware/upload.blog.images");

const authTokenMiddleware = require("../middleware/auth.token.middleware");

//get blogs by filters
router.get("/list", blogController.getBlogLists);

//get blogs for user
router.get("/list/user/:id", blogController.getUserBlogs);

//get blog by id
router.get("/get/:id", blogController.getBlogById);

//get blog by slug
router.get("/getBySlug/:slug", blogController.getBlogBySlug);

//get blog comments
router.get("/comments/:id", blogController.getBlogComments);

router.use(authTokenMiddleware);

//create blog
router.post(
  "/create",
  uploadBlogImages.single("blog_image"),
  blogController.createBlog
);

//update blog
router.put(
  "/update/:id",
  uploadBlogImages.single("blog_image"),
  blogController.updateBlog
);

//delete blog
// router.delete("/delete/:id", blogController.deleteBlog);

//like blog
router.post("/like/:id", blogController.likeBlog);

//unlike blog
router.post("/unlike/:id", blogController.unlikeBlog);

//comment blog
router.post("/comment/:id", blogController.commentBlog);

module.exports = router;