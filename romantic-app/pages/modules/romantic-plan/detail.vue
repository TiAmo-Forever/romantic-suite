<template>
  <view class="page romantic-plan-detail-page" :style="themeStyle">
    <GlobalNotificationBanner />

    <view class="page-bg">
      <view class="cloud cloud-left"></view>
      <view class="cloud cloud-right"></view>
      <view class="cloud cloud-bottom"></view>
      <view class="spark spark-a"></view>
      <view class="spark spark-b"></view>
    </view>

    <view class="detail-shell">
      <view class="topbar-row">
        <view class="back-chip" @click="goBack">
          <view class="back-chip-arrow"></view>
          <text>返回</text>
        </view>
        <view class="edit-chip" @click="goEdit">编辑</view>
      </view>

      <view class="hero-banner">
        <view class="hero-banner-kicker">计划详情</view>
        <view class="hero-title-wrap">
          <view class="hero-title">{{ planDetail?.title || '浪漫计划' }}</view>
          <view class="hero-title-ornament"></view>
        </view>
      </view>

      <view v-if="planDetail" class="section-card hero-card">
        <view class="ribbon ribbon-pink">{{ resolveTypeLabel(planDetail.planType) }}</view>
        <view class="section-card-inner hero-card-inner">
          <view class="hero-cover" :class="`hero-cover-${planDetail.planType || 'daily'}`">
            <image v-if="planDetail.coverUrl" class="hero-cover-image" :src="planDetail.coverUrl" mode="aspectFill" />
            <view v-else class="hero-cover-placeholder">
              <view class="hero-cover-title">{{ resolveTypeLabel(planDetail.planType) }}</view>
              <view class="hero-cover-copy">{{ planDetail.location || '这份计划还没有补地点。' }}</view>
            </view>

            <view class="hero-cover-overlay"></view>
            <view class="hero-cover-top">
              <view class="hero-cover-status" :class="`status-${planDetail.status || 'active'}`">{{ resolveStatusLabel(planDetail.status) }}</view>
              <view class="hero-progress-pill">{{ progressPercent(planDetail) }}%</view>
            </view>
            <view class="hero-cover-bottom">
              <view class="hero-cover-tag">{{ resolveCountdownText(planDetail) }}</view>
              <view class="hero-cover-progress">
                <view class="hero-cover-progress-bar" :style="{ width: `${progressPercent(planDetail)}%` }"></view>
              </view>
            </view>
          </view>

          <view class="hero-main">
            <view class="hero-main-title">{{ planDetail.title || '未命名计划' }}</view>
            <view class="hero-main-desc" @longpress.stop="copyText(planDetail.description || '先把目标定下来，再慢慢推进。')">{{ planDetail.description || '先把目标定下来，再慢慢推进。' }}</view>

            <view class="hero-overview-row">
              <view class="hero-overview-card">
                <view class="hero-overview-label">完成进度</view>
                <view class="hero-overview-value">{{ resolveProgressText(planDetail) }}</view>
              </view>
              <view class="hero-overview-card">
                <view class="hero-overview-label">时间提醒</view>
                <view class="hero-overview-value">{{ resolveCountdownText(planDetail) }}</view>
              </view>
              <view class="hero-overview-card">
                <view class="hero-overview-label">最近动作</view>
                <view class="hero-overview-value">{{ planDetail.nextExecuteLabel || '等你们安排' }}</view>
              </view>
            </view>

            <view class="hero-meta-grid">
              <view class="hero-meta-card">
                <view class="hero-meta-label">周期</view>
                <view class="hero-meta-value">{{ planDetail.scheduleSummary || '待补充' }}</view>
              </view>
              <view class="hero-meta-card">
                <view class="hero-meta-label">地点</view>
                <view class="hero-meta-value">{{ planDetail.location || '未指定' }}</view>
              </view>
              <view class="hero-meta-card">
                <view class="hero-meta-label">发起人</view>
                <view class="hero-meta-value">{{ resolveUserName(planDetail.creatorNickname, planDetail.creatorUsername, '共同创建') }}</view>
              </view>
              <view class="hero-meta-card">
                <view class="hero-meta-label">最近更新</view>
                <view class="hero-meta-value">{{ resolveUserName(planDetail.updaterNickname, planDetail.updaterUsername, '共同维护') }}</view>
              </view>
            </view>

            <view v-if="latestFeedbackText" class="hero-latest-feedback">
              <view class="hero-latest-feedback-label">最近反馈</view>
              <view class="hero-latest-feedback-text" @longpress.stop="copyText(latestFeedbackText)">{{ latestFeedbackText }}</view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="planDetail" class="section-card tab-card">
        <view class="ribbon ribbon-green">计划分区</view>
        <view class="section-card-inner">
          <scroll-view class="tab-scroll" scroll-x enable-flex show-scrollbar="false">
            <view class="tab-row">
              <view
                v-for="item in detailTabs"
                :key="item.key"
                class="tab-pill"
                :class="{ active: activeTab === item.key }"
                @click="activeTab = item.key"
              >
                {{ item.label }}
              </view>
            </view>
          </scroll-view>

          <view v-if="activeTab === 'items'" class="content-block">
            <view class="block-title">执行安排</view>
            <view class="block-desc">把计划拆成几步，照着推进就好。</view>

            <view class="mini-progress-strip">
              <view class="mini-progress-track">
                <view class="mini-progress-bar" :style="{ width: `${progressPercent(planDetail)}%` }"></view>
              </view>
              <view class="mini-progress-text">{{ resolveProgressText(planDetail) }}</view>
            </view>

            <view v-if="planDetail.itemList?.length" class="roadmap-list">
              <view v-for="item in planDetail.itemList" :key="item.id" class="roadmap-card">
                <view class="roadmap-line">
                  <view class="roadmap-dot"></view>
                </view>
                <view class="roadmap-main">
                  <view class="roadmap-head">
                    <view class="roadmap-title">{{ item.title || '未命名条目' }}</view>
                    <view class="roadmap-state" :class="{ done: item.completed }">{{ item.completed ? '已完成' : '待执行' }}</view>
                  </view>
                  <view v-if="item.content" class="roadmap-content" @longpress.stop="copyText(item.content)">{{ item.content }}</view>
                  <view class="roadmap-meta">{{ resolveItemMeta(item) }}</view>
                  <view class="roadmap-foot">
                    <view class="roadmap-owner">{{ resolveUserName(item.creatorNickname, item.creatorUsername, '共同安排') }}</view>
                    <view class="roadmap-action" :class="{ done: item.completed }" @click="handleToggleItem(item)">
                      {{ item.completed ? '取消完成' : '标记完成' }}
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view v-else class="sub-empty">这份计划还没拆出步骤，可以先去编辑页补上。</view>
          </view>

          <view v-if="activeTab === 'feedback'" class="content-block">
            <view class="block-head">
              <view>
                <view class="block-title">反馈记录</view>
                <view class="block-desc">执行完记一笔，回头看会更清楚。</view>
              </view>
              <view class="block-action" @click="toggleFeedbackComposer">{{ showFeedbackComposer ? '收起' : '记反馈' }}</view>
            </view>

            <view v-if="showFeedbackComposer" class="feedback-composer">
              <picker mode="date" :value="feedbackDate" @change="handleFeedbackDateChange">
                <view class="picker-field">{{ feedbackDate || '选择反馈日期' }}</view>
              </picker>

              <scroll-view class="status-scroll" scroll-x enable-flex show-scrollbar="false">
                <view class="status-row">
                  <view
                    v-for="item in feedbackStatusOptions"
                    :key="item.value"
                    class="status-chip"
                    :class="{ active: feedbackStatus === item.value }"
                    @click="feedbackStatus = item.value"
                  >
                    {{ item.label }}
                  </view>
                </view>
              </scroll-view>

              <textarea
                v-model="feedbackContent"
                class="feedback-textarea"
                maxlength="1000"
                placeholder="写写今天推进得怎么样，或者下次准备怎么继续。"
                placeholder-class="textarea-placeholder"
              ></textarea>
              <view class="feedback-submit" @click="submitFeedback">保存反馈</view>
            </view>

            <view v-if="planDetail.feedbackList?.length" class="feedback-list">
              <view v-for="item in planDetail.feedbackList" :key="item.id" class="feedback-card">
                <view class="feedback-head">
                  <view class="feedback-author">{{ resolveUserName(item.creatorNickname, item.creatorUsername, '共同记录') }}</view>
                  <view class="feedback-date">{{ item.feedbackDate || item.createdAt }}</view>
                </view>
                <view class="feedback-status">{{ resolveFeedbackStatus(item.status) }}</view>
                <view class="feedback-content" @longpress.stop="copyText(item.content || '这条反馈还没有补内容。')">{{ item.content || '这条反馈还没有补内容。' }}</view>
              </view>
            </view>
            <view v-else class="sub-empty">还没有反馈，第一次执行完就可以来这里记一笔。</view>
          </view>

          <view v-if="activeTab === 'social'" class="content-block">
            <view class="block-title">互动留言</view>
            <view class="block-desc">点个赞，或者留一句小回应。</view>

            <view class="social-like-card" :class="{ active: planDetail.likedByCurrentUser }" @click="handleToggleLike">
              <view>
                <view class="social-like-title">{{ planDetail.likedByCurrentUser ? '你已经给这份计划点过赞啦' : '给这份计划点个赞' }}</view>
                <view class="social-like-users">{{ likeSummaryText }}</view>
              </view>
              <view class="social-like-count">{{ planDetail.likeCount || 0 }}</view>
            </view>

            <view class="comment-composer">
              <textarea
                v-model="commentContent"
                class="comment-textarea"
                maxlength="500"
                placeholder="留一句鼓励、提醒，或者补充下一步安排。"
                placeholder-class="textarea-placeholder"
              ></textarea>
              <view class="comment-submit" @click="submitComment">发送评论</view>
            </view>

            <view v-if="planDetail.commentList?.length" class="comment-list">
              <view v-for="item in planDetail.commentList" :key="item.id" class="comment-card">
                <view class="comment-head">
                  <view class="comment-author">{{ resolveUserName(item.commenterNickname, item.commenterUsername, '共同留言') }}</view>
                  <view class="comment-time">{{ item.createdAt || item.updatedAt }}</view>
                </view>
                <view class="comment-content" @longpress.stop="copyText(item.content || '这条评论没有内容。')">{{ item.content || '这条评论没有内容。' }}</view>
                <view v-if="canDeleteComment(item)" class="comment-delete" @click="handleDeleteComment(item.id)">删除评论</view>
              </view>
            </view>
            <view v-else class="sub-empty">还没有评论，给这份计划留一句话吧。</view>
          </view>
        </view>
      </view>

      <view v-else class="section-card loading-card">
        <view class="section-card-inner">
          <view class="sub-empty">正在加载这份计划的详情...</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  createRomanticPlanComment,
  createRomanticPlanFeedback,
  deleteRomanticPlanComment,
  fetchRomanticPlanDetail,
  toggleRomanticPlanItemCompletion,
  toggleRomanticPlanLike
} from '@/services/romantic-plans.js'
import { getUser, requireAuth } from '@/utils/auth.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'

