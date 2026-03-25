import { request } from '@/utils/request.js'
import { getDefaultProfile, getProfile, saveProfile } from '@/utils/profile.js'
import { ensureServerWritable, isServerOffline } from '@/utils/server-state.js'
import { saveAndApplyTheme } from '@/utils/theme.js'

function normalizeRemoteProfile(profile) {
  const localProfile = getDefaultProfile()
  const payload = {
    ...localProfile,
    ...(profile || {})
  }

  return {
    ...payload,
    defaultMeetingPlace: payload.defaultMeetingPlace || payload.city || localProfile.defaultMeetingPlace
  }
}

function ensureSuccess(response, fallbackMessage) {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage)
  }

  return response.data
}

function syncLocalProfile(profile, extraPatch = {}) {
  const payload = normalizeRemoteProfile({
    ...profile,
    ...extraPatch
  })
  saveProfile(payload)
  saveAndApplyTheme({ presetKey: payload.themePresetKey || 'pink' })
  return payload
}

export async function fetchRemoteProfile(options = {}) {
  const { allowOfflineFallback = true } = options

  try {
    const response = await request({
      url: '/api/profiles/mine'
    })

    return syncLocalProfile(ensureSuccess(response, '获取资料失败'))
  } catch (error) {
    if (allowOfflineFallback && isServerOffline()) {
      return getProfile()
    }
    throw error
  }
}

export async function updateRemoteProfile(patch) {
  if (!ensureServerWritable()) {
    throw new Error('离线模式下不支持修改')
  }

  const response = await request({
    url: '/api/profiles/mine',
    method: 'PUT',
    data: patch
  })

  return syncLocalProfile(ensureSuccess(response, '保存资料失败'))
}

export async function updateRemotePassword(password) {
  if (!ensureServerWritable()) {
    throw new Error('离线模式下不支持修改')
  }

  const response = await request({
    url: '/api/profiles/mine/password',
    method: 'PUT',
    data: { password }
  })

  return syncLocalProfile(ensureSuccess(response, '保存密码失败'), { password })
}

export async function resetRemoteProfile() {
  if (!ensureServerWritable()) {
    throw new Error('离线模式下不支持修改')
  }

  const response = await request({
    url: '/api/profiles/mine/reset',
    method: 'POST'
  })

  return syncLocalProfile(ensureSuccess(response, '恢复默认失败'))
}
