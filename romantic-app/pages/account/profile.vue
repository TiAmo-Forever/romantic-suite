<template>
	<view class="page app-account-page" :style="themeStyle">
		<GlobalNotificationBanner />
		<view class="app-account-topbar-shell">
			<AccountHeader title="资料信息" eyebrow="资料编辑" />
		</view>
		<view class="app-account-content">
			<AccountPanel title="基础资料">
				<AccountField label="昵称">
					<input v-model="form.nickname" class="input app-field" placeholder="请输入昵称" placeholder-class="app-account-input-placeholder" />
				</AccountField>
				<view class="app-account-form-row">
					<view class="app-account-form-col">
						<AccountField label="所在城市">
							<view class="picker app-field location-picker" @click="openCityPicker">
								<view class="picker-value">{{ form.city || '请选择所在城市' }}</view>
							</view>
						</AccountField>
					</view>
					<view class="app-account-form-col">
						<AccountField label="邮箱">
							<input v-model="form.email" class="input app-field" placeholder="请输入邮箱" placeholder-class="app-account-input-placeholder" />
						</AccountField>
					</view>
				</view>
				<AccountField label="个性签名">
					<textarea v-model="form.bio" maxlength="60" class="textarea app-textarea" placeholder="请输入个性签名" placeholder-class="app-account-input-placeholder" />
				</AccountField>
			</AccountPanel>
			<button class="save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn" @click="handleSave">保存资料</button>
		</view>
	</view>
</template>

<script setup>
import { reactive } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { requireAuth } from '@/utils/auth.js'
import { saveProfilePatchAndBack } from '@/utils/account.js'
import { buildAreaPickerUrl, clearAreaDraft, getAreaDraft } from '@/utils/area.js'
import { getProfile } from '@/utils/profile.js'
import { goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountField from '@/pages/account/components/AccountField.vue'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const { themeStyle } = useThemePage()
const form = reactive(getProfile())

onLoad(() => {
	requireAuth()
})

onShow(() => {
	const draft = getAreaDraft('profile_city')
	if (!draft) return
	form.city = draft.displayText || draft.mergerName || draft.name || ''
	clearAreaDraft('profile_city')
})

function openCityPicker() {
	goPage(buildAreaPickerUrl('profile_city', {
		value: form.city || ''
	}))
}

async function handleSave() {
	if (!form.nickname.trim()) {
		uni.showToast({ title: '请输入昵称', icon: 'none' })
		return
	}

	try {
		await saveProfilePatchAndBack({
			nickname: form.nickname.trim(),
			city: form.city.trim(),
			email: form.email.trim(),
			bio: (form.bio || '').trim()
		}, '资料已保存')
	} catch (error) {
		uni.showToast({ title: error?.message || '资料保存失败', icon: 'none' })
	}
}
</script>

<style scoped>
	.location-picker {
		justify-content: space-between;
	}
</style>
