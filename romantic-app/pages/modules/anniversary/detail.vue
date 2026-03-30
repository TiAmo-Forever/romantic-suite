<template>
  <view class="page app-account-page" :style="themeStyle" @click="handlePageTap">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader :title="TEXT.detailTitle" :eyebrow="TEXT.eyebrow" />
    </view>

    <view v-if="detail" class="app-account-content">
      <view v-if="detail.mediaList?.length" class="memory-cover-panel app-card-soft">
        <swiper class="memory-swiper" circular indicator-dots indicator-active-color="#ff7ea6">
          <swiper-item v-for="(item, index) in detail.mediaList" :key="item.id || index">
            <view class="memory-swiper-item" @click="openViewer(detail.mediaList, index)">
              <image
                v-if="item.mediaType === 'image' && resolveMedia(item.fileUrl)"
                class="memory-swiper-media"
                :src="resolveMedia(item.fileUrl)"
                mode="aspectFill"
              />
              <image
                v-else-if="resolveMedia(item.thumbnailUrl)"
                class="memory-swiper-media"
                :src="resolveMedia(item.thumbnailUrl)"
                mode="aspectFill"
              />
              <view v-else class="memory-swiper-media memory-swiper-fallback">
                <view class="memory-play-icon"></view>
              </view>
              <view class="memory-media-tag">{{ item.mediaType === 'video' ? TEXT.videoWord : TEXT.imageWord }}</view>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <AccountPanel :title="detail.title" :description="detail.location || ''">
        <view class="detail-head">
          <view class="identity-badge" :class="identityBadgeClass">
            <view class="identity-badge-dot"></view>
            <text>{{ identityBadgeText }}</text>
          </view>
          <view class="detail-manage-wrap" @click.stop>
            <view class="detail-manage-btn" @click.stop="toggleManageMenu">管理</view>
            <view v-if="showManageMenu" class="detail-manage-pop">
              <view class="detail-manage-item" @click.stop="handleManageEdit">{{ TEXT.editButton }}</view>
              <view class="detail-manage-divider"></view>
              <view class="detail-manage-item danger" @click.stop="handleManageDelete">{{ TEXT.deleteButton }}</view>
            </view>
          </view>
        </view>
        <view class="detail-meta">
          <view class="detail-chip">{{ detail.eventDate }}</view>
          <view class="detail-chip strong">{{ formatStatus(detail) }}</view>
          <view v-if="detail.mediaList?.length" class="detail-chip">{{ detail.mediaList.length }} {{ TEXT.mediaUnit }}</view>
        </view>

        <view class="detail-desc">{{ detail.description || TEXT.emptyDesc }}</view>

        <view class="interaction-row">
          <view class="interaction-time">{{ detail.eventDate }}</view>
          <view class="interaction-more-wrap" @click.stop>
            <view class="interaction-more-btn" @click.stop="toggleActionMenu">
              <text class="interaction-more-dot"></text>
              <text class="interaction-more-dot"></text>
              <text class="interaction-more-dot"></text>
            </view>

            <view v-if="showActionMenu" class="interaction-action-pop">
              <view class="interaction-pop-item" @click.stop="handleLikeFromMenu">
                <text class="interaction-pop-icon">{{ FILLED_HEART }}</text>
                <text class="interaction-pop-label">{{ likeActionText }}</text>
              </view>
              <view class="interaction-pop-divider"></view>
              <view class="interaction-pop-item comment-only" @click.stop="openCommentComposer()">
                <text class="interaction-pop-label">{{ TEXT.commentAction }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-if="hasInteractionFeed" class="interaction-feed">
          <view v-if="detail.likeUsers.length" class="interaction-feed-line interaction-feed-like">
            <text class="interaction-feed-heart">{{ FILLED_HEART }}</text>
            <text class="interaction-feed-text">{{ likeUserSummary }}</text>
          </view>
          <view
            v-for="item in detail.commentList"
            :key="item.id"
            class="interaction-feed-line interaction-feed-comment"
            @click.stop="handleCommentTap(item)"
            @longpress.stop="handleCommentLongPress(item, $event)"
          >
            <view class="interaction-comment-head">
              <text class="interaction-feed-name">{{ getCommentDisplayName(item) }}</text>
              <text class="interaction-comment-time">{{ formatCommentTime(item.createdAt || item.updatedAt) }}</text>
            </view>
            <text class="interaction-comment-content">{{ item.content }}</text>
          </view>
        </view>
      </AccountPanel>

      <AccountPanel :title="TEXT.mediaTitle">
        <view v-if="detail.mediaList?.length" class="media-list">
          <view
            v-for="(item, index) in detail.mediaList"
            :key="item.id || index"
            class="media-item"
            @click="openViewer(detail.mediaList, index)"
          >
            <image
              v-if="item.mediaType === 'image' && resolveMedia(item.fileUrl)"
              class="media-preview"
              :src="resolveMedia(item.fileUrl)"
              mode="aspectFill"
            />
            <image
              v-else-if="resolveMedia(item.thumbnailUrl)"
              class="media-preview"
              :src="resolveMedia(item.thumbnailUrl)"
              mode="aspectFill"
            />
            <view v-else class="media-preview memory-swiper-fallback">
              <view class="memory-play-icon"></view>
            </view>
            <view class="media-tag">{{ item.mediaType === 'video' ? TEXT.videoWord : TEXT.imageWord }}</view>
          </view>
        </view>
        <view v-else class="detail-empty">{{ TEXT.emptyMedia }}</view>
      </AccountPanel>

    </view>

    <view v-if="commentInputVisible" class="comment-composer" @click.stop>
      <input
        v-model="commentForm.content"
        class="comment-input"
        :focus="commentFocus"
        :maxlength="200"
        :cursor-spacing="24"
        :placeholder="commentInputPlaceholder"
        placeholder-class="app-account-input-placeholder"
        confirm-type="send"
        @confirm="handleSubmitComment"
      />
      <view class="comment-composer-actions">
        <view class="comment-limit">{{ commentLengthText }}</view>
        <button class="comment-send-btn" :disabled="submittingComment" @click="handleSubmitComment">
          {{ submittingComment ? TEXT.commentSending : TEXT.commentSend }}
        </button>
      </view>
    </view>

    <view v-if="commentActionSheetVisible" class="comment-sheet-mask" @click="closeCommentActionSheet">
      <view class="comment-sheet-card" @click.stop>
        <view class="comment-sheet-title">{{ TEXT.deleteOwnCommentTitle }}</view>
        <view class="comment-sheet-action danger" @click="handleDeleteSelectedComment">{{ TEXT.deleteAction }}</view>
        <view class="comment-sheet-action" @click="closeCommentActionSheet">{{ TEXT.cancelAction }}</view>
      </view>
    </view>

    <view
      v-if="commentPopoverVisible"
      class="comment-popover-card"
      :style="commentPopoverStyle"
      @click.stop
    >
      <view class="comment-popover-item" @click="handleCopySelectedComment">{{ TEXT.copyAction }}</view>
      <view class="comment-popover-divider"></view>
      <view class="comment-popover-item danger" @click="handleDeleteSelectedComment">{{ TEXT.deleteAction }}</view>
    </view>
  </view>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  createAnniversaryComment,
  deleteAnniversary,
  deleteAnniversaryComment,
  fetchAnniversaryDetail,
  toggleAnniversaryLike
} from '@/services/anniversaries.js'
import { getUser, requireAuth } from '@/utils/auth.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { openMediaViewer } from '@/utils/media-viewer.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const FILLED_HEART = '❤'
const TEXT = {
  eyebrow: '重要日子',
  detailTitle: '纪念日详情',
  imageWord: '图片',
  videoWord: '视频',
  mediaUnit: '份媒体',
  mediaTitle: '图片与视频',
  emptyMedia: '暂时还没有上传媒体内容',
  emptyDesc: '这一天的细节，也值得慢慢补全。',
  editButton: '编辑纪念日',
  deleteButton: '删除纪念日',
  deleteTitle: '删除纪念日',
  deleteContent: '删除后会一并移除相关图片和视频，确认继续吗？',
  deleted: '这条纪念日已删除',
  deleteFailed: '删除纪念日失败',
  loadFailed: '纪念日详情加载失败',
  likeFailed: '操作失败，请稍后再试',
  likeAction: '点赞',
  unlikeAction: '取消点赞',
  commentAction: '评论',
  commentPlaceholder: '写下一句想留给这一天的话',
  commentSend: '发送',
  commentSending: '发送中',
  commentFailed: '评论失败，请稍后再试',
  commentEmptyError: '请先写下评论内容',
  commentSuccess: '评论已发送',
  commentDeleted: '评论已删除',
  commentDeleteFailed: '删除评论失败',
  commentCopied: '评论内容已复制',
  commentFallbackUser: '未命名',
  creatorPrefix: '由 ',
  creatorSuffix: ' 创建',
  futureToday: '就是今天',
  futurePrefix: '还有 ',
  futureSuffix: ' 天',
  pastPrefix: '已过去 ',
  pastSuffix: ' 天',
  commentLengthSuffix: '/200',
  replyPrefix: '回复 ',
  replyDivider: '：',
  deleteOwnCommentTitle: '删除我的评论',
  deleteAction: '删除',
  cancelAction: '取消',
  copyAction: '复制'
}

