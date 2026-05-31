<template>
  <view class="page app-account-page daily-detail-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader :title="TEXT.pageTitle" :eyebrow="TEXT.eyebrow" />
    </view>

    <view class="app-account-content app-account-stack daily-detail-content">
      <view class="daily-hero app-account-intro-card app-card">
        <view class="daily-hero-topline">
          <view class="app-account-intro-kicker">{{ currentDateLabel }}</view>
        </view>
        <view class="daily-hero-row">
          <view class="daily-mood-pill" :class="`daily-mood-pill-${summary.mood}`">{{ moodMeta.label }}</view>
          <view class="daily-hero-updated">{{ updaterLabel }}</view>
        </view>
        <view class="app-account-intro-title">{{ heroTitle }}</view>
        <view class="app-account-intro-desc">{{ heroDesc }}</view>
        <view class="daily-hero-meta">
          <view class="app-account-intro-chip">{{ entryCountText }}</view>
          <view class="app-account-intro-chip">{{ activeEntrySummary }}</view>
        </view>
      </view>

      <view class="daily-stage app-card">
        <view class="daily-stage-head">
          <view>
            <view class="daily-stage-title">{{ TEXT.recordBookTitle }}</view>
            <view class="daily-stage-desc">{{ summary.entryList.length ? TEXT.recordBookDesc : TEXT.emptyBoardDesc }}</view>
          </view>
          <view class="daily-stage-actions">
            <view class="daily-history-entry stage" @click.stop="openHistoryDrawer">
              <text class="daily-history-entry-dot"></text>
              <text>{{ TEXT.historyButton }}</text>
            </view>
            <view v-if="summary.entryList.length" class="daily-stage-count">{{ activeEntryIndex + 1 }}/{{ summary.entryList.length }}</view>
          </view>
        </view>

        <view v-if="summary.entryList.length" class="daily-swiper-shell">
          <swiper class="daily-swiper" :current="activeEntryIndex" @change="handleEntryChange">
            <swiper-item v-for="(entry, index) in summary.entryList" :key="entry.id">
              <view class="daily-entry-card" :class="getEntryCardClass(entry.creatorUsername)">
                <view class="daily-entry-topline">
                  <view class="daily-entry-left">
                    <view class="identity-badge" :class="getIdentityBadgeClass(entry.creatorUsername)">
                      <view class="identity-badge-dot"></view>
                      <text>{{ getIdentityBadgeText(entry.creatorUsername) }}</text>
                    </view>
                    <view class="entry-mood-pill" :class="`entry-mood-pill-${entry.mood}`">{{ entry.moodMeta.label }}</view>
                  </view>
                  <view class="daily-entry-page-index">第 {{ index + 1 }} 页</view>
                </view>
                <view class="daily-entry-meta">{{ getEntryMeta(entry) }}</view>

                <view class="daily-entry-actions">
                  <view class="daily-entry-edit" @click.stop="goEdit(entry)">{{ TEXT.editAction }}</view>
                  <view class="daily-entry-stamp">
                    <text>{{ formatCommentTime(entry.updatedAt || entry.createdAt) }}</text>
                  </view>
                </view>

                <scroll-view class="daily-entry-scroll" scroll-y enhanced show-scrollbar="false">
                  <view class="daily-entry-paper">
                    <view class="daily-entry-paper-label">{{ TEXT.entryContentLabel }}</view>
                    <view class="daily-entry-content">{{ entry.content }}</view>
                  </view>

                  <view v-if="entry.mediaList.length" class="daily-media-grid">
                    <view class="daily-entry-paper-label media-label">{{ TEXT.entryMediaLabel }}</view>
                    <view
                      v-for="(media, mediaIndex) in entry.mediaList"
                      :key="media.id || mediaIndex"
                      class="daily-media-card"
                      @click.stop="openEntryViewer(entry.mediaList, mediaIndex)"
                    >
                      <image
                        v-if="media.mediaType === 'image' && resolveMedia(media.fileUrl)"
                        class="daily-media-thumb"
                        :src="resolveMedia(media.fileUrl)"
                        mode="aspectFill"
                      />
                      <image
                        v-else-if="resolveMedia(media.thumbnailUrl)"
                        class="daily-media-thumb"
                        :src="resolveMedia(media.thumbnailUrl)"
                        mode="aspectFill"
                      />
                      <view v-else class="daily-media-thumb daily-media-fallback">
                        <view class="daily-play-icon"></view>
                      </view>
                      <view class="daily-media-tag">{{ media.mediaType === 'video' ? TEXT.videoWord : TEXT.imageWord }}</view>
                    </view>
                  </view>
                </scroll-view>

                <view class="daily-entry-footer">
                  <view class="daily-entry-summary-card">
                    <view class="daily-entry-summary-kicker">{{ TEXT.entrySummaryLabel }}</view>
                    <view class="daily-entry-summary-text">{{ getEntryInteractionSummary(entry) }}</view>
                  </view>
                  <view class="daily-entry-footer-actions">
                    <view class="daily-inline-action" @click.stop="handleLikeToggle(entry)">
                      <text class="daily-inline-action-heart">{{ FILLED_HEART }}</text>
                      <text>{{ entry.likedByCurrentUser ? TEXT.unlikeAction : TEXT.likeAction }}</text>
                    </view>
                    <view class="daily-inline-action primary" @click.stop="openCommentDrawer(null, entry.id, true)">
                      <text>{{ entry.commentList.length ? TEXT.viewCommentAction : TEXT.writeCommentAction }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </swiper-item>
          </swiper>

          <scroll-view class="entry-strip" scroll-x enable-flex enhanced show-scrollbar="false">
            <view
              v-for="(entry, index) in summary.entryList"
              :key="entry.id"
              class="entry-strip-chip"
              :class="{ active: index === activeEntryIndex }"
              @click="switchEntry(index)"
            >
              <text class="entry-strip-mood">{{ entry.moodMeta.label }}</text>
              <text class="entry-strip-time">{{ formatCommentTime(entry.updatedAt || entry.createdAt) }}</text>
            </view>
          </scroll-view>
        </view>
        <view v-else class="detail-empty">{{ TEXT.emptyEntryContent }}</view>
      </view>
    </view>

    <view v-if="historyDrawerVisible" class="history-drawer-mask" @click="closeHistoryDrawer">
      <view class="history-drawer-card" @click.stop>
        <view class="history-drawer-handle"></view>
        <view class="history-drawer-head">
          <view class="history-drawer-title">{{ TEXT.historyTitle }}</view>
          <view class="history-drawer-subtitle">{{ historyDrawerSubtitle }}</view>
        </view>
        <scroll-view class="history-drawer-scroll" scroll-y enhanced show-scrollbar="false">
          <view v-if="historyList.length" class="history-list">
              <view
              v-for="item in historyList"
              :key="item.id || item.summaryDate"
              class="history-item"
              :class="[getHistoryItemClass(item), { active: item.summaryDate === activeDate }]"
              @click="handleHistorySelect(item.summaryDate)"
            >
              <view class="history-main">
                <view class="history-date">{{ formatHistoryDate(item.summaryDate) }}</view>
                <view class="history-count">{{ item.entryCount }} 条</view>
              </view>
              <view class="history-author">{{ getHistoryMeta(item) }}</view>
              <view class="history-preview">{{ item.content || TEXT.emptyHistoryPreview }}</view>
            </view>
          </view>
          <view v-else class="detail-empty">{{ TEXT.emptyHistory }}</view>
        </scroll-view>
      </view>
    </view>

    <view v-if="commentDrawerVisible && activeEntry?.id" class="comment-drawer-mask" @click="closeCommentDrawer">
      <view class="comment-drawer-card" @click.stop>
        <view class="comment-drawer-handle"></view>
        <view class="comment-drawer-head">
          <view>
            <view class="comment-drawer-title">{{ TEXT.commentDrawerTitle }}</view>
            <view class="comment-drawer-subtitle">{{ commentDrawerSubtitle }}</view>
          </view>
          <view class="comment-drawer-badge">{{ activeEntryCommentStats }}</view>
        </view>

        <scroll-view class="comment-drawer-scroll" scroll-y enable-flex enhanced show-scrollbar="false">
          <view class="comment-overview-card">
            <view class="comment-overview-title">{{ TEXT.commentOverviewTitle }}</view>
            <view class="comment-overview-copy">{{ getEntryInteractionSummary(activeEntry) }}</view>
          </view>

          <view v-if="activeEntry.likeUsers.length" class="comment-like-strip">
            <text class="comment-like-strip-heart">{{ FILLED_HEART }}</text>
            <text class="comment-like-strip-text">{{ getEntryLikeUserSummary(activeEntry) }}</text>
          </view>

          <view v-if="activeEntry.commentList.length" class="comment-thread-list">
            <view
              v-for="item in activeEntry.commentList"
              :key="item.id"
              class="comment-thread-card"
              :class="{ mine: String(item.commenterUsername || '').trim() === currentUsername }"
              @click.stop="handleCommentTap(activeEntry, item)"
            >
              <view class="comment-thread-topline">
                <view class="comment-thread-name">{{ getCommentDisplayName(item) }}</view>
                <view class="comment-thread-time">{{ formatCommentTime(item.createdAt || item.updatedAt) }}</view>
              </view>
              <view class="comment-thread-content">{{ item.content }}</view>
            </view>
          </view>

          <view v-else class="comment-thread-empty">{{ TEXT.emptyEntryInteraction }}</view>
        </scroll-view>

        <view class="comment-composer drawer-composer">
          <view v-if="replyTargetComment" class="comment-reply-banner">
            <text class="comment-reply-text">{{ `${TEXT.replyingPrefix}${getCommentDisplayName(replyTargetComment)}` }}</text>
            <text class="comment-reply-clear" @click.stop="clearReplyTarget">{{ TEXT.clearReplyAction }}</text>
          </view>
          <textarea
            v-model="commentForm.content"
            class="comment-input comment-textarea"
            :focus="commentFocus"
            :maxlength="500"
            :cursor-spacing="24"
            :placeholder="commentInputPlaceholder"
            placeholder-class="app-account-input-placeholder"
            auto-height
            :show-confirm-bar="false"
            :adjust-position="true"
          />
          <view class="comment-composer-actions">
            <view class="comment-limit">{{ commentLengthText }}</view>
            <button class="comment-send-btn" :disabled="submittingComment" @click="handleSubmitComment">
              {{ submittingComment ? TEXT.commentSending : TEXT.commentSend }}
            </button>
          </view>
        </view>
      </view>
    </view>

    <view v-if="commentActionSheetVisible" class="comment-sheet-mask" @click="closeCommentActionSheet">
      <view class="comment-sheet-card" @click.stop>
        <view class="comment-sheet-title">{{ TEXT.deleteOwnCommentTitle }}</view>
        <view class="comment-sheet-action danger" @click="handleDeleteSelectedComment">{{ TEXT.deleteAction }}</view>
        <view class="comment-sheet-action" @click="closeCommentActionSheet">{{ TEXT.cancelAction }}</view>
      </view>
    </view>

    <button class="daily-add-btn app-primary-btn app-primary-btn-shadow" @click="goAddEntry">
      {{ summary.hasRecord ? TEXT.addAnotherButton : TEXT.firstEntryButton }}
    </button>
  </view>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  createDailySummaryEntryComment,
  deleteDailySummaryEntryComment,
  fetchDailySummaryByDate,
  fetchTodayDailySummary,
  getDailySummaryMoodMeta,
  toggleDailySummaryEntryLike
} from '@/services/daily-summaries.js'
import { getUser, requireAuth } from '@/utils/auth.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { openMediaViewer } from '@/utils/media-viewer.js'
import { goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'

const FILLED_HEART = '❤'
const TEXT = {
  pageTitle: '今日小计',
  eyebrow: '共享日常',
  historyButton: '历史查看',
  historyTitle: '历史查看',
  recordBookTitle: '当天记录册',
  recordBookDesc: '左右翻看这一天里的每一条小计，把一整天慢慢读完。',
  entryContentLabel: '今天记下',
  entryMediaLabel: '贴图',
  entrySummaryLabel: '互动摘要',
  emptyUpdated: '今天正在等待被认真写下来',
  updatedPrefix: '最后更新：',
  commentAction: '评论',
  commentDrawerTitle: '今天的留言',
  commentOverviewTitle: '先把内容和回应分开来看',
  commentPlaceholder: '写下一句想留在今天的话',
  commentReplyPrefix: '回复 ',
  commentReplyDivider: '：',
  replyingPrefix: '正在回复 ',
  clearReplyAction: '取消',
  commentSend: '发送',
  commentSending: '发送中',
  commentFailed: '评论失败，请稍后再试',
  commentEmptyError: '请先写下评论内容',
  commentDeleted: '评论已删除',
  commentDeleteFailed: '删除评论失败',
  likeAction: '点赞',
  unlikeAction: '取消点赞',
  likeFailed: '操作失败，请稍后再试',
  editAction: '编辑',
  viewCommentAction: '打开留言区',
  writeCommentAction: '写一句留言',
  imageWord: '图片',
  videoWord: '视频',
  emptyBoardDesc: '今天还没有任何一条小计，先留下第一段吧。',
  emptyEntryContent: '今天还没有任何一条小计。',
  emptyEntryInteraction: '这条小计还没有评论和爱心。',
  emptyHistory: '写下第一天之后，这里就会慢慢有历史了。',
  emptyHistoryPreview: '这一天暂时还没有预览内容。',
  deleteOwnCommentTitle: '删除我的评论',
  deleteAction: '删除',
  cancelAction: '取消',
  addAnotherButton: '再写一条今天的小计',
  firstEntryButton: '开始记录今天',
  commentLengthSuffix: '/500'
}

const { themeStyle } = useThemePage()
const summary = reactive({
  id: '',
  summaryDate: '',
  mood: 'gentle',
  content: '',
  hasRecord: false,
  entryCount: 0,
  creatorUsername: '',
  updaterUsername: '',
  updatedAt: '',
  entryList: [],
  historyList: []
})

const activeDate = ref('')
const activeEntryIndex = ref(0)
const submittingComment = ref(false)
const deletingComment = ref(false)
const liking = ref(false)
const commentDrawerVisible = ref(false)
const commentFocus = ref(false)
const commentActionSheetVisible = ref(false)
const historyDrawerVisible = ref(false)
const selectedComment = ref(null)
const selectedCommentEntryId = ref('')
const replyTargetComment = ref(null)
const replyEntryId = ref('')
const commentForm = reactive({ content: '' })

const currentUsername = computed(() => String(getUser()?.username || '').trim())
const moodMeta = computed(() => getDailySummaryMoodMeta(summary.mood))
const currentDateLabel = computed(() => formatPrettyDate(activeDate.value || summary.summaryDate))
const updaterLabel = computed(() => {
  if (!summary.hasRecord || !summary.updaterUsername) return TEXT.emptyUpdated
  return `${TEXT.updatedPrefix}${summary.updaterUsername === currentUsername.value ? '我写的' : 'TA写的'}`
})
const heroTitle = computed(() => {
  if (!summary.hasRecord) return '今天也值得认真留下一页'
  return `${moodMeta.value.label}的一天，被写成了 ${summary.entryCount} 条小计`
})
const heroDesc = computed(() => {
  if (!summary.hasRecord) return '从一条今天的小计开始，慢慢把普通的一天也收藏起来。'
  if (summary.entryCount > 1) {
    return '把这一天拆成几页来写，回看时会更像慢慢翻一本当天的手账。'
  }
  return '先把今天的情绪和片段收好，具体内容留到下面那一页再慢慢读。'
})
const entryCountText = computed(() => (summary.hasRecord ? `今天写下了 ${summary.entryCount} 条小计` : '今天还没有小计'))
const activeEntry = computed(() => summary.entryList[activeEntryIndex.value] || null)
const activeEntrySummary = computed(() => {
  if (!activeEntry.value) return `历史共 ${historyList.value.length} 天`
  return `${activeEntry.value.moodMeta.label} · ${formatCommentTime(activeEntry.value.updatedAt || activeEntry.value.createdAt)}`
})
const historyList = computed(() => Array.isArray(summary.historyList) ? summary.historyList : [])
const historyDrawerSubtitle = computed(() => `共 ${historyList.value.length} 天可以回看`)
const activeEntryCommentStats = computed(() => {
  if (!activeEntry.value) return '0 条留言'
  const commentCount = Array.isArray(activeEntry.value.commentList) ? activeEntry.value.commentList.length : 0
  return `${commentCount} 条留言`
})
const commentDrawerSubtitle = computed(() => {
  if (!activeEntry.value) return '把今天这一页的回应单独收在这里。'
  const likeCount = Array.isArray(activeEntry.value.likeUsers) ? activeEntry.value.likeUsers.length : 0
  const commentCount = Array.isArray(activeEntry.value.commentList) ? activeEntry.value.commentList.length : 0
  return `${likeCount} 个爱心 · ${commentCount} 条留言`
})
const commentLengthText = computed(() => `${String(commentForm.content || '').length}${TEXT.commentLengthSuffix}`)
const commentInputPlaceholder = computed(() => {
  if (!replyTargetComment.value) return TEXT.commentPlaceholder
  return `${TEXT.commentReplyPrefix}${getCommentDisplayName(replyTargetComment.value)}${TEXT.commentReplyDivider}`
})
onLoad((options) => {
  requireAuth()
  activeDate.value = String(options?.date || '').trim()
})

onShow(() => {
  if (!requireAuth()) return
  loadSummary(activeDate.value)
})

async function loadSummary(date) {
  try {
    const detail = date ? await fetchDailySummaryByDate(date) : await fetchTodayDailySummary()
    Object.assign(summary, detail)
    activeDate.value = detail.summaryDate || date || activeDate.value
    activeEntryIndex.value = 0
    closeTransientState()
  } catch (error) {
    uni.showToast({ title: error?.message || '今日小计加载失败', icon: 'none' })
  }
}

function handleEntryChange(event) {
  activeEntryIndex.value = Number(event?.detail?.current || 0)
  closeTransientState()
}

function switchEntry(index) {
  activeEntryIndex.value = index
  closeTransientState()
}

function openHistoryDrawer() {
  historyDrawerVisible.value = true
  closeTransientState()
}

function closeHistoryDrawer() {
  historyDrawerVisible.value = false
}

async function handleHistorySelect(date) {
  if (!date) return
  closeHistoryDrawer()
  if (date === activeDate.value) return
  await loadSummary(date)
}

function goAddEntry() {
  goPage(`/pages/modules/daily-summary/edit?date=${encodeURIComponent(activeDate.value || summary.summaryDate)}`)
}

function goEdit(entry) {
  if (!summary.id || !entry?.id) return
  goPage(`/pages/modules/daily-summary/edit?summaryId=${encodeURIComponent(summary.id)}&entryId=${encodeURIComponent(entry.id)}&date=${encodeURIComponent(activeDate.value || summary.summaryDate)}`)
}

async function handleLikeToggle(entry) {
  const targetEntry = entry?.id ? entry : activeEntry.value
  if (!summary.id || !targetEntry?.id || liking.value) return
  try {
    liking.value = true
    await toggleDailySummaryEntryLike(summary.id, targetEntry.id)
    await loadSummary(activeDate.value)
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.likeFailed, icon: 'none' })
  } finally {
    liking.value = false
  }
}