const detailTabs = [
  { key: 'items', label: '执行安排' },
  { key: 'feedback', label: '反馈记录' },
  { key: 'social', label: '互动留言' }
]

const feedbackStatusOptions = [
  { value: 'done', label: '完成不错' },
  { value: 'partial', label: '完成一半' },
  { value: 'missed', label: '今天没做' }
]

const { themeStyle } = useThemePage()
const planId = ref('')
const planDetail = ref(null)
const activeTab = ref('items')
const showFeedbackComposer = ref(false)
const feedbackDate = ref('')
const feedbackStatus = ref('done')
const feedbackContent = ref('')
const commentContent = ref('')

const currentUsername = computed(() => String(getUser()?.username || '').trim())
const likeSummaryText = computed(() => {
  const likeUsers = planDetail.value?.likeUsers || []
  if (!likeUsers.length) return '还没有点赞记录'
  return likeUsers.map((item) => item.nickname || item.username || '未命名').join('、')
})
const latestFeedbackText = computed(() => {
  const list = Array.isArray(planDetail.value?.feedbackList) ? [...planDetail.value.feedbackList] : []
  if (!list.length) return ''
  list.sort((a, b) => toDate(b?.createdAt || b?.feedbackDate) - toDate(a?.createdAt || a?.feedbackDate))
  return String(list[0]?.content || '').trim()
})