const { themeStyle } = useThemePage()
const detail = ref(null)
const eventId = ref('')
const showActionMenu = ref(false)
const showManageMenu = ref(false)
const liking = ref(false)
const submittingComment = ref(false)
const deletingComment = ref(false)
const commentInputVisible = ref(false)
const commentFocus = ref(false)
const commentActionSheetVisible = ref(false)
const commentPopoverVisible = ref(false)
const selectedComment = ref(null)
const replyTargetComment = ref(null)
const suppressCommentTapUntil = ref(0)
const popoverPosition = reactive({ left: 0, top: 0 })
const commentForm = reactive({ content: '' })

const currentUsername = computed(() => String(getUser()?.username || '').trim())
const isDetailCreator = computed(() => {
  return currentUsername.value && currentUsername.value === String(detail.value?.creatorUsername || '').trim()
})

const identityBadgeText = computed(() => {
  return currentUsername.value && currentUsername.value === String(detail.value?.creatorUsername || '').trim()
    ? '我'
    : 'TA'
})

const identityBadgeClass = computed(() => {
  return currentUsername.value && currentUsername.value === String(detail.value?.creatorUsername || '').trim()
    ? 'identity-badge-mine'
    : 'identity-badge-other'
})

const likeActionText = computed(() => (detail.value?.likedByCurrentUser ? TEXT.unlikeAction : TEXT.likeAction))

