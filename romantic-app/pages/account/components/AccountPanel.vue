<template>
	<view class="app-card app-account-section app-account-panel">
		<view v-if="title || description" class="app-account-panel-head">
			<view v-if="title" class="app-account-panel-title" @longpress.stop="copyText(title)">{{ title }}</view>
			<view v-if="description" class="app-account-panel-desc" @longpress.stop="copyText(description)">{{ description }}</view>
		</view>
		<slot />
	</view>
</template>

<script setup>
function copyText(value) {
	const content = String(value || '').trim()
	if (!content) return
	uni.setClipboardData({
		data: content,
		success: () => {
			uni.showToast({ title: '内容已复制', icon: 'success' })
		}
	})
}

defineProps({
	title: {
		type: String,
		default: ''
	},
	description: {
		type: String,
		default: ''
	}
})
</script>
