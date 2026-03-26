<template>
  <view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader :title="pageTitle" :eyebrow="TEXT.albumTitle" />
    </view>

    <view class="app-account-content">
      <AccountPanel :title="TEXT.basicTitle">
        <AccountField :label="TEXT.titleLabel">
          <input
            v-model="form.title"
            class="input app-field"
            maxlength="30"
            :placeholder="TEXT.titlePlaceholder"
            placeholder-class="app-account-input-placeholder"
          />
        </AccountField>

        <view class="app-account-form-row">
          <view class="app-account-form-col">
            <AccountField :label="TEXT.dateLabel">
              <picker class="picker app-field" mode="date" :value="form.memoryDate" @change="handleDateChange">
                <view class="picker-value">{{ form.memoryDate || TEXT.datePlaceholder }}</view>
              </picker>
            </AccountField>
          </view>

          <view class="app-account-form-col">
            <AccountField :label="TEXT.locationLabel">
              <view class="picker app-field location-picker" @click="openLocationPicker">
                <view class="picker-value">{{ form.location || TEXT.locationPlaceholder }}</view>
              </view>
            </AccountField>
          </view>
        </view>

        <AccountField :label="TEXT.summaryLabel">
          <textarea
            v-model="form.summary"
            maxlength="200"
            class="textarea app-textarea"
            :placeholder="TEXT.summaryPlaceholder"
            placeholder-class="app-account-input-placeholder"
          />
        </AccountField>
      </AccountPanel>

      <AccountPanel :title="TEXT.tagsTitle">
        <view class="tag-module">
          <view class="tag-module-head">
            <view class="tag-module-title">{{ TEXT.presetTitle }}</view>
            <view class="tag-module-sub">{{ TEXT.tapToChoose }}</view>
          </view>
          <view class="tag-list">
            <view
              v-for="tag in presetTagOptions"
              :key="tag"
              class="tag-chip"
              :class="{ active: form.tags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </view>
          </view>
        </view>

        <view class="tag-module tag-module-custom">
          <view class="tag-module-head">
            <view class="tag-module-title">{{ TEXT.customTitle }}</view>
            <view class="tag-module-sub">{{ TEXT.customLimit }}</view>
          </view>

          <view class="tag-input-row">
            <input
              v-model="customTagInput"
              class="input app-field tag-input"
              maxlength="8"
              :placeholder="TEXT.customPlaceholder"
              placeholder-class="app-account-input-placeholder"
            />
            <view class="tag-add-btn" @click="handleAddCustomTag">{{ TEXT.add }}</view>
          </view>

          <view v-if="customTags.length" class="tag-list custom-tag-list">
            <view
              v-for="tag in customTags"
              :key="tag"
              class="tag-chip tag-chip-custom"
              :class="{ active: form.tags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              <text class="tag-chip-text">{{ tag }}</text>
              <text class="tag-chip-remove" @click.stop="removeCustomTag(tag)">{{ TEXT.remove }}</text>
            </view>
          </view>
        </view>
      </AccountPanel>

      <AccountPanel :title="TEXT.mediaTitle">
        <view class="media-toolbar">
          <view class="media-entry-btn media-entry-photo" @click="chooseImages">
            <view class="media-entry-dot"></view>
            <view class="media-entry-title">{{ TEXT.addImage }}</view>
          </view>
          <view class="media-entry-btn media-entry-video" @click="chooseVideo">
            <view class="media-entry-dot"></view>
            <view class="media-entry-title">{{ TEXT.addVideo }}</view>
          </view>
        </view>

        <view class="media-tips">
          {{ TEXT.selectedPrefix }} {{ imageCount }} {{ TEXT.imageUnit }}{{ TEXT.countJoin }}{{ videoCount }} {{ TEXT.videoUnit }}
        </view>

        <view v-if="mediaList.length" class="media-grid">
          <view v-for="(item, index) in mediaList" :key="item.localId" class="media-card">
            <image
              v-if="item.mediaType === 'image'"
              class="media-thumb"
              :src="item.previewUrl"
              mode="aspectFill"
              @click="previewDraftImage(item)"
            />
            <image
              v-else-if="item.previewUrl"
              class="media-thumb"
              :src="item.previewUrl"
              mode="aspectFill"
              @click="openViewer(mediaList, index)"
            />
            <view v-else class="media-thumb media-fallback" @click="openViewer(mediaList, index)">
              <view class="memory-play-icon"></view>
            </view>
            <view class="media-type">{{ item.mediaType === 'image' ? TEXT.imageWord : TEXT.videoWord }}</view>
            <view v-if="index === 0" class="media-cover-badge">{{ TEXT.cover }}</view>
            <view class="media-remove" @click.stop="removeMedia(index)">{{ TEXT.remove }}</view>
          </view>
        </view>
        <view v-else class="media-empty">{{ TEXT.emptyMedia }}</view>
      </AccountPanel>

      <button class="save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn" @click="handleSave">
        {{ TEXT.save }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { createAlbumMemory, fetchAlbumMemoryDetail, updateAlbumMemory } from '@/services/albums.js'
import { requireAuth } from '@/utils/auth.js'
import { buildAreaPickerUrl, clearAreaDraft, getAreaDraft } from '@/utils/area.js'
import { previewImages } from '@/utils/image-preview.js'
import { prepareImageFile, resolveMediaUrl, uploadAlbumMedia } from '@/utils/media-upload.js'
import { openMediaViewer } from '@/utils/media-viewer.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountField from '@/pages/account/components/AccountField.vue'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const TEXT = {
  albumTitle: '甜蜜相册',
  basicTitle: '基础信息',
  titleLabel: '回忆标题',
  titlePlaceholder: '请输入标题',
  dateLabel: '日期',
  datePlaceholder: '请选择日期',
  locationLabel: '地点',
  locationPlaceholder: '请选择地点',
  summaryLabel: '一句话回忆',
  summaryPlaceholder: '写一句关于这天的回忆',
  tagsTitle: '回忆标签',
  presetTitle: '常用标签',
  tapToChoose: '点击选择',
  customTitle: '自定义标签',
  customLimit: '最多 6 个',
  customPlaceholder: '输入自定义标签',
  add: '添加',
  mediaTitle: '图片与视频',
  addImage: '添加图片',
  addVideo: '添加视频',
  selectedPrefix: '已选',
  countJoin: ' / ',
  imageUnit: '张图片',
  videoUnit: '个视频',
  imageWord: '图片',
  videoWord: '视频',
  cover: '封面',
  emptyMedia: '暂时还没有媒体',
  save: '保存回忆',
  createPage: '新建回忆',
  editPage: '编辑回忆',
  titleRequired: '请先填写回忆标题',
  dateRequired: '请选择回忆日期',
  loadFailed: '回忆详情加载失败',
  saveFailed: '保存失败',
  saved: '回忆已保存',
  saving: '正在保存',
  imageLimit: '图片最多 12 张',
  videoLimit: '视频最多 2 个',
  remove: '×'
}

