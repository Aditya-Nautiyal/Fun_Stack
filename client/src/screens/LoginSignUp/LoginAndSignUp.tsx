import React, { useState, useEffect, useTransition } from "react";
import { jwtDecode } from "jwt-decode";
import SpaceFiller from "../../components/spaceFiller/SpaceFiller.jsx";
import {
  validateEmail,
  validatePassword,
} from "../../utility/commonFunctions.jsx";
import {
  loginUser,
  registerUser,
  urlGenerator,
} from "../../services/apiCall.js";
import { toast } from "react-toastify";
import {
  LOGIN,
  EMAIL_ADDRESS,
  INVALID_MAIL,
  PASSWORD,
  DONOT_HAVE_ACCESS,
  REGISTER,
  SIGN_UP,
  ALREADY_ACCOUNT,
  AT_LEAST_UPPER_CASE,
  AT_LEAST_DIGITS,
  AT_LEAST_SPECIAL_CHARACTERS,
  AT_LEAST_LETTERS,
  SHOW_PASSWORD,
} from "../../constants/string.jsx";
import "./LoginAndSignUp.css";
import {
  GENERIC_FAILIURE,
  GENERIC_SUCCESS,
  SUCCESS,
} from "../../constants/codes.jsx";
import { useNavigate } from "react-router-dom";
import { MemoryGame } from "../../constants/navigation.jsx";
import { ToastMsgStructure } from "../../components/toastMsg/ToastMsgStructure.jsx";
import LanguageSelector from "../../components/languageSelector/LanguageSelector.js";
import { useTranslation } from "react-i18next";

function LoginAndSignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [passwordValidation, setPasswordValidation] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const validationStringArray = [
    AT_LEAST_UPPER_CASE,
    AT_LEAST_DIGITS,
    AT_LEAST_SPECIAL_CHARACTERS,
    AT_LEAST_LETTERS,
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(MemoryGame, { replace: true });
    }
  }, []);

  useEffect(() => {
    setPasswordValidation(validatePassword(password));
  }, [password]);

  const onEmailChange = (e) => {
    setEmail(e.target.value);
    if (e.target.value !== "") {
      setEmailError(validateEmail(e.target.value));
    } else {
      setEmailError(false);
    }
  };

  const onPasswordChange = (e) => {
    setPassword(e.target.value);
    if (e.target.value === "") {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  };

  const onLogin = async () => {
    setIsLoading(true);
    const result = await loginUser(urlGenerator("login"), {
      email,
      password,
    });
    if (String(result?.data?.statusCode) === GENERIC_SUCCESS) {
      toast.success(result?.data?.desc, ToastMsgStructure);
      const tokenFromBE = result?.data?.token;
      const decodedToken = jwtDecode(tokenFromBE);
      const { username } = decodedToken || "";
      localStorage.setItem("token", tokenFromBE);
      navigate(MemoryGame, { state: { emailFromProps: username } });
    } else if (String(result?.data?.statusCode) === GENERIC_FAILIURE) {
      toast.error(result?.data?.desc, ToastMsgStructure);
    } else {
      toast.error("Error...", ToastMsgStructure);
    }
    setIsLoading(false);
  };

  const onSignUp = async () => {
    setIsLoading(true);
    const result = await registerUser(urlGenerator("register"), {
      email,
      password,
    });
    if (String(result?.data?.statusCode) === GENERIC_SUCCESS) {
      toast.success(result?.data?.desc, ToastMsgStructure);
    } else if (String(result?.data?.statusCode) === GENERIC_FAILIURE) {
      toast.error(result?.data?.desc, ToastMsgStructure);
    } else {
      toast.error("Error...", ToastMsgStructure);
    }
    setIsLoading(false);
  };

  const changeLanguage = (lang: string | undefined) => {
    i18n.changeLanguage(lang);
  };

  const isLoginButtonEnabled = () => {
    if (
      !emailError &&
      !passwordError &&
      email.length > 0 &&
      password.length > 0 &&
      !isLoading
    )
      return true;
    return false;
  };

  const isSignUpButtonEnabled = () => {
    if (
      !emailError &&
      !passwordError &&
      email.length > 0 &&
      password.length > 0 &&
      Object.values(passwordValidation).every((value) => value === true) &&
      !isLoading
    )
      return true;
    return false;
  };

  const onFlip = () => {
    setIsLogin(!isLogin);
    reset();
  };

  const handleCheckboxChange = () => {
    setShowPassword(!showPassword);
  };

  const preventCopyPasteCut = (e) => {
    e.preventDefault();
  };

  const reset = () => {
    setEmail("");
    setPassword("");
    setEmailError(false);
    setPasswordError(false);
    setShowPassword(false);
  };

  const loginStructure = () => {
    return (
      <div className="loginWrapper">
        <div className="loginHeader common-flex-box">{t("login")}</div>
        <SpaceFiller margin="15px" />
        <div className="emailHeader">{t("emailAddress")}</div>
        <SpaceFiller />
        {emailAndPasswordStructure()}
        <SpaceFiller margin="30px" />
        <button
          className={
            isLoginButtonEnabled() ? "submitButton" : "submitButtonDisabled"
          }
          onClick={onLogin}
        >
          {t("login")}
        </button>
        <SpaceFiller margin="20px" />
        <div className="registerUserWrapper common-flex-box">
          <div className="donotHaveAccountText">{t("doNotHaveAccess")}</div>
          <div className="registerText" onClick={onFlip}>
            <u>{t("register")}</u>
          </div>
        </div>
        <SpaceFiller margin="20px" />
        <div className="common-flex-box">
          <LanguageSelector
            defaultLanguage={i18n.language || "en"}
            onChange={(lan) => changeLanguage(lan)}
          />
        </div>
      </div>
    );
  };

  const signUpStructure = () => {
    return (
      <div className="signUpWrapper">
        <div className="loginHeader common-flex-box">{SIGN_UP}</div>
        <SpaceFiller margin="15px" />
        <div className="emailHeader">{t("emailAddress")}</div>
        <SpaceFiller />
        {emailAndPasswordStructure()}
        <SpaceFiller margin="10px" />
        <div className={password?.length > 0 ? "visible" : "hidden"}>
          {Object.keys(passwordValidation)?.map((key, index) => (
            <div className={"validationRow"} key={`${key}${index}`}>
              <div
                className={
                  passwordValidation[key] ? "successText" : "errorText"
                }
              >
                {passwordValidation[key] ? "✔" : "✖"}
              </div>
              <div>{validationStringArray[index]}</div>
            </div>
          ))}
        </div>
        <SpaceFiller margin="20px" />
        <button
          className={
            isSignUpButtonEnabled() ? "submitButton" : "submitButtonDisabled"
          }
          onClick={onSignUp}
        >
          {t("signUp")}
        </button>
        <SpaceFiller margin="20px" />
        <div className="registerUserWrapper common-flex-box">
          <div className="donotHaveAccountText">{t("alreadyAccount")}</div>
          <div className="registerText" onClick={onFlip}>
            <u>{t("login")}</u>
          </div>
        </div>
        <SpaceFiller margin="20px" />
        <div className="common-flex-box">
          <LanguageSelector
            defaultLanguage={i18n.language || "en"}
            onChange={(lan) => changeLanguage(lan)}
          />
        </div>
      </div>
    );
  };

  const emailAndPasswordStructure = () => {
    return (
      <>
        <input
          type="email"
          value={email} // Bind the input value to the state
          onChange={onEmailChange} // Call handleInputChange on every keystroke
          placeholder={t("emailAddress")}
          className="inputEmail"
          required
        />
        {emailError && (
          <>
            <SpaceFiller margin="5px" />
            <div className="errorMessage">{`**${t("invalidEmail")}`}</div>
          </>
        )}
        <SpaceFiller margin="15px" />
        <div className="passwordHeader">{t("password")}</div>
        <SpaceFiller />
        <input
          type={showPassword ? "text" : "password"}
          value={password} // Bind the input value to the state
          onChange={onPasswordChange} // Call handleInputChange on every keystroke
          placeholder={t("password")}
          className="inputPassword"
          required
          onCopy={preventCopyPasteCut} // Disable copy
          onPaste={preventCopyPasteCut} // Disable paste
          onCut={preventCopyPasteCut} // Disable cut
        />
        <SpaceFiller margin="10px" />
        <div className="checkBoxWrapper">
          <input
            type="checkbox" // Checkbox input type
            checked={showPassword} // Set checked based on state
            onChange={handleCheckboxChange} // Handle change event
            className="passwordCheckbox"
          />
          <div>{t("showPassword")}</div>
        </div>
      </>
    );
  };

  return (
    <div className="parentLoginWrapper common-flex-box">
      <div className={`loginComponentWrapper ${!isLogin ? "flip" : ""}`}>
        {isLogin ? loginStructure() : signUpStructure()}
      </div>
    </div>
  );
}

export default LoginAndSignUp;