function openCommentDrawer(comment = null, entryId = '', focus = false) {
  const targetEntryId = entryId || activeEntry.value?.id
  if (!targetEntryId) return
  replyTargetComment.value = comment
  replyEntryId.value = targetEntryId
  commentDrawerVisible.value = true
  commentFocus.value = false
  if (focus) {
    nextTick(() => {
      commentFocus.value = true
    })
  }
}

function openCommentComposer(comment = null, entryId = '') {
  openCommentDrawer(comment, entryId, true)
}

async function handleSubmitComment() {
  const rawContent = String(commentForm.content || '').trim()
  const targetEntryId = replyEntryId.value || activeEntry.value?.id
  if (!rawContent) {
    uni.showToast({ title: TEXT.commentEmptyError, icon: 'none' })
    return
  }
  if (!summary.id || !targetEntryId || submittingComment.value) return

  const targetName = replyTargetComment.value ? getCommentDisplayName(replyTargetComment.value) : ''
  const content = targetName ? `${TEXT.commentReplyPrefix}${targetName}${TEXT.commentReplyDivider}${rawContent}` : rawContent

  try {
    submittingComment.value = true
    await createDailySummaryEntryComment(summary.id, targetEntryId, { content })
    commentForm.content = ''
    closeCommentDrawer()
    await loadSummary(activeDate.value)
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.commentFailed, icon: 'none' })
  } finally {
    submittingComment.value = false
  }
}

