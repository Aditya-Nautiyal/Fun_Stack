const jwt = require("jsonwebtoken");

const validateEmail = (text) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(text)) {
    return false;
  }
  return true;
};

const validatePassword = (text) => {
  return {
    hasUpperCase: /[A-Z]/.test(text),
    hasNumber: /\d/.test(text),
    hasSpecialChar: /[!@#$%^&*]/.test(text),
    hasMinLength: text.length >= 8,
  };
};

const generateToken = (user) => {
  //generate secrete key - node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  const accessToken = jwt.sign(
    { userId: user?._id, username: user?.email },
    process.env.ACCESS_JWT_SECRET,
    { expiresIn: "1h" }
  );
  const refreshToken = jwt.sign(
    { userId: user?._id, username: user?.email },
    process.env.REFRESH_JWT_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

module.exports = {
  validateEmail,
  validatePassword,
  generateToken,
};
