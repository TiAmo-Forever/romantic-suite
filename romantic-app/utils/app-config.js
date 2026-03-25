// 手动指定环境时可填写 `development` 或 `production`，留空则按打包环境自动判断。
const MANUAL_ENV = 'production'

const ENV_CONFIG = {
  development: {
    apiBaseUrl: 'http://127.0.0.1:8081'
  },
  production: {
    apiBaseUrl: 'https://romantic.allmyreasons.love'
  }
}

function detectDefaultEnv() {
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
    return 'production'
  }
  return 'development'
}

function resolveEnvName() {
  const envName = String(MANUAL_ENV || detectDefaultEnv()).trim().toLowerCase()
  return ENV_CONFIG[envName] ? envName : 'development'
}

function joinUrl(baseUrl, path) {
  const normalizedBase = String(baseUrl || '').replace(/\/+$/, '')
  const normalizedPath = String(path || '').replace(/^\/+/, '')
  return `${normalizedBase}/${normalizedPath}`
}

export function getAppEnv() {
  return resolveEnvName()
}

export function getAppConfig() {
  return {
    env: getAppEnv(),
    ...ENV_CONFIG[getAppEnv()]
  }
}

export function getApiBaseUrl() {
  return getAppConfig().apiBaseUrl
}

export function buildApiUrl(path) {
  return joinUrl(getApiBaseUrl(), path)
}

export function buildServerAssetUrl(path) {
  return joinUrl(getApiBaseUrl(), path)
}
