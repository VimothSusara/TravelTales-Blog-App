const express = require("express");
const router = express.Router();

const blogController = require("../controllers/blog.controller");
const uploadBlogImages = require("../middleware/upload.blog.images");

const authTokenMiddleware = require("../middleware/auth.token.middleware");

router.use(authTokenMiddleware);

//create blog
router.post(
  "/create",
  uploadBlogImages.single("blog_image"),
  blogController.createBlog
);

//get blog by id
router.get("/get/:id", blogController.getBlogById);

//get blog by slug
router.get("/getBySlug/:slug", blogController.getBlogBySlug);

//update blog
router.put(
  "/update/:id",
  uploadBlogImages.single("blog_image"),
  blogController.updateBlog
);

//delete blog
// router.delete("/delete/:id", blogController.deleteBlog);



module.exports = router;
