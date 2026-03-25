<template>
	<view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
		<view class="app-account-topbar-shell">
			<AccountHeader title="主题设置" eyebrow="视觉风格" />
		</view>
		<view class="app-account-content">
			<AccountPanel title="当前主题" description="切换后会立即应用到首页、星球、我的和设置页。">
				<view class="theme-hero" :style="heroStyle">
					<view class="theme-hero-glow"></view>
					<view class="theme-hero-kicker">{{ currentPreset.name }}</view>
					<view class="theme-hero-title">{{ currentPreset.description }}</view>
					<view class="theme-hero-swatches">
						<view v-for="color in currentPreset.swatches" :key="color" class="theme-hero-dot" :style="{ background: color }"></view>
					</view>
				</view>
			</AccountPanel>

			<AccountPanel title="预设主题" description="第一期先提供 4 套预设主题，保证整体视觉统一。">
				<view class="theme-grid">
					<view
						v-for="item in presets"
						:key="item.key"
						class="theme-card app-card-soft"
						:class="{ active: draftPresetKey === item.key }"
						hover-class="theme-card-hover"
						hover-stay-time="60"
						@click="selectPreset(item.key)"
					>
						<view class="theme-card-preview" :style="getPreviewStyle(item)">
							<view class="theme-card-orb orb-a"></view>
							<view class="theme-card-orb orb-b"></view>
							<view class="theme-card-chip">{{ item.name }}</view>
						</view>
						<view class="theme-card-copy">
							<view class="theme-card-title-row">
								<view class="theme-card-title">{{ item.name }}</view>
								<view v-if="draftPresetKey === item.key" class="theme-card-tag">当前</view>
							</view>
							<view class="theme-card-desc">{{ item.description }}</view>
							<view class="theme-card-swatches">
								<view v-for="color in item.swatches" :key="color" class="theme-card-dot" :style="{ background: color }"></view>
							</view>
						</view>
					</view>
				</view>
			</AccountPanel>

			<view class="theme-actions">
				<button class="ghost-btn app-account-flat-btn app-account-flat-btn-soft" @click="handleReset">恢复默认</button>
				<button class="save-btn app-primary-btn app-primary-btn-shadow app-account-flat-btn" @click="handleSave">保存主题</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { requireAuth } from '@/utils/auth.js'
import { fetchRemoteProfile, updateRemoteProfile } from '@/services/profile.js'
import { applyTheme, getCurrentThemePreset, getThemePresets, getThemeSettings, saveAndApplyTheme } from '@/utils/theme.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const { themeStyle } = useThemePage()
const presets = getThemePresets()
const themeSettings = ref(getThemeSettings())
const draftPresetKey = ref(themeSettings.value.presetKey)

const currentPreset = computed(() => getCurrentThemePreset({ presetKey: draftPresetKey.value }))
const heroStyle = computed(() => ({ background: currentPreset.value.variables['--app-gradient-hero'] }))

onLoad(() => {
	requireAuth()
})

onShow(async () => {
	if (!requireAuth()) return
	try {
		await fetchRemoteProfile()
	} catch (error) {
		// Fall back to local theme cache when the server is unavailable.
	}
	themeSettings.value = getThemeSettings()
	draftPresetKey.value = themeSettings.value.presetKey
})

function getPreviewStyle(item) {
	return {
		background: item.variables['--app-gradient-hero']
	}
}

function selectPreset(key) {
	draftPresetKey.value = key
	applyTheme({ presetKey: key })
}

async function handleReset() {
	const previousSettings = { ...themeSettings.value }
	const payload = { presetKey: 'pink' }
	try {
		applyTheme(payload)
		await updateRemoteProfile({ themePresetKey: payload.presetKey })
		themeSettings.value = payload
		draftPresetKey.value = payload.presetKey
		saveAndApplyTheme(payload)
		uni.showToast({ title: '已恢复默认主题', icon: 'none' })
	} catch (error) {
		themeSettings.value = previousSettings
		draftPresetKey.value = previousSettings.presetKey
		saveAndApplyTheme(previousSettings)
		uni.showToast({ title: error?.message || '恢复默认主题失败', icon: 'none' })
	}
}

