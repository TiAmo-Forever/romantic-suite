import { request } from '@/utils/request.js'

export async function loginByServer(payload) {
	const response = await request({
		url: '/api/auth/login',
		method: 'POST',
		data: payload,
		offlineTip: false
	})

	if (!response?.success) {
		throw new Error(response?.message || '登录失败')
	}

	return response.data
}

export async function resetPasswordByServer(payload) {
	const response = await request({
		url: '/api/auth/reset-password',
		method: 'POST',
		data: payload,
		offlineTip: false
	})

	if (!response?.success) {
		throw new Error(response?.message || '密码重置失败')
	}

	return response.data
}

export async function logoutByServer() {
	try {
		await request({
			url: '/api/auth/logout',
			method: 'POST',
			offlineTip: false
		})
	} catch (error) {
		// 退出登录以清理本地状态为主，服务端退出失败时不阻塞页面跳转。
	}
}