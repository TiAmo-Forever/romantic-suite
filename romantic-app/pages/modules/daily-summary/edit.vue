<template>
  <view class="page app-account-page daily-edit-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader :title="pageTitle" :eyebrow="TEXT.eyebrow" />
    </view>

    <view class="app-account-content app-account-stack">
      <view class="app-account-intro-card app-card">
        <view class="app-account-intro-kicker">{{ activeDateLabel }}</view>
        <view class="app-account-intro-title">{{ introTitle }}</view>
        <view class="app-account-intro-desc">{{ moodMeta.caption }}</view>
        <view class="app-account-intro-meta">
          <view class="app-account-intro-chip">{{ TEXT.sharedWord }}</view>
          <view class="app-account-intro-chip">{{ mediaCountText }}</view>
        </view>
      </view>

      <AccountPanel title="今天的氛围" description="先挑一个最贴近今天的感觉，再把这一天写下来。">
        <view class="mood-grid">
          <view
            v-for="item in moodOptions"
            :key="item.key"
            class="mood-chip"
            :class="[`mood-chip-${item.key}`, { active: form.mood === item.key }]"
            @click="form.mood = item.key"
          >
            {{ item.label }}
          </view>
        </view>
      </AccountPanel>

      <AccountPanel title="今天的一句话" description="这不是正式日记，只要留下今天最想记住的一小段就好。">
        <textarea
          v-model="form.content"
          maxlength="300"
          class="app-textarea daily-textarea"
          placeholder="写下今天最想认真留住的一句话……"
          placeholder-class="app-account-input-placeholder"
        />
        <view class="content-meta">{{ form.content.length }}/300</view>
      </AccountPanel>

      <AccountPanel title="图片与视频" description="可以给今天的小计补上一张照片，或者一段短短的视频。">
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

        <view class="media-tips">{{ mediaCountText }}</view>

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
              <view class="media-play-icon"></view>
            </view>
            <view class="media-type">{{ item.mediaType === 'image' ? TEXT.imageWord : TEXT.videoWord }}</view>
            <view class="media-remove" @click.stop="removeMedia(index)">{{ TEXT.remove }}</view>
          </view>
        </view>
        <view v-else class="media-empty">{{ TEXT.emptyMedia }}</view>
      </AccountPanel>

      <button class="save-btn app-primary-btn app-primary-btn-shadow" :disabled="saving" @click="handleSave">
        {{ saving ? TEXT.savingButton : TEXT.saveButton }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  createDailySummaryEntry,
  DAILY_SUMMARY_MOODS,
  fetchDailySummaryByDate,
  getDailySummaryMoodMeta,
  updateDailySummaryEntry
} from '@/services/daily-summaries.js'
import { requireAuth } from '@/utils/auth.js'
import { previewImages } from '@/utils/image-preview.js'
import { prepareImageFile, resolveMediaUrl, uploadDailySummaryMedia } from '@/utils/media-upload.js'
import { openMediaViewer } from '@/utils/media-viewer.js'
import { backPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const MAX_IMAGE_COUNT = 9
const MAX_VIDEO_COUNT = 1
const TEXT = {
  eyebrow: '共享日常',
  createTitle: '记录今天',
  editTitle: '编辑今天的小计',
  createIntro: '把今天想认真留下的一段话写下来。',
  editIntro: '这条小计已经在今天这一页里，随时都可以再修一修。',
  sharedWord: '双方都可补充',
  addImage: '添加图片',
  addVideo: '添加视频',
  imageWord: '图片',
  videoWord: '视频',
  saveButton: '保存今天的小计',
  savingButton: '保存中',
  emptyMedia: '暂时还没有媒体内容。',
  remove: '×',
  imageLimit: '图片最多 9 张',
  videoLimit: '视频最多 1 个',
  contentRequired: '请先写下一句今天的小计',
  loadFailed: '今日小计加载失败',
  saveFailed: '保存失败',
  saved: '今日小计已保存'
}

const { themeStyle } = useThemePage()
const moodOptions = DAILY_SUMMARY_MOODS
const saving = ref(false)
const summaryId = ref('')
const entryId = ref('')
const activeDate = ref('')
const mediaList = ref([])
const form = reactive({
  mood: 'gentle',
  content: ''
})

const isEditing = computed(() => Boolean(entryId.value))
const pageTitle = computed(() => (isEditing.value ? TEXT.editTitle : TEXT.createTitle))
const introTitle = computed(() => (isEditing.value ? TEXT.editIntro : TEXT.createIntro))
const moodMeta = computed(() => getDailySummaryMoodMeta(form.mood))
const activeDateLabel = computed(() => formatPrettyDate(activeDate.value))
const imageCount = computed(() => mediaList.value.filter((item) => item.mediaType === 'image').length)
const videoCount = computed(() => mediaList.value.filter((item) => item.mediaType === 'video').length)
const mediaCountText = computed(() => `已选 ${imageCount.value} 张图片 / ${videoCount.value} 个视频`)

onLoad(async (options) => {
  if (!requireAuth()) return
  summaryId.value = String(options?.summaryId || '').trim()
  entryId.value = String(options?.entryId || '').trim()
  activeDate.value = String(options?.date || '').trim() || formatDate(new Date())

  if (isEditing.value) {
    await loadEntry()
  }
})

async function loadEntry() {
  try {
    const detail = await fetchDailySummaryByDate(activeDate.value)
    const target = (detail.entryList || []).find((item) => String(item.id) === entryId.value)
    if (!target) {
      throw new Error('这条小计不存在或已经被删除')
    }

    summaryId.value = String(detail.id || '')
    form.mood = target.mood || 'gentle'
    form.content = target.content || ''
    mediaList.value = (target.mediaList || []).map((item, index) => ({
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

async function chooseImages() {
  const remain = MAX_IMAGE_COUNT - imageCount.value
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

    for (const filePath of result.tempFilePaths || []) {
      const preparedPath = await prepareImageFile(filePath)
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
  if (videoCount.value >= MAX_VIDEO_COUNT) {
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
      fileUrl = await uploadDailySummaryMedia(item.localPath)
    }
    if (item.thumbnailLocalPath) {
      thumbnailUrl = await uploadDailySummaryMedia(item.thumbnailLocalPath)
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
  const content = String(form.content || '').trim()
  if (!content) {
    uni.showToast({ title: TEXT.contentRequired, icon: 'none' })
    return
  }

  try {
    saving.value = true
    uni.showLoading({ title: TEXT.savingButton, mask: true })

    const payload = {
      mood: form.mood,
      content,
      mediaList: await buildUploadedMedia()
    }

    if (isEditing.value) {
      await updateDailySummaryEntry(summaryId.value, entryId.value, payload)
    } else {
      await createDailySummaryEntry(activeDate.value, payload)
    }

    uni.hideLoading()
    uni.showToast({ title: TEXT.saved, icon: 'success' })
    setTimeout(() => backPage(), 320)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: error?.message || TEXT.saveFailed, icon: 'none' })
  } finally {
    saving.value = false
  }
}

function formatPrettyDate(value) {
  if (!value) return '今天'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style scoped>
.daily-edit-page {
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.92), rgba(255, 243, 238, 0.92)),
    linear-gradient(180deg, #fff4f7 0%, #ffedf2 100%);
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.mood-chip {
  min-height: 88rpx;
  padding: 0 18rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 600;
  border: 2rpx solid rgba(255, 255, 255, 0.58);
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.32);
}

.mood-chip.active {
  transform: translateY(-2rpx);
  box-shadow: 0 12rpx 24rpx rgba(255, 140, 175, 0.14);
}

.mood-chip-gentle {
  background: #fff1f5;
  color: #c66e89;
}

.mood-chip-sweet {
  background: #fff0e7;
  color: #cc815d;
}

.mood-chip-calm {
  background: #eef7ef;
  color: #70936a;
}

.mood-chip-missing {
  background: #f6efff;
  color: #8f78ba;
}

.mood-chip-busy {
  background: #fff6e5;
  color: #bf8c45;
}

.mood-chip-closer {
  background: #edf6fb;
  color: #5a8dae;
}

.daily-textarea {
  min-height: 280rpx;
}

.content-meta {
  margin-top: 14rpx;
  text-align: right;
  font-size: 22rpx;
  color: #b28190;
}

.media-toolbar {
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

.media-play-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.76);
  position: relative;
}

.media-play-icon::before {
  content: '';
  position: absolute;
  left: 30rpx;
  top: 19rpx;
  border-left: 22rpx solid #ff7ea6;
  border-top: 16rpx solid transparent;
  border-bottom: 16rpx solid transparent;
}

.media-type {
  position: absolute;
  left: 12rpx;
  bottom: 12rpx;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
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

.save-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 30rpx;
}

@media screen and (max-width: 520px) {
  .media-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
