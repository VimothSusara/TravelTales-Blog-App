const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const blogController = require("../controllers/blog.controller");
const upload = require("../middleware/multer");

const authTokenMiddleware = require("../middleware/auth.token.middleware");

//register user
router.post("/register", upload.single("avatar"), authController.register);

//login user
router.post("/login", authController.login);

//check auth
router.get("/checkAuth", authController.checkAuth);

//add role
router.post("/addRole", authController.addRole);

//logout user
router.get("/logout", authController.logout);

//get profile
router.get("/profile/:username", authController.getProfileWithUsername);

router.use(authTokenMiddleware);

//follow user
router.post("/follow/:id", blogController.followUser);

//unfollow user
router.post("/unfollow/:id", blogController.unfollowUser);

module.exports = router;
