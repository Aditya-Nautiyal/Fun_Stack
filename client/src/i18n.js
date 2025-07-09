import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { DONOT_HAVE_ACCESS } from "./constants/string";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: "en", // Default language
    fallbackLng: "en",
    debug: true, // Set to false in production
    resources: {
      en: {
        translation: {
          login: "Login",
          register: "Register",
          emailAddress: "Email address",
          password: "Password",
          showPassword: "Show password",
          submit: "Submit",
          languageSelector: "Select Language",
          doNotHaveAccess: "Don't have an account?",
          invalidEmail: "Invalid email",
        },
      },
      hi: {
        translation: {
          login: "लॉगिन",
          register: "रजिस्टर",
          emailAddress: "ईमेल पता",
          password: "पासवर्ड",
          showPassword: "पासवर्ड दिखाएं",
          confirmPassword: "पासवर्ड की पुष्टि करें",
          submit: "सबमिट करें",
          languageSelector: "भाषा चुनें",
          doNotHaveAccess: "क्या आपके पास खाता नहीं है?",
          invalidEmail: "अमान्य ईमेल",
        },
      },
      fr: {
        translation: {
          login: "Connexion",
          register: "Inscription",
          emailAddress: "Adresse e-mail",
          password: "Mot de passe",
          showPassword: "Afficher le mot de passe",
          confirmPassword: "Confirmer le mot de passe",
          submit: "Soumettre",
          languageSelector: "Sélectionner la langue",
          doNotHaveAccess: "Vous n'avez pas de compte ?", 
          invalidEmail: "E-mail invalide",
        },
      },
      es: {
        translation: {
          welcome: "Bienvenido a Fun Stack",
          login: "Iniciar sesión",
          register: "Registrarse",
          emailAddress: "Dirección de correo electrónico",
          password: "Contraseña",
          showPassword: "Mostrar contraseña",
          confirmPassword: "Confirmar contraseña",
          submit: "Enviar",
          languageSelector: "Seleccionar idioma",
          doNotHaveAccess: "¿No tienes una cuenta?",
          invalidEmail: "Correo electrónico inválido",
        },
      },
    },
  });

export default i18n;
