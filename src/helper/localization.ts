import * as vscode from "vscode";
import * as l10n from "@vscode/l10n";
import * as path from "path";
import * as fs from "fs";

class Localization {
  private translations: Record<string, string> = {};
  private defaultLocale = "en"; // Default language

  constructor(private context: vscode.ExtensionContext) {}

  /**
   * Initializes the localization system, loads the appropriate translations
   * based on the user's language preference.
   * If the user's language is not supported, it falls back to the default language (English).
   */
  public async init() {
    const supportedLocales = ["en", "ru"];
    const currentLocale = supportedLocales.includes(vscode.env.language)
      ? vscode.env.language
      : this.defaultLocale;

    // Load translations with fallback
    this.translations = this.loadTranslations(
      currentLocale,
      this.defaultLocale
    );

    // Set up l10n with the loaded translations
    await l10n.config({ contents: this.translations });
  }

  /**
   * Retrieves a localized string for a specific key, with optional arguments
   * for dynamic content replacement.
   *
   * @param key The key to identify the localized string.
   * @param args Optional arguments to insert into the localized string.
   * @returns The localized string with arguments substituted.
   */
  public t(key: string, ...args: any[]): string {
    return l10n.t(this.translations[key] || key, ...args);
  }

  /**
   * Loads the translation JSON file for the given locale, with a fallback to
   * the default locale if necessary.
   *
   * @param locale The locale for which to load translations (e.g., 'en', 'ru').
   * @param fallbackLocale The fallback locale to use if the requested locale is unavailable.
   * @returns A record of key-value pairs representing localized strings.
   */
  private loadTranslations(
    locale: string,
    fallbackLocale: string
  ): Record<string, string> {
    const localePath =
      locale === "en"
        ? path.join(this.context.extensionPath, "package.nls.json")
        : path.join(this.context.extensionPath, `package.nls.${locale}.json`);
    const fallbackPath =
      locale === "en"
        ? path.join(this.context.extensionPath, "package.nls.json")
        : path.join(
            this.context.extensionPath,
            `package.nls.${fallbackLocale}.json`
          );

    let localeData: Record<string, string> = {};
    let fallbackData: Record<string, string> = {};

    // Load fallback language (default language)
    if (fs.existsSync(fallbackPath)) {
      fallbackData = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
    }

    // Load local translation if available
    if (fs.existsSync(localePath)) {
      localeData = JSON.parse(fs.readFileSync(localePath, "utf-8"));
    }

    // Return merged object with local language taking priority
    return { ...fallbackData, ...localeData };
  }
}

export default Localization;
