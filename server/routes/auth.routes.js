const express = require('express');
const router = express.Router();

const authController = require("../controllers/auth.controller");

//register user
router.post("/register", authController.register);

//login user
router.post("/login", authController.login);

//check auth
router.get("/checkAuth", authController.checkAuth);

//add role
router.post("/addRole", authController.addRole);

module.exports = router;