async function handleSave() {
	try {
		themeSettings.value = { presetKey: draftPresetKey.value }
		await updateRemoteProfile({ themePresetKey: themeSettings.value.presetKey })
		saveAndApplyTheme(themeSettings.value)
		uni.showToast({ title: '主题已保存', icon: 'success' })
	} catch (error) {
		themeSettings.value = getThemeSettings()
		draftPresetKey.value = themeSettings.value.presetKey
		saveAndApplyTheme(themeSettings.value)
		uni.showToast({ title: error?.message || '主题保存失败', icon: 'none' })
	}
}
</script>

<style scoped>
	.theme-hero {
		position: relative;
		overflow: hidden;
		padding: 30rpx 28rpx;
		border-radius: 30rpx;
		color: #fff;
		box-shadow: var(--app-shadow-card);
	}

	.theme-hero-glow {
		position: absolute;
		width: 180rpx;
		height: 180rpx;
		right: -40rpx;
		top: -40rpx;
		border-radius: 50%;
		background: rgba(255,255,255,0.16);
	}

	.theme-hero-kicker,
	.theme-hero-title,
	.theme-hero-swatches {
		position: relative;
		z-index: 1;
	}

	.theme-hero-kicker {
		font-size: 22rpx;
		font-weight: 700;
		letter-spacing: 2rpx;
		text-transform: uppercase;
		color: rgba(255,255,255,0.78);
	}

	.theme-hero-title {
		margin-top: 14rpx;
		font-size: 28rpx;
		line-height: 1.7;
	}

	.theme-hero-swatches {
		margin-top: 20rpx;
		display: flex;
		gap: 14rpx;
	}

	.theme-hero-dot,
	.theme-card-dot {
		width: 24rpx;
		height: 24rpx;
		border-radius: 50%;
		box-shadow: inset 0 0 0 2rpx rgba(255,255,255,0.45);
	}

	.theme-grid {
		margin-top: 10rpx;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 18rpx;
	}

	.theme-card {
		overflow: hidden;
		transition: transform 0.18s ease, box-shadow 0.18s ease;
	}

	.theme-card-hover {
		transform: scale(0.985);
	}

	.theme-card.active {
		box-shadow: 0 14rpx 28rpx rgba(255, 126, 166, 0.16);
	}

	.theme-card-preview {
		position: relative;
		height: 150rpx;
		padding: 18rpx;
		border-radius: 24rpx 24rpx 0 0;
		overflow: hidden;
	}

	.theme-card-orb {
		position: absolute;
		border-radius: 50%;
		background: rgba(255,255,255,0.18);
	}

	.theme-card-orb.orb-a {
		width: 92rpx;
		height: 92rpx;
		right: -18rpx;
		top: -18rpx;
	}

	.theme-card-orb.orb-b {
		width: 56rpx;
		height: 56rpx;
		left: 20rpx;
		bottom: -12rpx;
	}

	.theme-card-chip {
		position: relative;
		z-index: 1;
		display: inline-flex;
		padding: 8rpx 14rpx;
		border-radius: 999rpx;
		background: rgba(255,255,255,0.22);
		color: #fff;
		font-size: 20rpx;
		font-weight: 700;
	}

	.theme-card-copy {
		padding: 20rpx 20rpx 22rpx;
	}

	.theme-card-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10rpx;
	}

	.theme-card-title {
		font-size: 28rpx;
		font-weight: 700;
		color: var(--app-color-primary-strong);
	}

	.theme-card-tag {
		padding: 6rpx 12rpx;
		border-radius: 999rpx;
		background: #fff2f6;
		color: #c86f8c;
		font-size: 20rpx;
		font-weight: 700;
	}

	.theme-card-desc {
		margin-top: 10rpx;
		font-size: 22rpx;
		line-height: 1.7;
		color: #98707d;
	}

	.theme-card-swatches {
		margin-top: 16rpx;
		display: flex;
		gap: 12rpx;
	}

	.theme-actions {
		margin-top: 26rpx;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16rpx;
	}

	@media screen and (max-width: 520px) {
		.theme-grid,
		.theme-actions {
			grid-template-columns: 1fr;
		}
	}
</style>
