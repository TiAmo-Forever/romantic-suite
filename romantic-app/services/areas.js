import { request } from '@/utils/request.js'

function ensureSuccess(response, fallbackMessage) {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage)
  }

  return response.data || []
}

export async function fetchProvinces() {
  const response = await request({
    url: '/api/areas/provinces'
  })
  return ensureSuccess(response, '获取省份列表失败')
}

export async function fetchAreaChildren(parentId) {
  const response = await request({
    url: `/api/areas/children?parentId=${encodeURIComponent(parentId)}`
  })
  return ensureSuccess(response, '获取下级地区失败')
}

export async function fetchAreaDetail(id) {
  const response = await request({
    url: `/api/areas/${encodeURIComponent(id)}`
  })
  const data = ensureSuccess(response, '获取地区详情失败')
  return data || null
}

export async function searchAreas(keyword, level = null, limit = 20) {
  const query = [`keyword=${encodeURIComponent(keyword)}`, `limit=${encodeURIComponent(limit)}`]
  if (level !== null && level !== undefined) {
    query.push(`level=${encodeURIComponent(level)}`)
  }

  const response = await request({
    url: `/api/areas/search?${query.join('&')}`
  })
  return ensureSuccess(response, '搜索地区失败')
}
