const express = require('express');
const router = express.Router();

const authController = require("../controllers/auth.controller");
const upload = require('../middleware/multer');

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

module.exports = router;