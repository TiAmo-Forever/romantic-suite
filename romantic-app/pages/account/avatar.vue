<template>
  <view class="page app-account-page avatar-page" :style="themeStyle">
    <GlobalNotificationBanner />

    <view class="app-account-topbar-shell">
      <view class="avatar-topbar">
        <view class="avatar-back-btn" @click="backPage">
          <view class="avatar-back-icon" aria-hidden="true"></view>
        </view>
        <view class="avatar-topbar-title">设置头像</view>
        <button class="avatar-save-btn" @click="handleSave">{{ TEXT.saveButton }}</button>
      </view>
    </view>

    <view class="app-account-content avatar-page-content">
      <view class="avatar-preview-card app-card app-fade-up">
        <view class="avatar-preview-shell" @click="handlePreviewTap">
          <image
            v-if="showImagePreview"
            class="avatar-preview-image"
            :src="previewAvatarUrl"
            mode="aspectFill"
          />
          <text v-else class="avatar-preview-text">{{ previewAvatarText }}</text>
        </view>
        <view class="avatar-preview-caption">当前头像预览</view>
        <view class="avatar-preview-source">{{ previewSourceLabel }}</view>
      </view>

      <view class="avatar-mode-switch app-fade-up app-delay-1">
        <view
          class="avatar-mode-item"
          :class="{ active: form.avatarType === 'preset' }"
          @click="setAvatarType('preset')"
        >
          <view class="avatar-mode-icon avatar-mode-icon-grid"></view>
          <text>{{ TEXT.presetMode }}</text>
        </view>
        <view
          class="avatar-mode-item"
          :class="{ active: form.avatarType === 'text' }"
          @click="setAvatarType('text')"
        >
          <text class="avatar-mode-letter">T</text>
          <text>{{ TEXT.textMode }}</text>
        </view>
      </view>

      <view v-if="form.avatarType === 'preset'" class="avatar-style-panel app-card app-fade-up app-delay-2">
        <view class="avatar-section-title">{{ TEXT.presetFieldLabel }}</view>
        <view class="avatar-preset-grid">
          <view
            v-for="item in avatarPresets"
            :key="item.key"
            class="avatar-preset-card"
            :class="{ active: form.avatarPreset === item.key }"
            :style="getPresetCardStyle(item.key)"
            @click="selectPreset(item.key)"
          >
            <view class="avatar-preset-text">{{ item.text }}</view>
            <view v-if="form.avatarPreset === item.key" class="avatar-preset-check">✓</view>
          </view>
        </view>
      </view>

      <view v-else class="avatar-style-panel app-card app-fade-up app-delay-2">
        <view class="avatar-section-title">{{ TEXT.textFieldLabel }}</view>
        <view class="avatar-text-editor">
          <view class="avatar-text-preview">{{ textAvatarPreview }}</view>
          <view class="avatar-text-form">
            <input
              v-model="form.avatarText"
              maxlength="2"
              class="avatar-text-input app-field"
              :placeholder="TEXT.textPlaceholder"
              placeholder-class="app-account-input-placeholder"
            />
            <view class="avatar-text-hint">
              <text>{{ TEXT.textHint }}</text>
              <text>{{ textLengthText }}</text>
            </view>
          </view>
        </view>
      </view>

      <view
        class="avatar-upload-card app-card app-fade-up app-delay-3"
        :class="{ active: form.avatarType === 'upload' }"
        @click="activateUploadAvatar"
      >
        <view class="avatar-upload-icon">
          <view class="avatar-upload-icon-inner"></view>
        </view>
        <view class="avatar-upload-copy">
          <view class="avatar-upload-title">{{ uploadTitle }}</view>
          <view class="avatar-upload-desc">{{ uploadDescription }}</view>
        </view>
        <view v-if="form.avatarType === 'upload' && previewAvatarUrl" class="avatar-upload-thumb-wrap" @click.stop="previewCurrentAvatar">
          <image class="avatar-upload-thumb" :src="previewAvatarUrl" mode="aspectFill" />
        </view>
      </view>

      <view v-if="form.avatarType === 'upload' && previewAvatarUrl" class="avatar-upload-actions app-fade-up app-delay-4">
        <view class="avatar-inline-action" @click="chooseAvatarImage">{{ TEXT.reselectButton }}</view>
        <view class="avatar-inline-action ghost" @click="clearAvatarImage">{{ TEXT.clearButton }}</view>
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
import { backPage, goPage } from '@/utils/nav.js'
import { fetchRemoteProfile } from '@/services/profile.js'
import { getAvatarPresets, getProfile, saveProfile } from '@/utils/profile.js'
import { useThemePage } from '@/utils/useThemePage.js'

