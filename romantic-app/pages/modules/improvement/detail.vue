<template>
  <view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader title="恋爱改进簿" eyebrow="记录详情" />
    </view>

    <view v-if="detail" class="app-account-content">
      <AccountPanel :title="detail.title" :description="detail.description || ''">
        <view class="detail-meta">
          <view class="detail-chip">{{ targetLabelMap[detail.targetType] }}</view>
          <view class="detail-chip">{{ detail.startDate }}</view>
          <view class="detail-chip strong" :class="`detail-chip-${detail.status}`">{{ statusLabelMap[detail.status] }}</view>
        </view>
        <view class="detail-creator">{{ detail.creatorNickname ? `创建人：${detail.creatorNickname}` : '未登记创建人' }}</view>
        <view class="latest-feedback">{{ detail.latestFeedback || '还没有反馈' }}</view>
        <view class="status-banner" :class="`status-banner-${detail.status}`">{{ statusHintMap[detail.status] }}</view>

        <view v-if="detail.mediaList?.length" class="fold-card" @click="toggleNoteMedia">
          <view class="fold-title">记录媒体 · {{ mediaSummary(detail.mediaList) }}</view>
          <view class="fold-desc">{{ noteMediaExpanded ? '收起内容' : '点击查看' }}</view>
        </view>
        <view v-if="noteMediaExpanded && detail.mediaList?.length" class="media-grid">
          <view v-for="(item, index) in detail.mediaList" :key="`note_${item.id || index}`" class="media-card" @click="openViewer(detail.mediaList, index)">
            <image v-if="item.mediaType === 'image'" class="media-thumb" :src="resolveMedia(item.fileUrl)" mode="aspectFill" />
            <image v-else-if="item.thumbnailUrl" class="media-thumb" :src="resolveMedia(item.thumbnailUrl)" mode="aspectFill" />
            <view v-else class="media-thumb media-video-fallback">视频</view>
            <view class="media-type">{{ item.mediaType === 'video' ? '视频' : '图片' }}</view>
          </view>
        </view>
      </AccountPanel>

      <AccountPanel title="反馈记录">
        <view v-if="detail.feedbackList?.length" class="timeline">
          <view v-for="item in detail.feedbackList" :key="item.id" class="timeline-item">
            <view class="timeline-head">
              <view class="timeline-status" :class="`timeline-status-${item.status}`">{{ statusLabelMap[item.status] }}</view>
              <view class="timeline-time">{{ item.createdAt }}</view>
            </view>
            <view class="timeline-content">{{ item.content }}</view>
            <view class="timeline-author">{{ item.creatorNickname ? `记录人：${item.creatorNickname}` : '未登记记录人' }}</view>
            <view class="timeline-action-row">
              <view class="timeline-action-chip" @click="startEditFeedback(item)">{{ isEditingFeedback(item.id) ? '正在编辑' : '编辑反馈' }}</view>
            </view>

            <view v-if="item.mediaList?.length" class="fold-card" @click="toggleFeedbackMedia(item.id)">
              <view class="fold-title">反馈媒体 · {{ mediaSummary(item.mediaList) }}</view>
              <view class="fold-desc">{{ isFeedbackExpanded(item.id) ? '收起内容' : '点击查看' }}</view>
            </view>
            <view v-if="isFeedbackExpanded(item.id) && item.mediaList?.length" class="media-grid">
              <view v-for="(media, mediaIndex) in item.mediaList" :key="`feedback_${item.id}_${media.id || mediaIndex}`" class="media-card" @click="openViewer(item.mediaList, mediaIndex)">
                <image v-if="media.mediaType === 'image'" class="media-thumb" :src="resolveMedia(media.fileUrl)" mode="aspectFill" />
                <image v-else-if="media.thumbnailUrl" class="media-thumb" :src="resolveMedia(media.thumbnailUrl)" mode="aspectFill" />
                <view v-else class="media-thumb media-video-fallback">视频</view>
                <view class="media-type">{{ media.mediaType === 'video' ? '视频' : '图片' }}</view>
              </view>
            </view>

            <view v-if="isEditingFeedback(item.id)" class="feedback-editor">
              <picker class="picker-row-shell" mode="selector" :range="statusOptions" range-key="label" :value="editingStatusIndex" @change="handleEditingStatusChange">
                <view class="picker-row">
                  <view class="picker-row-main">
                    <view class="picker-row-label">编辑状态</view>
                    <view class="picker-row-value">{{ statusOptions[editingStatusIndex]?.label || '请选择状态' }}</view>
                  </view>
                </view>
              </picker>

              <AccountField label="反馈内容">
                <textarea v-model="editingForm.content" maxlength="200" class="textarea app-textarea" placeholder="请输入反馈内容" placeholder-class="app-account-input-placeholder" />
              </AccountField>

              <view class="status-banner mini" :class="`status-banner-${editingForm.status}`">{{ statusHintMap[editingForm.status] }}</view>

              <view class="action-row">
                <button class="mini-btn" @click="chooseEditingImages">编辑图片</button>
                <button class="mini-btn" @click="chooseEditingVideo">编辑视频</button>
              </view>
              <view class="media-tips">当前已选 {{ editingImageCount }} 张图片，{{ editingVideoCount }} 个视频</view>
              <view v-if="editingMediaList.length" class="media-grid compact">
                <view v-for="(mediaItem, mediaIndex) in editingMediaList" :key="mediaItem.localId" class="media-card">
                  <image v-if="mediaItem.mediaType === 'image'" class="media-thumb" :src="mediaItem.previewUrl" mode="aspectFill" @click="previewEditingImage(mediaItem)" />
                  <image v-else-if="mediaItem.previewUrl" class="media-thumb" :src="mediaItem.previewUrl" mode="aspectFill" @click="openViewer(editingMediaList, mediaIndex)" />
                  <view v-else class="media-thumb media-video-fallback" @click="openViewer(editingMediaList, mediaIndex)">视频</view>
                  <view class="media-type">{{ mediaItem.mediaType === 'image' ? '图片' : '视频' }}</view>
                  <view class="media-remove" @click.stop="removeEditingMedia(mediaIndex)">×</view>
                </view>
              </view>

              <view class="action-row">
                <button class="mini-btn" @click="cancelEditFeedback">取消编辑</button>
                <button class="mini-btn primary" @click="handleUpdateFeedback(item)">保存反馈</button>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="timeline-empty">还没有反馈</view>
      </AccountPanel>

      <AccountPanel title="新增反馈">
        <picker class="picker-row-shell" mode="selector" :range="statusOptions" range-key="label" :value="statusIndex" @change="handleStatusChange">
          <view class="picker-row">
            <view class="picker-row-main">
              <view class="picker-row-label">当前状态</view>
              <view class="picker-row-value">{{ statusOptions[statusIndex]?.label || '请选择状态' }}</view>
            </view>
          </view>
        </picker>

        <AccountField label="反馈内容">
          <textarea v-model="feedbackForm.content" maxlength="200" class="textarea app-textarea" placeholder="请输入反馈内容" placeholder-class="app-account-input-placeholder" />
        </AccountField>

        <view class="status-banner mini" :class="`status-banner-${feedbackForm.status}`">{{ statusHintMap[feedbackForm.status] }}</view>

        <view class="action-row">
          <button class="mini-btn" @click="chooseFeedbackImages">添加图片</button>
          <button class="mini-btn" @click="chooseFeedbackVideo">添加视频</button>
        </view>
        <view class="media-tips">当前已选 {{ feedbackImageCount }} 张图片，{{ feedbackVideoCount }} 个视频</view>
        <view v-if="feedbackMediaList.length" class="media-grid compact">
          <view v-for="(item, index) in feedbackMediaList" :key="item.localId" class="media-card">
            <image v-if="item.mediaType === 'image'" class="media-thumb" :src="item.previewUrl" mode="aspectFill" @click="previewDraftImage(item)" />
            <image v-else-if="item.previewUrl" class="media-thumb" :src="item.previewUrl" mode="aspectFill" @click="openViewer(feedbackMediaList, index)" />
            <view v-else class="media-thumb media-video-fallback" @click="openViewer(feedbackMediaList, index)">视频</view>
            <view class="media-type">{{ item.mediaType === 'image' ? '图片' : '视频' }}</view>
            <view class="media-remove" @click.stop="removeFeedbackMedia(index)">×</view>
          </view>
        </view>

        <view class="action-row">
          <button class="mini-btn" @click="goEdit">编辑记录</button>
          <button class="mini-btn" @click="handleDelete">删除</button>
        </view>
        <button class="save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn" @click="handleAddFeedback">记录这次反馈</button>
      </AccountPanel>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { addImprovementFeedback, deleteImprovementNote, fetchImprovementNoteDetail, updateImprovementFeedback } from '@/services/improvement-notes.js'
