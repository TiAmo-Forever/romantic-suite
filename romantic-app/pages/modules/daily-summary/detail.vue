<template>
  <view class="page daily-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="bg blob a"></view>
    <view class="bg blob b"></view>
    <view class="bg blob c"></view>

    <view class="topbar">
      <view class="icon-btn" hover-class="surface-press" hover-stay-time="60" @click="backPage()">
        <image class="icon" :src="iconBack" mode="aspectFit"></image>
      </view>
      <view class="title">每日小计</view>
      <view class="icon-btn" hover-class="surface-press" hover-stay-time="60" @click="handleTopAction">
        <image class="icon edit-icon" :src="iconEdit" mode="aspectFit"></image>
      </view>
    </view>

    <view class="head-copy">
      <view class="date">{{ fullDateLabel }}</view>
      <view class="love-line">
        <view class="line"></view>
        <text>{{ togetherText }}</text>
        <view class="line right"></view>
      </view>
    </view>

    <view class="content">
      <view class="card overview">
        <view class="overview-strip"></view>
        <view class="overview-body">
          <view class="overview-top">
            <view class="duo">
              <view class="duo-badge main">{{ selfBadge }}</view>
              <view class="duo-heart">♥</view>
              <view class="duo-badge partner">{{ partnerBadge }}</view>
            </view>
            <view class="status" :class="{ muted: !summary.hasRecord }">
              <image class="mini-icon" :src="iconCheck" mode="aspectFit"></image>
              <text>{{ summary.hasRecord ? '今日已记录' : '等待记录' }}</text>
            </view>
          </view>

          <view class="mood">
            <view class="mood-glow"></view>
            <image class="flower" :src="iconFlower" mode="aspectFit"></image>
            <view class="mood-title">{{ moodView.title }}</view>
            <view class="mood-desc">{{ moodView.desc }}</view>
          </view>

          <view class="divider"></view>
          <view class="summary-text" @longpress.stop="copyText(summaryText)">{{ summaryText }}</view>
          <view class="chips">
            <view class="chip"><image class="mini-icon" :src="iconNote" mode="aspectFit"></image><text>{{ entryCount }} 个片段</text></view>
            <view class="chip"><image class="mini-icon" :src="iconImage" mode="aspectFit"></image><text>{{ mediaCountDisplay }} 张附图</text></view>
            <view class="chip"><image class="mini-icon" :src="iconHeart" mode="aspectFit"></image><text>{{ responseChipText }}</text></view>
          </view>
        </view>
      </view>

      <view class="card note-card">
        <view class="section-label"><view class="bar"></view><text>今日小记</text></view>
        <view class="note-text" @longpress.stop="copyText(noteText)">{{ noteText }}</view>
        <view v-if="noteExpandable" class="expand" @click="noteExpanded = !noteExpanded">
          <text>{{ noteExpanded ? '收起内容' : '展开全部' }}</text>
          <image class="expand-icon" :class="{ open: noteExpanded }" :src="iconChevronDown" mode="aspectFit"></image>
        </view>
        <view class="note-foot"><view class="note-line"></view><text>{{ noteFooter }}</text><text>✦</text></view>
      </view>

      <view class="section-head"><view class="section-label"><view class="bar"></view><text>今日片段</text></view><text class="section-count">{{ entryCount }} 个</text></view>
      <view v-if="entryCards.length" class="list">
        <view v-for="item in entryCards" :key="item.id" class="card row" hover-class="surface-press" hover-stay-time="60" @click="goEdit(item.raw)">
          <text class="time">{{ item.time }}</text>
          <text class="row-text">{{ item.text }}</text>
          <view class="action"><image class="mini-icon" :src="iconItemAction" mode="aspectFit"></image></view>
        </view>
      </view>
      <view v-else class="card empty">今天还没有新的片段</view>

      <view v-if="allMedia.length" class="photo-block">
        <view class="section-head"><view class="section-label"><view class="bar"></view><text>今日附图</text></view><text class="section-count">共 {{ allMedia.length }} 张 →</text></view>
        <view class="card photo-strip">
          <view v-for="item in photoPreview" :key="item.key" class="thumb" @click="openGallery(item.index)">
            <image v-if="resolveMedia(item.src)" class="thumb-img" :src="resolveMedia(item.src)" mode="aspectFill"></image>
            <view v-else class="thumb-fallback"><image class="thumb-fallback-icon" :src="iconImage" mode="aspectFit"></image></view>
            <view v-if="item.more" class="thumb-mask"><text class="thumb-more">{{ item.more }}</text><text class="thumb-see">查看</text></view>
          </view>
        </view>
      </view>

      <view class="section-head response-head"><view class="section-label"><view class="bar"></view><text>{{ responseTitle }}</text></view></view>
      <view class="card response-card">
        <view class="response-top">
          <view class="avatar">{{ partnerBadge }}</view>
          <view class="response-copy"><view class="response-name">{{ response.displayName }}</view><view class="response-meta">{{ response.meta }}</view></view>
          <view v-if="response.likeCount" class="like-pill"><image class="mini-icon" :src="iconHeart" mode="aspectFit"></image><text>{{ response.likeCount }}</text></view>
        </view>
        <view class="quote"><text class="quote-mark">"</text><text class="quote-text" @longpress.stop="copyText(response.content)">{{ response.content }}</text></view>
        <view class="response-foot"><text>✦</text><text class="response-action" @click="openResponse">{{ response.action }}</text></view>
      </view>

      <view class="section-head"><view class="section-label"><view class="bar"></view><text>往期记录</text></view></view>
      <scroll-view class="history-scroll" scroll-x enable-flex enhanced show-scrollbar="false">
        <view v-for="item in historyChips" :key="item.summaryDate" class="history-chip" :class="{ active: item.summaryDate === activeDate }" @click="selectHistory(item.summaryDate)">
          <text class="history-chip-top">{{ item.label }}</text>
          <text class="history-chip-date">{{ item.short }}</text>
        </view>
        <view class="history-chip calendar" @click="historyVisible = true"><image class="calendar-icon" :src="iconCalendar" mode="aspectFit"></image><text class="calendar-text">日历</text></view>
      </scroll-view>
    </view>

    <view v-if="historyVisible" class="sheet-mask" @click="historyVisible = false">
      <view class="sheet card" @click.stop>
        <view class="handle"></view>
        <view class="sheet-title">往期记录</view>
        <scroll-view class="sheet-scroll" scroll-y enhanced show-scrollbar="false">
          <view v-for="item in historyList" :key="item.summaryDate" class="history-item" :class="historyTone(item)" @click="pickHistory(item.summaryDate)">
            <view class="history-main"><text class="history-title">{{ pretty(item.summaryDate) }}</text><text class="history-num">{{ item.entryCount }} 条</text></view>
            <view class="history-meta">{{ historyMeta(item) }}</view>
            <view class="history-preview" @longpress.stop="copyText(item.content || '暂无预览内容')">{{ item.content || '暂无预览内容' }}</view>
          </view>
        </scroll-view>
      </view>
    </view>

    <view v-if="commentVisible && activeEntry" class="sheet-mask" @click="closeComment">
      <view class="sheet card" @click.stop>
        <view class="handle"></view>
        <view class="sheet-title">今天的留言</view>
        <view class="sheet-sub">{{ commentSub }}</view>
        <scroll-view class="sheet-scroll" scroll-y enhanced show-scrollbar="false">
          <view class="comment-summary" @longpress.stop="copyText(interactionSummary(activeEntry))">{{ interactionSummary(activeEntry) }}</view>
          <view v-if="activeEntry.likeUsers.length" class="likes">❤ {{ likeUsers(activeEntry) }}</view>
          <view v-if="activeEntry.commentList.length" class="comment-list">
            <view v-for="item in activeEntry.commentList" :key="item.id" class="comment-item" :class="{ mine: item.commenterUsername === currentUsername }" @click.stop="tapComment(activeEntry, item)" @longpress.stop="copyText(item.content)">
              <view class="comment-head"><text>{{ commentName(item) }}</text><text>{{ clock(item.createdAt || item.updatedAt) }}</text></view>
              <view class="comment-body">{{ item.content }}</view>
            </view>
          </view>
          <view v-else class="empty comment-empty">暂无互动</view>
        </scroll-view>
        <view class="composer">
          <view v-if="replyTo" class="reply-tip"><text>{{ `正在回复 ${commentName(replyTo)}` }}</text><text @click="clearReply">取消</text></view>
          <textarea v-model="commentForm.content" class="comment-input" :focus="commentFocus" :maxlength="500" :cursor-spacing="24" :placeholder="commentPlaceholder" auto-height :show-confirm-bar="false" :adjust-position="true" />
          <view class="composer-foot"><text>{{ commentForm.content.length }}/500</text><button class="send-btn" :disabled="commentSubmitting" @click="submitComment">{{ commentSubmitting ? '发送中' : '发送' }}</button></view>
        </view>
      </view>
    </view>

    <view v-if="commentActionVisible" class="sheet-mask small-mask" @click="closeCommentAction">
      <view class="action-sheet card" @click.stop>
        <view class="action-row title-row">删除我的评论</view>
        <view class="action-row danger" @click="deleteComment">删除</view>
        <view class="action-row" @click="closeCommentAction">取消</view>
      </view>
    </view>

    <view class="bottom-bar">
      <button class="primary-btn" @click="goAddEntry"><image class="btn-icon" :src="iconBottomAction" mode="aspectFit"></image><text>{{ summary.hasRecord ? '继续记录今天' : '开始记录今天' }}</text></button>
      <view class="bottom-note">{{ summary.hasRecord ? '今天还可以继续补充记录' : '从第一句开始写下今天' }}</view>
    </view>
  </view>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { createDailySummaryEntryComment, deleteDailySummaryEntryComment, fetchDailySummaryByDate, fetchTodayDailySummary } from '@/services/daily-summaries.js'
