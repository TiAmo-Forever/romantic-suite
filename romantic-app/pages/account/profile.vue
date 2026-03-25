<template>
	<view class="page app-account-page" :style="themeStyle">
		<GlobalNotificationBanner />
		<view class="app-account-topbar-shell">
			<AccountHeader title="资料信息" eyebrow="资料编辑" />
		</view>
		<view class="app-account-content">
			<view class="app-account-stack">
				<AccountIntroCard
					eyebrow="个人档案"
					title="把关于你的信息整理得更完整"
					description="这里保存你的真实姓名、所在城市、联系邮箱和一句简短签名，只会同步到当前账号自己的资料档案。"
					:tags="introTags"
				/>
				<AccountPanel title="基础资料" description="这些资料会用于个人资料展示与账号内页摘要，不会被另一方账号覆盖。">
				<AccountField label="真实姓名">
					<input v-model="form.nickname" class="input app-field" placeholder="输入你的真实姓名" placeholder-class="app-account-input-placeholder" />
				</AccountField>
				<view class="app-account-form-row">
					<view class="app-account-form-col">
						<AccountField label="所在城市">
							<view class="picker app-field location-picker" @click="openCityPicker">
								<view class="picker-value">{{ form.city || '选择你常驻的城市' }}</view>
							</view>
						</AccountField>
					</view>
					<view class="app-account-form-col">
						<AccountField label="邮箱">
							<input v-model="form.email" class="input app-field" placeholder="输入常用联系邮箱" placeholder-class="app-account-input-placeholder" />
						</AccountField>
					</view>
				</view>
				<AccountField label="个性签名">
					<textarea v-model="form.bio" maxlength="60" class="textarea app-textarea" placeholder="留下一句今天想写给自己的话" placeholder-class="app-account-input-placeholder" />
				</AccountField>
			</AccountPanel>
				<view class="app-account-action-bar">
					<view class="app-account-action-note">
						<view class="app-account-action-note-title">保存后会同步当前账号资料</view>
						<view class="app-account-action-note-desc">如果你同时修改了城市或邮箱，设置页和资料摘要也会一起更新显示。</view>
					</view>
					<button class="save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn" @click="handleSave">保存资料</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { requireAuth } from '@/utils/auth.js'
import { saveProfilePatchAndBack } from '@/utils/account.js'
import { buildAreaPickerUrl, clearAreaDraft, getAreaDraft } from '@/utils/area.js'
import { getProfile } from '@/utils/profile.js'
import { goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountField from '@/pages/account/components/AccountField.vue'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountIntroCard from '@/pages/account/components/AccountIntroCard.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const { themeStyle } = useThemePage()
const form = reactive(getProfile())
const introTags = computed(() => [
	form.city || '城市待补充',
	form.email ? '邮箱已填写' : '邮箱待填写'
])

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
		uni.showToast({ title: '请输入真实姓名', icon: 'none' })
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
