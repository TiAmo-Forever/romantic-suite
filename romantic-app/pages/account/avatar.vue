<template>
	<view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
		<view class="app-account-topbar-shell">
			<AccountHeader :title="TEXT.pageTitle" :eyebrow="TEXT.eyebrow" />
		</view>
		<view class="app-account-content">
			<view class="app-account-stack">
				<AccountIntroCard
					eyebrow="头像风格"
					title="挑一个更像现在的你"
					description="你可以在预设头像、上传照片和字符头像之间切换，保存后会同步到当前账号的资料展示里。"
					:tags="[avatarModeTag, previewAvatarUrl ? '已有头像预览' : '等待选择头像']"
				/>
				<AccountPanel :title="TEXT.panelTitle" :description="TEXT.panelDescription">
					<view class="avatar-mode-row">
						<view class="avatar-mode" :class="{ active: form.avatarType === 'preset' }" @click="setAvatarType('preset')">{{ TEXT.presetMode }}</view>
						<view class="avatar-mode" :class="{ active: form.avatarType === 'upload' }" @click="activateUploadAvatar">{{ TEXT.uploadMode }}</view>
						<view class="avatar-mode" :class="{ active: form.avatarType === 'text' }" @click="setAvatarType('text')">{{ TEXT.textMode }}</view>
					</view>

					<template v-if="form.avatarType === 'preset'">
						<AccountField :label="TEXT.presetFieldLabel" :hint="TEXT.presetHint" bare>
							<scroll-view class="preset-scroll" scroll-x show-scrollbar="false">
								<view class="preset-row">
									<view
										v-for="item in avatarPresets"
										:key="item.key"
										class="preset-card"
										:class="{ active: form.avatarPreset === item.key }"
										:style="{ background: item.gradient }"
										@click="selectPreset(item.key)"
									>
										<view class="preset-icon">{{ item.text }}</view>
										<view class="preset-name">{{ item.label }}</view>
									</view>
								</view>
							</scroll-view>
						</AccountField>
					</template>

					<template v-else-if="form.avatarType === 'upload'">
						<AccountField :label="TEXT.uploadFieldLabel" :hint="TEXT.uploadHint" bare>
							<view class="upload-panel app-input-shell">
								<image v-if="previewAvatarUrl" class="upload-preview" :src="previewAvatarUrl" mode="aspectFill" @click="previewCurrentAvatar"></image>
								<view v-else class="upload-empty">{{ TEXT.emptyUpload }}</view>
								<view class="upload-actions">
									<button class="small-btn" @click="chooseAvatarImage">{{ TEXT.chooseButton }}</button>
									<button class="small-btn ghost" @click="clearAvatarImage">{{ TEXT.clearButton }}</button>
								</view>
							</view>
						</AccountField>
					</template>

					<template v-else>
						<AccountField :label="TEXT.textFieldLabel" :hint="TEXT.textHint">
							<input
								v-model="form.avatarText"
								maxlength="2"
								class="input app-field"
								:placeholder="TEXT.textPlaceholder"
								placeholder-class="app-account-input-placeholder"
							/>
						</AccountField>
					</template>
				</AccountPanel>
				<view class="app-account-action-bar">
					<view class="app-account-action-note">
						<view class="app-account-action-note-title">保存后会更新账号资料中的头像展示</view>
						<view class="app-account-action-note-desc">如果使用上传头像，系统会先完成裁剪和上传，再同步保存到服务端。</view>
					</view>
					<button class="save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn" @click="handleSave">{{ TEXT.saveButton }}</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { requireAuth } from '@/utils/auth.js'
