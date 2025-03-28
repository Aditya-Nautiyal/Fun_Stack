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
  return jwt.sign({ userId: user?._id, username: user?.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

module.exports = {
  validateEmail,
  validatePassword,
  generateToken
};
