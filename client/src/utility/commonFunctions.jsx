export const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(text)) {
      return false
    };
    return true;
}

export const validatePassword = (text) => {
  return ({
    hasUpperCase: /[A-Z]/.test(text),
    hasNumber: /\d/.test(text),
    hasSpecialChar: /[!@#$%^&*]/.test(text),
    hasMinLength: text.length >= 8,
  });
}