const commentLengthText = computed(() => `${String(commentForm.content || '').length}${TEXT.commentLengthSuffix}`)

const commentInputPlaceholder = computed(() => {
  const target = replyTargetComment.value
  if (!target) return TEXT.commentPlaceholder
  return `${TEXT.replyPrefix}${getCommentDisplayName(target)}${TEXT.replyDivider}`
})

const likeUserSummary = computed(() => {
  const list = Array.isArray(detail.value?.likeUsers) ? detail.value.likeUsers : []
  return list.map((item) => item?.nickname || item?.username || TEXT.commentFallbackUser).join('、')
})

const hasInteractionFeed = computed(() => {
  const likeUsers = Array.isArray(detail.value?.likeUsers) ? detail.value.likeUsers : []
  const commentList = Array.isArray(detail.value?.commentList) ? detail.value.commentList : []
  return likeUsers.length > 0 || commentList.length > 0
})

const commentPopoverStyle = computed(() => ({
  left: `${popoverPosition.left}px`,
  top: `${popoverPosition.top}px`
}))

onLoad(async (options) => {
  if (!requireAuth()) return
  eventId.value = String(options?.id || '')
  await loadDetail()
})

onShow(async () => {
  if (!eventId.value || !requireAuth()) return
  await loadDetail()
})