function handleCommentTap(entry, comment) {
  if (!entry?.id || !comment) return
  if (String(comment.commenterUsername || '').trim() === currentUsername.value) {
    selectedComment.value = comment
    selectedCommentEntryId.value = entry.id
    commentActionSheetVisible.value = true
    return
  }
  openCommentComposer(comment, entry.id)
}

async function handleDeleteSelectedComment() {
  if (!summary.id || !selectedComment.value?.id || !selectedCommentEntryId.value || deletingComment.value) return
  try {
    deletingComment.value = true
    await deleteDailySummaryEntryComment(summary.id, selectedCommentEntryId.value, selectedComment.value.id)
    if (replyTargetComment.value?.id === selectedComment.value.id) {
      replyTargetComment.value = null
      replyEntryId.value = ''
    }
    closeCommentActionSheet()
    uni.showToast({ title: TEXT.commentDeleted, icon: 'success' })
    await loadSummary(activeDate.value)
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.commentDeleteFailed, icon: 'none' })
  } finally {
    deletingComment.value = false
  }
}

function closeCommentActionSheet() {
  commentActionSheetVisible.value = false
  selectedComment.value = null
  selectedCommentEntryId.value = ''
}

function clearReplyTarget() {
  replyTargetComment.value = null
  replyEntryId.value = activeEntry.value?.id || ''
}