import { requireAuth } from '@/utils/auth.js'
import { previewImages } from '@/utils/image-preview.js'
import { prepareImageFile, resolveMediaUrl, uploadImprovementMedia } from '@/utils/media-upload.js'
import { openMediaViewer } from '@/utils/media-viewer.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountField from '@/pages/account/components/AccountField.vue'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const statusOptions = [
  { key: 'resolved', label: '已改善 · 已经明显好转' },
  { key: 'improving', label: '跟进中 · 还在持续努力' },
  { key: 'pending', label: '待开始 · 准备马上行动' }
]

const targetLabelMap = { me: '我自己', lover: '对方感受', both: '共同努力' }
const statusLabelMap = { resolved: '已改善', improving: '跟进中', pending: '待开始' }
const statusHintMap = {
  resolved: '已经明显好转，可以把这段努力好好收起来了。',
  improving: '还在持续努力里，每一次记录都会让改变更清楚。',
  pending: '准备开始行动，把第一步写下来就已经很重要。'
}
const statusEmojiMap = { resolved: '✓', improving: '↗', pending: '…' }

const { themeStyle } = useThemePage()
const detail = ref(null)
const noteId = ref('')
const statusIndex = ref(1)
const noteMediaExpanded = ref(false)
const expandedFeedbackIds = ref([])
const feedbackMediaList = ref([])
const editingFeedbackId = ref(0)
const editingStatusIndex = ref(1)
const editingMediaList = ref([])
const skipNextOnShowReload = ref(false)
const feedbackForm = reactive({ status: 'improving', content: '' })
const editingForm = reactive({ status: 'improving', content: '' })

