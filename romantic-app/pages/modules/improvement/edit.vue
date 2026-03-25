<template>
  <view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader :title="pageTitle" eyebrow="记录编辑" />
    </view>

    <view class="app-account-content">
      <AccountPanel title="记录信息">
        <AccountField label="问题标题">
          <input v-model="form.title" class="input app-field" placeholder="请输入问题标题" placeholder-class="app-account-input-placeholder" />
        </AccountField>

        <AccountField label="详细说明">
          <textarea v-model="form.description" maxlength="300" class="textarea app-textarea" placeholder="请输入详细说明" placeholder-class="app-account-input-placeholder" />
        </AccountField>

        <picker class="picker-row-shell" mode="selector" :range="targetOptions" range-key="label" :value="targetIndex" @change="handleTargetChange">
          <view class="picker-row">
            <view class="picker-row-main">
              <view class="picker-row-label">改进方向</view>
              <view class="picker-row-value">{{ targetOptions[targetIndex]?.label || '请选择改进方向' }}</view>
            </view>
            <view class="picker-row-arrow"></view>
          </view>
        </picker>

        <picker class="picker-row-shell" mode="date" :value="form.startDate" @change="handleDateChange">
          <view class="picker-row">
            <view class="picker-row-main">
              <view class="picker-row-label">开始日期</view>
              <view class="picker-row-value">{{ form.startDate || '请选择开始日期' }}</view>
            </view>
            <view class="picker-row-arrow"></view>
          </view>
        </picker>

        <picker class="picker-row-shell" mode="selector" :range="statusOptions" range-key="label" :value="statusIndex" @change="handleStatusChange">
          <view class="picker-row">
            <view class="picker-row-main">
              <view class="picker-row-label">当前状态</view>
              <view class="picker-row-value">{{ statusOptions[statusIndex]?.label || '请选择当前状态' }}</view>
            </view>
            <view class="picker-row-arrow"></view>
          </view>
        </picker>

        <view class="status-preview" :class="`status-preview-${form.status}`">
          <view class="status-preview-title">{{ statusPreviewMap[form.status]?.title }}</view>
          <view class="status-preview-desc">{{ statusPreviewMap[form.status]?.desc }}</view>
        </view>

        <AccountField label="最近反馈摘要">
          <input v-model="form.latestFeedback" class="input app-field" placeholder="请输入反馈摘要" placeholder-class="app-account-input-placeholder" />
        </AccountField>
      </AccountPanel>

      <AccountPanel title="图片与视频">
        <view class="media-toolbar">
          <button class="compact-media-btn" @click="chooseImages">选择图片</button>
          <button class="compact-media-btn" @click="chooseVideo">选择视频</button>
        </view>
        <view class="media-tips">当前已选 {{ imageCount }} 张图片，{{ videoCount }} 个视频</view>

        <view v-if="mediaList.length" class="media-grid">
          <view v-for="(item, index) in mediaList" :key="item.localId" class="media-card">
            <image
              v-if="item.mediaType === 'image'"
              class="media-thumb"
              :src="item.previewUrl"
              mode="aspectFill"
              @click="previewEditImage(item)"
            />
            <video v-else class="media-thumb" :src="item.previewUrl" objectFit="cover" :show-center-play-btn="false"></video>
            <view class="media-type">{{ item.mediaType === 'image' ? '图片' : '视频' }}</view>
            <view class="media-remove" @click.stop="removeMedia(index)">×</view>
          </view>
        </view>
        <view v-else class="media-empty">还没有添加媒体</view>
      </AccountPanel>

      <button class="save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn" @click="handleSave">保存记录</button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createImprovementNote, fetchImprovementNoteDetail, updateImprovementNote } from '@/services/improvement-notes.js'
