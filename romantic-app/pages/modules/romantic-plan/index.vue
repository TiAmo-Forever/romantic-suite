<template>
  <view class="page romantic-plan-page" :style="themeStyle">
    <GlobalNotificationBanner />

    <view class="plan-page-bg">
      <view class="cloud cloud-left"></view>
      <view class="cloud cloud-right"></view>
      <view class="cloud cloud-bottom"></view>
      <view class="spark spark-a"></view>
      <view class="spark spark-b"></view>
      <view class="spark spark-c"></view>
    </view>

    <view class="plan-shell">
      <view class="topbar-row">
        <view class="back-chip" @click="goBack">
          <view class="back-chip-arrow"></view>
          <text>返回</text>
        </view>
      </view>

      <view class="hero-banner">
        <view class="hero-banner-kicker">计划中心</view>
        <view class="hero-title-wrap">
          <view class="hero-title">浪漫计划</view>
          <view class="hero-title-ornament"></view>
        </view>
      </view>

      <view class="section-card intro-card">
        <view class="ribbon ribbon-pink">共同安排</view>
        <view class="section-card-inner">
          <view class="intro-title">把想完成的事，慢慢排进你们的日常。</view>
          <view class="intro-desc" @longpress.stop="copyText('先定计划，再跟着节奏推进，反馈也能随手补上。')">先定计划，再跟着节奏推进，反馈也能随手补上。</view>

          <view class="intro-bottom">
            <view class="stat-row">
              <view class="stat-chip">
                <view class="stat-chip-icon stat-chip-icon-calendar"></view>
                <text>{{ activeCount }} 个进行中</text>
              </view>
              <view class="stat-chip">
                <view class="stat-chip-icon stat-chip-icon-chat"></view>
                <text>{{ feedbackCount }} 条反馈</text>
              </view>
            </view>

            <view class="create-button" @click="goCreate">
              <text class="create-button-plus">+</text>
              <text>新建计划</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-card list-card">
        <view class="ribbon ribbon-green">计划列表</view>
        <view class="section-card-inner">
          <view class="list-intro" @longpress.stop="copyText('先把最想一起完成的一件事排进去。')">先把最想一起完成的一件事排进去。</view>

          <scroll-view class="filter-scroll" scroll-x enable-flex show-scrollbar="false">
            <view class="filter-row">
              <view
                v-for="item in filters"
                :key="item.key"
                class="filter-pill"
                :class="{ active: activeFilter === item.key }"
                @click="handleFilterChange(item.key)"
              >
                {{ item.label }}
              </view>
            </view>
          </scroll-view>

          <view v-if="planList.length" class="plan-list">
            <view
              v-for="item in planList"
              :key="item.id"
              class="plan-item-card"
              hover-class="plan-item-card-active"
              hover-stay-time="70"
              @click="openDetail(item.id)"
            >
              <view class="plan-item-cover" :class="`plan-item-cover-${item.planType || 'daily'}`">
                <image v-if="item.coverUrl" class="plan-item-image" :src="item.coverUrl" mode="aspectFill" />
                <view v-else class="plan-item-cover-placeholder">
                  <view class="plan-item-cover-badge">{{ resolveTypeLabel(item.planType) }}</view>
                  <view class="plan-item-cover-copy">{{ resolveCoverText(item) }}</view>
                </view>

                <view class="plan-item-cover-overlay"></view>

                <view class="plan-item-cover-top">
                  <view class="plan-status-pill" :class="`plan-status-${item.status}`">{{ resolveStatusLabel(item.status) }}</view>
                  <view class="plan-item-progress-pill">{{ progressPercent(item) }}%</view>
                </view>

                <view class="plan-item-cover-bottom">
                  <view class="plan-item-cover-label">{{ resolveCountdownText(item) }}</view>
                  <view class="plan-item-cover-progress">
                    <view class="plan-item-cover-progress-bar" :style="{ width: `${progressPercent(item)}%` }"></view>
                  </view>
                </view>
              </view>

              <view class="plan-item-main">
                <view class="plan-item-top">
                  <view class="plan-type-pill" :class="`plan-type-${item.planType}`">{{ resolveTypeLabel(item.planType) }}</view>
                  <view class="plan-item-link">查看详情</view>
                </view>

                <view class="plan-item-title">{{ item.title || '未命名计划' }}</view>
                <view class="plan-item-desc" @longpress.stop="copyText(item.description || '先把目标写下来，后面再慢慢补细节。')">{{ item.description || '先把目标写下来，后面再慢慢补细节。' }}</view>

                <view class="plan-highlight-row">
                  <view class="plan-highlight-card">
                    <view class="plan-highlight-label">完成进度</view>
                    <view class="plan-highlight-value">{{ resolveProgressText(item) }}</view>
                  </view>
                  <view class="plan-highlight-card">
                    <view class="plan-highlight-label">时间提醒</view>
                    <view class="plan-highlight-value">{{ resolveCountdownText(item) }}</view>
                  </view>
                  <view class="plan-highlight-card">
                    <view class="plan-highlight-label">下一步</view>
                    <view class="plan-highlight-value">{{ item.nextExecuteLabel || '等你们安排' }}</view>
                  </view>
                </view>

                <view v-if="resolveLatestFeedback(item)" class="plan-feedback-preview">
                  <view class="plan-feedback-preview-label">最近反馈</view>
                  <view class="plan-feedback-preview-text" @longpress.stop="copyText(resolveLatestFeedback(item))">{{ resolveLatestFeedback(item) }}</view>
                </view>

                <view class="plan-item-footer">
                  <view class="plan-owner">{{ resolveOwnerText(item) }}</view>
                  <view class="plan-meta-brief">{{ item.likeCount || 0 }} 赞 · {{ item.feedbackCount || 0 }} 条反馈</view>
                </view>
              </view>
            </view>
          </view>

          <view v-else class="empty-board">
            <view class="empty-divider">
              <view class="empty-divider-line"></view>
              <view class="empty-divider-title">还没有计划</view>
              <view class="empty-divider-line"></view>
            </view>

            <view class="empty-illustration">
              <view class="empty-card empty-card-left">
                <view class="empty-card-title">计划清单</view>
                <view class="empty-note-lines">
                  <view v-for="line in 4" :key="line" class="empty-note-line"></view>
                </view>
              </view>
              <view class="empty-card empty-card-right">
                <view class="cup cup-left"></view>
                <view class="cup cup-right"></view>
              </view>
            </view>

            <view class="empty-copy">从小目标开始，把未来慢慢排进日常里。</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'

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
import { onShow } from '@dcloudio/uni-app'
import { fetchRomanticPlanList } from '@/services/romantic-plans.js'
import { requireAuth } from '@/utils/auth.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'

