import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { enTranslationConstants } from "./en";
import { frTranslationConstants } from "./fr";
import { esTranslationConstants } from "./es";
import { hiTranslationConstants } from "./hi";
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: "en", // Default language
    fallbackLng: "en",
    debug: true, // Set to false in production
    resources: {
      en: {
        translation: enTranslationConstants,
      },
      hi: {
        translation: hiTranslationConstants,
      },
      fr: {
        translation: frTranslationConstants,
      },
      es: {
        translation: esTranslationConstants,
      },
    },
  });

export default i18n;