import { getUser, requireAuth } from '@/utils/auth.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { openMediaViewer } from '@/utils/media-viewer.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import { fetchPartnerProfile, fetchRemoteProfile } from '@/services/profile.js'
import { getProfile } from '@/utils/profile.js'
import iconBack from '@/assets/daily-summary/icon-back.svg'
import iconEdit from '@/assets/daily-summary/icon-edit.svg'
import iconCheck from '@/assets/daily-summary/icon-check.svg'
import iconNote from '@/assets/daily-summary/icon-note.svg'
import iconImage from '@/assets/daily-summary/icon-image.svg'
import iconHeart from '@/assets/daily-summary/icon-heart.svg'
import iconChevronDown from '@/assets/daily-summary/icon-chevron-down.svg'
import iconItemAction from '@/assets/daily-summary/icon-item-action.svg'
import iconCalendar from '@/assets/daily-summary/icon-calendar.svg'
import iconBottomAction from '@/assets/daily-summary/icon-bottom-action.svg'
import iconFlower from '@/assets/daily-summary/icon-flower.svg'

const DAY = 24 * 60 * 60 * 1000
const WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const MOOD = {
  gentle: { title: '温暖', desc: '心情平静、有点期待' },
  sweet: { title: '很甜', desc: '空气里都是认真喜欢' },
  calm: { title: '安稳', desc: '今天也过得刚刚好' },
  missing: { title: '想念', desc: '有一点想你，也有一点柔软' },
  busy: { title: '忙碌', desc: '在匆忙里也记得彼此' },
  closer: { title: '靠近', desc: '今天又向彼此靠近一点' }
}