onLoad((options) => {
  planId.value = String(options?.id || '').trim()
})

onShow(async () => {
  if (!requireAuth()) return
  await loadDetail()
})

async function loadDetail() {
  if (!planId.value) return
  try {
    planDetail.value = await fetchRomanticPlanDetail(planId.value)
  } catch (error) {
    uni.showToast({ title: error?.message || '获取计划详情失败', icon: 'none' })
  }
}

function resolveTypeLabel(planType) {
  if (planType === 'interval') return '周期计划'
  if (planType === 'stage') return '阶段计划'
  return '日程计划'
}

function resolveStatusLabel(status) {
  if (status === 'completed') return '已完成'
  if (status === 'draft') return '草稿'
  if (status === 'archived') return '已归档'
  return '进行中'
}

function resolveFeedbackStatus(status) {
  if (status === 'partial') return '完成一半'
  if (status === 'missed') return '今天没做'
  return '完成不错'
}

function resolveUserName(nickname, username, fallback) {
  return String(nickname || '').trim() || String(username || '').trim() || fallback
}

function resolveItemMeta(item) {
  const parts = []
  if (item.scheduledAt) parts.push(item.scheduledAt)
  if (item.endAt) parts.push(`结束于 ${item.endAt}`)
  if (item.location) parts.push(item.location)
  return parts.join(' · ') || '待补充时间和地点'
}