const feedbackImageCount = computed(() => feedbackMediaList.value.filter((item) => item.mediaType === 'image').length)
const feedbackVideoCount = computed(() => feedbackMediaList.value.filter((item) => item.mediaType === 'video').length)
const editingImageCount = computed(() => editingMediaList.value.filter((item) => item.mediaType === 'image').length)
const editingVideoCount = computed(() => editingMediaList.value.filter((item) => item.mediaType === 'video').length)

onLoad(async (options) => {
  if (!requireAuth()) return
  noteId.value = options?.id || ''
  await loadDetail()
})

onShow(async () => {
  if (!noteId.value || !requireAuth()) return
  if (skipNextOnShowReload.value) {
    skipNextOnShowReload.value = false
    return
  }
  await loadDetail()
})

async function loadDetail() {
  if (!noteId.value) return
  try {
    detail.value = await fetchImprovementNoteDetail(noteId.value)
    cancelEditFeedback()
    syncFeedbackStatus(detail.value?.status)
  } catch (error) {
    uni.showToast({ title: error?.message || '记录详情加载失败', icon: 'none' })
  }
}

function resolveStatusEmoji(status) {
  return statusEmojiMap[status] || statusEmojiMap.improving
}

function resolveMedia(path) {
  return resolveMediaUrl(path)
}

function mediaSummary(mediaList = []) {
  const imageCount = mediaList.filter((item) => item.mediaType === 'image').length
  const videoCount = mediaList.filter((item) => item.mediaType === 'video').length
  const parts = []
  if (imageCount) parts.push(`${imageCount} 张图片`)
  if (videoCount) parts.push(`${videoCount} 个视频`)
  return parts.join(' · ') || '媒体'
}

function toggleNoteMedia() {
  noteMediaExpanded.value = !noteMediaExpanded.value
}

function isFeedbackExpanded(feedbackId) {
  return expandedFeedbackIds.value.includes(feedbackId)
}

