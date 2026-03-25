"use strict";
const MANUAL_ENV = "production";
const ENV_CONFIG = {
  development: {
    apiBaseUrl: "http://127.0.0.1:8081"
  },
  production: {
    apiBaseUrl: "https://romantic.allmyreasons.love"
  }
};
function resolveEnvName() {
  const envName = String(MANUAL_ENV).trim().toLowerCase();
  return ENV_CONFIG[envName] ? envName : "development";
}
function joinUrl(baseUrl, path) {
  const normalizedBase = String(baseUrl || "").replace(/\/+$/, "");
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  return `${normalizedBase}/${normalizedPath}`;
}
function getAppEnv() {
  return resolveEnvName();
}
function getAppConfig() {
  return {
    env: getAppEnv(),
    ...ENV_CONFIG[getAppEnv()]
  };
}
function getApiBaseUrl() {
  return getAppConfig().apiBaseUrl;
}
function buildApiUrl(path) {
  return joinUrl(getApiBaseUrl(), path);
}
function buildServerAssetUrl(path) {
  return joinUrl(getApiBaseUrl(), path);
}
exports.buildApiUrl = buildApiUrl;
exports.buildServerAssetUrl = buildServerAssetUrl;
exports.getApiBaseUrl = getApiBaseUrl;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/app-config.js.map