function closeCommentDrawer() {
  commentDrawerVisible.value = false
  commentFocus.value = false
  clearReplyTarget()
}

function closeTransientState() {
  closeCommentActionSheet()
  closeCommentDrawer()
  commentForm.content = ''
}

function hasEntryInteraction(entry) {
  return (Array.isArray(entry?.likeUsers) && entry.likeUsers.length > 0) || (Array.isArray(entry?.commentList) && entry.commentList.length > 0)
}

function getEntryLikeUserSummary(entry) {
  return (entry.likeUsers || []).map((item) => item?.nickname || item?.username || '未命名').join('、')
}

function getEntryInteractionSummary(entry) {
  if (!entry) return '这一天的回应会单独收在这里。'
  const likeCount = Array.isArray(entry.likeUsers) ? entry.likeUsers.length : 0
  const commentCount = Array.isArray(entry.commentList) ? entry.commentList.length : 0
  if (!likeCount && !commentCount) {
    return '先把今天的内容写下来，回应和爱心就会慢慢聚过来。'
  }
  if (likeCount && commentCount) {
    return `${likeCount} 个爱心和 ${commentCount} 条留言，已经把这页日常接住了。`
  }
  if (likeCount) {
    return `${likeCount} 个爱心已经先落在这页，留言区也随时可以继续写。`
  }
  return `${commentCount} 条留言正在这里慢慢延长今天的对话。`
}