async function loadDetail() {
  if (!eventId.value) return
  try {
    detail.value = await fetchAnniversaryDetail(eventId.value)
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.loadFailed, icon: 'none' })
  }
}

function resolveMedia(path) {
  return resolveMediaUrl(path)
}

function openViewer(mediaList, index) {
  const safeList = Array.isArray(mediaList) ? mediaList : []
  const payload = []
  let nextIndex = 0

  safeList.forEach((item, itemIndex) => {
    if (!item?.fileUrl) return
    if (itemIndex === index) {
      nextIndex = payload.length
    }
    payload.push({
      mediaType: item.mediaType,
      fileUrl: item.fileUrl,
      thumbnailUrl: item.thumbnailUrl
    })
  })

  if (!payload.length) return
  openMediaViewer(payload, nextIndex)
}

function formatStatus(item) {
  if (item.timeStatus === 'future') {
    if (Number(item.dayOffset) === 0) return TEXT.futureToday
    return `${TEXT.futurePrefix}${item.dayOffset}${TEXT.futureSuffix}`
  }
  return `${TEXT.pastPrefix}${Math.abs(Number(item.dayOffset || 0))}${TEXT.pastSuffix}`
}

function getCommentDisplayName(comment) {
  return comment?.commenterNickname || comment?.commenterUsername || TEXT.commentFallbackUser
}

function formatCommentTime(value) {
  const source = String(value || '').replace('T', ' ').trim()
  if (!source) return ''
  if (source.length >= 16) {
    return source.slice(5, 16)
  }
  return source
}

function isOwnComment(comment) {
  return String(comment?.commenterUsername || '').trim() === currentUsername.value
}

function toggleActionMenu() {
  closeManageMenu()
  closeCommentMenus()
  showActionMenu.value = !showActionMenu.value
}

function closeActionMenu() {
  showActionMenu.value = false
}

function toggleManageMenu() {
  closeActionMenu()
  closeCommentMenus()
  showManageMenu.value = !showManageMenu.value
}

function closeManageMenu() {
  showManageMenu.value = false
}

function closeCommentActionSheet() {
  commentActionSheetVisible.value = false
}

function closeCommentPopover() {
  commentPopoverVisible.value = false
}

function closeCommentMenus() {
  closeCommentActionSheet()
  closeCommentPopover()
}

function handlePageTap() {
  closeManageMenu()
  closeActionMenu()
  closeCommentMenus()
}

function openCommentComposer(targetComment = null) {
  closeManageMenu()
  closeActionMenu()
  closeCommentMenus()
  replyTargetComment.value = targetComment
  commentInputVisible.value = true
  commentFocus.value = false
  nextTick(() => {
    commentFocus.value = true
  })
}

function closeCommentComposer() {
  commentFocus.value = false
  commentInputVisible.value = false
  replyTargetComment.value = null
}

function handleCommentTap(comment) {
  if (!comment || Date.now() < suppressCommentTapUntil.value) return
  selectedComment.value = comment
  closeManageMenu()
  closeActionMenu()
  closeCommentPopover()

  if (isOwnComment(comment)) {
    commentActionSheetVisible.value = true
    return
  }

  openCommentComposer(comment)
}

function handleCommentLongPress(comment, event) {
  if (!comment || !isDetailCreator.value) return
  suppressCommentTapUntil.value = Date.now() + 320
  selectedComment.value = comment
  closeActionMenu()
  closeCommentActionSheet()

  const touch = event?.changedTouches?.[0] || event?.touches?.[0] || {}
  const systemInfo = uni.getSystemInfoSync()
  const cardWidth = 176
  const cardHeight = 92
  const left = Math.min(Math.max(Number(touch.clientX || touch.x || 0) - cardWidth / 2, 12), systemInfo.windowWidth - cardWidth - 12)
  const top = Math.min(Math.max(Number(touch.clientY || touch.y || 0) - cardHeight - 16, 18), systemInfo.windowHeight - cardHeight - 18)

  popoverPosition.left = left
  popoverPosition.top = top
  commentPopoverVisible.value = true
}

