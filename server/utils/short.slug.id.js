const crypto = require("crypto");

async function generateShortId(length = 8) {
  return crypto.randomBytes(length / 2).toString("hex");
}

module.exports = generateShortId;