function getCommentDisplayName(comment) {
  return comment?.commenterNickname || comment?.commenterUsername || '未命名'
}

function formatCommentTime(value) {
  const source = String(value || '').replace('T', ' ').trim()
  if (!source) return ''
  return source.length >= 16 ? source.slice(5, 16) : source
}

function getIdentityBadgeText(username) {
  return String(username || '').trim() === currentUsername.value ? '我写的' : 'TA写的'
}

function getIdentityBadgeClass(username) {
  return getAuthorToneClass(username)
}

function getEntryMeta(entry) {
  const nickname = getAuthorDisplayName(entry.creatorNickname, entry.creatorUsername)
  const time = formatCommentTime(entry.updatedAt || entry.createdAt)
  return time ? `${nickname} · ${time}` : nickname
}

function getEntryCardClass(username) {
  return getAuthorToneClass(username)
}

function getHistoryAuthorKey(item) {
  return String(item?.authorUsername || item?.updaterUsername || item?.creatorUsername || item?.authorNickname || item?.updaterNickname || item?.creatorNickname || '').trim()
}

function getHistoryAuthorName(item) {
  return getAuthorDisplayName(
    item?.authorNickname || item?.updaterNickname || item?.creatorNickname,
    item?.authorUsername || item?.updaterUsername || item?.creatorUsername
  )
}

function getHistoryMeta(item) {
  const time = formatCommentTime(item?.updatedAt || '')
  const name = getHistoryAuthorName(item)
  return time ? `${name} · ${time}` : name
}

function getHistoryItemClass(item) {
  return getAuthorToneClass(getHistoryAuthorKey(item))
}

function getAuthorDisplayName(nickname, username) {
  const name = String(nickname || '').trim() || String(username || '').trim()
  return name || '未命名'
}

function getAuthorToneClass(username) {
  const key = String(username || '').trim()
  if (!key) {
    return 'author-tone-unknown'
  }
  if (key === currentUsername.value) {
    return 'author-tone-mine'
  }
  return 'author-tone-partner'
}

function resolveMedia(path) {
  return resolveMediaUrl(path)
}

function openEntryViewer(mediaList, index) {
  openMediaViewer(mediaList, index)
}

function formatPrettyDate(value) {
  if (!value) return '今天'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function formatHistoryDate(value) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style scoped>
.daily-detail-page {
  min-height: 100vh;
  padding-bottom: 188rpx;
  background: var(--app-page-gradient-main);
  overflow-x: hidden;
}

.daily-detail-content {
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

.daily-hero-topline,
.daily-hero-row,
.daily-hero-meta,
.daily-entry-topline,
.daily-entry-actions,
.daily-stage-actions,
.interaction-comment-head,
.history-main,
.comment-composer-actions {
  display: flex;
  align-items: center;
}

.daily-hero-topline,
.daily-hero-row,
.daily-entry-topline,
.daily-entry-actions,
.history-main {
  justify-content: space-between;
}

.daily-hero-topline {
  gap: 24rpx;
}

.daily-history-entry {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  flex-shrink: 0;
  min-height: 58rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.7);
  color: var(--app-color-primary-strong);
  font-size: 24rpx;
  font-weight: 700;
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.46);
}

.daily-history-entry.stage {
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    inset 0 0 0 2rpx rgba(255, 255, 255, 0.58),
    0 10rpx 20rpx rgba(83, 148, 138, 0.1);
}

