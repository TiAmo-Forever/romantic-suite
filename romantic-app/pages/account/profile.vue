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
				<AccountField label="当前头像">
					<view class="profile-avatar-entry app-field" @click="goAvatarSettings">
						<view class="profile-avatar-copy">
							<view class="profile-avatar-title">进入头像设置</view>
							<view class="profile-avatar-desc">{{ avatarSummary }}</view>
						</view>
						<view class="profile-avatar-preview">
							<image v-if="isImageAvatar" class="profile-avatar-image" :src="avatarImageUrl" mode="aspectFill" />
							<view v-else class="profile-avatar-text">{{ avatarDisplay }}</view>
						</view>
						<view class="profile-avatar-arrow"></view>
					</view>
				</AccountField>
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
	import { resolveAvatarUrl } from '@/utils/avatar.js'
	import { saveProfilePatchAndBack } from '@/utils/account.js'
	import { buildAreaPickerUrl, clearAreaDraft, getAreaDraft } from '@/utils/area.js'
	import { getAvatarPresetMap, getProfile } from '@/utils/profile.js'
	import { goPage } from '@/utils/nav.js'
	import { useThemePage } from '@/utils/useThemePage.js'
	import AccountField from '@/pages/account/components/AccountField.vue'
	import AccountHeader from '@/pages/account/components/AccountHeader.vue'
	import AccountIntroCard from '@/pages/account/components/AccountIntroCard.vue'
	import AccountPanel from '@/pages/account/components/AccountPanel.vue'

	const { themeStyle } = useThemePage()
	const form = reactive(getProfile())
	const avatarPresetMap = getAvatarPresetMap()
	const introTags = computed(() => [
		form.city || '城市待补充',
		form.email ? '邮箱已填写' : '邮箱待填写'
	])
	const isImageAvatar = computed(() => form.avatarType === 'upload' && !!form.avatarImage)
	const avatarImageUrl = computed(() => resolveAvatarUrl(form.avatarImage))
	const avatarDisplay = computed(() => {
		if (form.avatarType === 'preset') {
			return avatarPresetMap[form.avatarPreset] || '♥'
		}
		return String(form.avatarText || '').trim() || '♥'
	})
	const avatarSummary = computed(() => {
		if (form.avatarType === 'upload' && form.avatarImage) return '当前使用已上传头像'
		if (form.avatarType === 'text') return `当前字符：${String(form.avatarText || '').trim() || '♥'}`
		return `当前预设：${avatarDisplay.value}`
	})

onLoad(() => {
	requireAuth()
})

onShow(() => {
	Object.assign(form, getProfile())

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

	function goAvatarSettings() {
		goPage('/pages/account/avatar')
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

	.profile-avatar-entry {
		display: flex;
		align-items: center;
		gap: 18rpx;
	}

	.profile-avatar-copy {
		flex: 1;
		min-width: 0;
	}

	.profile-avatar-title {
		font-size: 28rpx;
		font-weight: 600;
		color: var(--app-color-text-strong);
	}

	.profile-avatar-desc {
		margin-top: 6rpx;
		font-size: 22rpx;
		line-height: 1.5;
		color: var(--app-color-text);
	}

	.profile-avatar-preview {
		width: 78rpx;
		height: 78rpx;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
		background: var(--app-gradient-primary);
		box-shadow: inset 0 0 0 4rpx rgba(255, 255, 255, 0.22);
	}

	.profile-avatar-image,
	.profile-avatar-text {
		width: 100%;
		height: 100%;
	}

	.profile-avatar-text {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		font-weight: 700;
		color: #fff;
	}

	.profile-avatar-arrow {
		width: 18rpx;
		height: 18rpx;
		border-top: 4rpx solid color-mix(in srgb, var(--app-color-primary-strong) 58%, #c8a2ae 42%);
		border-right: 4rpx solid color-mix(in srgb, var(--app-color-primary-strong) 58%, #c8a2ae 42%);
		transform: rotate(45deg);
		border-radius: 2rpx;
		box-sizing: border-box;
		flex-shrink: 0;
	}
</style>
