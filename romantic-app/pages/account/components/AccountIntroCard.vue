<template>
	<view class="app-card app-account-intro-card">
		<view class="app-account-intro-kicker" @longpress.stop="copyText(eyebrow)">{{ eyebrow }}</view>
		<view class="app-account-intro-title" @longpress.stop="copyText(title)">{{ title }}</view>
		<view v-if="description" class="app-account-intro-desc" @longpress.stop="copyText(description)">{{ description }}</view>
		<view v-if="tags.length || hasMetaSlot" class="app-account-intro-meta">
			<view v-for="item in tags" :key="item" class="app-account-intro-chip">{{ item }}</view>
			<slot name="meta" />
		</view>
	</view>
</template>

<script setup>
import { computed, useSlots } from 'vue'

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

const props = defineProps({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		default: ''
	},
	eyebrow: {
		type: String,
		default: ''
	},
	tags: {
		type: Array,
		default: () => []
	}
})

const slots = useSlots()
const hasMetaSlot = computed(() => Boolean(slots.meta))
</script>
