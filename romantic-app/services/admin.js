import { request } from '@/utils/request.js'

export async function fetchAdminOverview() {
	const response = await request({
		url: '/api/admin/overview',
		method: 'GET'
	})

	if (!response?.success) {
		throw new Error(response?.message || '加载管理员信息失败')
	}

	return response.data || {}
}

export async function fetchAdminCountdownDetail() {
	const response = await request({
		url: '/api/admin/countdown',
		method: 'GET'
	})

	if (!response?.success) {
		throw new Error(response?.message || '加载见面计划失败')
	}

	return response.data || {}
}

export async function fetchAdminAnniversaryList(status = 'all') {
	const response = await request({
		url: '/api/admin/anniversaries',
		method: 'GET',
		data: { status }
	})

	if (!response?.success) {
		throw new Error(response?.message || '加载纪念日失败')
	}

	return Array.isArray(response.data) ? response.data : []
}

export async function fetchAdminAnniversaryDetail(id) {
	const response = await request({
		url: `/api/admin/anniversaries/${id}`,
		method: 'GET'
	})

	if (!response?.success) {
		throw new Error(response?.message || '加载纪念日详情失败')
	}

	return response.data || {}
}