const TEXT = {
  saveButton: '保存',
  presetMode: '默认头像',
  textMode: '文字头像',
  presetFieldLabel: '选择样式',
  textFieldLabel: '输入文字',
  textPlaceholder: '心动',
  textHint: '最多保留 2 个字，让头像更像你现在的样子',
  chooseButton: '从相册选择照片',
  reselectButton: '重新选择照片',
  clearButton: '移除照片',
  uploadTitle: '从相册选择照片',
  uploadDesc: '上传并裁剪一张更贴近现在的照片，保存后会同步到当前账号资料里',
  uploadActiveTitle: '当前正在使用上传头像',
  uploadActiveDesc: '点击可以重新选择照片，也可以保留当前照片继续保存',
  saveSuccess: '头像已保存',
  saveError: '头像保存失败'
}

const { themeStyle } = useThemePage()
const form = reactive(getProfile())
const avatarPresets = getAvatarPresets()
const draftAvatarPath = ref('')

const previewAvatarUrl = computed(() => resolveAvatarUrl(draftAvatarPath.value || form.avatarImage))
const showImagePreview = computed(() => form.avatarType === 'upload' && !!previewAvatarUrl.value)
const presetAvatarText = computed(() => {
  const selected = avatarPresets.find((item) => item.key === form.avatarPreset)
  return selected?.text || '💕'
})
const textAvatarPreview = computed(() => normalizeAvatarText(form.avatarText))
const previewAvatarText = computed(() => {
  if (form.avatarType === 'text') return textAvatarPreview.value
  if (form.avatarType === 'preset') return presetAvatarText.value
  return presetAvatarText.value
})
const previewSourceLabel = computed(() => {
  if (form.avatarType === 'upload' && previewAvatarUrl.value) return '当前使用上传照片'
  if (form.avatarType === 'text') return '当前使用文字头像'
  return '当前使用默认头像'
})
const uploadTitle = computed(() => (form.avatarType === 'upload' && previewAvatarUrl.value ? TEXT.uploadActiveTitle : TEXT.uploadTitle))
const uploadDescription = computed(() => (form.avatarType === 'upload' && previewAvatarUrl.value ? TEXT.uploadActiveDesc : TEXT.uploadDesc))
const textLengthText = computed(() => `${String(normalizeAvatarText(form.avatarText)).length}/2`)
const presetThemeMap = {
  heart: 'linear-gradient(135deg, var(--app-color-primary), var(--app-color-primary-soft))',
  bunny: 'linear-gradient(135deg, var(--app-color-primary-soft), var(--app-color-surface-soft))',
  star: 'linear-gradient(135deg, var(--app-color-primary-soft), var(--app-color-accent))',
  cat: 'linear-gradient(135deg, var(--app-color-primary), var(--app-color-accent))',
  moon: 'linear-gradient(135deg, var(--app-color-accent), var(--app-color-primary-soft))',
  flower: 'linear-gradient(135deg, var(--app-color-primary-soft), var(--app-color-primary))',
  bear: 'linear-gradient(135deg, var(--app-color-accent), var(--app-color-primary))',
  cloud: 'linear-gradient(135deg, var(--app-color-surface-soft), var(--app-color-primary-soft))'
}

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

function normalizeAvatarText(value) {
  const text = String(value || '').trim()
  if (!text) return '心'
  return text.slice(0, 2)
}

function setAvatarType(type) {
  form.avatarType = type
}

function selectPreset(key) {
  form.avatarType = 'preset'
  form.avatarPreset = key
}

function getPresetCardStyle(key) {
  return {
    background: presetThemeMap[key] || 'linear-gradient(135deg, #ffbfd0, #ffe0e8)'
  }
}

