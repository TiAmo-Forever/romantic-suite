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
          <view class="summary-text" @longpress.stop="copyText(summaryText)">{{ overviewSummary }}</view>
          <view class="chips">
            <view class="chip"><image class="mini-icon" :src="iconNote" mode="aspectFit"></image><text>{{ entryCount }} 个片段</text></view>
            <view class="chip"><image class="mini-icon" :src="iconImage" mode="aspectFit"></image><text>{{ mediaCountDisplay }} 张附图</text></view>
            <view class="chip"><image class="mini-icon" :src="iconHeart" mode="aspectFit"></image><text>{{ interactionChipText }}</text></view>
          </view>
        </view>
      </view>

      <view class="card note-card">
        <view class="note-head">
          <view class="section-label"><view class="bar"></view><text>今日小记</text></view>
          <view class="section-count">{{ noteEntries.length }} 个</view>
        </view>
        <swiper v-if="noteEntries.length" class="note-swiper" :current="activeNoteIndex" indicator-dots indicator-color="rgba(201,168,122,.28)" indicator-active-color="#d4635a" @change="handleNoteSwipe">
          <swiper-item v-for="entry in noteEntries" :key="entry.id">
            <view class="note-slide" :class="entryTone(entry)">
              <scroll-view class="note-slide-scroll" scroll-y enhanced show-scrollbar="false">
                <view class="note-text" @longpress.stop="copyText(entry.content)">{{ entry.content || '暂无内容' }}</view>
                <view v-if="hasInlineInteraction(entry)" class="inline-interaction">
                  <view v-if="(entry.likeUsers || []).length" class="inline-likes" @longpress.stop="copyText(likeUsers(entry))">
                    <image class="mini-icon" :src="iconHeart" mode="aspectFit"></image>
                    <text>{{ likeUsers(entry) }}</text>
                  </view>
                  <view v-if="(entry.commentList || []).length" class="inline-comments">
                    <view v-for="item in entry.commentList || []" :key="item.id" class="inline-comment" :class="{ mine: item.commenterUsername === currentUsername }" @click.stop="tapComment(entry, item)" @longpress.stop="copyText(commentCopy(item))">
                      <text class="inline-comment-name">{{ commentName(item) }}</text>
                      <text v-if="replyPrefix(item)" class="inline-reply-prefix">{{ replyPrefix(item) }}</text>
                      <text>：{{ commentPlainText(item) }}</text>
                    </view>
                  </view>
                </view>
              </scroll-view>
              <view class="note-foot">
                <view class="note-foot-main">
                  <view class="note-line"></view>
                  <text>{{ entryAuthorName(entry) }} · {{ clock(entry.createdAt || entry.updatedAt) || pretty(activeDate || summary.summaryDate) }}</text>
                  <text>✦</text>
                </view>
                <view class="note-like-state" :class="{ active: entry.likedByCurrentUser }">
                  <image class="mini-icon" :src="iconHeart" mode="aspectFit"></image>
                  <text>{{ entryLikeText(entry) }}</text>
                </view>
                <view class="note-more-btn" @click.stop="openInteraction(entry)">...</view>
              </view>
            </view>
          </swiper-item>
        </swiper>
        <view v-else class="note-empty">暂无小记</view>
      </view>

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

      <view class="section-head"><view class="section-label"><view class="bar"></view><text>往期记录</text></view></view>
      <scroll-view class="history-scroll" scroll-x enable-flex enhanced show-scrollbar="false">
        <view v-for="item in historyChips" :key="item.summaryDate" class="history-chip" :class="{ active: item.summaryDate === activeDate }" @click="selectHistory(item.summaryDate)">
          <text class="history-chip-top">{{ item.label }}</text>
          <text class="history-chip-date">{{ item.short }}</text>
        </view>
        <view class="history-chip calendar" @click="historyVisible = true">
          <text class="history-chip-top">全部</text>
          <view class="history-chip-date calendar-date"><image class="calendar-icon" :src="iconCalendar" mode="aspectFit"></image><text>日历</text></view>
        </view>
      </scroll-view>
    </view>

    <view v-if="historyVisible" class="sheet-mask" @click="historyVisible = false">
      <view class="sheet card history-sheet" @click.stop>
        <view class="handle"></view>
        <view class="sheet-title">往期记录</view>
        <scroll-view class="sheet-scroll history-sheet-scroll" scroll-y enhanced show-scrollbar="false">
          <view v-for="item in historyList" :key="item.summaryDate" class="history-item" :class="historyTone(item)" @click="pickHistory(item.summaryDate)">
            <view class="history-main"><text class="history-title">{{ pretty(item.summaryDate) }}</text><text class="history-num">{{ item.entryCount }} 条</text></view>
            <view class="history-meta">{{ historyMeta(item) }}</view>
            <view class="history-preview" @longpress.stop="copyText(item.content || '暂无预览内容')">{{ item.content || '暂无预览内容' }}</view>
          </view>
        </scroll-view>
      </view>
    </view>

    <view v-if="interactionVisible && activeEntry" class="interaction-mask" @click="closeInteraction">
      <view class="interaction-popover card" @click.stop>
        <view class="interaction-title">{{ entryAuthorName(activeEntry) }}的小记</view>
        <view class="sheet-sub">{{ commentSub }}</view>
        <view class="sheet-interaction-actions">
          <button class="interaction-btn like-btn" :class="{ active: activeEntryLiked }" :disabled="likingEntry" @click.stop="toggleActiveLike">
            {{ activeEntryLiked ? '取消点赞' : '点赞' }}
          </button>
          <button class="interaction-btn comment-btn" @click.stop="startComment">评论</button>
        </view>
      </view>
    </view>

    <view v-if="commentVisible && activeEntry" class="sheet-mask composer-mask" @click="closeComment">
      <view class="sheet card comment-sheet" @click.stop>
        <view class="handle"></view>
        <view class="sheet-title">{{ replyTo ? `回复 ${commentName(replyTo)}` : '写评论' }}</view>
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
    </view>
  </view>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { createDailySummaryEntryComment, deleteDailySummaryEntryComment, fetchDailySummaryByDate, fetchTodayDailySummary, toggleDailySummaryEntryLike } from '@/services/daily-summaries.js'
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
const historyVisible = ref(false)
const interactionVisible = ref(false)
const commentVisible = ref(false)
const commentFocus = ref(false)
const commentSubmitting = ref(false)
const commentActionVisible = ref(false)
const likingEntry = ref(false)
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
const noteEntries = computed(() => Array.isArray(summary.entryList) ? summary.entryList : [])
const activeEntry = computed(() => noteEntries.value.find((item) => String(item.id) === String(activeEntryId.value)) || noteEntries.value[0] || null)
const moodView = computed(() => MOOD[summary.mood] || MOOD.gentle)
const entryCount = computed(() => noteEntries.value.length)
const activeNoteIndex = computed(() => Math.max(0, noteEntries.value.findIndex((entry) => String(entry.id) === String(activeEntryId.value))))
const summaryText = computed(() => String(activeEntry.value?.content || summary.content || '暂无内容').trim() || '暂无内容')
const overviewSummary = computed(() => summary.hasRecord ? cut(summaryText.value.replace(/\s+/g, ' '), 24) : '暂无记录')
const allMedia = computed(() => noteEntries.value.flatMap((entry) => (entry.mediaList || []).map((media) => ({ ...media, entryId: entry.id }))))
const mediaCountDisplay = computed(() => Number(pageView.value?.mediaCount || allMedia.value.length || 0))
const totalLikeCount = computed(() => noteEntries.value.reduce((total, entry) => total + Number(entry.likeCount || (entry.likeUsers || []).length || 0), 0))
const totalCommentCount = computed(() => noteEntries.value.reduce((total, entry) => total + (entry.commentList || []).length, 0))
const interactionChipText = computed(() => `${totalLikeCount.value}赞 · ${totalCommentCount.value}留言`)
const activeEntryLiked = computed(() => Boolean(activeEntry.value?.likedByCurrentUser))
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
    return '每日小计'
  }
  const days = Math.max(0, Math.floor((dayStart(new Date()).getTime() - start.getTime()) / DAY) + 1)
  return `与${partnerName.value}在一起的第 ${days} 天`
})
const historyList = computed(() => Array.isArray(summary.historyList) ? summary.historyList : [])
const historyChips = computed(() => historyList.value.slice(0, 5).map((item) => ({ ...item, label: relative(item.summaryDate, activeDate.value || summary.summaryDate), short: shortDate(item.summaryDate) })))
const fullDateLabel = computed(() => fullDate(activeDate.value || summary.summaryDate))
const commentSub = computed(() => !activeEntry.value ? '暂无留言' : `${(activeEntry.value?.likeUsers || []).length} 个爱心 · ${(activeEntry.value?.commentList || []).length} 条留言`)
const commentPlaceholder = computed(() => replyTo.value ? `回复 ${commentName(replyTo.value)}：` : '请输入留言')

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