const { themeStyle } = useThemePage()
const profile = ref(getProfile())
const partner = ref(null)
const activeDate = ref('')
const noteExpanded = ref(false)
const historyVisible = ref(false)
const commentVisible = ref(false)
const commentFocus = ref(false)
const commentSubmitting = ref(false)
const commentActionVisible = ref(false)
const replyTo = ref(null)
const replyEntryId = ref('')
const pickedComment = ref(null)
const pickedCommentEntryId = ref('')
const activeEntryId = ref('')
const commentForm = reactive({ content: '' })
const summary = reactive({
  id: '',
  summaryDate: '',
  mood: 'gentle',
  content: '',
  hasRecord: false,
  updaterUsername: '',
  updatedAt: '',
  entryList: [],
  historyList: [],
  pageView: null
})

const currentUsername = computed(() => String(getUser()?.username || '').trim())
const pageView = computed(() => summary.pageView || null)
const activeEntry = computed(() => summary.entryList.find((item) => String(item.id) === String(activeEntryId.value)) || summary.entryList[0] || null)
const moodView = computed(() => MOOD[summary.mood] || MOOD.gentle)
const entryCount = computed(() => Array.isArray(summary.entryList) ? summary.entryList.length : 0)
const summaryText = computed(() => String(summary.content || activeEntry.value?.content || '今天还没有留下新的内容').trim() || '今天还没有留下新的内容')
const noteExpandable = computed(() => summaryText.value.length > 64 || summaryText.value.includes('\n'))
const noteText = computed(() => noteExpanded.value || !noteExpandable.value ? summaryText.value : cut(summaryText.value, 64))
const allMedia = computed(() => summary.entryList.flatMap((entry) => (entry.mediaList || []).map((media) => ({ ...media, entryId: entry.id }))))
const mediaCountDisplay = computed(() => Number(pageView.value?.mediaCount || allMedia.value.length || 0))
const entryCards = computed(() => summary.entryList.slice(0, 3).map((entry, index) => ({
  id: entry.id || `entry_${index}`,
  raw: entry,
  time: clock(entry.createdAt || entry.updatedAt) || '--:--',
  text: cut(entry.content || '这条记录还没有文字内容', 28)
})))
const photoPreview = computed(() => {
  const list = allMedia.value
  if (list.length <= 4) {
    return list.map((item, index) => ({ key: item.id || index, src: item.thumbnailUrl || item.fileUrl, index, more: '' }))
  }
  return [
    ...list.slice(0, 3).map((item, index) => ({ key: item.id || index, src: item.thumbnailUrl || item.fileUrl, index, more: '' })),
    { key: 'more', src: list[3].thumbnailUrl || list[3].fileUrl, index: 3, more: `+${list.length - 3}` }
  ]
})
const selfName = computed(() => String(pageView.value?.selfDisplayName || profile.value?.nickname || getUser()?.nickname || currentUsername.value || '我').trim() || '我')
const partnerName = computed(() => String(pageView.value?.partnerDisplayName || partner.value?.nickname || profile.value?.loverNickname || 'TA').trim() || 'TA')
const selfBadge = computed(() => shortText(selfName.value, 1))
const partnerBadge = computed(() => shortText(partnerName.value, 1))
const togetherText = computed(() => {
  const text = String(pageView.value?.relationshipText || '').trim()
  if (text) {
    return text
  }
  const start = onlyDate(profile.value?.anniversaryDate)
  if (!start) {
    return '把今天写成一页温柔的小记'
  }
  const days = Math.max(0, Math.floor((dayStart(new Date()).getTime() - start.getTime()) / DAY) + 1)
  return `与${partnerName.value}在一起的第 ${days} 天`
})
const responseSource = computed(() => {
  const comments = summary.entryList.flatMap((entry) => (entry.commentList || []).map((comment) => ({ ...comment, entryId: entry.id, likeCount: (entry.likeUsers || []).length })))
  const latestComment = [...comments]
    .filter((item) => String(item.commenterUsername || '').trim() && item.commenterUsername !== currentUsername.value)
    .sort((a, b) => stamp(b.updatedAt || b.createdAt) - stamp(a.updatedAt || a.createdAt))[0]
  if (latestComment) {
    return {
      state: 'commented',
      displayName: commentName(latestComment),
      meta: clock(latestComment.updatedAt || latestComment.createdAt) ? `今天 ${clock(latestComment.updatedAt || latestComment.createdAt)} · 已看` : '今天 · 已看',
      content: latestComment.content || '今天留下一句温柔的回应',
      likeCount: latestComment.likeCount || 0,
      entryId: latestComment.entryId,
      action: '回应 →',
      ready: true
    }
  }
  const likeEntry = [...summary.entryList]
    .filter((entry) => (entry.likeUsers || []).some((item) => item.username !== currentUsername.value))
    .sort((a, b) => stamp(b.updatedAt || b.createdAt) - stamp(a.updatedAt || a.createdAt))[0]
  if (likeEntry) {
    return {
      state: 'liked',
      displayName: partnerName.value,
      meta: '今天 · 收到爱心',
      content: `${partnerName.value}已经给今天点了赞，可以继续留下一句回应`,
      likeCount: (likeEntry.likeUsers || []).length,
      entryId: likeEntry.id,
      action: '写下回应 →',
      ready: true
    }
  }
  return {
    state: 'waiting',
    displayName: partnerName.value,
    meta: '还没有新的回应',
    content: '今天的记录已经放进小计里了，等对方来接住这一页日常',
    likeCount: 0,
    entryId: activeEntry.value?.id || '',
    action: '去留言 →',
    ready: false
  }
})
const response = computed(() => {
  const state = String(pageView.value?.responseState || '').trim()
  const content = String(pageView.value?.responseContent || '').trim()
  if (!state && !content) {
    return responseSource.value
  }
  const resolvedState = state || 'waiting'
  return {
    state: resolvedState,
    displayName: String(pageView.value?.responseDisplayName || partnerName.value).trim() || partnerName.value,
    meta: String(pageView.value?.responseMetaText || '').trim() || (resolvedState === 'commented' ? '今天 · 已看' : resolvedState === 'liked' ? '今天 · 收到爱心' : '还没有新的回应'),
    content: content || '今天的记录已经放进小计里了，等对方来接住这一页日常',
    likeCount: Number(pageView.value?.responseLikeCount || 0),
    entryId: pageView.value?.responseEntryId || activeEntry.value?.id || '',
    action: resolvedState === 'commented' ? '回应 →' : resolvedState === 'liked' ? '写下回应 →' : '去留言 →',
    ready: resolvedState !== 'waiting'
  }
})
const responseChipText = computed(() => response.value.ready ? `${partnerName.value}已回应` : '等待回应')
const responseTitle = computed(() => response.value.ready ? '爱的回应' : '等待回应')
const historyList = computed(() => Array.isArray(summary.historyList) ? summary.historyList : [])
const historyChips = computed(() => historyList.value.slice(0, 5).map((item) => ({ ...item, label: relative(item.summaryDate, activeDate.value || summary.summaryDate), short: shortDate(item.summaryDate) })))
const fullDateLabel = computed(() => fullDate(activeDate.value || summary.summaryDate))
const noteFooter = computed(() => `${shortText(selfName.value, 4)} · ${same(activeDate.value || summary.summaryDate, today()) ? '今天' : pretty(activeDate.value || summary.summaryDate)}`)
const commentSub = computed(() => !activeEntry.value ? '暂无留言' : `${(activeEntry.value.likeUsers || []).length} 个爱心 · ${(activeEntry.value.commentList || []).length} 条留言`)
const commentPlaceholder = computed(() => replyTo.value ? `回复 ${commentName(replyTo.value)}：` : '写下一句想留在今天的话')