function activateUploadAvatar() {
  form.avatarType = 'upload'
  if (draftAvatarPath.value || form.avatarImage) return
  chooseAvatarImage()
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
  form.avatarType = 'preset'
}

function previewCurrentAvatar() {
  if (!showImagePreview.value || !previewAvatarUrl.value) return
  previewImages([previewAvatarUrl.value], previewAvatarUrl.value)
}

function handlePreviewTap() {
  if (showImagePreview.value) {
    previewCurrentAvatar()
  }
}

async function handleSave() {
  try {
    let avatarImage = form.avatarType === 'upload' ? form.avatarImage : ''

    if (form.avatarType === 'upload' && draftAvatarPath.value) {
      avatarImage = await uploadAvatarFile(draftAvatarPath.value)
      form.avatarImage = avatarImage
      draftAvatarPath.value = ''
    }

    await saveProfilePatchAndBack(
      {
        avatarType: form.avatarType,
        avatarPreset: form.avatarPreset,
        avatarText: normalizeAvatarText(form.avatarText),
        avatarImage
      },
      TEXT.saveSuccess
    )
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.saveError, icon: 'none' })
  }
}
</script>

<style scoped>
.avatar-page {
  min-height: 100vh;
  background: var(--app-page-gradient-main);
}

.avatar-page-content {
  padding-top: 22rpx;
}

.avatar-page-content .app-account-stack {
  gap: 26rpx;
}

.avatar-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.avatar-back-btn,
.avatar-save-btn {
  flex-shrink: 0;
}

.avatar-back-btn {
  width: 78rpx;
  height: 78rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-color-surface);
  box-shadow: var(--app-shadow-soft);
}

.avatar-back-icon {
  width: 18rpx;
  height: 18rpx;
  border-left: 4rpx solid var(--app-color-text);
  border-bottom: 4rpx solid var(--app-color-text);
  border-radius: 2rpx;
  box-sizing: border-box;
  transform: rotate(45deg);
}

.avatar-topbar-title {
  flex: 1;
  min-width: 0;
  font-size: 34rpx;
  font-weight: 700;
  color: var(--app-color-primary-strong);
}

.avatar-save-btn {
  min-width: 124rpx;
  height: 74rpx;
  line-height: 74rpx;
  padding: 0 28rpx;
  border: none;
  border-radius: 999rpx;
  background: var(--app-gradient-primary);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: var(--app-shadow-soft);
}

.avatar-save-btn::after {
  border: none;
}

.avatar-preview-card,
.avatar-style-panel,
.avatar-upload-card {
  padding: 34rpx;
  border-radius: 34rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.52);
}

.avatar-preview-card {
  text-align: center;
  background:
    radial-gradient(circle at top center, var(--app-page-glow-strong), transparent 44%),
    var(--app-card-gradient-soft);
  box-shadow: var(--app-shadow-card);
}

.avatar-preview-shell {
  width: 188rpx;
  height: 188rpx;
  margin: 8rpx auto 0;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-gradient-hero);
  box-shadow: var(--app-shadow-card);
}

.avatar-preview-image {
  width: 100%;
  height: 100%;
  display: block;
}

.avatar-preview-text {
  font-size: 74rpx;
  font-weight: 700;
  color: #fff;
}

.avatar-preview-caption {
  margin-top: 28rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--app-color-primary-strong);
}

.avatar-preview-source {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: var(--app-color-text);
}

.avatar-mode-switch {
  padding: 10rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.38);
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.26);
}

.avatar-mode-item {
  height: 84rpx;
  border-radius: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: var(--app-color-surface);
  color: var(--app-color-text);
  font-size: 26rpx;
  font-weight: 700;
  box-shadow: var(--app-shadow-soft);
  border: 2rpx solid rgba(255, 255, 255, 0.32);
}

.avatar-mode-item.active {
  background: var(--app-gradient-primary);
  color: #fff;
  box-shadow: var(--app-shadow-card);
}