const presetTagOptions = [
  '开心',
  '约会',
  '旅行',
  '纪念日',
  '生日',
  '海边',
  '散步',
  '见面'
]

const { themeStyle } = useThemePage()
const memoryId = ref('')
const mediaList = ref([])
const customTagInput = ref('')
const form = reactive({
  title: '',
  memoryDate: '',
  location: '',
  summary: '',
  tags: [],
  customTags: []
})

const pageTitle = computed(() => (memoryId.value ? TEXT.editPage : TEXT.createPage))
const imageCount = computed(() => mediaList.value.filter((item) => item.mediaType === 'image').length)
const videoCount = computed(() => mediaList.value.filter((item) => item.mediaType === 'video').length)
const customTags = computed(() => (Array.isArray(form.customTags) ? form.customTags : []))

onLoad(async (options) => {
  if (!requireAuth()) return
  memoryId.value = String(options?.id || '')
  if (memoryId.value) {
    await loadDetail()
  } else {
    form.memoryDate = new Date().toISOString().slice(0, 10)
  }
})

onShow(() => {
  const draft = getAreaDraft('album_location')
  if (!draft) return
  form.location = draft.displayText || draft.mergerName || draft.name || ''
  clearAreaDraft('album_location')
})

async function loadDetail() {
  try {
    const detail = await fetchAlbumMemoryDetail(memoryId.value)
    form.title = detail.title || ''
    form.memoryDate = detail.memoryDate || ''
    form.location = detail.location || ''
    form.summary = detail.summary || ''
    form.tags = [...(detail.tags || [])]
    form.customTags = [...(detail.tags || []).filter((tag) => !presetTagOptions.includes(tag))]
    mediaList.value = (detail.mediaList || []).map((item, index) => ({
      localId: `remote_${item.id || index}`,
      id: item.id || '',
      mediaType: item.mediaType,
      fileUrl: item.fileUrl || '',
      thumbnailUrl: item.thumbnailUrl || '',
      previewUrl: resolveMediaUrl(item.thumbnailUrl || item.fileUrl),
      localPath: '',
      thumbnailLocalPath: ''
    }))
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.loadFailed, icon: 'none' })
  }
}

function handleDateChange(event) {
  form.memoryDate = event.detail.value
}

function openLocationPicker() {
  goPage(buildAreaPickerUrl('album_location', {
    value: form.location || ''
  }))
}

function toggleTag(tag) {
  const currentTags = Array.isArray(form.tags) ? form.tags : []
  form.tags = currentTags.includes(tag)
    ? currentTags.filter((item) => item !== tag)
    : [...currentTags, tag].slice(0, 6)
}