async function handleLikeFromMenu() {
  closeActionMenu()
  await handleLike()
}

async function handleLike() {
  if (!detail.value?.id || liking.value) return
  liking.value = true
  try {
    const result = await toggleAnniversaryLike(detail.value.id)
    detail.value.likeCount = Number(result.likeCount || 0)
    detail.value.likedByCurrentUser = Boolean(result.liked)
    await loadDetail()
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.likeFailed, icon: 'none' })
  } finally {
    liking.value = false
  }
}

async function handleSubmitComment() {
  if (!detail.value?.id || submittingComment.value) return
  const rawContent = String(commentForm.content || '').trim()
  if (!rawContent) {
    uni.showToast({ title: TEXT.commentEmptyError, icon: 'none' })
    return
  }

  const targetName = replyTargetComment.value ? getCommentDisplayName(replyTargetComment.value) : ''
  const payloadContent = targetName ? `${TEXT.replyPrefix}${targetName}${TEXT.replyDivider}${rawContent}` : rawContent

  submittingComment.value = true
  try {
    const comment = await createAnniversaryComment(detail.value.id, { content: payloadContent })
    detail.value.commentList = [...(detail.value.commentList || []), comment]
    commentForm.content = ''
    closeCommentComposer()
    uni.hideKeyboard()
    uni.showToast({ title: TEXT.commentSuccess, icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.commentFailed, icon: 'none' })
  } finally {
    submittingComment.value = false
  }
}

async function handleDeleteSelectedComment() {
  if (!detail.value?.id || !selectedComment.value?.id || deletingComment.value) return
  deletingComment.value = true
  try {
    await deleteAnniversaryComment(detail.value.id, selectedComment.value.id)
    detail.value.commentList = (detail.value.commentList || []).filter((item) => item.id !== selectedComment.value.id)
    if (replyTargetComment.value?.id === selectedComment.value.id) {
      replyTargetComment.value = null
    }
    closeCommentMenus()
    uni.showToast({ title: TEXT.commentDeleted, icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.commentDeleteFailed, icon: 'none' })
  } finally {
    deletingComment.value = false
  }
}

function handleCopySelectedComment() {
  const content = String(selectedComment.value?.content || '').trim()
  if (!content) {
    closeCommentPopover()
    return
  }

  uni.setClipboardData({
    data: content,
    success: () => {
      closeCommentPopover()
      uni.showToast({ title: TEXT.commentCopied, icon: 'none' })
    }
  })
}

function handleManageEdit() {
  closeManageMenu()
  goEdit()
}

function handleManageDelete() {
  closeManageMenu()
  handleDelete()
}

function goEdit() {
  if (!detail.value?.id) return
  goPage(`/pages/modules/anniversary/edit?id=${detail.value.id}`)
}

function handleDelete() {
  if (!detail.value?.id) return

  uni.showModal({
    title: TEXT.deleteTitle,
    content: TEXT.deleteContent,
    success: async (result) => {
      if (!result.confirm) return
      try {
        await deleteAnniversary(detail.value.id)
        uni.showToast({ title: TEXT.deleted, icon: 'success' })
        setTimeout(() => backPage(), 250)
      } catch (error) {
        uni.showToast({ title: error?.message || TEXT.deleteFailed, icon: 'none' })
      }
    }
  })
}
</script>

<style scoped>
.app-account-topbar-shell {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 250, 252, 0.88);
}