function toggleFeedbackMedia(feedbackId) {
  if (isFeedbackExpanded(feedbackId)) {
    expandedFeedbackIds.value = expandedFeedbackIds.value.filter((item) => item !== feedbackId)
    return
  }
  expandedFeedbackIds.value = [...expandedFeedbackIds.value, feedbackId]
}

function syncFeedbackStatus(status) {
  const nextIndex = Math.max(statusOptions.findIndex((item) => item.key === status), 0)
  statusIndex.value = nextIndex
  feedbackForm.status = statusOptions[nextIndex]?.key || 'improving'
}

function handleStatusChange(event) {
  statusIndex.value = Number(event.detail.value || 0)
  feedbackForm.status = statusOptions[statusIndex.value]?.key || 'improving'
}

function handleEditingStatusChange(event) {
  editingStatusIndex.value = Number(event.detail.value || 0)
  editingForm.status = statusOptions[editingStatusIndex.value]?.key || 'improving'
}

function goEdit() {
  goPage(`/pages/modules/improvement/edit?id=${detail.value.id}`)
}

function isEditingFeedback(feedbackId) {
  return editingFeedbackId.value === feedbackId
}

function startEditFeedback(item) {
  editingFeedbackId.value = item.id
  editingForm.status = item.status || 'improving'
  editingForm.content = item.content || ''
  editingStatusIndex.value = Math.max(statusOptions.findIndex((option) => option.key === editingForm.status), 0)
  editingMediaList.value = (item.mediaList || []).map((media, index) => ({
    localId: `feedback_remote_${item.id}_${media.id || index}`,
    id: media.id,
    mediaType: media.mediaType,
    fileUrl: media.fileUrl,
    thumbnailUrl: media.thumbnailUrl,
    previewUrl: resolveMediaUrl(media.thumbnailUrl || media.fileUrl),
    localPath: '',
    thumbnailLocalPath: ''
  }))
}

function cancelEditFeedback() {
  editingFeedbackId.value = 0
  editingForm.status = 'improving'
  editingForm.content = ''
  editingStatusIndex.value = 1
  editingMediaList.value = []
}

function openViewer(mediaList = [], startIndex = 0) {
  const normalizedMediaList = mediaList.map((item) => ({
    mediaType: item.mediaType,
    fileUrl: item.fileUrl || item.localPath || '',
    thumbnailUrl: item.thumbnailUrl || item.previewUrl || ''
  }))
  openMediaViewer(normalizedMediaList, startIndex)
}

async function chooseFeedbackImages() {
  await chooseImagesForList(feedbackMediaList.value, 9 - feedbackImageCount.value)
}

async function chooseEditingImages() {
  await chooseImagesForList(editingMediaList.value, 9 - editingImageCount.value)
}

async function chooseImagesForList(targetList, remain) {
  if (remain <= 0) {
    uni.showToast({ title: '图片最多上传 9 张', icon: 'none' })
    return
  }
  try {
    skipNextOnShowReload.value = true
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
      targetList.push({
        localId: `local_${Date.now()}_${Math.random()}`,
        mediaType: 'image',
        previewUrl: preparedPath,
        localPath: preparedPath,
        thumbnailLocalPath: '',
        fileUrl: '',
        thumbnailUrl: ''
      })
    }
  } catch (error) {
    if (error?.message) uni.showToast({ title: error.message, icon: 'none' })
  }
}

async function chooseFeedbackVideo() {
  if (feedbackVideoCount.value >= 1) {
    uni.showToast({ title: '视频最多上传 1 个', icon: 'none' })
    return
  }
  await chooseVideoForList(feedbackMediaList.value)
}

async function chooseEditingVideo() {
  if (editingVideoCount.value >= 1) {
    uni.showToast({ title: '视频最多上传 1 个', icon: 'none' })
    return
  }
  await chooseVideoForList(editingMediaList.value)
}

