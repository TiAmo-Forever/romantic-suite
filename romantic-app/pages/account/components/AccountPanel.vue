<template>
	<view class="app-card app-account-section app-account-panel">
		<view v-if="title || description" class="app-account-panel-head">
			<view v-if="title" class="app-account-panel-title">{{ title }}</view>
			<view v-if="description" class="app-account-panel-desc">{{ description }}</view>
		</view>
		<slot />
	</view>
</template>

<script setup>
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