onLoad((options) => {
  requireAuth()
  activeDate.value = String(options?.date || '').trim()
})

onShow(async () => {
  if (!requireAuth()) {
    return
  }
  await Promise.allSettled([loadSummary(activeDate.value), loadProfile()])
})

async function loadProfile() {
  try {
    const [mine, partnerProfile] = await Promise.all([
      fetchRemoteProfile({ allowOfflineFallback: true }),
      fetchPartnerProfile({ allowOfflineFallback: true })
    ])
    profile.value = mine || getProfile()
    partner.value = partnerProfile || null
  } catch {
    profile.value = getProfile()
    partner.value = null
  }
}

async function loadSummary(date) {
  try {
    const detail = date ? await fetchDailySummaryByDate(date) : await fetchTodayDailySummary()
    Object.assign(summary, detail)
    activeDate.value = detail.summaryDate || date || activeDate.value
    activeEntryId.value = detail.entryList?.[0]?.id || ''
    noteExpanded.value = false
    closeComment()
    closeCommentAction()
    historyVisible.value = false
  } catch (error) {
    uni.showToast({ title: error?.message || '今日小计加载失败', icon: 'none' })
  }
}

function handleTopAction() {
  activeEntry.value?.id ? goEdit(activeEntry.value) : goAddEntry()
}

function goAddEntry() {
  goPage(`/pages/modules/daily-summary/edit?date=${encodeURIComponent(activeDate.value || summary.summaryDate)}`)
}

function goEdit(entry) {
  if (!summary.id || !entry?.id) {
    return
  }
  goPage(`/pages/modules/daily-summary/edit?summaryId=${encodeURIComponent(summary.id)}&entryId=${encodeURIComponent(entry.id)}&date=${encodeURIComponent(activeDate.value || summary.summaryDate)}`)
}

function selectHistory(date) {
  if (!date || date === activeDate.value) {
    return
  }
  loadSummary(date)
}

function pickHistory(date) {
  historyVisible.value = false
  selectHistory(date)
}

function openGallery(index = 0) {
  if (allMedia.value.length) {
    openMediaViewer(allMedia.value, Number(index || 0))
  }
}

