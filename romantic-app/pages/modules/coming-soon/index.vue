<template>
	<view class="page coming-page" :style="themeStyle">
    <GlobalNotificationBanner />
		<view class="bg-orb orb-a"></view>
		<view class="bg-orb orb-b"></view>
		<view class="top-bar app-topbar app-fade-up">
			<view class="top-nav-btn app-topbar-btn" @click="goBack"><view class="top-nav-icon app-topbar-icon" aria-hidden="true"></view><text class="top-nav-text app-topbar-text">返回</text></view>
			<view class="page-title-wrap app-topbar-center"><view class="page-eyebrow app-topbar-eyebrow">功能预告</view><view class="page-title app-topbar-title">敬请期待</view></view>
			<view class="top-placeholder app-topbar-placeholder"></view>
		</view>
		<view class="content-shell">
			<view class="card app-card app-fade-up app-delay-1">
				<view class="card-glow glow-a"></view><view class="card-glow glow-b"></view>
				<view class="badge app-pill app-pill-soft">开发中</view>
				<view class="icon">💫</view>
				<view class="title">{{ title }}</view>
				<view class="desc">该功能暂未开放。</view>
				<view class="meta-row"><view class="meta-chip app-pill app-pill-soft">开发中</view></view>
				<button class="back-btn app-primary-btn app-primary-btn-shadow" @click="goBack">返回上一页</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { backPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'

const { themeStyle } = useThemePage()
const title = ref('敬请期待')
function goBack() { backPage() }
onLoad((options) => { title.value = decodeURIComponent(options.title || '敬请期待') })
</script>

<style scoped>
	.coming-page { min-height: 100vh; position: relative; padding: 24rpx 24rpx 40rpx; background: radial-gradient(circle at 12% 12%, var(--app-page-glow-strong), transparent 28%), var(--app-page-gradient-main); overflow: hidden; }
	.bg-orb { position: absolute; border-radius: 50%; filter: blur(8rpx); }
	.orb-a { width: 220rpx; height: 220rpx; right: -60rpx; top: 160rpx; background: var(--app-page-orb-a); }
	.orb-b { width: 180rpx; height: 180rpx; left: -40rpx; bottom: 120rpx; background: var(--app-page-orb-b); }
	.content-shell { position: relative; z-index: 1; }
	.card { position: relative; overflow: hidden; margin-top: 28rpx; width: 100%; max-width: 100%; padding: 60rpx 40rpx; text-align: center; background: radial-gradient(circle at top right, var(--app-page-glow-soft), transparent 28%), var(--app-color-surface); }
	.card-glow { position: absolute; border-radius: 50%; background: var(--app-page-orb-b); }
	.glow-a { width: 180rpx; height: 180rpx; right: -40rpx; top: -50rpx; }
	.glow-b { width: 120rpx; height: 120rpx; left: 30rpx; bottom: -30rpx; }
	.badge, .icon, .title, .desc, .meta-row, .note-card, .back-btn { position: relative; z-index: 1; }
	.icon { margin-top: 26rpx; font-size: 88rpx; }
	.title { margin-top: 24rpx; font-size: 42rpx; font-weight: 700; color: var(--app-color-primary); }
	.desc { margin-top: 20rpx; font-size: 28rpx; color: var(--app-color-text); line-height: 1.8; }
	.meta-row { display: flex; justify-content: center; flex-wrap: wrap; gap: 14rpx; margin-top: 24rpx; }
	.note-card { margin-top: 28rpx; padding: 28rpx 26rpx; text-align: left; }
	.note-title { font-size: 26rpx; font-weight: 700; color: var(--app-color-primary); }
	.note-text { margin-top: 14rpx; font-size: 24rpx; line-height: 1.8; color: var(--app-color-text); }
	.back-btn { margin-top: 36rpx; font-size: 30rpx; font-weight: 700; }
	.top-nav-icon { width: 18rpx; height: 18rpx; border-left: 4rpx solid currentColor; border-bottom: 4rpx solid currentColor; border-radius: 2rpx; box-sizing: border-box; transform: rotate(45deg); flex-shrink: 0; }
</style>
