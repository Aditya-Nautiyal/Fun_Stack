import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

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
        },
      },
      hi: {
        translation: {
          login: "लॉगिन",
          register: "रजिस्टर",
          emailAddress: "ईमेल पता",
          showPassword: "पासवर्ड दिखाएं",
          confirmPassword: "पासवर्ड की पुष्टि करें",
          submit: "सबमिट करें",
          languageSelector: "भाषा चुनें",
        },
      },
      fr: {
        translation: {
          login: "Connexion",
          register: "Inscription",
          emailAddress: "Adresse e-mail",
          showPassword: "Afficher le mot de passe",
          confirmPassword: "Confirmer le mot de passe",
          submit: "Soumettre",
          languageSelector: "Sélectionner la langue",
        },
      },
      es: {
        translation: {
          welcome: "Bienvenido a Fun Stack",
          login: "Iniciar sesión",
          register: "Registrarse",
          emailAddress: "Dirección de correo electrónico",
          showPassword: "Mostrar contraseña",
          confirmPassword: "Confirmar contraseña",
          submit: "Enviar",
          languageSelector: "Seleccionar idioma",
        },
      },
    },
  });

export default i18n;