async function chooseVideoForList(targetList) {
  try {
    skipNextOnShowReload.value = true
    const result = await new Promise((resolve, reject) => {
      uni.chooseVideo({
        sourceType: ['album', 'camera'],
        compressed: true,
        success: resolve,
        fail: reject
      })
    })
    targetList.push({
      localId: `local_${Date.now()}_${Math.random()}`,
      mediaType: 'video',
      previewUrl: result.thumbTempFilePath || result.tempFilePath,
      localPath: result.tempFilePath,
      thumbnailLocalPath: result.thumbTempFilePath || '',
      fileUrl: '',
      thumbnailUrl: ''
    })
  } catch (error) {
    if (error?.message) uni.showToast({ title: error.message, icon: 'none' })
  }
}

function previewDraftImage(currentItem) {
  if (currentItem?.mediaType !== 'image') return
  const imageUrls = feedbackMediaList.value.filter((item) => item.mediaType === 'image').map((item) => item.previewUrl).filter(Boolean)
  if (!imageUrls.length || !currentItem.previewUrl) return
  previewImages(imageUrls, currentItem.previewUrl)
}

function previewEditingImage(currentItem) {
  if (currentItem?.mediaType !== 'image') return
  const imageUrls = editingMediaList.value.filter((item) => item.mediaType === 'image').map((item) => item.previewUrl).filter(Boolean)
  if (!imageUrls.length || !currentItem.previewUrl) return
  previewImages(imageUrls, currentItem.previewUrl)
}

function removeFeedbackMedia(index) {
  feedbackMediaList.value.splice(index, 1)
}

function removeEditingMedia(index) {
  editingMediaList.value.splice(index, 1)
}

async function buildUploadedMedia(mediaList) {
  const uploadedMedia = []
  for (let index = 0; index < mediaList.length; index += 1) {
    const item = mediaList[index]
    let fileUrl = item.fileUrl
    let thumbnailUrl = item.thumbnailUrl
    if (item.localPath) fileUrl = await uploadImprovementMedia(item.localPath)
    if (item.thumbnailLocalPath) thumbnailUrl = await uploadImprovementMedia(item.thumbnailLocalPath)
    uploadedMedia.push({ mediaType: item.mediaType, fileUrl, thumbnailUrl: thumbnailUrl || '', sortOrder: index })
  }
  return uploadedMedia
}

async function handleAddFeedback() {
  if (!feedbackForm.content.trim()) {
    uni.showToast({ title: '请先写一点反馈内容', icon: 'none' })
    return
  }
  try {
    uni.showLoading({ title: '正在提交', mask: true })
    const uploadedMedia = await buildUploadedMedia(feedbackMediaList.value)
    detail.value = await addImprovementFeedback(detail.value.id, {
      status: feedbackForm.status,
      content: feedbackForm.content.trim(),
      mediaList: uploadedMedia
    })
    feedbackForm.content = ''
    feedbackMediaList.value = []
    syncFeedbackStatus(detail.value.status)
    uni.hideLoading()
    uni.showToast({ title: '已记录', icon: 'success' })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: error?.message || '记录失败', icon: 'none' })
  }
}

async function handleUpdateFeedback(item) {
  if (!editingForm.content.trim()) {
    uni.showToast({ title: '请先写一点反馈内容', icon: 'none' })
    return
  }
  try {
    uni.showLoading({ title: '正在保存', mask: true })
    const uploadedMedia = await buildUploadedMedia(editingMediaList.value)
    detail.value = await updateImprovementFeedback(detail.value.id, item.id, {
      status: editingForm.status,
      content: editingForm.content.trim(),
      mediaList: uploadedMedia
    })
    cancelEditFeedback()
    syncFeedbackStatus(detail.value.status)
    uni.hideLoading()
    uni.showToast({ title: '反馈已更新', icon: 'success' })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: error?.message || '反馈更新失败', icon: 'none' })
  }
}

function handleDelete() {
  uni.showModal({
    title: '删除记录',
    content: '删除后，这条改进记录、时间线和关联媒体都会一起移除，是否继续？',
    success: async (result) => {
      if (!result.confirm) return
      try {
        await deleteImprovementNote(detail.value.id)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => backPage(), 250)
      } catch (error) {
        uni.showToast({ title: error?.message || '删除失败', icon: 'none' })
      }
    }
  })
}
</script>

