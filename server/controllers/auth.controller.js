const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt.utils");
const fs = require("fs");

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = require("../models/user.model");
const Role = require("../models/role.model");

const register = async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);
  try {
    const { email, password, username, first_name, last_name, phone_number } =
      req.body;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required.", success: false });
    }

    if (!password) {
      return res
        .status(400)
        .json({ message: "Password is required.", success: false });
    }

    if (!username) {
      return res
        .status(400)
        .json({ message: "Username is required.", success: false });
    }

    if (!first_name) {
      return res
        .status(400)
        .json({ message: "First Name is required.", success: false });
    }

    if (!last_name) {
      return res
        .status(400)
        .json({ message: "Last Name is required.", success: false });
    }

    if (!phone_number) {
      return res
        .status(400)
        .json({ message: "Phone Number required.", success: false });
    }

    const existingUserWithEmail = await User.findUserWithEmail(email);

    const existingUserWithUsername = await User.findUsername(username);

    if (existingUserWithEmail || existingUserWithUsername) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res
        .status(400)
        .json({ message: "Email or Username already exists.", success: false });
    }

    const avatar_url = req.file
      ? `/uploads/avatars/${req.file.filename}`
      : `/uploads/avatars/default-avatar.png`;

    const newUser = await User.register(
      email,
      password,
      username,
      first_name,
      last_name,
      phone_number,
      avatar_url
    );

    return res.status(200).json({
      message: "User registered successfully.",
      user: newUser,
      success: true,
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: error?.message || "Error while registering user",
      success: false,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    const user = await User.findUserWithEmail(email);

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials." });
    }

    const follow_details = await User.getFollowDetails(user.id);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      user: {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        avatar_url: user.avatar_url,
        follow_details: follow_details,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error?.message || "Error while logging in",
      success: false,
    });
  }
};

const checkAuth = async (req, res) => {
  try {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      return res.status(401).json({ authenticated: false, success: false });
    }

    const user = await User.verifyAccessToken(accessToken);

    if (!user) {
      return res.status(403).json({ authenticated: false, success: false });
    }

    const follow_details = await User.getFollowDetails(user.id);

    return res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        avatar_url: user.avatar_url,
        follow_details: follow_details,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error?.message || "Authentication failed",
      success: false,
    });
  }
};

const logout = async (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.status(200).json({ message: "Logout successful" });
};

const addRole = async (req, res) => {
  try {
    const { role_name } = req.body;

    if (!role_name) {
      return res
        .status(400)
        .json({ message: "Role is required.", success: false });
    }

    const role = await Role.createRole(role_name);

    return res.status(200).json({
      success: true,
      message: "Role added successfully",
      role,
    });
  } catch (error) {
    return res.status(500).json({
      message: error?.message || "Error while adding role",
      success: false,
    });
  }
};

const getProfileWithUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const { user_id } = req.query;

    if (!username) {
      return res
        .status(400)
        .json({ message: "Username is required.", success: false });
    }

    const usernameExists = await User.findUsername(username);

    if (!usernameExists) {
      return res
        .status(404)
        .json({ message: "Username not found.", success: false });
    }

    const profile = await User.getProfileWithUsername(username, user_id || null);

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "Error while fetching profile",
    });
  }
};

module.exports = {
  register,
  login,
  checkAuth,
  logout,
  addRole,
  getProfileWithUsername,
};