function openResponse() {
  response.value.entryId ? openComment(null, response.value.entryId, true) : goAddEntry()
}

function openComment(comment = null, entryId = '', focus = false) {
  const id = entryId || activeEntry.value?.id
  if (!id) {
    return
  }
  activeEntryId.value = id
  replyTo.value = comment
  replyEntryId.value = id
  commentVisible.value = true
  commentFocus.value = false
  if (focus) {
    nextTick(() => {
      commentFocus.value = true
    })
  }
}

function closeComment() {
  commentVisible.value = false
  commentFocus.value = false
  clearReply()
  commentForm.content = ''
}

function clearReply() {
  replyTo.value = null
  replyEntryId.value = activeEntry.value?.id || ''
}

async function submitComment() {
  const raw = String(commentForm.content || '').trim()
  const targetId = replyEntryId.value || activeEntry.value?.id
  if (!raw) {
    return uni.showToast({ title: '请先写下评论内容', icon: 'none' })
  }
  if (!summary.id || !targetId || commentSubmitting.value) {
    return
  }
  const content = replyTo.value ? `回复 ${commentName(replyTo.value)}：${raw}` : raw
  try {
    commentSubmitting.value = true
    await createDailySummaryEntryComment(summary.id, targetId, { content })
    closeComment()
    await loadSummary(activeDate.value)
  } catch (error) {
    uni.showToast({ title: error?.message || '评论失败，请稍后再试', icon: 'none' })
  } finally {
    commentSubmitting.value = false
  }
}

function tapComment(entry, comment) {
  if (!entry?.id || !comment) {
    return
  }
  if (comment.commenterUsername === currentUsername.value) {
    pickedComment.value = comment
    pickedCommentEntryId.value = entry.id
    commentActionVisible.value = true
    return
  }
  openComment(comment, entry.id, true)
}

function closeCommentAction() {
  commentActionVisible.value = false
  pickedComment.value = null
  pickedCommentEntryId.value = ''
}

async function deleteComment() {
  if (!summary.id || !pickedComment.value?.id || !pickedCommentEntryId.value) {
    return
  }
  try {
    await deleteDailySummaryEntryComment(summary.id, pickedCommentEntryId.value, pickedComment.value.id)
    closeCommentAction()
    uni.showToast({ title: '评论已删除', icon: 'success' })
    await loadSummary(activeDate.value)
  } catch (error) {
    uni.showToast({ title: error?.message || '删除评论失败', icon: 'none' })
  }
}

function copyText(value) {
  const text = String(value || '').trim()
  if (!text) {
    return
  }
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: '内容已复制', icon: 'success' })
  })
}

function resolveMedia(path) {
  return resolveMediaUrl(path)
}

function interactionSummary(entry) {
  if (!entry) {
    return '暂无留言'
  }
  const likes = (entry.likeUsers || []).length
  const comments = (entry.commentList || []).length
  if (!likes && !comments) {
    return '发布内容后可继续互动'
  }
  if (likes && comments) {
    return `${likes} 个爱心和 ${comments} 条留言，已经把这页日常接住了`
  }
  if (likes) {
    return `${likes} 次点赞 · 可继续留言`
  }
  return `${comments} 条留言`
}

function likeUsers(entry) {
  return (entry?.likeUsers || []).map((item) => item.nickname || item.username || '未命名').join('、')
}

function commentName(item) {
  return String(item?.commenterNickname || item?.commenterUsername || '未命名').trim() || '未命名'
}

function historyMeta(item) {
  const name = String(item?.authorNickname || item?.updaterNickname || item?.creatorNickname || item?.authorUsername || item?.updaterUsername || item?.creatorUsername || '未命名').trim() || '未命名'
  const time = clock(item?.updatedAt || '')
  return time ? `${name} · ${time}` : name
}

function historyTone(item) {
  const user = String(item?.authorUsername || item?.updaterUsername || item?.creatorUsername || '').trim()
  return user && user === currentUsername.value ? 'mine' : user ? 'partner' : ''
}

function clock(value) {
  const s = String(value || '').replace('T', ' ').trim()
  return s.length >= 16 ? s.slice(11, 16) : ''
}

function stamp(value) {
  const t = new Date(String(value || '').trim().replace(' ', 'T')).getTime()
  return Number.isFinite(t) ? t : 0
}

function cut(value, limit = 40) {
  const s = String(value || '').trim()
  return s.length > limit ? `${s.slice(0, limit)}...` : s
}

function shortText(value, n = 2) {
  return String(value || '').trim().slice(0, n) || 'TA'
}

