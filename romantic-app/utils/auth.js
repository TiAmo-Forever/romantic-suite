import { loginByServer, logoutByServer } from '@/services/auth.js'
import { closeNotificationSocket, ensureNotificationSocket } from '@/utils/notification-socket.js'
import { clearNotificationIndicatorState } from '@/utils/notification-indicator.js'
import { saveProfile } from '@/utils/profile.js'
import { saveAndApplyTheme } from '@/utils/theme.js'

const TOKEN_KEY = 'romantic_token'
const USER_KEY = 'romantic_user'
const LOGIN_PAGE = '/pages/login/login'
const NORMAL_ACCOUNT_TYPE = 'NORMAL'
const ADMIN_ACCOUNT_TYPE = 'ADMIN'
let redirectingToLogin = false

export async function login(username, password) {
	try {
		const payload = await loginByServer({ username, password })
		const user = {
			username: payload.username,
			nickname: payload.nickname || payload.profile?.nickname || 'Romantic Space',
			accountType: normalizeAccountType(payload.accountType || payload.profile?.accountType)
		}

		uni.setStorageSync(TOKEN_KEY, payload.token)
		uni.setStorageSync(USER_KEY, user)

		if (payload.profile) {
			saveProfile({
				...payload.profile,
				password
			})
			saveAndApplyTheme({ presetKey: payload.profile.themePresetKey || 'pink' })
		}

		if (!isAdminUser(user)) {
			ensureNotificationSocket()
		}

		return { success: true, user }
	} catch (error) {
		return { success: false, message: error?.message || 'Login failed' }
	}
}

export function clearLoginState() {
	closeNotificationSocket()
	clearNotificationIndicatorState()
	uni.removeStorageSync(TOKEN_KEY)
	uni.removeStorageSync(USER_KEY)
}

export async function logout(options = {}) {
	const { notifyServer = true } = options

	if (notifyServer) {
		try {
			await logoutByServer()
		} catch (error) {
			// Keep local logout as the primary action.
		}
	}

	clearLoginState()
}

export function redirectToLogin(message = 'Login expired, please sign in again') {
	clearLoginState()

	if (redirectingToLogin) {
		return
	}

	redirectingToLogin = true
	uni.showToast({
		title: message,
		icon: 'none'
	})

	setTimeout(() => {
		uni.reLaunch({ url: LOGIN_PAGE })
		redirectingToLogin = false
	}, 120)
}

export function isLogin() {
	return !!uni.getStorageSync(TOKEN_KEY)
}

export function getUser() {
	const user = uni.getStorageSync(USER_KEY) || null
	if (!user || typeof user !== 'object') {
		return null
	}
	return {
		...user,
		accountType: normalizeAccountType(user.accountType)
	}
}

export function isAdminUser(user = getUser()) {
	return String(user?.accountType || '').trim().toUpperCase() === ADMIN_ACCOUNT_TYPE
}

export function requireAuth() {
	if (isLogin()) {
		return true
	}

	redirectToLogin('Please sign in first')
	return false
}

function normalizeAccountType(accountType) {
	const normalized = String(accountType || '').trim().toUpperCase()
	if (!normalized || normalized === NORMAL_ACCOUNT_TYPE) {
		return NORMAL_ACCOUNT_TYPE
	}
	return ADMIN_ACCOUNT_TYPE
}
