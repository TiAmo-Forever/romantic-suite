import { ref, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCurrentThemePreset, getThemeSettings } from '@/utils/theme.js'

export function useThemePage() {
	const themeStyle = ref({ ...getCurrentThemePreset(getThemeSettings()).variables })

	function syncTheme() {
		themeStyle.value = { ...getCurrentThemePreset(getThemeSettings()).variables }
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

	return {
		themeStyle,
		syncTheme
	}
}
