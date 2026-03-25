<template>
	<view class="app-account-form-item" :class="wrapperClass">
		<view v-if="label" class="app-account-label">{{ label }}</view>
		<view :class="contentClass">
			<slot />
		</view>
		<view v-if="hint" class="app-account-field-hint">{{ hint }}</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	label: {
		type: String,
		default: ''
	},
	hint: {
		type: String,
		default: ''
	},
	bare: {
		type: Boolean,
		default: false
	},
	compact: {
		type: Boolean,
		default: false
	}
})

const wrapperClass = computed(() => ({
	'app-account-form-item-compact': props.compact
}))

const contentClass = computed(() => props.bare ? '' : 'app-input-shell')
</script>