async function loadSummary(date, options = {}) {
  try {
    const preferredEntryId = options.entryId || activeEntryId.value
    const detail = date ? await fetchDailySummaryByDate(date) : await fetchTodayDailySummary()
    Object.assign(summary, detail)
    activeDate.value = detail.summaryDate || date || activeDate.value
    const entries = Array.isArray(detail.entryList) ? detail.entryList : []
    activeEntryId.value = entries.some((entry) => String(entry.id) === String(preferredEntryId)) ? preferredEntryId : entries[0]?.id || ''
    if (!options.keepPanels) {
      closeComment()
      closeInteraction()
      closeCommentAction()
      historyVisible.value = false
    }
  } catch (error) {
    uni.showToast({ title: error?.message || '今日小计加载失败', icon: 'none' })
  }
}

function handleTopAction() {
  activeEntry.value?.id ? goEdit(activeEntry.value) : goAddEntry()
}

function handleNoteSwipe(event) {
  const index = Number(event?.detail?.current || 0)
  const entry = noteEntries.value[index]
  if (entry?.id) {
    activeEntryId.value = entry.id
  }
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

function openComment(comment = null, entryId = '', focus = false) {
  const id = entryId || activeEntry.value?.id
  if (!id) {
    return
  }
  interactionVisible.value = false
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

function openInteraction(entry) {
  if (!entry?.id) {
    return
  }
  activeEntryId.value = entry.id
  clearReply()
  interactionVisible.value = true
}

function closeInteraction() {
  interactionVisible.value = false
}

function startComment() {
  openComment(null, activeEntry.value?.id || '', true)
}

async function toggleActiveLike() {
  const entryId = activeEntry.value?.id
  if (!summary.id || !entryId || likingEntry.value) {
    return
  }
  try {
    likingEntry.value = true
    await toggleDailySummaryEntryLike(summary.id, entryId)
    await loadSummary(activeDate.value, { entryId, keepPanels: true })
    closeInteraction()
  } catch (error) {
    uni.showToast({ title: error?.message || '操作失败', icon: 'none' })
  } finally {
    likingEntry.value = false
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
    return uni.showToast({ title: '请输入评论内容', icon: 'none' })
  }
  if (!summary.id || !targetId || commentSubmitting.value) {
    return
  }
  const content = replyTo.value ? `回复 ${commentName(replyTo.value)}：${raw}` : raw
  try {
    commentSubmitting.value = true
    await createDailySummaryEntryComment(summary.id, targetId, { content })
    closeComment()
    await loadSummary(activeDate.value, { entryId: targetId })
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
    const entryId = pickedCommentEntryId.value
    closeCommentAction()
    uni.showToast({ title: '评论已删除', icon: 'success' })
    await loadSummary(activeDate.value, { entryId })
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

function likeUsers(entry) {
  return (entry?.likeUsers || []).map((item) => item.nickname || item.username || '未命名').join('、')
}

function commentName(item) {
  return String(item?.commenterNickname || item?.commenterUsername || '未命名').trim() || '未命名'
}

function hasInlineInteraction(entry) {
  return Boolean((entry?.likeUsers || []).length || (entry?.commentList || []).length)
}

function entryLikeText(entry) {
  const count = Number(entry?.likeCount || (entry?.likeUsers || []).length || 0)
  if (entry?.likedByCurrentUser) {
    return count > 1 ? `已赞 · ${count}` : '已赞'
  }
  return count ? `${count}赞` : '赞'
}

function commentParts(item) {
  const content = String(item?.content || '').trim()
  const matched = content.match(/^回复\s+(.+?)[：:]\s*(.*)$/)
  return matched ? { replyName: matched[1], text: matched[2] || '' } : { replyName: '', text: content }
}

function replyPrefix(item) {
  const name = commentParts(item).replyName
  return name ? ` 回复 ${name}` : ''
}

function commentPlainText(item) {
  return commentParts(item).text || ''
}

function commentCopy(item) {
  const prefix = replyPrefix(item)
  return `${commentName(item)}${prefix}：${commentPlainText(item)}`
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

function entryTone(entry) {
  const user = String(entry?.creatorUsername || '').trim()
  return user && user === currentUsername.value ? 'mine' : user ? 'partner' : ''
}

function entryAuthorName(entry) {
  const fallback = entryTone(entry) === 'mine' ? selfName.value : partnerName.value
  return String(entry?.creatorNickname || fallback || '未命名').trim() || '未命名'
}

function clock(value) {
  const s = String(value || '').replace('T', ' ').trim()
  return s.length >= 16 ? s.slice(11, 16) : ''
}

function cut(value, limit = 40) {
  const s = String(value || '').trim()
  const chars = Array.from(s)
  return chars.length > limit ? `${chars.slice(0, limit).join('')}...` : s
}

function shortText(value, n = 2) {
  return Array.from(String(value || '').trim()).slice(0, n).join('') || 'TA'
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
.daily-page { min-height: 100vh; padding: var(--app-shell-padding-top) 20rpx calc(env(safe-area-inset-bottom) + 230rpx); background: linear-gradient(134deg, #fdf4ee 8%, #fceae0 46%, #f8d9ce 92%); position: relative; overflow-x: hidden }
.bg.blob { position: absolute; border-radius: 999rpx; filter: blur(90rpx); opacity: .24; pointer-events: none }
.bg.a { width: 420rpx; height: 420rpx; top: -90rpx; right: -40rpx; background: rgba(244,190,175,.62) }
.bg.b { width: 360rpx; height: 360rpx; top: 320rpx; left: -110rpx; background: rgba(240,208,196,.48) }
.bg.c { width: 320rpx; height: 320rpx; top: 900rpx; right: -30rpx; background: rgba(232,196,160,.4) }
.topbar,.love-line,.overview-top,.chips,.note-head,.note-foot,.note-foot-main,.note-like-state,.inline-likes,.section-head,.sheet-interaction-actions,.history-main,.composer-foot,.reply-tip { display: flex; align-items: center }
.topbar,.note-head,.note-foot,.section-head,.history-main,.composer-foot,.reply-tip { justify-content: space-between }
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
.overview-top { position: relative; justify-content: center; min-height: 78rpx }
.duo { position: relative; display: flex; align-items: center; justify-content: center }
.duo-badge { width: 76rpx; height: 76rpx; border-radius: 38rpx; display: flex; align-items: center; justify-content: center; font-family: 'Times New Roman', serif; font-size: 32rpx; color: #fff8f4; border: 2rpx solid rgba(255,248,244,.94) }
.duo-badge.main { background: linear-gradient(140deg, #e8877a 4%, #d4635a 96%) }
.duo-badge.partner { margin-left: 26rpx; background: linear-gradient(140deg, #d4a87a 4%, #b88860 96%) }
.duo-heart { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 40rpx; height: 40rpx; border-radius: 20rpx; display: flex; align-items: center; justify-content: center; background: linear-gradient(140deg, #f8d4cc 4%, #f0c0b0 96%); border: 2rpx solid rgba(255,248,244,.94); color: #e07b6a; font-size: 18rpx }
.status,.chip { display: inline-flex; align-items: center; gap: 8rpx; min-height: 48rpx; padding: 0 18rpx; border-radius: 24rpx; font-size: 18rpx }
.status { position: absolute; right: 0; top: 50%; transform: translateY(-50%); background: rgba(156,184,144,.14); border: 2rpx solid rgba(156,184,144,.25); color: #7aaa88 }
.status.muted { background: rgba(217,195,176,.18); border-color: rgba(201,168,122,.2); color: #b8896e }
.mini-icon { width: 20rpx; height: 20rpx }
.mood { position: relative; padding-top: 30rpx; text-align: center }
.mood-glow { position: absolute; left: 50%; top: 34rpx; width: 160rpx; height: 160rpx; transform: translateX(-50%); background: radial-gradient(circle, rgba(224,123,106,.14), rgba(224,123,106,0)); filter: blur(16rpx) }
.flower { width: 118rpx; height: 118rpx; display: block; margin: 0 auto }
.mood-title { margin-top: 10rpx; font-family: 'Times New Roman', serif; font-size: 58rpx; letter-spacing: 6rpx; color: #6b3f32 }
.mood-desc { margin-top: 8rpx; font-size: 20rpx; letter-spacing: 2rpx; color: rgba(184,137,110,.92) }
.divider { height: 2rpx; margin-top: 26rpx; background: rgba(201,168,122,.18) }
.summary-text,.note-text,.history-preview { white-space: pre-wrap; word-break: break-word }
.summary-text { margin-top: 18rpx; font-size: 25rpx; line-height: 1.55; color: rgba(107,63,50,.72); text-align: center }
.chips { flex-wrap: wrap; gap: 14rpx; margin-top: 24rpx }
.chip { background: rgba(252,236,224,.62); border: 2rpx solid rgba(220,160,130,.18); color: #9b7060 }
.note-card,.photo-strip,.sheet,.action-sheet { border-radius: 34rpx }
.note-card { margin-top: 24rpx; padding: 28rpx 0 24rpx; overflow: hidden }
.note-head { padding: 0 30rpx }
.section-label { display: inline-flex; align-items: center; gap: 10rpx; color: #6b3f32; font-size: 24rpx; letter-spacing: 2rpx }
.bar { width: 6rpx; height: 24rpx; border-radius: 999rpx; background: rgba(201,168,122,.62) }
.note-swiper { height: 570rpx; margin-top: 20rpx }
.note-slide { position: relative; height: 100%; margin: 0 18rpx; padding: 28rpx 28rpx 82rpx; border-radius: 30rpx; box-sizing: border-box; background: rgba(255,250,246,.86); border: 2rpx solid rgba(201,168,122,.12) }
.note-slide.mine { background: rgba(255,248,242,.95); border-color: rgba(224,123,106,.18) }
.note-slide.partner { background: rgba(246,251,249,.95); border-color: rgba(120,170,150,.16) }
.note-slide-scroll { height: 426rpx }
.note-text { font-size: 30rpx; line-height: 1.9; color: #6b3f32 }
.inline-interaction { margin-top: 28rpx; padding: 18rpx 20rpx; border-radius: 22rpx; background: rgba(252,238,229,.74); box-shadow: inset 0 0 0 2rpx rgba(201,168,122,.12) }
.inline-likes { gap: 8rpx; padding-bottom: 12rpx; color: #d4635a; font-size: 24rpx; line-height: 1.5 }
.inline-likes + .inline-comments { border-top: 2rpx solid rgba(201,168,122,.12); padding-top: 10rpx }
.inline-comment { font-size: 24rpx; line-height: 1.7; color: #6b3f32 }
.inline-comment + .inline-comment { margin-top: 8rpx }
.inline-comment-name { color: #b56d62; font-weight: 700 }
.inline-comment.mine .inline-comment-name { color: #d4635a }
.inline-reply-prefix { color: rgba(107,63,50,.7) }
.note-foot { position: absolute; left: 28rpx; right: 28rpx; bottom: 22rpx; padding-top: 16rpx; border-top: 2rpx solid rgba(201,168,122,.18); gap: 16rpx; color: rgba(184,137,110,.82); font-size: 20rpx }
.note-foot-main { min-width: 0; gap: 12rpx; flex: 1 }
.note-line { width: 24rpx; height: 2rpx; background: rgba(201,168,122,.4) }
.note-like-state { height: 42rpx; padding: 0 14rpx; border-radius: 999rpx; gap: 6rpx; flex-shrink: 0; background: rgba(255,250,246,.86); color: rgba(143,102,93,.82); font-size: 20rpx; box-shadow: inset 0 0 0 2rpx rgba(201,168,122,.12) }
.note-like-state.active { color: #d4635a; background: rgba(255,241,239,.96); box-shadow: inset 0 0 0 2rpx rgba(224,123,106,.18) }
.note-more-btn { width: 58rpx; height: 42rpx; border-radius: 999rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(252,236,224,.9); color: #b8896e; font-size: 28rpx; line-height: 1; letter-spacing: 2rpx; box-shadow: inset 0 0 0 2rpx rgba(201,168,122,.12) }
.note-empty { margin: 20rpx 30rpx 0; padding: 28rpx; border-radius: 26rpx; background: rgba(255,250,246,.82); color: rgba(107,63,50,.6); font-size: 24rpx }
.section-head { margin-top: 24rpx }
.section-count { font-size: 20rpx; color: rgba(201,168,122,.9) }
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
.interaction-btn { flex: 1; height: 72rpx; line-height: 72rpx; border: none; border-radius: 999rpx; font-size: 26rpx; font-weight: 700 }
.interaction-btn::after { border: none }
.like-btn { color: #d4635a; background: rgba(255,241,239,.96); box-shadow: inset 0 0 0 2rpx rgba(224,123,106,.16) }
.like-btn.active { color: #fff8f4; background: linear-gradient(172deg, #e8877a 4%, #d4635a 96%); box-shadow: 0 12rpx 22rpx rgba(224,123,106,.24) }
.comment-btn { color: #8f6b3e; background: rgba(255,248,231,.96); box-shadow: inset 0 0 0 2rpx rgba(201,168,122,.18) }
.history-meta,.sheet-sub,.composer-foot text { font-size: 20rpx; color: rgba(107,63,50,.6) }
.history-scroll { margin-top: 14rpx; white-space: nowrap; height: 116rpx }
.history-chip { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; width: 108rpx; height: 112rpx; margin-right: 12rpx; border-radius: 28rpx; background: rgba(255,250,246,.8); border: 2rpx solid rgba(220,160,130,.16); box-sizing: border-box }
.history-chip.active { background: rgba(236,226,216,.94); box-shadow: inset 0 0 0 2rpx rgba(255,255,255,.5) }
.history-chip-top { font-size: 18rpx; color: rgba(184,137,110,.84) }
.history-chip-date { margin-top: 8rpx; font-family: 'Times New Roman', serif; font-size: 28rpx; color: #6b3f32 }
.history-chip.calendar { background: rgba(252,240,232,.5); border-style: dashed; border-color: rgba(201,168,122,.3) }
.calendar-icon { width: 28rpx; height: 28rpx }
.calendar-date { display: inline-flex; align-items: center; justify-content: center; gap: 6rpx; color: #c9a87a }
.interaction-mask { position: fixed; inset: 0; z-index: 32; display: flex; align-items: flex-end; justify-content: center; padding: 0 44rpx calc(env(safe-area-inset-bottom) + 138rpx); box-sizing: border-box; background: rgba(17,18,22,.06) }
.interaction-popover { width: 100%; max-width: 640rpx; padding: 24rpx; border-radius: 30rpx; background: rgba(255,251,247,.98); box-shadow: 0 18rpx 38rpx rgba(107,63,50,.14) }
.interaction-title { margin-bottom: 8rpx; font-size: 26rpx; font-weight: 700; color: #6b3f32 }
.sheet-mask { position: fixed; inset: 0; z-index: 30; display: flex; align-items: flex-end; background: rgba(17,18,22,.16) }
.composer-mask { z-index: 34 }
.small-mask { justify-content: center; padding: 0 28rpx calc(env(safe-area-inset-bottom) + 24rpx); box-sizing: border-box }
.sheet { width: 100%; max-width: 750rpx; max-height: 78vh; padding: 18rpx 24rpx calc(env(safe-area-inset-bottom) + 24rpx); background: rgba(255,251,247,.98); box-shadow: 0 -18rpx 36rpx rgba(0,0,0,.12); border-radius: 32rpx 32rpx 0 0; display: flex; flex-direction: column }
.history-sheet { height: 78vh }
.comment-sheet { max-height: none }
.handle { width: 88rpx; height: 8rpx; border-radius: 999rpx; background: rgba(153,174,171,.55); margin: 0 auto 20rpx }
.sheet-title { font-size: 32rpx; color: #6b3f32 }
.sheet-interaction-actions { gap: 18rpx; margin-top: 18rpx }
.sheet-scroll { width: 100%; flex: 1; min-height: 0; margin-top: 20rpx }
.history-sheet-scroll { height: calc(78vh - 128rpx) }
.history-item,.composer,.action-sheet { box-sizing: border-box }
.history-item { position: relative; margin-bottom: 14rpx; padding: 20rpx 22rpx 20rpx 30rpx; border-radius: 24rpx; background: rgba(255,248,242,.95) }
.history-item.mine { background: #e9f4ff }
.history-item.partner { background: #ffeaf1 }
.history-title { font-size: 28rpx; color: #6b3f32 }
.history-num { font-size: 22rpx; color: rgba(107,63,50,.56) }
.history-meta { margin-top: 10rpx }
.history-preview { margin-top: 8rpx; font-size: 24rpx; line-height: 1.7; color: rgba(107,63,50,.72) }
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
.bottom-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; padding: 18rpx 36rpx calc(env(safe-area-inset-bottom) + 18rpx); box-sizing: border-box; background: linear-gradient(180deg, rgba(253,234,224,0), rgba(253,225,214,.98) 28%, rgba(253,225,214,.98)); backdrop-filter: blur(16rpx) }
.primary-btn { width: 100%; height: 88rpx; border: none; border-radius: 36rpx; display: flex; align-items: center; justify-content: center; gap: 12rpx; background: linear-gradient(172deg, #e8877a 4%, #d4635a 96%); box-shadow: 0 10rpx 22rpx rgba(224,123,106,.28); color: #fff8f4; font-size: 28rpx; letter-spacing: 3rpx }
.primary-btn::after { border: none }
.btn-icon { width: 28rpx; height: 28rpx }
</style>
