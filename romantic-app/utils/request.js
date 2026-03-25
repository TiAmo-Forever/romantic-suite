import { buildApiUrl } from '@/utils/app-config.js'
import { redirectToLogin } from '@/utils/auth.js'
import { markServerOffline, markServerOnline } from '@/utils/server-state.js'

const AUTH_INVALID_MESSAGES = [
  'AUTH_INVALID',
  'LOGIN_EXPIRED',
  'UNAUTHORIZED'
]
const OFFLINE_STATUS_CODES = [502, 503, 504]

function isAuthInvalid(statusCode, payload) {
  const message = String(payload?.message || '').trim()
  return statusCode === 401 || AUTH_INVALID_MESSAGES.includes(message)
}

function isOfflineFailure(statusCode, payload) {
  const message = String(payload?.message || '').trim()
  return OFFLINE_STATUS_CODES.includes(statusCode) || message.includes('Failed to obtain JDBC Connection')
}

function normalizeRequestFailMessage(error, requestUrl) {
  const rawMessage = String(error?.errMsg || '').trim()
  const apiUrl = buildApiUrl(requestUrl || '')

  if (!rawMessage) {
    return `无法连接到服务器，请确认后端服务已启动：${apiUrl}`
  }

  if (rawMessage.includes('Failed to connect') || rawMessage.includes('statusCode:-1')) {
    return `无法连接到服务器，请确认后端服务已启动：${apiUrl}`
  }

  if (rawMessage.toLowerCase().includes('timeout')) {
    return `连接服务器超时，请检查服务是否可用：${apiUrl}`
  }

  if (rawMessage.toLowerCase().includes('abort')) {
    return `服务器连接已中断，请确认服务状态：${apiUrl}`
  }

  return `请求服务器失败：${rawMessage}`
}

export function request(options) {
  const { url, method = 'GET', data, header = {}, offlineTip = true } = options || {}
  const token = uni.getStorageSync('romantic_token')

  return new Promise((resolve, reject) => {
    uni.request({
      url: buildApiUrl(url),
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...header
      },
      success(response) {
        const { statusCode, data: payload } = response

        if (isAuthInvalid(statusCode, payload)) {
          const message = payload?.message || 'Login expired, please sign in again'
          redirectToLogin(message)
          reject(new Error(message))
          return
        }

        if (isOfflineFailure(statusCode, payload)) {
          if (offlineTip) {
            markServerOffline()
          }
          reject(new Error(payload?.message || 'Server is temporarily unavailable'))
          return
        }

        if (statusCode >= 200 && statusCode < 300) {
          markServerOnline()
          resolve(payload)
          return
        }

        reject(new Error(payload?.message || `Request failed (${statusCode})`))
      },
      fail(error) {
        if (offlineTip) {
          markServerOffline()
        }
        reject(new Error(normalizeRequestFailMessage(error, url)))
      }
    })
  })
}