const filters = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'draft', label: '草稿' },
  { key: 'archived', label: '已归档' }
]

const { themeStyle } = useThemePage()
const planList = ref([])
const activeFilter = ref('all')

const activeCount = computed(() => planList.value.filter((item) => item.status === 'active').length)
const feedbackCount = computed(() => planList.value.reduce((sum, item) => sum + Number(item.feedbackCount || 0), 0))

onShow(async () => {
  if (!requireAuth()) return
  await loadList()
})

async function loadList() {
  try {
    planList.value = await fetchRomanticPlanList(activeFilter.value)
  } catch (error) {
    uni.showToast({ title: error?.message || '获取浪漫计划失败', icon: 'none' })
  }
}

async function handleFilterChange(filterKey) {
  if (activeFilter.value === filterKey) return
  activeFilter.value = filterKey
  await loadList()
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

function resolveCoverText(item) {
  if (item.location) return item.location
  if (item.scheduleSummary) return item.scheduleSummary
  return '这份计划还没有补地点'
}

function resolveOwnerText(item) {
  const creator = item?.creatorNickname || item?.creatorUsername || '共同创建'
  const updater = item?.updaterNickname || item?.updaterUsername || creator
  return `${creator} 发起，最近由 ${updater} 更新`
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
  if (total <= 0) {
    return item?.status === 'completed' ? '已收尾' : '待拆步骤'
  }
  return `${completed}/${total} 步`
}

function resolveLatestFeedback(item) {
  const list = Array.isArray(item?.feedbackList) ? [...item.feedbackList] : []
  if (!list.length) return ''
  list.sort((a, b) => toDate(b?.createdAt || b?.feedbackDate) - toDate(a?.createdAt || a?.feedbackDate))
  return String(list[0]?.content || '').trim()
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
    if (startTime > Date.now()) {
      return formatDistance(startTime - Date.now(), '距离开始')
    }
  }
  if (item?.endAt) {
    const endTime = toDate(item.endAt)
    if (endTime > Date.now()) {
      return formatDistance(endTime - Date.now(), '距离截止')
    }
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

function goCreate() {
  goPage('/pages/modules/romantic-plan/edit')
}

function openDetail(id) {
  goPage(`/pages/modules/romantic-plan/detail?id=${id}`)
}

function goBack() {
  backPage()
}
</script>

<style scoped>
.romantic-plan-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.82), rgba(255, 248, 244, 0.24) 38%, transparent 60%),
    linear-gradient(180deg, #f9e8df 0%, #f7ddd6 26%, #efd9e5 58%, #f7e4da 100%);
}