.memory-cover-panel {
  overflow: hidden;
  padding: 18rpx;
  border-radius: 34rpx;
  background: linear-gradient(135deg, #fff2f7, #fffafc);
}

.memory-swiper {
  height: 430rpx;
}

.memory-swiper-item {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-radius: 26rpx;
}

.memory-swiper-media {
  width: 100%;
  height: 100%;
  display: block;
  background: rgba(255, 255, 255, 0.4);
}

.memory-swiper-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.32);
}

.memory-play-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.76);
  position: relative;
}

.memory-play-icon::before {
  content: '';
  position: absolute;
  left: 36rpx;
  top: 24rpx;
  border-left: 26rpx solid #ff7ea6;
  border-top: 18rpx solid transparent;
  border-bottom: 18rpx solid transparent;
}

.memory-media-tag {
  position: absolute;
  left: 18rpx;
  bottom: 18rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.8);
  color: #bf6f8b;
  font-size: 22rpx;
  font-weight: 700;
}

.detail-meta {
  display: flex;
  gap: 14rpx;
  flex-wrap: wrap;
  margin-top: 16rpx;
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 4rpx;
}

.identity-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 700;
}

.identity-badge-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.85;
}

.identity-badge-mine {
  background: rgba(223, 246, 242, 0.96);
  color: #3e9b92;
}

.identity-badge-other {
  background: rgba(255, 238, 229, 0.96);
  color: #d18264;
}

.detail-manage-wrap {
  position: relative;
  flex-shrink: 0;
}

.detail-manage-btn {
  min-width: 84rpx;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 249, 251, 0.96);
  box-shadow: inset 0 0 0 2rpx rgba(233, 207, 216, 0.52);
  font-size: 22rpx;
  line-height: 1;
  color: #ad8090;
  text-align: center;
}

.detail-manage-pop {
  position: absolute;
  top: calc(100% + 12rpx);
  right: 0;
  min-width: 220rpx;
  padding: 10rpx 0;
  border-radius: 24rpx;
  background: rgba(255, 252, 253, 0.98);
  box-shadow: 0 16rpx 38rpx rgba(114, 80, 92, 0.18);
  z-index: 8;
}

.detail-manage-item {
  padding: 22rpx 24rpx;
  font-size: 25rpx;
  line-height: 1.4;
  color: #7c5f68;
}

.detail-manage-item.danger {
  color: #cf6d78;
}

.detail-manage-divider {
  height: 1rpx;
  margin: 0 18rpx;
  background: rgba(224, 196, 206, 0.64);
}

.detail-chip {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: #fff4f8;
  color: #bc7990;
  font-size: 22rpx;
  font-weight: 700;
}

.detail-chip.strong {
  background: #ffe8f0;
  color: #ff6b97;
}

.detail-desc {
  margin-top: 18rpx;
  font-size: 25rpx;
  line-height: 1.9;
  color: #866670;
}

.interaction-row {
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(233, 214, 222, 0.72);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.interaction-time {
  font-size: 22rpx;
  color: #b997a4;
}

.interaction-more-wrap {
  position: relative;
  flex-shrink: 0;
}

.interaction-more-btn {
  width: 72rpx;
  height: 52rpx;
  border-radius: 16rpx;
  background: #f1f3f6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.interaction-more-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #78828f;
}

.interaction-action-pop {
  position: absolute;
  right: 84rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  padding: 0 14rpx;
  border-radius: 22rpx;
  background: rgba(30, 35, 41, 0.96);
  box-shadow: 0 14rpx 32rpx rgba(27, 31, 37, 0.18);
  white-space: nowrap;
}

.interaction-pop-item {
  min-width: 152rpx;
  height: 84rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  color: #fff8fb;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1;
}

.interaction-pop-item.comment-only {
  min-width: 108rpx;
}

.interaction-pop-icon {
  flex-shrink: 0;
  font-size: 26rpx;
  line-height: 1;
}

.interaction-pop-label {
  flex-shrink: 0;
  white-space: nowrap;
  line-height: 1;
}

.interaction-pop-divider {
  width: 2rpx;
  height: 32rpx;
  background: rgba(255, 255, 255, 0.16);
}

.interaction-feed {
  margin-top: 20rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, rgba(244, 246, 249, 0.98), rgba(240, 243, 247, 0.94));
  box-shadow: inset 0 0 0 1rpx rgba(220, 226, 235, 0.7);
  overflow: hidden;
}