.daily-history-entry-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: currentColor;
}

.daily-hero-row {
  margin-top: 18rpx;
  gap: 16rpx;
}

.daily-hero-meta {
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 18rpx;
}

.daily-mood-pill,
.entry-mood-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.daily-mood-pill-gentle,
.entry-mood-pill-gentle {
  background: rgba(255, 241, 245, 0.95);
  color: #c66e89;
}

.daily-mood-pill-sweet,
.entry-mood-pill-sweet {
  background: rgba(255, 240, 231, 0.95);
  color: #cc815d;
}

.daily-mood-pill-calm,
.entry-mood-pill-calm {
  background: rgba(238, 247, 239, 0.95);
  color: #70936a;
}

.daily-mood-pill-missing,
.entry-mood-pill-missing {
  background: rgba(246, 239, 255, 0.95);
  color: #8f78ba;
}

.daily-mood-pill-busy,
.entry-mood-pill-busy {
  background: rgba(255, 246, 229, 0.95);
  color: #bf8c45;
}

.daily-mood-pill-closer,
.entry-mood-pill-closer {
  background: rgba(237, 246, 251, 0.95);
  color: #5a8dae;
}

.daily-hero-updated,
.daily-stage-count,
.daily-entry-time,
.daily-entry-meta,
.history-count,
.interaction-comment-time,
.comment-limit {
  font-size: 22rpx;
  color: var(--app-color-text-muted);
}
.daily-stage {
  padding: 30rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: var(--app-card-shadow);
  overflow: hidden;
}

.daily-stage-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.daily-stage-actions {
  flex-shrink: 0;
  gap: 14rpx;
}

.daily-stage-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--app-color-text-strong);
}

.daily-stage-desc {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--app-color-text-muted);
}

.daily-swiper-shell {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  margin-top: 24rpx;
}

.daily-swiper {
  width: 100%;
  height: 980rpx;
}

.daily-entry-card {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 28rpx;
  border-radius: 30rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), var(--author-surface, rgba(255, 255, 255, 0.98))),
    var(--author-surface, rgba(255, 255, 255, 0.98));
  box-shadow:
    inset 0 0 0 2rpx var(--author-outline, rgba(67, 122, 118, 0.08)),
    0 18rpx 34rpx rgba(67, 122, 118, 0.08);
}

.daily-entry-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 24rpx;
  bottom: 24rpx;
  width: 10rpx;
  border-radius: 0 999rpx 999rpx 0;
  background: var(--author-accent, var(--app-color-primary-strong));
}

.daily-entry-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
  flex-wrap: wrap;
}

.daily-entry-page-index {
  min-height: 44rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.72);
  color: var(--author-accent, var(--app-color-primary-strong));
  font-size: 20rpx;
  font-weight: 700;
}

.identity-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  min-height: 46rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 700;
  background: var(--author-badge-bg, rgba(255, 255, 255, 0.95));
  color: var(--author-accent, var(--app-color-primary-strong));
}

.identity-badge-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: currentColor;
}

.author-tone-mine {
  --author-surface: #e9f4ff;
  --author-surface-active: #d9ecff;
  --author-surface-soft: rgba(228, 242, 255, 0.9);
  --author-badge-bg: #ffffff;
  --author-accent: #2f7bdc;
  --author-outline: rgba(47, 123, 220, 0.24);
}

.author-tone-partner {
  --author-surface: #ffeaf1;
  --author-surface-active: #ffdce7;
  --author-surface-soft: rgba(255, 233, 241, 0.9);
  --author-badge-bg: #ffffff;
  --author-accent: #d85b87;
  --author-outline: rgba(216, 91, 135, 0.24);
}

.author-tone-unknown {
  --author-surface: #f3f5f7;
  --author-surface-active: #ebeff3;
  --author-surface-soft: rgba(243, 245, 247, 0.9);
  --author-badge-bg: #ffffff;
  --author-accent: #6b7280;
  --author-outline: rgba(107, 114, 128, 0.18);
}

.daily-entry-meta {
  margin-top: 12rpx;
}

.daily-entry-paper {
  position: relative;
  overflow: hidden;
  padding: 28rpx 24rpx 30rpx;
  border-radius: 26rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(255, 252, 246, 0.96));
  box-shadow:
    inset 0 0 0 2rpx rgba(255, 255, 255, 0.82),
    0 10rpx 24rpx rgba(95, 113, 112, 0.05);
}

.daily-entry-paper::after {
  content: '';
  position: absolute;
  inset: 24rpx 22rpx 24rpx auto;
  width: 2rpx;
  background: linear-gradient(180deg, rgba(228, 220, 202, 0), rgba(228, 220, 202, 0.92) 20%, rgba(228, 220, 202, 0.92) 80%, rgba(228, 220, 202, 0));
  opacity: 0.42;
}

.daily-entry-paper-label {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  min-height: 42rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: rgba(243, 237, 225, 0.88);
  color: #a27d57;
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.daily-entry-paper-label.media-label {
  grid-column: 1 / -1;
  margin-bottom: -2rpx;
}

.daily-entry-content {
  margin-top: 16rpx;
  font-size: 30rpx;
  line-height: 1.9;
  color: var(--app-color-text-strong);
  white-space: pre-wrap;
  word-break: break-word;
}

.daily-entry-scroll {
  flex: 1;
  min-height: 0;
  margin-top: 22rpx;
}

.daily-media-grid {
  margin-top: 22rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.daily-media-card {
  position: relative;
  overflow: hidden;
  border-radius: 24rpx;
  aspect-ratio: 1 / 1;
  background: rgba(255, 255, 255, 0.72);
}

.daily-media-thumb {
  width: 100%;
  height: 100%;
  display: block;
}

.daily-media-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 244, 247, 0.85), rgba(238, 247, 239, 0.85));
}