import { clearAvatarDraft, getAvatarDraft, resolveAvatarUrl, uploadAvatarFile } from '@/utils/avatar.js'
import { saveProfilePatchAndBack } from '@/utils/account.js'
import { previewImages } from '@/utils/image-preview.js'
import { fetchRemoteProfile } from '@/services/profile.js'
import { getAvatarPresets, getProfile, saveProfile } from '@/utils/profile.js'
import { goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountField from '@/pages/account/components/AccountField.vue'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountIntroCard from '@/pages/account/components/AccountIntroCard.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const TEXT = {
	pageTitle: '\u5934\u50CF\u8BBE\u7F6E',
	eyebrow: '\u5934\u50CF\u7F16\u8F91',
	panelTitle: '\u5934\u50CF\u65B9\u5F0F',
	panelDescription: '\u53EF\u4EE5\u5728\u9ED8\u8BA4\u5934\u50CF\u3001\u4E0A\u4F20\u5934\u50CF\u548C\u5B57\u7B26\u5934\u50CF\u4E4B\u95F4\u5207\u6362\u3002',
	presetMode: '\u9ED8\u8BA4\u5934\u50CF',
	uploadMode: '\u4E0A\u4F20\u5934\u50CF',
	textMode: '\u5B57\u7B26\u5934\u50CF',
	presetFieldLabel: '\u9ED8\u8BA4\u5934\u50CF',
	presetHint: '\u5DE6\u53F3\u6ED1\u52A8\u67E5\u770B\u66F4\u591A\u9884\u8BBE\uFF0C\u9009\u4E2D\u540E\u4F1A\u76F4\u63A5\u5E94\u7528\u5230\u5934\u50CF\u9884\u89C8\u3002',
	uploadFieldLabel: '\u4E0A\u4F20\u5934\u50CF',
	uploadHint: '\u5982\u679C\u5DF2\u7ECF\u4E0A\u4F20\u8FC7\u5934\u50CF\uFF0C\u4F1A\u5148\u5C55\u793A\u5F53\u524D\u9884\u89C8\uFF1B\u6CA1\u6709\u5934\u50CF\u65F6\u624D\u4F1A\u63D0\u793A\u91CD\u65B0\u9009\u62E9\u3002',
	emptyUpload: '\u8FD8\u6CA1\u6709\u9009\u62E9\u5934\u50CF',
	chooseButton: '\u9009\u62E9\u5E76\u88C1\u526A',
	clearButton: '\u6E05\u7A7A\u5934\u50CF',
	textFieldLabel: '\u5934\u50CF\u5B57\u7B26',
	textHint: '\u9002\u5408\u505A\u7B80\u5355\u7684\u60C5\u7EEA\u6807\u8BB0\uFF0C\u6700\u591A\u4FDD\u7559 2 \u4E2A\u5B57\u7B26\u3002',
	textPlaceholder: '\uD83D\uDC95',
	saveButton: '\u4FDD\u5B58\u5934\u50CF',
	saveSuccess: '\u5934\u50CF\u5DF2\u4FDD\u5B58',
	saveError: '\u5934\u50CF\u4FDD\u5B58\u5931\u8D25'
}

const { themeStyle } = useThemePage()
const form = reactive(getProfile())
const avatarPresets = getAvatarPresets()
const draftAvatarPath = ref('')
const previewAvatarUrl = computed(() => resolveAvatarUrl(draftAvatarPath.value || form.avatarImage))
const avatarModeTag = computed(() => {
	if (form.avatarType === 'upload') return '上传头像'
	if (form.avatarType === 'text') return '字符头像'
	return '默认头像'
})

onLoad(() => {
	requireAuth()
})

onShow(async () => {
	if (!requireAuth()) return

	try {
		Object.assign(form, await fetchRemoteProfile())
		saveProfile(form)
	} catch (error) {
		Object.assign(form, getProfile())
	}

	const draft = getAvatarDraft()
	if (!draft) return
	form.avatarType = 'upload'
	draftAvatarPath.value = draft
	clearAvatarDraft()
})

function setAvatarType(type) {
	form.avatarType = type
}

function activateUploadAvatar() {
	form.avatarType = 'upload'
	if (draftAvatarPath.value || form.avatarImage) {
		return
	}
	chooseAvatarImage()
}