function handleAddCustomTag() {
  const value = String(customTagInput.value || '').trim()
  if (!value) return
  if (form.tags.includes(value)) {
    customTagInput.value = ''
    return
  }
  form.customTags = [...customTags.value, value].slice(0, 6)
  form.tags = [...form.tags, value].slice(0, 6)
  customTagInput.value = ''
}

function removeCustomTag(tag) {
  form.customTags = customTags.value.filter((item) => item !== tag)
  form.tags = form.tags.filter((item) => item !== tag)
}

async function chooseImages() {
  const remain = 12 - imageCount.value
  if (remain <= 0) {
    uni.showToast({ title: TEXT.imageLimit, icon: 'none' })
    return
  }

  try {
    const result = await new Promise((resolve, reject) => {
      uni.chooseImage({
        count: remain,
        sizeType: ['compressed', 'original'],
        sourceType: ['album', 'camera'],
        success: resolve,
        fail: reject
      })
    })

    for (const path of result.tempFilePaths || []) {
      const preparedPath = await prepareImageFile(path)
      mediaList.value.push({
        localId: `local_${Date.now()}_${Math.random()}`,
        mediaType: 'image',
        fileUrl: '',
        thumbnailUrl: '',
        previewUrl: preparedPath,
        localPath: preparedPath,
        thumbnailLocalPath: ''
      })
    }
  } catch (error) {
    if (error?.message) {
      uni.showToast({ title: error.message, icon: 'none' })
    }
  }
}

async function chooseVideo() {
  if (videoCount.value >= 2) {
    uni.showToast({ title: TEXT.videoLimit, icon: 'none' })
    return
  }

  try {
    const result = await new Promise((resolve, reject) => {
      uni.chooseVideo({
        sourceType: ['album', 'camera'],
        compressed: true,
        success: resolve,
        fail: reject
      })
    })

    mediaList.value.push({
      localId: `local_${Date.now()}_${Math.random()}`,
      mediaType: 'video',
      fileUrl: '',
      thumbnailUrl: '',
      previewUrl: result.thumbTempFilePath || '',
      localPath: result.tempFilePath,
      thumbnailLocalPath: result.thumbTempFilePath || ''
    })
  } catch (error) {
    if (error?.message) {
      uni.showToast({ title: error.message, icon: 'none' })
    }
  }
}

function removeMedia(index) {
  mediaList.value.splice(index, 1)
}

function previewDraftImage(item) {
  const imageUrls = mediaList.value
    .filter((media) => media.mediaType === 'image')
    .map((media) => media.previewUrl)
    .filter(Boolean)
  if (!imageUrls.length || !item.previewUrl) return
  previewImages(imageUrls, item.previewUrl)
}

function openViewer(list, index) {
  const payload = []
  let nextIndex = 0

  ;(Array.isArray(list) ? list : []).forEach((item, itemIndex) => {
    const fileUrl = item.fileUrl || item.localPath || ''
    if (!fileUrl) return
    if (itemIndex === index) {
      nextIndex = payload.length
    }
    payload.push({
      mediaType: item.mediaType,
      fileUrl,
      thumbnailUrl: item.thumbnailUrl || item.thumbnailLocalPath || ''
    })
  })

  if (!payload.length) return
  openMediaViewer(payload, nextIndex)
}

async function buildUploadedMedia() {
  const uploadedMedia = []

  for (let index = 0; index < mediaList.value.length; index += 1) {
    const item = mediaList.value[index]
    let fileUrl = item.fileUrl
    let thumbnailUrl = item.thumbnailUrl

    if (item.localPath) {
      fileUrl = await uploadAlbumMedia(item.localPath)
    }
    if (item.thumbnailLocalPath) {
      thumbnailUrl = await uploadAlbumMedia(item.thumbnailLocalPath)
    }

    uploadedMedia.push({
      id: item.id || undefined,
      mediaType: item.mediaType,
      fileUrl: fileUrl || '',
      thumbnailUrl: thumbnailUrl || '',
      sortOrder: index
    })
  }

  return uploadedMedia
}

async function handleSave() {
  if (!form.title.trim()) {
    uni.showToast({ title: TEXT.titleRequired, icon: 'none' })
    return
  }
  if (!form.memoryDate) {
    uni.showToast({ title: TEXT.dateRequired, icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: TEXT.saving, mask: true })
    const payload = {
      title: form.title.trim(),
      memoryDate: form.memoryDate,
      location: form.location.trim(),
      summary: form.summary.trim(),
      tags: form.tags,
      mediaList: await buildUploadedMedia()
    }

    if (memoryId.value) {
      await updateAlbumMemory(memoryId.value, payload)
    } else {
      await createAlbumMemory(payload)
    }

    uni.hideLoading()
    uni.showToast({ title: TEXT.saved, icon: 'success' })
    setTimeout(() => backPage(), 250)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: error?.message || TEXT.saveFailed, icon: 'none' })
  }
}