.daily-play-icon {
  width: 0;
  height: 0;
  border-top: 14rpx solid transparent;
  border-bottom: 14rpx solid transparent;
  border-left: 22rpx solid rgba(90, 141, 174, 0.9);
  margin-left: 8rpx;
}

.daily-media-tag {
  position: absolute;
  right: 10rpx;
  bottom: 10rpx;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.42);
  color: #fff;
  font-size: 20rpx;
}

.daily-entry-actions {
  margin-top: 22rpx;
}

.daily-entry-edit {
  min-height: 52rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  color: var(--app-color-primary-strong);
  font-size: 24rpx;
  font-weight: 700;
}

.daily-entry-stamp {
  min-height: 52rpx;
  padding: 0 18rpx;
  border-radius: 18rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.72);
  color: var(--author-accent, var(--app-color-primary-strong));
  font-size: 22rpx;
  font-weight: 700;
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.68);
}

.daily-entry-footer {
  margin-top: 20rpx;
}

.daily-entry-summary-card {
  padding: 20rpx 22rpx;
  border-radius: 24rpx;
  background: var(--author-surface-soft, rgba(255, 255, 255, 0.64));
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.56);
}

.daily-entry-summary-kicker {
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  color: var(--author-accent, var(--app-color-primary-strong));
}

.daily-entry-summary-text {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.75;
  color: var(--app-color-text-strong);
}

.daily-entry-footer-actions {
  margin-top: 16rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.daily-inline-action {
  min-height: 78rpx;
  padding: 0 18rpx;
  border-radius: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  background: rgba(255, 255, 255, 0.82);
  color: var(--author-accent, var(--app-color-primary-strong));
  font-size: 24rpx;
  font-weight: 700;
  box-shadow:
    inset 0 0 0 2rpx rgba(255, 255, 255, 0.7),
    0 10rpx 20rpx rgba(95, 113, 112, 0.06);
}

.daily-inline-action.primary {
  background: linear-gradient(180deg, rgba(255, 249, 239, 0.98), rgba(255, 255, 255, 0.96));
  color: #a36e55;
}

.daily-inline-action-heart {
  font-size: 26rpx;
  line-height: 1;
  color: #ef728d;
}

.entry-empty-tip,
.detail-empty {
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--app-color-text-muted);
}

.entry-empty-tip {
  padding: 20rpx 22rpx;
}

.entry-strip {
  width: 100%;
  min-width: 0;
  margin-top: 20rpx;
  white-space: nowrap;
}

.entry-strip-chip {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  margin-right: 14rpx;
  padding: 14rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.74);
  color: #6b8a89;
  font-size: 22rpx;
}

.entry-strip-chip.active {
  background: linear-gradient(135deg, rgba(233, 248, 244, 0.98), rgba(246, 255, 252, 0.98));
  color: var(--app-color-primary-strong);
  box-shadow: 0 10rpx 20rpx rgba(83, 148, 138, 0.12);
}

.entry-strip-mood {
  font-weight: 700;
}
.history-drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 28;
  background: rgba(17, 18, 22, 0.18);
  display: flex;
  align-items: flex-end;
}

.history-drawer-card {
  width: 100%;
  max-width: 750rpx;
  padding: 18rpx 24rpx calc(env(safe-area-inset-bottom) + 28rpx);
  border-radius: 32rpx 32rpx 0 0;
  background: rgba(255, 255, 255, 0.96);
  box-sizing: border-box;
  box-shadow: 0 -18rpx 36rpx rgba(0, 0, 0, 0.12);
}

.history-drawer-handle {
  width: 88rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: rgba(153, 174, 171, 0.55);
  margin: 0 auto 20rpx;
}

.history-drawer-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--app-color-text-strong);
}

.history-drawer-subtitle {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--app-color-text-muted);
}

.history-drawer-scroll {
  width: 100%;
  max-height: 58vh;
  margin-top: 20rpx;
}

.history-list {
  display: grid;
  gap: 14rpx;
}

.history-item {
  position: relative;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 20rpx 22rpx 20rpx 30rpx;
  border-radius: 24rpx;
  background: var(--author-surface, rgba(243, 250, 248, 0.96));
  box-shadow: inset 0 0 0 2rpx var(--author-outline, rgba(255, 255, 255, 0.46));
}

.history-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 18rpx;
  bottom: 18rpx;
  width: 10rpx;
  border-radius: 0 999rpx 999rpx 0;
  background: var(--author-accent, var(--app-color-primary-strong));
}

.history-item.active {
  background: var(--author-surface-active, rgba(243, 250, 248, 0.96));
  box-shadow:
    inset 0 0 0 2rpx var(--author-outline, rgba(255, 255, 255, 0.78)),
    0 12rpx 24rpx rgba(83, 148, 138, 0.08);
}

.history-date {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--app-color-primary-strong);
}

.history-author {
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--author-accent, var(--app-color-text-muted));
}

.history-preview {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--app-color-text-muted);
  white-space: normal;
  word-break: break-word;
}

