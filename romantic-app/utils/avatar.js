import { getApiBaseUrl } from '@/utils/app-config.js'
import { redirectToLogin } from '@/utils/auth.js'
import { markServerOffline, markServerOnline } from '@/utils/server-state.js'

const AVATAR_DRAFT_KEY = 'romantic_avatar_draft'
const AUTH_INVALID_MESSAGES = [
  '\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u5931\u6548',
  '\u767B\u5F55\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55',
  '\u767B\u5F55\u5DF2\u5931\u6548'
]

function joinUrl(baseUrl, path) {
  const normalizedBase = String(baseUrl || '').replace(/\/+$/, '')
  const normalizedPath = String(path || '').replace(/^\/+/, '')
  return `${normalizedBase}/${normalizedPath}`
}

function parseUploadResponse(rawData) {
  if (typeof rawData === 'object' && rawData !== null) {
    return rawData
  }

  if (!rawData) {
    return null
  }

  try {
    return JSON.parse(rawData)
  } catch (error) {
    return null
  }
}

function isAuthInvalid(statusCode, payload) {
  const message = String(payload?.message || '').trim()
  return statusCode === 401 || AUTH_INVALID_MESSAGES.includes(message)
}

export function setAvatarDraft(path) {
  uni.setStorageSync(AVATAR_DRAFT_KEY, path || '')
}

export function getAvatarDraft() {
  return uni.getStorageSync(AVATAR_DRAFT_KEY) || ''
}

export function clearAvatarDraft() {
  uni.removeStorageSync(AVATAR_DRAFT_KEY)
}

export function persistAvatarDraft(filePath) {
  return new Promise((resolve) => {
    if (!filePath) {
      resolve('')
      return
    }

    if (typeof uni.saveFile !== 'function') {
      resolve(filePath)
      return
    }

    uni.saveFile({
      tempFilePath: filePath,
      success(result) {
        resolve(result.savedFilePath || filePath)
      },
      fail() {
        resolve(filePath)
      }
    })
  })
}

export function resolveAvatarUrl(path) {
  const value = String(path || '').trim()
  if (!value) {
    return ''
  }

  if (/^(https?:|data:|file:|wxfile:|blob:)/i.test(value)) {
    return value
  }

  return joinUrl(getApiBaseUrl(), value)
}

export function uploadAvatarFile(filePath) {
  const token = uni.getStorageSync('romantic_token')

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: joinUrl(getApiBaseUrl(), '/api/files/avatar'),
      filePath,
      name: 'file',
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success(response) {
        const payload = parseUploadResponse(response.data)
        const message = payload?.message || '\u5934\u50CF\u4E0A\u4F20\u5931\u8D25'

        if (isAuthInvalid(response.statusCode, payload)) {
          redirectToLogin(message)
          reject(new Error(message))
          return
        }

        if (response.statusCode >= 200 && response.statusCode < 300 && payload?.success && payload?.data?.path) {
          markServerOnline()
          resolve(payload.data.path)
          return
        }

        reject(new Error(message))
      },
      fail(error) {
        markServerOffline()
        reject(error)
      }
    })
  })
}
