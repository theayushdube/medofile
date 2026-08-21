import Constants from "expo-constants";

const configuredDomain = process.env.EXPO_PUBLIC_DOMAIN
  ?.replace(/^https?:\/\//, "")
  .replace(/\/+$/, "");

const configuredApiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;

export const API_BASE_URL =
  configuredDomain
    ? `https://${configuredDomain}/api`
    : typeof configuredApiBaseUrl === "string"
      ? configuredApiBaseUrl.replace(/\/+$/, "")
      : "https://medofile.com/api";