.avatar-mode-icon-grid {
  width: 28rpx;
  height: 28rpx;
  border-radius: 8rpx;
  background:
    linear-gradient(#fff, #fff) left top / 10rpx 10rpx no-repeat,
    linear-gradient(#fff, #fff) right top / 10rpx 10rpx no-repeat,
    linear-gradient(#fff, #fff) left bottom / 10rpx 10rpx no-repeat,
    linear-gradient(#fff, #fff) right bottom / 10rpx 10rpx no-repeat;
}

.avatar-mode-letter {
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1;
}

.avatar-style-panel {
  background:
    radial-gradient(circle at top right, var(--app-page-glow-mid), transparent 30%),
    var(--app-card-gradient-soft);
  box-shadow: var(--app-shadow-card);
}

.avatar-section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--app-color-primary-strong);
}

.avatar-preset-grid {
  margin-top: 28rpx;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22rpx;
}

.avatar-preset-card {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--app-shadow-soft);
  border: 2rpx solid rgba(255, 255, 255, 0.34);
}

.avatar-preset-card.active {
  box-shadow: 0 0 0 6rpx var(--app-color-surface), var(--app-shadow-card);
}

.avatar-preset-text {
  font-size: 52rpx;
  color: #fff;
}

.avatar-preset-check {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-color-primary-soft);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.avatar-text-editor {
  margin-top: 28rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar-text-preview {
  width: 134rpx;
  height: 134rpx;
  border-radius: 28rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-gradient-hero);
  color: #fff;
  font-size: 56rpx;
  font-weight: 700;
  box-shadow: var(--app-shadow-card);
}

.avatar-text-form {
  flex: 1;
  min-width: 0;
  padding: 18rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.42);
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.28);
}

.avatar-text-input {
  width: 100%;
  min-height: 92rpx;
  border-radius: 24rpx;
  background: var(--app-color-surface-soft);
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.42);
}

.avatar-text-hint {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--app-color-text);
}

.avatar-upload-card {
  display: flex;
  align-items: center;
  gap: 22rpx;
  background:
    radial-gradient(circle at top right, var(--app-page-glow-soft), transparent 28%),
    var(--app-card-gradient-soft);
  box-shadow: var(--app-shadow-card);
}

.avatar-upload-card.active {
  box-shadow: 0 0 0 4rpx rgba(255, 255, 255, 0.42), var(--app-shadow-card);
}

.avatar-upload-icon {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-color-surface-soft);
}

.avatar-upload-icon-inner {
  width: 36rpx;
  height: 28rpx;
  border-radius: 8rpx;
  border: 4rpx solid var(--app-color-primary-soft);
  position: relative;
}

.avatar-upload-icon-inner::before {
  content: '';
  position: absolute;
  left: 8rpx;
  top: -10rpx;
  width: 12rpx;
  height: 8rpx;
  border-radius: 6rpx 6rpx 0 0;
  background: var(--app-color-primary-soft);
}

.avatar-upload-icon-inner::after {
  content: '';
  position: absolute;
  right: 6rpx;
  top: 6rpx;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: var(--app-color-primary-soft);
}

.avatar-upload-copy {
  flex: 1;
  min-width: 0;
}

.avatar-upload-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--app-color-primary-strong);
}

.avatar-upload-desc {
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--app-color-text);
}

.avatar-upload-thumb-wrap {
  width: 88rpx;
  height: 88rpx;
  flex-shrink: 0;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: var(--app-shadow-soft);
}

.avatar-upload-thumb {
  width: 100%;
  height: 100%;
  display: block;
}

.avatar-upload-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 22rpx;
  padding: 6rpx 2rpx 0;
}

.avatar-inline-action {
  flex: 1;
  min-height: 82rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-gradient-primary);
  color: #fff;
  font-size: 25rpx;
  font-weight: 700;
  box-shadow: var(--app-shadow-soft);
  border: 2rpx solid rgba(255, 255, 255, 0.26);
}

.avatar-inline-action.ghost {
  background: var(--app-color-surface);
  color: var(--app-color-text);
  box-shadow: var(--app-shadow-soft);
}

@media screen and (max-width: 520px) {
  .avatar-preset-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .avatar-text-editor {
    flex-direction: column;
    align-items: stretch;
  }

  .avatar-text-preview {
    width: 100%;
    height: 140rpx;
  }
}
</style>
