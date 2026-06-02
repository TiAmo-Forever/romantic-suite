import { isAdminUser } from '@/utils/auth.js'

export function goPage(url) {
	uni.navigateTo({ url, animationType: 'pop-in', animationDuration: 220 })
}

export function replacePage(url) {
	uni.redirectTo({ url, animationType: 'fade-in', animationDuration: 220 })
}

export function relaunchPage(url) {
	uni.reLaunch({ url })
}

export function switchRootPage(url) {
	uni.reLaunch({ url })
}

export function openHomePage() {
	const user = uni.getStorageSync('romantic_user') || {}
	switchRootPage(isAdminUser(user) ? '/pages/admin/overview' : '/pages/home/home')
}

export function backPage() {
	uni.navigateBack({ animationType: 'pop-out', animationDuration: 200 })
}