.comment-drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 32;
  background: rgba(17, 18, 22, 0.18);
  display: flex;
  align-items: flex-end;
}

.comment-drawer-card {
  width: 100%;
  max-width: 750rpx;
  height: 76vh;
  max-height: 76vh;
  min-height: 560rpx;
  padding: 18rpx 24rpx calc(env(safe-area-inset-bottom) + 24rpx);
  border-radius: 32rpx 32rpx 0 0;
  background: rgba(255, 255, 255, 0.97);
  box-sizing: border-box;
  box-shadow: 0 -18rpx 36rpx rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.comment-drawer-handle {
  width: 88rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: rgba(153, 174, 171, 0.55);
  margin: 0 auto 20rpx;
}

.comment-drawer-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.comment-drawer-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--app-color-text-strong);
}

.comment-drawer-subtitle {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--app-color-text-muted);
}

.comment-drawer-badge {
  flex-shrink: 0;
  min-height: 52rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(243, 250, 248, 0.96);
  color: var(--app-color-primary-strong);
  font-size: 22rpx;
  font-weight: 700;
}

.comment-drawer-scroll {
  width: 100%;
  flex: 1;
  height: 0;
  min-height: 0;
  margin-top: 20rpx;
}

.comment-overview-card {
  padding: 22rpx 22rpx 20rpx;
  border-radius: 24rpx;
  background: rgba(246, 251, 249, 0.96);
  box-shadow: inset 0 0 0 2rpx rgba(229, 242, 239, 0.96);
}

.comment-overview-title {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--app-color-primary-strong);
}

.comment-overview-copy {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.75;
  color: var(--app-color-text-strong);
}

.comment-like-strip {
  margin-top: 16rpx;
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
  background: rgba(255, 244, 247, 0.92);
}

.comment-like-strip-heart {
  font-size: 26rpx;
  color: #ef728d;
}

.comment-like-strip-text {
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--app-color-text-strong);
}

.comment-thread-list {
  margin-top: 16rpx;
  display: grid;
  gap: 14rpx;
}

.comment-thread-card {
  padding: 20rpx 22rpx;
  border-radius: 24rpx;
  background: rgba(243, 248, 255, 0.92);
  box-shadow: inset 0 0 0 2rpx rgba(222, 234, 249, 0.96);
}

.comment-thread-card.mine {
  background: rgba(255, 242, 247, 0.94);
  box-shadow: inset 0 0 0 2rpx rgba(249, 225, 234, 0.98);
}

.comment-thread-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.comment-thread-name {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--app-color-text-strong);
}

.comment-thread-time {
  font-size: 22rpx;
  color: var(--app-color-text-muted);
}

.comment-thread-content {
  margin-top: 10rpx;
  font-size: 25rpx;
  line-height: 1.75;
  color: var(--app-color-text-strong);
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-thread-empty {
  margin-top: 16rpx;
  padding: 28rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(247, 249, 250, 0.96);
  font-size: 24rpx;
  line-height: 1.75;
  color: var(--app-color-text-muted);
  text-align: center;
}

.comment-composer {
  padding: 20rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(18px);
  box-shadow: 0 18rpx 34rpx rgba(83, 148, 138, 0.12);
  box-sizing: border-box;
}

.drawer-composer {
  margin-top: 18rpx;
  padding: 18rpx;
  border-radius: 26rpx;
  background: rgba(250, 252, 251, 0.96);
  box-shadow: inset 0 0 0 2rpx rgba(234, 241, 239, 0.96);
}

.comment-reply-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 12rpx;
  padding: 0 6rpx;
}

.comment-reply-text {
  font-size: 22rpx;
  color: var(--app-color-primary-strong);
  font-weight: 700;
}

.comment-reply-clear {
  font-size: 22rpx;
  color: var(--app-color-text-muted);
}

.comment-input {
  width: 100%;
  min-height: 120rpx;
  padding: 18rpx 22rpx;
  border-radius: 22rpx;
  box-sizing: border-box;
  background: rgba(242, 250, 248, 0.96);
  font-size: 28rpx;
  line-height: 1.7;
  color: var(--app-color-text-strong);
}

.comment-textarea {
  max-height: 260rpx;
}

.comment-composer-actions {
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 14rpx;
}

.comment-send-btn {
  min-width: 128rpx;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 28rpx;
  border: none;
  border-radius: 999rpx;
  background: var(--app-gradient-primary);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.comment-sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 35;
  background: rgba(17, 18, 22, 0.16);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 28rpx calc(env(safe-area-inset-bottom) + 24rpx);
  box-sizing: border-box;
}

.comment-sheet-card {
  width: 100%;
  max-width: 460rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.97);
  overflow: hidden;
  box-shadow: 0 22rpx 42rpx rgba(0, 0, 0, 0.12);
}

.comment-sheet-title,
.comment-sheet-action {
  min-height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.comment-sheet-title {
  color: var(--app-color-text-muted);
  border-bottom: 1px solid rgba(220, 231, 228, 0.9);
}

.comment-sheet-action {
  color: var(--app-color-text-strong);
}

.comment-sheet-action + .comment-sheet-action {
  border-top: 1px solid rgba(220, 231, 228, 0.9);
}

.comment-sheet-action.danger {
  color: #d85c7c;
  font-weight: 700;
}

.daily-add-btn {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(env(safe-area-inset-bottom) + 20rpx);
  z-index: 20;
  width: auto;
  max-width: calc(100vw - 48rpx);
  height: 92rpx;
  line-height: 92rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
</style>