function onlyDate(value) {
  const s = String(value || '').trim()
  if (!s) {
    return null
  }
  const d = new Date(`${s}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function dayStart(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function pretty(value) {
  const d = onlyDate(value)
  return d ? `${d.getMonth() + 1}月${d.getDate()}日` : '今天'
}

function shortDate(value) {
  const d = onlyDate(value)
  return d ? `${d.getMonth() + 1}/${d.getDate()}` : '--'
}

function fullDate(value) {
  const d = onlyDate(value)
  return d ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${WEEK[d.getDay()]}` : '今天'
}

function same(a, b) {
  return String(a || '').trim() === String(b || '').trim()
}

function today() {
  const d = new Date()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function relative(value, base) {
  const d = onlyDate(value)
  const b = onlyDate(base) || dayStart(new Date())
  if (!d) {
    return '--'
  }
  const diff = Math.round((dayStart(b).getTime() - dayStart(d).getTime()) / DAY)
  if (diff === 1) {
    return '昨天'
  }
  if (diff === 2) {
    return '前天'
  }
  return WEEK[d.getDay()].replace('星期', '周')
}
</script>
<style scoped>
.daily-page { min-height: 100vh; padding: var(--app-shell-padding-top) 20rpx 190rpx; background: linear-gradient(134deg, #fdf4ee 8%, #fceae0 46%, #f8d9ce 92%); position: relative; overflow-x: hidden }
.bg.blob { position: absolute; border-radius: 999rpx; filter: blur(90rpx); opacity: .24; pointer-events: none }
.bg.a { width: 420rpx; height: 420rpx; top: -90rpx; right: -40rpx; background: rgba(244,190,175,.62) }
.bg.b { width: 360rpx; height: 360rpx; top: 320rpx; left: -110rpx; background: rgba(240,208,196,.48) }
.bg.c { width: 320rpx; height: 320rpx; top: 900rpx; right: -30rpx; background: rgba(232,196,160,.4) }
.topbar,.love-line,.overview-top,.chips,.section-head,.response-top,.response-foot,.history-main,.comment-head,.composer-foot,.reply-tip { display: flex; align-items: center }
.topbar,.section-head,.response-foot,.history-main,.comment-head,.composer-foot,.reply-tip { justify-content: space-between }
.topbar,.head-copy,.content,.bottom-bar { position: relative; z-index: 2 }
.icon-btn { width: 68rpx; height: 68rpx; border-radius: 32rpx; display: flex; align-items: center; justify-content: center; background: rgba(255,250,246,.84); box-shadow: 0 4rpx 20rpx rgba(180,80,60,.07); border: 2rpx solid rgba(220,160,130,.2) }
.icon { width: 28rpx; height: 28rpx }
.edit-icon { width: 26rpx; height: 26rpx }
.title { font-family: 'Times New Roman', serif; font-size: 36rpx; letter-spacing: 4rpx; color: #6b3f32 }
.head-copy { padding: 26rpx 0 8rpx }
.date { text-align: center; font-size: 20rpx; letter-spacing: 3rpx; color: rgba(184,137,110,.82) }
.love-line { justify-content: center; gap: 16rpx; margin-top: 10rpx; color: #c9a87a; font-size: 18rpx; letter-spacing: 2rpx }
.line { width: 44rpx; height: 2rpx; background: linear-gradient(90deg, rgba(201,168,122,0), #c9a87a) }
.line.right { background: linear-gradient(270deg, rgba(201,168,122,0), #c9a87a) }
.content { margin-top: 16rpx }
.card { box-sizing: border-box; background: rgba(255,248,242,.9); border: 2rpx solid rgba(220,160,130,.14); box-shadow: 0 20rpx 50rpx rgba(180,80,60,.08) }
.overview { border-radius: 52rpx; overflow: hidden }
.overview-strip { height: 8rpx; background: linear-gradient(90deg, #e07b6a 0%, #e8967e 52%, #c9a87a 100%) }
.overview-body { padding: 28rpx 30rpx 32rpx }
.duo { position: relative; display: flex; align-items: center }
.duo-badge { width: 76rpx; height: 76rpx; border-radius: 38rpx; display: flex; align-items: center; justify-content: center; font-family: 'Times New Roman', serif; font-size: 32rpx; color: #fff8f4; border: 2rpx solid rgba(255,248,244,.94) }
.duo-badge.main { background: linear-gradient(140deg, #e8877a 4%, #d4635a 96%) }
.duo-badge.partner { margin-left: 26rpx; background: linear-gradient(140deg, #d4a87a 4%, #b88860 96%) }
.duo-heart { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 40rpx; height: 40rpx; border-radius: 20rpx; display: flex; align-items: center; justify-content: center; background: linear-gradient(140deg, #f8d4cc 4%, #f0c0b0 96%); border: 2rpx solid rgba(255,248,244,.94); color: #e07b6a; font-size: 18rpx }
.status,.chip,.like-pill { display: inline-flex; align-items: center; gap: 8rpx; min-height: 48rpx; padding: 0 18rpx; border-radius: 24rpx; font-size: 18rpx }
.status { background: rgba(156,184,144,.14); border: 2rpx solid rgba(156,184,144,.25); color: #7aaa88 }
.status.muted { background: rgba(217,195,176,.18); border-color: rgba(201,168,122,.2); color: #b8896e }
.mini-icon { width: 20rpx; height: 20rpx }
.mood { position: relative; padding-top: 30rpx; text-align: center }
.mood-glow { position: absolute; left: 50%; top: 34rpx; width: 160rpx; height: 160rpx; transform: translateX(-50%); background: radial-gradient(circle, rgba(224,123,106,.14), rgba(224,123,106,0)); filter: blur(16rpx) }
.flower { width: 118rpx; height: 118rpx; display: block; margin: 0 auto }
.mood-title { margin-top: 10rpx; font-family: 'Times New Roman', serif; font-size: 68rpx; letter-spacing: 8rpx; color: #6b3f32 }
.mood-desc { margin-top: 10rpx; font-size: 22rpx; letter-spacing: 2rpx; color: rgba(184,137,110,.92) }
.divider { height: 2rpx; margin-top: 26rpx; background: rgba(201,168,122,.18) }
.summary-text,.note-text,.quote-text,.history-preview,.comment-body { white-space: pre-wrap; word-break: break-word }
.summary-text { margin-top: 22rpx; font-size: 28rpx; line-height: 1.7; color: #6b3f32 }
.chips { flex-wrap: wrap; gap: 14rpx; margin-top: 24rpx }
.chip { background: rgba(252,236,224,.62); border: 2rpx solid rgba(220,160,130,.18); color: #9b7060 }
.note-card,.row,.response-card,.photo-strip,.sheet,.action-sheet { border-radius: 34rpx }
.note-card { margin-top: 24rpx; padding: 28rpx 30rpx }
.section-label { display: inline-flex; align-items: center; gap: 10rpx; color: #6b3f32; font-size: 24rpx; letter-spacing: 2rpx }
.bar { width: 6rpx; height: 24rpx; border-radius: 999rpx; background: rgba(201,168,122,.62) }
.note-text { margin-top: 24rpx; font-size: 30rpx; line-height: 1.95; color: #6b3f32 }
.expand,.response-action { display: inline-flex; align-items: center; gap: 8rpx; margin-top: 16rpx; color: #c9a87a; font-size: 22rpx }
.expand-icon { width: 20rpx; height: 20rpx; transition: transform .2s ease }
.expand-icon.open { transform: rotate(180deg) }
.note-foot { margin-top: 24rpx; padding-top: 18rpx; border-top: 2rpx solid rgba(201,168,122,.18); display: flex; align-items: center; gap: 12rpx; color: rgba(184,137,110,.82); font-size: 20rpx }
.note-line { width: 24rpx; height: 2rpx; background: rgba(201,168,122,.4) }
.section-head,.response-head { margin-top: 24rpx }
.section-count { font-size: 20rpx; color: rgba(201,168,122,.9) }
.list { margin-top: 14rpx; display: grid; gap: 14rpx }
.row { padding: 22rpx 22rpx 22rpx 28rpx; gap: 18rpx; display: flex; align-items: center }
.time { min-width: 70rpx; font-size: 22rpx; color: #d49a71 }
.row-text { flex: 1; min-width: 0; font-size: 28rpx; line-height: 1.55; color: #6b3f32 }
.action { width: 48rpx; height: 48rpx; border-radius: 24rpx; background: rgba(252,236,224,.64); display: flex; align-items: center; justify-content: center }
.empty { margin-top: 14rpx; padding: 26rpx 28rpx; font-size: 24rpx; color: rgba(107,63,50,.66) }
.photo-block { margin-top: 22rpx }
.photo-strip { margin-top: 14rpx; padding: 24rpx 22rpx; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16rpx }
.thumb { position: relative; height: 144rpx; overflow: hidden; border-radius: 22rpx; background: rgba(250,235,224,.72) }
.thumb-img,.thumb-fallback,.thumb-mask { position: absolute; inset: 0 }
.thumb-img { width: 100%; height: 100% }
.thumb-fallback,.thumb-mask { display: flex; align-items: center; justify-content: center }
.thumb-fallback-icon { width: 40rpx; height: 40rpx; opacity: .8 }
.thumb-mask { flex-direction: column; color: #fff8f4; background: rgba(107,63,50,.42) }
.thumb-more { font-size: 34rpx; font-weight: 700 }
.thumb-see { margin-top: 8rpx; font-size: 20rpx }
.response-card { margin-top: 14rpx; padding: 24rpx }
.response-copy { flex: 1; min-width: 0; margin-left: 18rpx }
.avatar { width: 72rpx; height: 72rpx; border-radius: 36rpx; display: flex; align-items: center; justify-content: center; font-family: 'Times New Roman', serif; font-size: 30rpx; color: #fff8f4; background: linear-gradient(140deg, #d4a87a 4%, #b88860 96%) }
.response-name { font-size: 24rpx; color: #6b3f32 }
.response-meta,.history-meta,.sheet-sub,.comment-head text:last-child,.composer-foot text,.bottom-note { font-size: 20rpx; color: rgba(107,63,50,.6) }
.like-pill { background: rgba(252,236,224,.55); border: 2rpx solid rgba(220,160,130,.18); color: #b8896e }
.quote { position: relative; margin-top: 18rpx; padding: 24rpx 24rpx 24rpx 26rpx; min-height: 120rpx; border-radius: 22rpx; background: rgba(252,240,230,.52); border: 2rpx solid rgba(201,168,122,.14) }
.quote-mark { position: absolute; right: 18rpx; top: 6rpx; font-family: 'Times New Roman', serif; font-size: 58rpx; line-height: 1; color: rgba(201,168,122,.16) }
.quote-text { position: relative; z-index: 1; font-size: 26rpx; line-height: 1.75; color: #6b3f32 }
.history-scroll { margin-top: 14rpx; white-space: nowrap }
.history-chip { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; width: 108rpx; height: 112rpx; margin-right: 12rpx; border-radius: 28rpx; background: rgba(255,250,246,.8); border: 2rpx solid rgba(220,160,130,.16); box-sizing: border-box }
.history-chip.active { background: rgba(236,226,216,.94); box-shadow: inset 0 0 0 2rpx rgba(255,255,255,.5) }
.history-chip-top { font-size: 18rpx; color: rgba(184,137,110,.84) }
.history-chip-date { margin-top: 8rpx; font-family: 'Times New Roman', serif; font-size: 28rpx; color: #6b3f32 }
.history-chip.calendar { background: rgba(252,240,232,.5); border-style: dashed; border-color: rgba(201,168,122,.3) }
.calendar-icon { width: 28rpx; height: 28rpx }
.calendar-text { margin-top: 6rpx; font-size: 18rpx; color: #c9a87a }
.sheet-mask { position: fixed; inset: 0; z-index: 30; display: flex; align-items: flex-end; background: rgba(17,18,22,.16) }
.small-mask { justify-content: center; padding: 0 28rpx calc(env(safe-area-inset-bottom) + 24rpx); box-sizing: border-box }
.sheet { width: 100%; max-width: 750rpx; max-height: 78vh; padding: 18rpx 24rpx calc(env(safe-area-inset-bottom) + 24rpx); background: rgba(255,251,247,.98); box-shadow: 0 -18rpx 36rpx rgba(0,0,0,.12); border-radius: 32rpx 32rpx 0 0; display: flex; flex-direction: column }
.handle { width: 88rpx; height: 8rpx; border-radius: 999rpx; background: rgba(153,174,171,.55); margin: 0 auto 20rpx }
.sheet-title { font-size: 32rpx; color: #6b3f32 }
.sheet-scroll { width: 100%; flex: 1; min-height: 0; margin-top: 20rpx }
.history-item,.comment-summary,.comment-item,.composer,.action-sheet { box-sizing: border-box }
.history-item { position: relative; margin-bottom: 14rpx; padding: 20rpx 22rpx 20rpx 30rpx; border-radius: 24rpx; background: rgba(255,248,242,.95) }
.history-item.mine { background: #e9f4ff }
.history-item.partner { background: #ffeaf1 }
.history-title { font-size: 28rpx; color: #6b3f32 }
.history-num { font-size: 22rpx; color: rgba(107,63,50,.56) }
.history-meta { margin-top: 10rpx }
.history-preview { margin-top: 8rpx; font-size: 24rpx; line-height: 1.7; color: rgba(107,63,50,.72) }
.comment-summary { padding: 22rpx; border-radius: 24rpx; background: rgba(246,251,249,.96); box-shadow: inset 0 0 0 2rpx rgba(229,242,239,.96); font-size: 24rpx; line-height: 1.75; color: #6b3f32 }
.likes { margin-top: 16rpx; padding: 18rpx 20rpx; border-radius: 22rpx; background: rgba(255,244,247,.92); font-size: 24rpx; line-height: 1.7; color: #6b3f32 }
.comment-list { margin-top: 16rpx; display: grid; gap: 14rpx }
.comment-item { padding: 20rpx 22rpx; border-radius: 24rpx; background: rgba(243,248,255,.92) }
.comment-item.mine { background: rgba(255,242,247,.94) }
.comment-head text:first-child { font-size: 24rpx; color: #6b3f32 }
.comment-body { margin-top: 10rpx; font-size: 24rpx; line-height: 1.75; color: #6b3f32 }
.comment-empty { margin-top: 16rpx }
.composer { margin-top: 18rpx; padding: 18rpx; border-radius: 26rpx; background: rgba(250,252,251,.96); box-shadow: inset 0 0 0 2rpx rgba(234,241,239,.96) }
.reply-tip { margin-bottom: 12rpx }
.reply-tip text:first-child { font-size: 22rpx; color: #6b3f32 }
.comment-input { width: 100%; min-height: 120rpx; padding: 18rpx 22rpx; border-radius: 22rpx; box-sizing: border-box; background: rgba(242,250,248,.96); font-size: 28rpx; line-height: 1.7; color: #6b3f32; max-height: 260rpx }
.composer-foot { gap: 20rpx; margin-top: 14rpx }
.send-btn { min-width: 128rpx; height: 64rpx; line-height: 64rpx; padding: 0 28rpx; border: none; border-radius: 999rpx; background: linear-gradient(172deg, #e8877a 4%, #d4635a 96%); color: #fff; font-size: 24rpx }
.action-sheet { width: 100%; max-width: 460rpx; background: rgba(255,255,255,.97); overflow: hidden; box-shadow: 0 22rpx 42rpx rgba(0,0,0,.12) }
.action-row { min-height: 84rpx; display: flex; align-items: center; justify-content: center; font-size: 28rpx; color: #6b3f32 }
.title-row { color: rgba(107,63,50,.6); border-bottom: 1px solid rgba(220,231,228,.9) }
.action-row + .action-row { border-top: 1px solid rgba(220,231,228,.9) }
.action-row.danger { color: #d85c7c }
.bottom-bar { position: fixed; left: 20rpx; right: 20rpx; bottom: calc(env(safe-area-inset-bottom) + 20rpx); z-index: 20 }
.primary-btn { width: 100%; height: 96rpx; border: none; border-radius: 40rpx; display: flex; align-items: center; justify-content: center; gap: 12rpx; background: linear-gradient(172deg, #e8877a 4%, #d4635a 96%); box-shadow: 0 16rpx 30rpx rgba(224,123,106,.38); color: #fff8f4; font-size: 30rpx; letter-spacing: 4rpx }
.primary-btn::after { border: none }
.btn-icon { width: 28rpx; height: 28rpx }
.bottom-note { margin-top: 12rpx; text-align: center }
</style>
