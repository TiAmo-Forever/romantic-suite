import { request } from '@/utils/request.js'
import { getAnniversaryListCache, saveAnniversaryListCache } from '@/utils/anniversary.js'
import { isServerOffline } from '@/utils/server-state.js'

function ensureSuccess(response, fallbackMessage) {
	if (!response?.success) {
		throw new Error(response?.message || fallbackMessage)
	}
	return response.data
}

export async function fetchAnniversaryList(status = 'all', options = {}) {
	const { allowOfflineFallback = true } = options

	try {
		const response = await request({
			url: `/api/anniversaries?status=${encodeURIComponent(status)}`
		})
		const list = ensureSuccess(response, '获取纪念日列表失败') || []
		saveAnniversaryListCache(list)
		return list
	} catch (error) {
		if (allowOfflineFallback && isServerOffline()) {
			return getAnniversaryListCache()
		}
		throw error
	}
}

export async function fetchAnniversaryDetail(id) {
	const response = await request({
		url: `/api/anniversaries/${encodeURIComponent(id)}`
	})
	return ensureSuccess(response, '获取纪念日详情失败')
}

export async function createAnniversary(payload) {
	const response = await request({
		url: '/api/anniversaries',
		method: 'POST',
		data: payload
	})
	return ensureSuccess(response, '创建纪念日失败')
}

export async function updateAnniversary(id, payload) {
	const response = await request({
		url: `/api/anniversaries/${encodeURIComponent(id)}`,
		method: 'PUT',
		data: payload
	})
	return ensureSuccess(response, '保存纪念日失败')
}

export async function deleteAnniversary(id) {
	const response = await request({
		url: `/api/anniversaries/${encodeURIComponent(id)}`,
		method: 'DELETE'
	})
	return ensureSuccess(response, '删除纪念日失败')
}

export async function increaseAnniversaryLikeCount(id) {
	const response = await request({
		url: `/api/anniversaries/${encodeURIComponent(id)}/likes`,
		method: 'POST'
	})
	return ensureSuccess(response, '点赞失败')
}

export async function checkAnniversaryReminders() {
	const response = await request({
		url: '/api/anniversaries/reminders/check',
		method: 'POST',
		offlineTip: false
	})
	return ensureSuccess(response, '检查纪念日提醒失败') || []
}
