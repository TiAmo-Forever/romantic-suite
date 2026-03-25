import { request } from '@/utils/request.js'
import { getCountdownPlanCache, saveCountdownPlanCache } from '@/utils/countdown.js'
import { ensureServerWritable, isServerOffline } from '@/utils/server-state.js'

function ensureSuccess(response, fallbackMessage) {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage)
  }
  return response.data
}

export async function fetchSharedCountdownPlan(options = {}) {
  const { allowOfflineFallback = true } = options

  try {
    const response = await request({
      url: '/api/countdown/plan'
    })
    return saveCountdownPlanCache(ensureSuccess(response, '获取见面倒计时失败'))
  } catch (error) {
    if (allowOfflineFallback && isServerOffline()) {
      return getCountdownPlanCache()
    }
    throw error
  }
}

export async function updateSharedCountdownPlan(payload) {
  if (!ensureServerWritable()) {
    throw new Error('离线模式下不支持修改')
  }

  const response = await request({
    url: '/api/countdown/plan',
    method: 'PUT',
    data: payload
  })
  return saveCountdownPlanCache(ensureSuccess(response, '保存见面倒计时失败'))
}

export async function resetSharedCountdownPlan() {
  if (!ensureServerWritable()) {
    throw new Error('离线模式下不支持修改')
  }

  const response = await request({
    url: '/api/countdown/plan/reset',
    method: 'POST'
  })
  return saveCountdownPlanCache(ensureSuccess(response, '恢复默认倒计时失败'))
}
