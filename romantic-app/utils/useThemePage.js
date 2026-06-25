import { ref, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCurrentThemePreset, getThemeSettings } from '@/utils/theme.js'

function toPositiveNumber(value, fallback = 0) {
	const numeric = Number(value)
	return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback
}

function getTopSafeAreaStyleVars() {
	let statusBarHeight = 24
	let capsuleTop = statusBarHeight + 8
	let capsuleHeight = 32

	try {
		const systemInfo = uni.getSystemInfoSync()
		statusBarHeight = toPositiveNumber(systemInfo?.statusBarHeight, statusBarHeight)

		if (typeof uni.getMenuButtonBoundingClientRect === 'function') {
			const capsuleRect = uni.getMenuButtonBoundingClientRect()
			capsuleTop = toPositiveNumber(capsuleRect?.top, capsuleTop)
			capsuleHeight = toPositiveNumber(capsuleRect?.height, capsuleHeight)
		}
	} catch (error) {
		console.warn('getTopSafeAreaStyleVars failed', error)
	}

	const capsuleBottom = capsuleTop + capsuleHeight
	const topGap = Math.max(capsuleTop - statusBarHeight, 6)
	const topbarHeight = capsuleHeight + topGap * 2

	return {
		'--app-shell-padding-top': `${capsuleBottom + 12}px`,
		'--app-account-topbar-padding-top': `${Math.max(statusBarHeight + 8, capsuleTop)}px`,
		'--app-topbar-height': `${topbarHeight}px`,
		'--app-sticky-top': `${capsuleBottom + 4}px`,
		'--app-banner-top': `${capsuleBottom + 8}px`,
		'--app-login-shell-padding-top': `${capsuleBottom + 24}px`,
		'--app-overlay-top-offset': `${capsuleBottom + topbarHeight + 12}px`
	}
}

export function useThemePage() {
	const themeStyle = ref({})

	function syncTheme() {
		themeStyle.value = {
			...getCurrentThemePreset(getThemeSettings()).variables,
			...getTopSafeAreaStyleVars()
		}
	}

	const handleThemeChange = () => {
		syncTheme()
	}

	onShow(() => {
		syncTheme()
	})

	uni.$on('theme:changed', handleThemeChange)

	onUnmounted(() => {
		uni.$off('theme:changed', handleThemeChange)
	})

	syncTheme()

	return {
		themeStyle,
		syncTheme
	}
}