function progressPercent(item) {
  const total = Number(item?.totalItemCount || 0)
  const completed = Number(item?.completedItemCount || 0)
  if (total <= 0) return item?.status === 'completed' ? 100 : 0
  return Math.max(0, Math.min(100, Math.round((completed / total) * 100)))
}

function resolveProgressText(item) {
  const total = Number(item?.totalItemCount || 0)
  const completed = Number(item?.completedItemCount || 0)
  if (total <= 0) return item?.status === 'completed' ? '已收尾' : '待拆步骤'
  return `${completed}/${total} 步`
}

function resolveCountdownText(item) {
  if (item?.status === 'completed') return '已经完成'
  if (item?.status === 'archived') return '暂时收起'
  if (item?.status === 'draft') return '还在草稿中'
  if (item?.nextExecuteAt) {
    return formatDistance(toDate(item.nextExecuteAt) - Date.now(), '下次安排')
  }
  if (item?.startAt) {
    const startTime = toDate(item.startAt)
    if (startTime > Date.now()) return formatDistance(startTime - Date.now(), '距离开始')
  }
  if (item?.endAt) {
    const endTime = toDate(item.endAt)
    if (endTime > Date.now()) return formatDistance(endTime - Date.now(), '距离截止')
  }
  return item?.nextExecuteLabel || '等你们安排'
}