</script>

<style scoped>
  .app-account-topbar-shell {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(255, 250, 252, 0.88);
  }
  .location-picker {
    justify-content: space-between;
  }
  .tag-module + .tag-module {
    margin-top: 24rpx;
  }
  .tag-module-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    margin-bottom: 16rpx;
  }
  .tag-module-title {
    font-size: 24rpx;
    font-weight: 800;
    color: #755864;
  }
  .tag-module-sub {
    font-size: 21rpx;
    color: #b28a97;
  }
  .tag-list {
    display: flex;
    gap: 14rpx;
    flex-wrap: wrap;
    padding-bottom: 6rpx;
  }
  .tag-chip {
    padding: 12rpx 22rpx;
    border-radius: 999rpx;
    background: #fff4f8;
    color: #bf7d94;
    font-size: 23rpx;
    font-weight: 700;
    box-shadow: inset 0 0 0 2rpx rgba(255, 220, 230, 0.72);
  }
  .tag-chip.active {
    background: linear-gradient(135deg, #ff7fa8, #ff9fba);
    color: #fff;
    box-shadow: none;
  }
  .tag-input-row {
    display: flex;
    align-items: center;
    gap: 14rpx;
    margin-bottom: 16rpx;
  }
  .tag-input {
    flex: 1;
    min-width: 0;
  }
  .tag-add-btn {
    flex-shrink: 0;
    height: 78rpx;
    padding: 0 28rpx;
    border-radius: 999rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #fff6f9, #fff1f6);
    box-shadow: inset 0 0 0 2rpx rgba(255, 214, 226, 0.65);
    color: var(--app-color-primary-strong);
    font-size: 24rpx;
    font-weight: 800;
  }
  .custom-tag-list {
    padding-bottom: 0;
  }
  .tag-chip-custom {
    display: inline-flex;
    align-items: center;
    gap: 10rpx;
  }
  .tag-chip-text {
    line-height: 1;
  }
  .tag-chip-remove {
    font-size: 22rpx;
    line-height: 1;
    opacity: 0.72;
  }
  .media-toolbar {
    margin-top: 6rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }
  .media-entry-btn {
    min-height: 72rpx;
    padding: 0 24rpx;
    border-radius: 999rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    box-sizing: border-box;
  }
  .media-entry-photo {
    background: linear-gradient(180deg, #fff6f9, #fff1f6);
    box-shadow: inset 0 0 0 2rpx rgba(255, 214, 226, 0.65);
  }
  .media-entry-video {
    background: linear-gradient(180deg, #fff8f3, #fff3ec);
    box-shadow: inset 0 0 0 2rpx rgba(255, 223, 206, 0.72);
  }
  .media-entry-dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    background: #d97b9d;
    flex-shrink: 0;
  }
  .media-entry-video .media-entry-dot {
    background: #e09a72;
  }
  .media-entry-title {
    font-size: 24rpx;
    line-height: 1;
    color: var(--app-color-primary-strong);
    font-weight: 800;
  }
  .media-tips {
    margin-top: 16rpx;
    font-size: 23rpx;
    color: #9b7481;
  }
  .media-grid {
    margin-top: 18rpx;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14rpx;
  }
  .media-card {
    position: relative;
    border-radius: 24rpx;
    overflow: hidden;
    background: #fff3f7;
    min-height: 180rpx;
  }
  .media-thumb {
    width: 100%;
    height: 180rpx;
    display: block;
    background: #ffeef3;
  }
  .media-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .memory-play-icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.76);
    position: relative;
  }
  .memory-play-icon::before {
    content: '';
    position: absolute;
    left: 30rpx;
    top: 19rpx;
    border-left: 22rpx solid #ff7ea6;
    border-top: 16rpx solid transparent;
    border-bottom: 16rpx solid transparent;
  }
  .media-type,
  .media-cover-badge {
    position: absolute;
    left: 12rpx;
    padding: 6rpx 12rpx;
    border-radius: 999rpx;
    font-size: 20rpx;
    color: #fff;
  }
  .media-type {
    bottom: 12rpx;
    background: rgba(0, 0, 0, 0.45);
  }
  .media-cover-badge {
    top: 12rpx;
    background: rgba(255, 95, 147, 0.82);
  }
  .media-remove {
    position: absolute;
    right: 12rpx;
    top: 12rpx;
    width: 42rpx;
    height: 42rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    font-size: 30rpx;
    line-height: 1;
  }
  .media-empty {
    font-size: 24rpx;
    color: #9b7481;
  }
  @media screen and (max-width: 520px) {
    .tag-input-row {
      align-items: stretch;
    }
    .media-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
