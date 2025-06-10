import i18next from "i18next";
import {
  handle as i18NextHttpMiddleware,
  LanguageDetector,
} from "i18next-http-middleware";
import i18NextFsBackend from "i18next-fs-backend";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const { NODE_ENV } = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const loadPath = resolve(
  join(
    __dirname,
    `../${NODE_ENV === "production" ? "../" : ""}locales/{{lng}}/{{ns}}.json`,
  ),
);

export default async function i18n() {
  const languageDetector = new LanguageDetector();

  await i18next
    .use(i18NextFsBackend)
    .use(languageDetector)
    .init({
      debug: NODE_ENV === "development",
      backend: {
        loadPath,
      },
      fallbackLng: "en",
      preload: ["en", "fr", "es"],
      detection: {
        order: ["header"],
      },
    });

  return i18NextHttpMiddleware(i18next);
}