<style scoped>
  .detail-meta,.action-row{display:flex;gap:14rpx;flex-wrap:wrap}
  .detail-meta{margin-top:8rpx}
  .detail-chip{padding:10rpx 16rpx;border-radius:999rpx;background:#fff4f8;color:#bc7990;font-size:22rpx;font-weight:700}
  .detail-chip.strong{color:#ff6b97}
  .detail-chip-resolved{background:linear-gradient(135deg,#fff7d9,#ffe08d);color:#9b6a08}
  .detail-chip-improving{background:linear-gradient(135deg,#ffeaf0,#ffc6d6);color:#b54876}
  .detail-chip-pending{background:linear-gradient(135deg,#ffe6df,#ffbead);color:#b45745}
  .detail-creator,.timeline-author,.media-tips{margin-top:14rpx;font-size:22rpx;color:#bc8b9b}
  .latest-feedback,.timeline-content{margin-top:14rpx;font-size:24rpx;line-height:1.8;color:#8d6c77}
  .status-banner{margin-top:16rpx;padding:18rpx 20rpx;border-radius:24rpx;font-size:24rpx;font-weight:700;line-height:1.6}
  .status-banner.mini{font-size:22rpx}
  .status-banner-resolved{background:linear-gradient(135deg,rgba(255,243,200,.95),rgba(255,223,128,.9));color:#8d6200}
  .status-banner-improving{background:linear-gradient(135deg,rgba(255,233,239,.95),rgba(255,199,214,.9));color:#b84d78}
  .status-banner-pending{background:linear-gradient(135deg,rgba(255,231,224,.95),rgba(255,189,173,.9));color:#b55647}
  .fold-card,.picker-row{margin-top:18rpx;padding:18rpx 20rpx;border-radius:24rpx;background:#fff4f8}
  .fold-title{font-size:24rpx;font-weight:700;color:#a85d77}
  .fold-desc,.timeline-time{margin-top:6rpx;font-size:22rpx;color:#b98a99}
  .media-grid{margin-top:16rpx;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14rpx}
  .media-grid.compact{grid-template-columns:repeat(3,minmax(0,1fr))}
  .media-card{position:relative;border-radius:22rpx;overflow:hidden;background:#fff3f7}
  .media-thumb{width:100%;height:220rpx;display:block;background:#ffeef3}
  .media-video-fallback{display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,#ffcedd,#ff9db7)}
  .media-type{position:absolute;left:12rpx;bottom:12rpx;padding:6rpx 12rpx;border-radius:999rpx;background:rgba(0,0,0,.45);color:#fff;font-size:20rpx}
  .media-remove{position:absolute;right:12rpx;top:12rpx;width:42rpx;height:42rpx;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);color:#fff;font-size:30rpx}
  .timeline{display:grid;gap:18rpx}
  .timeline-item,.timeline-head{display:flex;justify-content:space-between;gap:12rpx}
  .timeline-item{flex-direction:column;padding:18rpx;border-radius:22rpx;background:#fff5f8}
  .timeline-status{font-size:24rpx;font-weight:700}
  .timeline-status-resolved{color:#a86f08}
  .timeline-status-improving{color:#c24d7d}
  .timeline-status-pending{color:#be5a49}
  .timeline-action-chip,.mini-btn{padding:10rpx 18rpx;border-radius:999rpx;background:#fff;box-shadow:inset 0 0 0 2rpx rgba(255,214,226,.7);font-size:22rpx;font-weight:700;color:var(--app-color-primary-strong)}
  .mini-btn{margin:0}
  .mini-btn.primary{background:var(--app-gradient-primary);color:#fff;box-shadow:none}
  .feedback-editor{margin-top:18rpx;padding:18rpx;border-radius:24rpx;background:rgba(255,255,255,.78);box-shadow:inset 0 0 0 2rpx rgba(255,226,234,.78)}
  .timeline-empty{font-size:24rpx;color:#98707d}
  .picker-row-shell{display:block}
  .picker-row-label{font-size:22rpx;color:#b58b99}
  .picker-row-value{margin-top:8rpx;font-size:27rpx;line-height:1.5;color:#8f6d78;font-weight:700}
  @media screen and (max-width:520px){.media-grid,.media-grid.compact{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