function selectPreset(key) {
	form.avatarType = 'preset'
	form.avatarPreset = key
}

function chooseAvatarImage() {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (result) => {
			const filePath = result.tempFilePaths?.[0]
			if (!filePath) return
			goPage(`/pages/account/avatar-crop?src=${encodeURIComponent(filePath)}`)
		}
	})
}

function clearAvatarImage() {
	form.avatarImage = ''
	draftAvatarPath.value = ''
	form.avatarType = 'upload'
}

function previewCurrentAvatar() {
	if (!previewAvatarUrl.value) return
	previewImages([previewAvatarUrl.value], previewAvatarUrl.value)
}

async function handleSave() {
	try {
		let avatarImage = form.avatarType === 'upload' ? form.avatarImage : ''

		if (form.avatarType === 'upload' && draftAvatarPath.value) {
			avatarImage = await uploadAvatarFile(draftAvatarPath.value)
			form.avatarImage = avatarImage
			draftAvatarPath.value = ''
		}

		await saveProfilePatchAndBack({
			avatarType: form.avatarType,
			avatarPreset: form.avatarPreset,
			avatarText: (form.avatarText || TEXT.textPlaceholder).trim() || TEXT.textPlaceholder,
			avatarImage
		}, TEXT.saveSuccess)
	} catch (error) {
		uni.showToast({ title: error?.message || TEXT.saveError, icon: 'none' })
	}
}
</script>

<style scoped>
	.avatar-mode-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14rpx; }
	.avatar-mode { height: 84rpx; border-radius: 24rpx; display: flex; align-items: center; justify-content: center; font-size: 24rpx; font-weight: 700; color: #b56f85; background: #fff4f7; box-shadow: inset 0 0 0 2rpx rgba(255, 143, 179, 0.08); }
	.avatar-mode.active { background: linear-gradient(135deg, #ff9fbc, #ffb8cb); color: #fff; }
	.preset-scroll { margin-top: 4rpx; white-space: nowrap; }
	.preset-row { display: inline-flex; gap: 16rpx; padding-right: 24rpx; }
	.preset-card { width: 172rpx; padding: 24rpx 18rpx; border-radius: 32rpx; text-align: center; color: #fff; box-shadow: 0 12rpx 28rpx rgba(255, 143, 179, 0.14); transition: transform 0.22s ease, box-shadow 0.22s ease; }
	.preset-card.active { transform: translateY(-8rpx) scale(1.02); box-shadow: 0 20rpx 36rpx rgba(255, 126, 166, 0.24); }
	.preset-card.active .preset-icon { animation: presetPulse 0.5s ease; }
	.preset-icon { font-size: 48rpx; line-height: 1; }
	.preset-name { margin-top: 14rpx; font-size: 22rpx; font-weight: 700; }
	.upload-panel { margin-top: 4rpx; padding: 20rpx; border-radius: 24rpx; }
	.upload-preview, .upload-empty { width: 180rpx; height: 180rpx; margin: 0 auto; border-radius: 36rpx; }
	.upload-preview { display: block; }
	.upload-empty { display: flex; align-items: center; justify-content: center; background: #fff; color: #b58a97; font-size: 24rpx; text-align: center; }
	.upload-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; margin-top: 18rpx; }
	.small-btn { height: 88rpx; padding: 0; border: none; border-radius: 999rpx; display: flex; align-items: center; justify-content: center; font-size: 26rpx; font-weight: 700; background: linear-gradient(135deg, #ff8dab, #ffb4c8); color: #fff; }
	.small-btn.ghost { background: #fff4f7; color: #b56f85; }
	.small-btn::after { border: none; }
	@keyframes presetPulse { 0% { transform: scale(0.9); } 100% { transform: scale(1); } }
	@media screen and (max-width: 520px) { .avatar-mode-row, .upload-actions { grid-template-columns: 1fr; } }
</style>