.plan-page-bg {
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
  top: 560rpx;
  right: -50rpx;
  width: 320rpx;
  height: 220rpx;
}

.cloud-bottom {
  bottom: 120rpx;
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

.spark-c {
  top: 980rpx;
  left: 132rpx;
}

.plan-shell {
  position: relative;
  z-index: 1;
  padding: 28rpx 18rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 26rpx;
}

.topbar-row {
  display: flex;
  justify-content: flex-start;
}

.back-chip {
  min-width: 154rpx;
  height: 78rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10rpx 22rpx rgba(196, 161, 156, 0.18);
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  color: #c67f82;
  font-size: 24rpx;
  font-weight: 700;
}

.back-chip-arrow {
  width: 18rpx;
  height: 18rpx;
  border-left: 4rpx solid currentColor;
  border-bottom: 4rpx solid currentColor;
  transform: rotate(45deg);
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
  font-size: 88rpx;
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: 6rpx;
  color: #2a9c94;
  text-shadow: 0 6rpx 16rpx rgba(255, 255, 255, 0.48);
}

.hero-title-ornament {
  margin-top: 10rpx;
  width: 330rpx;
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

.intro-title {
  font-size: 52rpx;
  line-height: 1.38;
  font-weight: 800;
  color: #1d948f;
}

.intro-desc,
.list-intro,
.plan-item-desc,
.empty-copy,
.plan-feedback-preview-text {
  margin-top: 18rpx;
  font-size: 24rpx;
  line-height: 1.72;
  color: #6d5f68;
}

.intro-bottom {
  margin-top: 26rpx;
  display: flex;
  gap: 18rpx;
  align-items: flex-end;
  justify-content: space-between;
}

.stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.stat-chip {
  min-height: 66rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 234, 234, 0.92);
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  color: #855f5d;
  font-size: 24rpx;
  font-weight: 700;
}

.stat-chip-icon {
  width: 28rpx;
  height: 28rpx;
  position: relative;
  flex: 0 0 auto;
}

.stat-chip-icon-calendar {
  border: 3rpx solid #cf916e;
  border-radius: 6rpx;
}

.stat-chip-icon-calendar::before,
.stat-chip-icon-calendar::after {
  content: '';
  position: absolute;
  top: -6rpx;
  width: 5rpx;
  height: 10rpx;
  border-radius: 999rpx;
  background: #cf916e;
}

.stat-chip-icon-calendar::before {
  left: 6rpx;
}

.stat-chip-icon-calendar::after {
  right: 6rpx;
}

.stat-chip-icon-chat {
  border-radius: 50%;
  background: #ca6f73;
}

.stat-chip-icon-chat::after {
  content: '';
  position: absolute;
  left: 4rpx;
  bottom: -5rpx;
  width: 12rpx;
  height: 10rpx;
  background: #ca6f73;
  clip-path: polygon(0 0, 100% 0, 24% 100%);
}

.create-button {
  min-width: 250rpx;
  height: 84rpx;
  padding: 0 32rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff7f91, #ef5f73);
  box-shadow:
    inset 0 0 0 2rpx rgba(255, 255, 255, 0.48),
    0 12rpx 18rpx rgba(205, 109, 121, 0.22);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  color: #fff;
  font-size: 26rpx;
  font-weight: 800;
}

.create-button-plus {
  font-size: 42rpx;
  line-height: 1;
}

.filter-scroll {
  margin-top: 18rpx;
  white-space: nowrap;
}

.filter-row {
  display: inline-flex;
  gap: 16rpx;
  padding-right: 8rpx;
}

.filter-pill {
  min-width: 138rpx;
  height: 68rpx;
  padding: 0 24rpx;
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

.filter-pill.active {
  color: #1f948f;
  box-shadow: inset 0 0 0 2rpx rgba(86, 156, 138, 0.42);
}

.plan-list {
  margin-top: 24rpx;
  display: grid;
  gap: 20rpx;
}

.plan-item-card {
  padding: 18rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.92);
  display: grid;
  grid-template-columns: 200rpx minmax(0, 1fr);
  gap: 18rpx;
  box-shadow: 0 12rpx 24rpx rgba(214, 176, 166, 0.14);
}

.plan-item-card-active {
  transform: scale(0.992);
}

.plan-item-cover {
  position: relative;
  overflow: hidden;
  border-radius: 24rpx;
  min-height: 224rpx;
  background: #f4e4df;
}

.plan-item-cover-daily {
  background: linear-gradient(180deg, #f8ede7 0%, #ecd7cd 100%);
}

.plan-item-cover-interval {
  background: linear-gradient(180deg, #ecf5fb 0%, #dbe7f5 100%);
}

.plan-item-cover-stage {
  background: linear-gradient(180deg, #eef5eb 0%, #ddebd8 100%);
}

.plan-item-image {
  width: 100%;
  height: 100%;
}

.plan-item-cover-placeholder {
  width: 100%;
  height: 100%;
  min-height: 224rpx;
  padding: 20rpx 18rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.plan-item-cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(73, 54, 58, 0.26));
}

.plan-item-cover-top,
.plan-item-cover-bottom {
  position: absolute;
  left: 14rpx;
  right: 14rpx;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}

.plan-item-cover-top {
  top: 14rpx;
}

.plan-item-cover-bottom {
  bottom: 14rpx;
  flex-direction: column;
  align-items: stretch;
}

.plan-item-cover-badge,
.plan-item-progress-pill,
.plan-item-cover-label {
  width: fit-content;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 700;
  backdrop-filter: blur(8rpx);
}

.plan-item-cover-badge {
  background: rgba(255, 255, 255, 0.78);
  color: #715258;
}

.plan-item-progress-pill {
  background: rgba(36, 149, 144, 0.18);
  color: #ffffff;
  margin-left: auto;
}

.plan-item-cover-copy {
  position: relative;
  z-index: 1;
  font-size: 24rpx;
  line-height: 1.6;
  color: #6a5359;
  font-weight: 700;
}

.plan-item-cover-label {
  color: #ffffff;
  background: rgba(53, 43, 47, 0.26);
}

.plan-item-cover-progress {
  height: 12rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.32);
}

.plan-item-cover-progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #fff7d5, #ffd38c);
}

.plan-item-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.plan-item-top,
.plan-item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  flex-wrap: wrap;
}

