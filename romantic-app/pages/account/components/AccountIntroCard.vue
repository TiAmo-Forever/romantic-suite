<template>
	<view class="app-card app-account-intro-card">
		<view class="app-account-intro-kicker">{{ eyebrow }}</view>
		<view class="app-account-intro-title">{{ title }}</view>
		<view class="app-account-intro-desc">{{ description }}</view>
		<view v-if="tags.length || hasMetaSlot" class="app-account-intro-meta">
			<view v-for="item in tags" :key="item" class="app-account-intro-chip">{{ item }}</view>
			<slot name="meta" />
		</view>
	</view>
</template>

<script setup>
import { computed, useSlots } from 'vue'

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
