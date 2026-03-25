<template>
	<view class="app-topbar app-account-topbar">
		<view class="top-nav-btn app-topbar-btn" @click="handleBack">
			<view class="top-nav-icon app-topbar-icon" aria-hidden="true"></view>
			<text class="top-nav-text app-topbar-text">返回</text>
		</view>
		<view class="page-title-wrap app-topbar-center">
			<view class="page-eyebrow app-topbar-eyebrow">{{ eyebrow }}</view>
			<view class="page-title app-topbar-title">{{ title }}</view>
		</view>
		<view class="top-placeholder app-topbar-placeholder"></view>
	</view>
</template>

<script setup>
import { backPage } from '@/utils/nav.js'

defineProps({
	title: {
		type: String,
		required: true
	},
	eyebrow: {
		type: String,
		default: 'Account'
	}
})

function handleBack() {
	backPage()
}
</script>

<style scoped>
	.top-nav-icon {
		width: 18rpx;
		height: 18rpx;
		border-left: 4rpx solid currentColor;
		border-bottom: 4rpx solid currentColor;
		border-radius: 2rpx;
		box-sizing: border-box;
		transform: rotate(45deg);
		flex-shrink: 0;
	}
</style>