.plan-type-pill,
.plan-status-pill {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 700;
}

.plan-type-daily {
  background: #fff0ea;
  color: #cf6b54;
}

.plan-type-interval {
  background: #edf4fb;
  color: #597ea3;
}

.plan-type-stage {
  background: #eef5eb;
  color: #64805f;
}

.plan-status-active {
  background: #fff4d9;
  color: #bb7a19;
}

.plan-status-completed {
  background: #edf7ef;
  color: #4d8f5e;
}

.plan-status-draft {
  background: #f1f2f5;
  color: #6f7684;
}

.plan-status-archived {
  background: #edeaf6;
  color: #776b9c;
}

.plan-item-link,
.plan-owner,
.plan-meta-brief,
.plan-highlight-label,
.plan-feedback-preview-label {
  font-size: 20rpx;
  color: #9b8a90;
}

.plan-item-link {
  color: #d36e73;
  font-weight: 700;
}

.plan-item-title,
.empty-divider-title {
  font-size: 34rpx;
  line-height: 1.36;
  font-weight: 800;
  color: #1f948f;
}

.plan-highlight-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
}

.plan-highlight-card,
.plan-feedback-preview {
  padding: 16rpx;
  border-radius: 20rpx;
  background: #fff6f1;
}

.plan-highlight-value {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.5;
  color: #4e454e;
  font-weight: 700;
}

