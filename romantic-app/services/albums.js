import { request } from '@/utils/request.js'

function ensureSuccess(response, fallbackMessage) {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage)
  }
  return response.data
}

function normalizeMediaItem(item = {}, index = 0) {
  return {
    id: item.id || `media_${index}`,
    mediaType: item.mediaType === 'video' ? 'video' : 'image',
    fileUrl: String(item.fileUrl || '').trim(),
    thumbnailUrl: String(item.thumbnailUrl || '').trim(),
    sortOrder: Number(item.sortOrder || index)
  }
}

function normalizeMemoryItem(item = {}) {
  const mediaList = (Array.isArray(item.mediaList) ? item.mediaList : []).map(normalizeMediaItem)
  const tags = Array.isArray(item.tags)
    ? item.tags.map((tag) => String(tag || '').trim()).filter(Boolean)
    : []

  return {
    id: item.id || '',
    title: String(item.title || '').trim(),
    memoryDate: String(item.memoryDate || '').trim(),
    location: String(item.location || '').trim(),
    summary: String(item.summary || '').trim(),
    coverUrl: String(item.coverUrl || '').trim(),
    tags,
    mediaList,
    imageCount: Number(item.imageCount || mediaList.filter((media) => media.mediaType === 'image').length),
    videoCount: Number(item.videoCount || mediaList.filter((media) => media.mediaType === 'video').length),
    creatorUsername: String(item.creatorUsername || '').trim(),
    creatorNickname: String(item.creatorNickname || '').trim(),
    createdAt: String(item.createdAt || '').trim(),
    updatedAt: String(item.updatedAt || '').trim()
  }
}

export async function fetchAlbumMemoryList() {
  const response = await request({
    url: '/api/albums'
  })
  return (ensureSuccess(response, '获取甜蜜相册列表失败') || []).map(normalizeMemoryItem)
}

export async function fetchAlbumMemoryDetail(id) {
  const response = await request({
    url: `/api/albums/${encodeURIComponent(id)}`
  })
  return normalizeMemoryItem(ensureSuccess(response, '获取回忆详情失败'))
}

export async function createAlbumMemory(payload) {
  const response = await request({
    url: '/api/albums',
    method: 'POST',
    data: payload
  })
  return normalizeMemoryItem(ensureSuccess(response, '创建回忆失败'))
}

export async function updateAlbumMemory(id, payload) {
  const response = await request({
    url: `/api/albums/${encodeURIComponent(id)}`,
    method: 'PUT',
    data: payload
  })
  return normalizeMemoryItem(ensureSuccess(response, '保存回忆失败'))
}

export async function deleteAlbumMemory(id) {
  const response = await request({
    url: `/api/albums/${encodeURIComponent(id)}`,
    method: 'DELETE'
  })
  return ensureSuccess(response, '删除回忆失败')
}
