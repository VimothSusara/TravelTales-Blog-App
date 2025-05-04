const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt.utils");

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = require("../models/user.model");
const Role = require("../models/role.model");

const register = async (req, res) => {
  try {
    const {
      email,
      password,
      username,
      first_name,
      last_name,
      phone_number,
      avatar_url,
    } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    if (!username) {
      return res.status(400).json({ message: "Username is required." });
    }

    if (!first_name) {
      return res.status(400).json({ message: "First Name is required." });
    }

    if (!last_name) {
      return res.status(400).json({ message: "Last Name is required." });
    }

    if (!phone_number) {
      return res.status(400).json({ message: "Phone Number required." });
    }

    const existingUser = await User.findUserWithEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const newUser = await User.register(
      email,
      password,
      username,
      first_name,
      last_name,
      phone_number,
      avatar_url || null
    );

    return res.status(200).json({
      message: "User registered successfully.",
      user: newUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error?.message || "Error while registering user" });
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
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error?.message || "Error while logging in" });
  }
};

const checkAuth = async (req, res) => {
  try {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      return res.status(401).json({ authenticated: true });
    }

    const user = await User.verifyAccessToken(accessToken);

    if (!user) {
      return res.status(403).json({ authenticated: false });
    }

    return res.status(200).json({
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
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error?.message || "Authentication failed" });
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
      return res.status(400).json({ message: "Role is required." });
    }

    const role = await Role.createRole(role_name);

    return res.status(200).json({
      message: "Role added successfully",
      role,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error?.message || "Error while adding role" });
  }
};

module.exports = {
  register,
  login,
  checkAuth,
  logout,
  addRole,
};
