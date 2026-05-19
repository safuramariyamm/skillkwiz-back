const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: user.toPublicJSON ? user.toPublicJSON() : user,
      accessToken,
      refreshToken,
    },
  });
};

module.exports = { generateAccessToken, generateRefreshToken, verifyRefreshToken, sendTokenResponse };