function toDate(value) {
  if (!value) return 0
  const normalized = String(value).trim().replace(/-/g, '/')
  const timestamp = new Date(normalized).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

function formatDistance(diff, prefix) {
  const day = 24 * 60 * 60 * 1000
  if (!Number.isFinite(diff) || diff <= 0) return `${prefix} 今天`
  const days = Math.ceil(diff / day)
  if (days <= 1) return `${prefix} 明天`
  return `${prefix} ${days} 天`
}

function toggleFeedbackComposer() {
  showFeedbackComposer.value = !showFeedbackComposer.value
}

function handleFeedbackDateChange(event) {
  feedbackDate.value = event?.detail?.value || ''
}

async function handleToggleLike() {
  try {
    await toggleRomanticPlanLike(planId.value)
    await loadDetail()
  } catch (error) {
    uni.showToast({ title: error?.message || '点赞失败', icon: 'none' })
  }
}

async function handleToggleItem(item) {
  try {
    planDetail.value = await toggleRomanticPlanItemCompletion(planId.value, item.id, !item.completed)
  } catch (error) {
    uni.showToast({ title: error?.message || '更新条目状态失败', icon: 'none' })
  }
}

async function submitFeedback() {
  if (!String(feedbackContent.value || '').trim()) {
    uni.showToast({ title: '请先填写反馈内容', icon: 'none' })
    return
  }
  try {
    planDetail.value = await createRomanticPlanFeedback(planId.value, {
      feedbackDate: feedbackDate.value,
      status: feedbackStatus.value,
      content: feedbackContent.value
    })
    feedbackContent.value = ''
    feedbackDate.value = ''
    feedbackStatus.value = 'done'
    showFeedbackComposer.value = false
    uni.showToast({ title: '反馈已记录', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.message || '保存反馈失败', icon: 'none' })
  }
}

async function submitComment() {
  if (!String(commentContent.value || '').trim()) {
    uni.showToast({ title: '请先填写评论内容', icon: 'none' })
    return
  }
  try {
    await createRomanticPlanComment(planId.value, { content: commentContent.value })
    commentContent.value = ''
    await loadDetail()
    uni.showToast({ title: '评论已发送', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.message || '评论失败', icon: 'none' })
  }
}

function canDeleteComment(item) {
  if (!planDetail.value) return false
  return String(item?.commenterUsername || '').trim() === currentUsername.value
    || String(planDetail.value?.creatorUsername || '').trim() === currentUsername.value
}

function handleDeleteComment(commentId) {
  uni.showModal({
    title: '删除评论',
    content: '确认删除这条评论吗？',
    success: async (result) => {
      if (!result.confirm) return
      try {
        await deleteRomanticPlanComment(planId.value, commentId)
        await loadDetail()
        uni.showToast({ title: '评论已删除', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: error?.message || '删除评论失败', icon: 'none' })
      }
    }
  })
}

function copyText(value) {
  const content = String(value || '').trim()
  if (!content) return
  uni.setClipboardData({
    data: content,
    success: () => {
      uni.showToast({ title: '内容已复制', icon: 'success' })
    }
  })
}

function goEdit() {
  goPage(`/pages/modules/romantic-plan/edit?id=${planId.value}`)
}

function goBack() {
  backPage()
}
</script>

<style scoped>
.romantic-plan-detail-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.82), rgba(255, 248, 244, 0.24) 38%, transparent 60%),
    linear-gradient(180deg, #f9e8df 0%, #f7ddd6 26%, #efd9e5 58%, #f7e4da 100%);
}

.page-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cloud,
.spark {
  position: absolute;
  opacity: 0.82;
}

.cloud {
  border-radius: 999rpx;
  background:
    radial-gradient(circle at 25% 40%, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.12) 70%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 240, 235, 0.3));
  filter: blur(4rpx);
}

.cloud-left {
  top: 180rpx;
  left: -40rpx;
  width: 280rpx;
  height: 180rpx;
}

.cloud-right {
  top: 580rpx;
  right: -50rpx;
  width: 320rpx;
  height: 220rpx;
}

.cloud-bottom {
  bottom: 100rpx;
  left: 50%;
  margin-left: -260rpx;
  width: 520rpx;
  height: 200rpx;
}

.spark {
  width: 22rpx;
  height: 22rpx;
  background: rgba(255, 255, 255, 0.95);
  clip-path: polygon(50% 0%, 64% 36%, 100% 50%, 64% 64%, 50% 100%, 36% 64%, 0% 50%, 36% 36%);
  box-shadow: 0 0 18rpx rgba(255, 255, 255, 0.6);
}