.interaction-feed-line {
  padding: 18rpx 20rpx;
  font-size: 23rpx;
  line-height: 1.7;
  color: #6d5c66;
  word-break: break-word;
}

.interaction-feed-line + .interaction-feed-line {
  border-top: 1rpx solid rgba(196, 204, 214, 0.5);
}

.interaction-feed-like {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.interaction-feed-heart {
  margin-top: 4rpx;
  color: #ff6b97;
  font-size: 24rpx;
  line-height: 1;
}

.interaction-feed-text {
  color: #6d5c66;
}

.interaction-feed-comment {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.interaction-comment-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.interaction-feed-name {
  color: #4f7aaf;
  font-weight: 700;
  flex: 1;
}

.interaction-comment-time {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #b49eaa;
}

.interaction-comment-content {
  color: #6d5c66;
  line-height: 1.75;
}

.media-list {
  display: grid;
  gap: 18rpx;
}

.media-item {
  position: relative;
  overflow: hidden;
  border-radius: 24rpx;
  background: #fff4f7;
}

.media-preview {
  width: 100%;
  height: 360rpx;
  display: block;
}

.media-tag {
  position: absolute;
  left: 14rpx;
  bottom: 14rpx;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.42);
  color: #fff;
  font-size: 20rpx;
}

.detail-empty {
  margin-top: 18rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: #9d7884;
}

.detail-action-btn {
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

.comment-composer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
  background: rgba(255, 251, 252, 0.94);
  backdrop-filter: blur(16px);
  box-shadow: 0 -12rpx 30rpx rgba(232, 152, 182, 0.12);
}

.comment-input {
  flex: 1;
  height: 84rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #fff4f7;
  font-size: 24rpx;
  color: #6d5c66;
}

.comment-composer-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.comment-limit {
  font-size: 22rpx;
  color: #b6929f;
}

.comment-send-btn {
  min-width: 120rpx;
  height: 76rpx;
  margin: 0;
  padding: 0 28rpx;
  border: none;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff8bac, #ff6e99);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 76rpx;
}

.comment-send-btn[disabled] {
  opacity: 0.6;
}

.comment-sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 82;
  background: rgba(18, 22, 28, 0.18);
}

.comment-sheet-card {
  position: fixed;
  left: 50%;
  bottom: calc(28rpx + env(safe-area-inset-bottom));
  z-index: 83;
  width: 360rpx;
  overflow: hidden;
  border-radius: 28rpx;
  transform: translateX(-50%);
  background: rgba(255, 252, 253, 0.98);
  box-shadow: 0 18rpx 42rpx rgba(76, 53, 63, 0.18);
}

.comment-sheet-title {
  padding: 24rpx 24rpx 18rpx;
  text-align: center;
  color: #9e8792;
  font-size: 23rpx;
}

.comment-sheet-action {
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1rpx solid rgba(223, 208, 214, 0.7);
  color: #6f5d66;
  font-size: 27rpx;
  font-weight: 700;
}

.comment-sheet-action.danger {
  color: #e36a8e;
}

.comment-popover-card {
  position: fixed;
  z-index: 84;
  min-width: 176px;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: 18rpx;
  background: rgba(33, 37, 43, 0.96);
  box-shadow: 0 12rpx 30rpx rgba(26, 30, 36, 0.2);
}

.comment-popover-item {
  flex: 1;
  padding: 18rpx 24rpx;
  text-align: center;
  color: #fff9fb;
  font-size: 24rpx;
  font-weight: 700;
}

.comment-popover-item.danger {
  color: #ff9fba;
}

.comment-popover-divider {
  width: 1px;
  align-self: stretch;
  background: rgba(255, 255, 255, 0.12);
}
</style>