import { requireAuth } from '@/utils/auth.js'
import { previewImages } from '@/utils/image-preview.js'
import { prepareImageFile, resolveMediaUrl, uploadImprovementMedia } from '@/utils/media-upload.js'
import { backPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountField from '@/pages/account/components/AccountField.vue'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const targetOptions = [
  { key: 'me', label: '我自己' },
  { key: 'lover', label: '对方感受' },
  { key: 'both', label: '共同努力' }
]

const statusOptions = [
  { key: 'resolved', label: '已改善 · 已经明显好转' },
  { key: 'improving', label: '跟进中 · 还在持续努力' },
  { key: 'pending', label: '待开始 · 准备马上行动' }
]

const statusPreviewMap = {
  resolved: {
    title: '已改善',
    desc: '状态会更新为已经明显好转。'
  },
  improving: {
    title: '跟进中',
    desc: '状态会更新为还在持续努力。'
  },
  pending: {
    title: '待开始',
    desc: '状态会更新为准备开始行动。'
  }
}

const { themeStyle } = useThemePage()
const noteId = ref('')
const targetIndex = ref(2)
const statusIndex = ref(1)
const mediaList = ref([])
const form = reactive({
  title: '',
  description: '',
  targetType: 'both',
  status: 'improving',
  startDate: '',
  latestFeedback: ''
})

const pageTitle = computed(() => (noteId.value ? '编辑记录' : '新增记录'))
const imageCount = computed(() => mediaList.value.filter((item) => item.mediaType === 'image').length)
const videoCount = computed(() => mediaList.value.filter((item) => item.mediaType === 'video').length)

onLoad(async (options) => {
  if (!requireAuth()) return
  noteId.value = options?.id || ''
  if (noteId.value) {
    await loadDetail()
    return
  }
  form.startDate = new Date().toISOString().slice(0, 10)
})

async function loadDetail() {
  try {
    const detail = await fetchImprovementNoteDetail(noteId.value)
    form.title = detail.title || ''
    form.description = detail.description || ''
    form.targetType = detail.targetType || 'both'
    form.status = detail.status || 'improving'
    form.startDate = detail.startDate || ''
    form.latestFeedback = detail.latestFeedback || ''
    targetIndex.value = Math.max(targetOptions.findIndex((item) => item.key === form.targetType), 0)
    statusIndex.value = Math.max(statusOptions.findIndex((item) => item.key === form.status), 0)
    mediaList.value = (detail.mediaList || []).map((item) => ({
      localId: `remote_${item.id}`,
      id: item.id,
      mediaType: item.mediaType,
      fileUrl: item.fileUrl,
      thumbnailUrl: item.thumbnailUrl,
      previewUrl: resolveMediaUrl(item.thumbnailUrl || item.fileUrl),
      localPath: '',
      thumbnailLocalPath: ''
    }))
  } catch (error) {
    uni.showToast({ title: error?.message || '记录详情加载失败', icon: 'none' })
  }
}

function handleTargetChange(event) {
  targetIndex.value = Number(event.detail.value || 0)
  form.targetType = targetOptions[targetIndex.value]?.key || 'both'
}

function handleStatusChange(event) {
  statusIndex.value = Number(event.detail.value || 0)
  form.status = statusOptions[statusIndex.value]?.key || 'improving'
}

function handleDateChange(event) {
  form.startDate = event.detail.value
}

async function chooseImages() {
  const remain = 9 - imageCount.value
  if (remain <= 0) {
    uni.showToast({ title: '图片最多上传 9 张', icon: 'none' })
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
  if (videoCount.value >= 1) {
    uni.showToast({ title: '视频最多上传 1 个', icon: 'none' })
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
      previewUrl: result.thumbTempFilePath || result.tempFilePath,
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

function previewEditImage(currentItem) {
  if (currentItem?.mediaType !== 'image') return
  const imageUrls = mediaList.value
    .filter((item) => item.mediaType === 'image')
    .map((item) => item.previewUrl)
    .filter(Boolean)
  if (!imageUrls.length || !currentItem.previewUrl) return
  previewImages(imageUrls, currentItem.previewUrl)
}

async function handleSave() {
  if (!form.title.trim()) {
    uni.showToast({ title: '请先填写问题标题', icon: 'none' })
    return
  }
  if (!form.startDate) {
    uni.showToast({ title: '请选择开始日期', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '正在保存', mask: true })
    const uploadedMedia = []
    for (let index = 0; index < mediaList.value.length; index += 1) {
      const item = mediaList.value[index]
      let fileUrl = item.fileUrl
      let thumbnailUrl = item.thumbnailUrl
      if (item.localPath) {
        fileUrl = await uploadImprovementMedia(item.localPath)
      }
      if (item.thumbnailLocalPath) {
        thumbnailUrl = await uploadImprovementMedia(item.thumbnailLocalPath)
      }
      uploadedMedia.push({
        mediaType: item.mediaType,
        fileUrl,
        thumbnailUrl: thumbnailUrl || '',
        sortOrder: index
      })
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      targetType: form.targetType,
      status: form.status,
      startDate: form.startDate,
      latestFeedback: form.latestFeedback.trim(),
      mediaList: uploadedMedia
    }

    if (noteId.value) {
      await updateImprovementNote(noteId.value, payload)
    } else {
      await createImprovementNote(payload)
    }

    uni.hideLoading()
    uni.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => backPage(), 250)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: error?.message || '保存失败', icon: 'none' })
  }
}
</script>

<style scoped>
  .picker-row-shell { display: block; margin-top: 18rpx; }
  .picker-row { padding: 24rpx 26rpx; border-radius: 26rpx; background: #fff5f8; display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
  .picker-row-main { flex: 1; min-width: 0; }
  .picker-row-label { font-size: 22rpx; color: #b58b99; }
  .picker-row-value { margin-top: 8rpx; font-size: 27rpx; line-height: 1.5; color: #8f6d78; font-weight: 700; }
  .picker-row-arrow { width: 16rpx; height: 16rpx; border-top: 4rpx solid #d18aa1; border-right: 4rpx solid #d18aa1; border-radius: 2rpx; transform: rotate(45deg); flex-shrink: 0; }
  .status-preview { margin-top: 14rpx; padding: 18rpx 20rpx; border-radius: 24rpx; }
  .status-preview-title { font-size: 24rpx; font-weight: 800; }
  .status-preview-desc { margin-top: 8rpx; font-size: 22rpx; line-height: 1.7; }
  .status-preview-resolved { background: linear-gradient(135deg, rgba(255, 244, 203, 0.96), rgba(255, 225, 142, 0.92)); color: #916205; }
  .status-preview-improving { background: linear-gradient(135deg, rgba(255, 235, 241, 0.96), rgba(255, 201, 216, 0.92)); color: #b44877; }
  .status-preview-pending { background: linear-gradient(135deg, rgba(255, 232, 225, 0.96), rgba(255, 194, 178, 0.92)); color: #b55747; }
  .media-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx 28rpx;
  }
  .compact-media-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: auto;
    min-width: 0;
    height: 88rpx;
    margin: 0;
    padding: 0 32rpx;
    border: none;
    border-radius: 999rpx;
    background: linear-gradient(180deg, #fff6f9, #fff1f6);
    box-shadow: inset 0 0 0 2rpx rgba(255, 214, 226, 0.65);
    color: var(--app-color-primary-strong);
    font-size: 25rpx;
    font-weight: 800;
    line-height: 1;
    text-align: center;
  }
  .media-tips { margin-top: 16rpx; font-size: 23rpx; color: #9b7481; }
  .media-grid { margin-top: 18rpx; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14rpx; }
  .media-card { position: relative; border-radius: 24rpx; overflow: hidden; background: #fff3f7; min-height: 200rpx; }
  .media-thumb { width: 100%; height: 200rpx; display: block; background: #ffeef3; }
  .media-type { position: absolute; left: 12rpx; bottom: 12rpx; padding: 6rpx 12rpx; border-radius: 999rpx; background: rgba(0, 0, 0, 0.45); color: #fff; font-size: 20rpx; }
  .media-remove { position: absolute; right: 12rpx; top: 12rpx; width: 42rpx; height: 42rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.45); color: #fff; font-size: 30rpx; line-height: 1; }
  .media-empty { font-size: 24rpx; color: #9b7481; }
  @media screen and (max-width: 520px) {
    .media-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
</style>
