const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const access_token = req.cookies.access_token;

  if (!access_token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ error: "Access token has expired" });
    }
    res.status(401).json({ error: "Invalid access token" });
  }
};

module.exports = authenticateToken;