.spark-a {
  top: 260rpx;
  left: 84rpx;
}

.spark-b {
  top: 410rpx;
  right: 116rpx;
}

.detail-shell {
  position: relative;
  z-index: 1;
  padding: 28rpx 18rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.topbar-row,
.hero-card-inner,
.hero-meta-grid,
.hero-overview-row,
.roadmap-head,
.roadmap-foot,
.feedback-head,
.comment-head,
.block-head {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.topbar-row {
  align-items: center;
  justify-content: space-between;
}

.back-chip,
.edit-chip,
.block-action,
.roadmap-action,
.feedback-submit,
.comment-submit {
  min-width: 136rpx;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.back-chip {
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10rpx 22rpx rgba(196, 161, 156, 0.18);
  color: #c67f82;
}

.back-chip-arrow {
  width: 18rpx;
  height: 18rpx;
  border-left: 4rpx solid currentColor;
  border-bottom: 4rpx solid currentColor;
  transform: rotate(45deg);
}

.edit-chip,
.block-action,
.feedback-submit,
.comment-submit,
.roadmap-action {
  background: linear-gradient(135deg, #ff7f91, #ef5f73);
  color: #fff;
  box-shadow: 0 10rpx 18rpx rgba(205, 109, 121, 0.22);
}

.roadmap-action.done {
  background: rgba(233, 247, 236, 0.96);
  color: #4d8f5e;
  box-shadow: none;
}

.hero-banner {
  padding-top: 8rpx;
  text-align: center;
}

.hero-banner-kicker {
  position: relative;
  display: inline-block;
  padding: 0 34rpx;
  color: #c77278;
  font-size: 24rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.hero-banner-kicker::before,
.hero-banner-kicker::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 88rpx;
  height: 2rpx;
  background: rgba(210, 125, 123, 0.56);
}

.hero-banner-kicker::before {
  left: -68rpx;
}

.hero-banner-kicker::after {
  right: -68rpx;
}

.hero-title-wrap {
  margin-top: 14rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-title {
  font-size: 64rpx;
  line-height: 1.1;
  font-weight: 800;
  color: #2a9c94;
  text-shadow: 0 6rpx 16rpx rgba(255, 255, 255, 0.48);
}

.hero-title-ornament {
  margin-top: 10rpx;
  width: 250rpx;
  height: 14rpx;
  border-bottom: 6rpx solid rgba(36, 149, 144, 0.82);
  border-radius: 50%;
  transform: rotate(-4deg);
}

.section-card {
  position: relative;
  border-radius: 34rpx;
  background: rgba(255, 251, 247, 0.9);
  box-shadow:
    0 16rpx 30rpx rgba(210, 169, 158, 0.16),
    inset 0 0 0 2rpx rgba(233, 198, 190, 0.62);
}

.section-card-inner {
  padding: 68rpx 24rpx 24rpx;
}

.ribbon {
  position: absolute;
  top: -12rpx;
  left: 18rpx;
  min-width: 174rpx;
  height: 64rpx;
  padding: 0 26rpx;
  border-radius: 18rpx 30rpx 22rpx 12rpx;
  display: inline-flex;
  align-items: center;
  color: #fff;
  font-size: 24rpx;
  font-weight: 800;
  box-shadow: 0 10rpx 18rpx rgba(201, 140, 142, 0.22);
}

.ribbon::after {
  content: '';
  position: absolute;
  right: -16rpx;
  bottom: 6rpx;
  border-width: 14rpx 0 14rpx 16rpx;
  border-style: solid;
}

.ribbon-pink {
  background: linear-gradient(135deg, #ef8f9e, #d96c7c);
}

.ribbon-pink::after {
  border-color: transparent transparent transparent #d96c7c;
}

.ribbon-green {
  background: linear-gradient(135deg, #89b670, #5a8d52);
}

.ribbon-green::after {
  border-color: transparent transparent transparent #5a8d52;
}

.hero-card-inner {
  align-items: stretch;
}

.hero-cover {
  position: relative;
  width: 220rpx;
  min-height: 320rpx;
  border-radius: 28rpx;
  overflow: hidden;
  background: #f4e4df;
  flex: 0 0 auto;
}

.hero-cover-daily {
  background: linear-gradient(180deg, #f8ede7 0%, #ecd7cd 100%);
}

.hero-cover-interval {
  background: linear-gradient(180deg, #ecf5fb 0%, #dbe7f5 100%);
}

.hero-cover-stage {
  background: linear-gradient(180deg, #eef5eb 0%, #ddebd8 100%);
}

.hero-cover-image {
  width: 100%;
  height: 100%;
}

.hero-cover-placeholder {
  width: 100%;
  height: 100%;
  padding: 22rpx 20rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.hero-cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(73, 54, 58, 0.26));
}

.hero-cover-title,
.hero-cover-copy,
.hero-cover-top,
.hero-cover-bottom {
  position: relative;
  z-index: 1;
}

.hero-cover-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #715258;
}

.hero-cover-copy {
  margin-top: 8rpx;
  font-size: 20rpx;
  line-height: 1.6;
  color: #886d72;
}

.hero-cover-top,
.hero-cover-bottom {
  position: absolute;
  left: 14rpx;
  right: 14rpx;
  display: flex;
  gap: 10rpx;
}

.hero-cover-top {
  top: 14rpx;
  align-items: center;
  justify-content: space-between;
}

.hero-cover-bottom {
  bottom: 14rpx;
  flex-direction: column;
}

.hero-cover-status,
.hero-progress-pill,
.hero-cover-tag {
  width: fit-content;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 700;
  backdrop-filter: blur(8rpx);
}

.hero-progress-pill,
.hero-cover-tag {
  color: #ffffff;
}

.hero-progress-pill {
  background: rgba(36, 149, 144, 0.18);
}

.hero-cover-tag {
  background: rgba(53, 43, 47, 0.26);
}

.hero-cover-progress {
  height: 12rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.32);
}

.hero-cover-progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #fff7d5, #ffd38c);
}

.status-active {
  background: #fff4d9;
  color: #bb7a19;
}

.status-completed {
  background: #edf7ef;
  color: #4d8f5e;
}

.status-draft {
  background: #f1f2f5;
  color: #6f7684;
}

.status-archived {
  background: #edeaf6;
  color: #776b9c;
}

.hero-main {
  min-width: 0;
  flex: 1;
}

.hero-main-title,
.block-title {
  font-size: 34rpx;
  line-height: 1.36;
  font-weight: 800;
  color: #1f948f;
}

.hero-main-desc,
.block-desc,
.roadmap-content,
.feedback-content,
.comment-content,
.sub-empty,
.social-like-users,
.hero-latest-feedback-text {
  margin-top: 16rpx;
  font-size: 24rpx;
  line-height: 1.72;
  color: #6d5f68;
}

.hero-overview-row,
.hero-meta-grid {
  margin-top: 22rpx;
}

.hero-overview-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.hero-overview-card,
.hero-meta-card,
.hero-latest-feedback {
  padding: 16rpx;
  border-radius: 20rpx;
  background: #fff6f1;
}

.hero-overview-label,
.hero-meta-label,
.roadmap-meta,
.roadmap-owner,
.feedback-date,
.comment-time,
.hero-latest-feedback-label {
  font-size: 20rpx;
  color: #9b8a90;
}

.hero-overview-value,
.hero-meta-value,
.roadmap-title,
.feedback-author,
.comment-author,
.social-like-title {
  margin-top: 6rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: #4e454e;
  font-weight: 700;
}

.tab-scroll {
  white-space: nowrap;
}

.tab-row {
  display: inline-flex;
  gap: 14rpx;
}

.tab-pill {
  min-width: 142rpx;
  height: 68rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 250, 245, 0.96);
  box-shadow: inset 0 0 0 2rpx rgba(224, 197, 189, 0.7);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9d6266;
  font-size: 24rpx;
  font-weight: 700;
}

.tab-pill.active {
  color: #1f948f;
  box-shadow: inset 0 0 0 2rpx rgba(86, 156, 138, 0.42);
}

.content-block {
  margin-top: 24rpx;
}

.block-head {
  align-items: center;
  justify-content: space-between;
}

.mini-progress-strip {
  margin-top: 18rpx;
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  background: #fff6f1;
}

.mini-progress-track {
  height: 12rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background: rgba(239, 127, 145, 0.16);
}

.mini-progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ff9ca8, #ef5f73);
}

.mini-progress-text {
  margin-top: 12rpx;
  font-size: 22rpx;
  font-weight: 700;
  color: #70575d;
}

.roadmap-list,
.feedback-list,
.comment-list {
  margin-top: 24rpx;
  display: grid;
  gap: 18rpx;
}

.roadmap-card {
  display: grid;
  grid-template-columns: 28rpx minmax(0, 1fr);
  gap: 14rpx;
}

.roadmap-line {
  display: flex;
  justify-content: center;
}

.roadmap-dot {
  width: 14rpx;
  height: 14rpx;
  margin-top: 16rpx;
  border-radius: 50%;
  background: #ef7e90;
}

.roadmap-main,
.feedback-card,
.comment-card,
.feedback-composer,
.social-like-card,
.comment-composer {
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10rpx 20rpx rgba(214, 176, 166, 0.12);
}

.roadmap-main,
.feedback-card,
.comment-card,
.feedback-composer,
.comment-composer {
  padding: 22rpx;
}

.roadmap-head,
.roadmap-foot,
.feedback-head,
.comment-head {
  align-items: center;
  justify-content: space-between;
}

.roadmap-state {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #fff4d9;
  color: #bb7a19;
  font-size: 20rpx;
  font-weight: 700;
}

.roadmap-state.done {
  background: #edf7ef;
  color: #4d8f5e;
}

.picker-field,
.feedback-textarea,
.comment-textarea {
  width: 100%;
  box-sizing: border-box;
  border-radius: 22rpx;
  background: #fff6f1;
  color: #5d535d;
  font-size: 24rpx;
}

.picker-field {
  min-height: 72rpx;
  padding: 0 22rpx;
  line-height: 72rpx;
}

.status-scroll {
  margin-top: 16rpx;
  white-space: nowrap;
}

.status-row {
  display: inline-flex;
  gap: 12rpx;
  padding-right: 10rpx;
}

.status-chip {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: #fff6f1;
  color: #866d73;
  font-size: 22rpx;
  font-weight: 600;
}

.status-chip.active {
  background: #ffdce3;
  color: #d06071;
}

.feedback-textarea,
.comment-textarea {
  min-height: 170rpx;
  margin-top: 16rpx;
  padding: 22rpx;
  line-height: 1.7;
}

.feedback-submit,
.comment-submit {
  margin-top: 18rpx;
}

.feedback-status,
.comment-delete,
.social-like-title {
  margin-top: 12rpx;
}

.feedback-status,
.comment-delete {
  font-size: 22rpx;
  font-weight: 700;
  color: #d16f74;
}

.social-like-card {
  margin-top: 24rpx;
  padding: 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.social-like-card.active {
  background: rgba(255, 237, 241, 0.96);
}

.social-like-count {
  font-size: 46rpx;
  line-height: 1;
  font-weight: 800;
  color: #ef677b;
}

.comment-composer {
  margin-top: 18rpx;
}

.textarea-placeholder {
  color: #b6a3aa;
}

@media screen and (max-width: 720rpx) {
  .hero-card-inner,
  .hero-meta-grid,
  .hero-overview-row {
    display: grid;
    grid-template-columns: 1fr;
  }

  .hero-cover {
    width: 100%;
  }
}
</style>
