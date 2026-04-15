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
          <text class="back-chip-arrow">‹</text>
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
          <view class="intro-title">把想认真完成的事情，拆成你们一起执行的小计划</view>
          <view class="intro-desc">支持按日程、按周期、按阶段来安排，也能随手记录每天的实际反馈。</view>

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
          <view class="list-intro">先从最重要的一件事开始，把它慢慢变成你们的共同节奏。</view>

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
              <view class="plan-item-cover">
                <image v-if="item.coverUrl" class="plan-item-image" :src="item.coverUrl" mode="aspectFill" />
                <view v-else class="plan-item-cover-placeholder">
                  <view class="plan-item-cover-type">{{ resolveTypeLabel(item.planType) }}</view>
                  <view class="plan-item-cover-copy">封面待补充</view>
                </view>
              </view>

              <view class="plan-item-main">
                <view class="plan-item-top">
                  <view class="plan-type-pill" :class="`plan-type-${item.planType}`">{{ resolveTypeLabel(item.planType) }}</view>
                  <view class="plan-status-pill" :class="`plan-status-${item.status}`">{{ resolveStatusLabel(item.status) }}</view>
                </view>

                <view class="plan-item-title">{{ item.title }}</view>
                <view class="plan-item-desc">{{ item.description || '先把目标定下来，再慢慢补齐执行节奏。' }}</view>

                <view class="plan-meta-board">
                  <view class="plan-meta-cell">
                    <view class="plan-meta-label">周期</view>
                    <view class="plan-meta-value">{{ item.scheduleSummary || '待补充' }}</view>
                  </view>
                  <view class="plan-meta-cell">
                    <view class="plan-meta-label">下一步</view>
                    <view class="plan-meta-value">{{ item.nextExecuteLabel || '待安排' }}</view>
                  </view>
                  <view class="plan-meta-cell">
                    <view class="plan-meta-label">条目</view>
                    <view class="plan-meta-value">{{ item.completedItemCount || 0 }}/{{ item.totalItemCount || 0 }}</view>
                  </view>
                  <view class="plan-meta-cell">
                    <view class="plan-meta-label">互动</view>
                    <view class="plan-meta-value">{{ item.likeCount || 0 }} 赞 · {{ item.commentList?.length || 0 }} 评</view>
                  </view>
                </view>

                <view class="plan-item-footer">
                  <view class="plan-owner">{{ resolveOwnerText(item) }}</view>
                  <view class="plan-link">查看详情</view>
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

            <view class="empty-copy">
              从减脂安排、洗头提醒、订婚筹备这些小目标开始，慢慢把未来排进日常里。
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { fetchRomanticPlanList } from '@/services/romantic-plans.js'
import { requireAuth } from '@/utils/auth.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'

const filters = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'draft', label: '草稿' }
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

// 中文注释：这里继续走服务端筛选，页面只负责展示当前筛选结果，不重复在前端再套一层过滤。
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

function resolveOwnerText(item) {
  const creator = item?.creatorNickname || item?.creatorUsername || '共同创建'
  const updater = item?.updaterNickname || item?.updaterUsername || creator
  return `${creator} 发起，最近由 ${updater} 更新`
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
  gap: 8rpx;
  color: #c67f82;
  font-size: 24rpx;
  font-weight: 700;
}

.back-chip-arrow {
  font-size: 38rpx;
  line-height: 1;
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
  padding: 40rpx 24rpx 24rpx;
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
.empty-copy {
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
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.92);
  display: grid;
  grid-template-columns: 180rpx minmax(0, 1fr);
  gap: 18rpx;
}

.plan-item-card-active {
  transform: scale(0.992);
}

.plan-item-cover {
  overflow: hidden;
  border-radius: 24rpx;
  background: #f4e4df;
  min-height: 180rpx;
}

.plan-item-image {
  width: 100%;
  height: 100%;
}

.plan-item-cover-placeholder {
  width: 100%;
  height: 100%;
  min-height: 180rpx;
  padding: 22rpx 18rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: linear-gradient(180deg, #f8ede7 0%, #ebd2ca 100%);
}

.plan-item-cover-type {
  font-size: 24rpx;
  font-weight: 700;
  color: #715258;
}

.plan-item-cover-copy {
  margin-top: 8rpx;
  font-size: 20rpx;
  line-height: 1.6;
  color: #886d72;
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

.plan-item-title,
.empty-divider-title {
  font-size: 34rpx;
  line-height: 1.36;
  font-weight: 800;
  color: #1f948f;
}

.plan-meta-board {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}

.plan-meta-cell {
  padding: 16rpx;
  border-radius: 20rpx;
  background: #fff6f1;
}

.plan-meta-label,
.plan-owner,
.plan-link {
  font-size: 20rpx;
  color: #9b8a90;
}

.plan-meta-value {
  margin-top: 6rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: #4e454e;
  font-weight: 700;
}

.plan-link {
  color: #d36e73;
  font-weight: 700;
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
  .plan-item-card,
  .empty-illustration,
  .plan-meta-board {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .plan-item-card {
    display: grid;
  }

  .create-button {
    width: 100%;
  }
}
</style>