.plan-feedback-preview-text {
  margin-top: 8rpx;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.empty-board {
  margin-top: 24rpx;
  padding: 14rpx 0 6rpx;
}

.empty-divider {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.empty-divider-line {
  flex: 1;
  height: 2rpx;
  background: rgba(207, 156, 147, 0.5);
}

.empty-illustration {
  margin-top: 28rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  align-items: end;
}

.empty-card {
  min-height: 200rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 12rpx 24rpx rgba(216, 176, 166, 0.16);
  position: relative;
}

.empty-card-left {
  padding: 22rpx 20rpx;
  transform: rotate(-4deg);
}

.empty-card-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #7d6558;
}

.empty-note-lines {
  margin-top: 18rpx;
  display: grid;
  gap: 14rpx;
}

.empty-note-line {
  height: 10rpx;
  border-radius: 999rpx;
  background: rgba(226, 179, 167, 0.72);
}

.empty-card-right {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 18rpx;
  padding: 22rpx;
}

.cup {
  position: relative;
  width: 74rpx;
  height: 94rpx;
  border-radius: 18rpx 18rpx 24rpx 24rpx;
  background: linear-gradient(180deg, #e8c08c, #c98c69);
  box-shadow: inset 0 0 0 3rpx rgba(255, 255, 255, 0.26);
}

.cup::after {
  content: '';
  position: absolute;
  top: 18rpx;
  right: -18rpx;
  width: 18rpx;
  height: 30rpx;
  border: 4rpx solid rgba(193, 132, 112, 0.86);
  border-left: none;
  border-radius: 0 18rpx 18rpx 0;
}

.cup-left {
  background: linear-gradient(180deg, #f0d3aa, #ddb98d);
}

.cup-right {
  background: linear-gradient(180deg, #c98f77, #a96a56);
}

.empty-copy {
  margin-top: 26rpx;
  text-align: center;
}

@media screen and (max-width: 720rpx) {
  .hero-title {
    font-size: 74rpx;
    letter-spacing: 4rpx;
  }

  .intro-title {
    font-size: 42rpx;
  }

  .intro-bottom,
  .empty-illustration {
    flex-direction: column;
    align-items: stretch;
    display: flex;
  }

  .plan-item-card,
  .plan-highlight-row {
    grid-template-columns: 1fr;
  }

  .create-button {
    width: 100%;
  }
}
</style>
