<template>
  <view class="page app-page-shell app-page-shell-tabbed album-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader :title="TEXT.albumTitle" :eyebrow="TEXT.albumEyebrow" />
    </view>

    <view class="album-hero app-fade-up">
      <view class="album-hero-content">
        <view class="album-kicker">{{ TEXT.heroKicker }}</view>
        <view class="album-title">{{ featuredMemory?.title || TEXT.albumTitle }}</view>
        <view class="album-meta">{{ featuredMetaText }}</view>
        <view class="album-summary">{{ featuredMemory?.summary || TEXT.heroSummary }}</view>
        <button class="album-create-btn app-primary-btn app-primary-btn-shadow" @click="handleCreate">
          {{ TEXT.createButton }}
        </button>
      </view>

      <view class="album-hero-stack">
        <view class="hero-photo hero-photo-back"></view>
        <view class="hero-photo hero-photo-front">
          <image v-if="featuredCover" class="hero-photo-image" :src="featuredCover" mode="aspectFill" />
          <view v-else class="hero-photo-fallback"></view>
          <view class="hero-photo-badge">{{ featuredCountText }}</view>
        </view>
      </view>
    </view>

    <view class="filter-row app-fade-up app-delay-1">
      <view
        v-for="item in filters"
        :key="item.key"
        class="filter-chip"
        :class="{ active: activeFilter === item.key }"
        @click="switchFilter(item.key)"
      >
        {{ item.label }}
      </view>
    </view>

    <view v-if="filteredGroups.length" class="memory-group-list app-fade-up app-delay-2">
      <view v-for="group in filteredGroups" :key="group.key" class="memory-group">
        <view class="group-head">
          <view>
            <view class="group-title">{{ group.label }}</view>
            <view class="group-sub">{{ group.items.length }} {{ TEXT.groupUnit }}</view>
          </view>
          <view class="group-chip">{{ group.range }}</view>
        </view>

        <view class="memory-card-list">
          <view
            v-for="item in group.items"
            :key="item.id"
            class="memory-card app-card-soft"
            hover-class="memory-card-active"
            hover-stay-time="70"
            @click="openMemory(item)"
          >
            <view class="memory-cover">
              <image
                v-if="resolveCover(item)"
                class="memory-cover-bg"
                :src="resolveCover(item)"
                mode="aspectFill"
              />
              <view class="memory-cover-overlay"></view>

              <view class="memory-cover-top">
                <view class="memory-cover-chip">{{ item.tags[0] || TEXT.memoryWord }}</view>
                <view class="memory-cover-count">{{ item.imageCount }} {{ TEXT.imageCountSuffix }}</view>
              </view>

              <view class="memory-cover-bottom">
                <view class="memory-cover-date">{{ item.memoryDate }}</view>
                <view v-if="item.videoCount" class="memory-cover-video">{{ item.videoCount }} {{ TEXT.videoCountSuffix }}</view>
              </view>
            </view>

            <view class="memory-body">
              <view class="memory-title app-line-clamp-2">{{ item.title }}</view>
              <view v-if="item.location" class="memory-location app-line-clamp-1">{{ item.location }}</view>
              <view v-if="item.summary" class="memory-summary app-line-clamp-2">{{ item.summary }}</view>
              <view v-if="item.tags.length" class="memory-tags">
                <view v-for="tag in item.tags.slice(0, 4)" :key="tag" class="memory-tag">{{ tag }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty-card app-card-soft app-fade-up app-delay-2">
      <view class="empty-icon">{{ TEXT.emptyIcon }}</view>
      <view class="empty-title">{{ TEXT.emptyTitle }}</view>
      <view class="empty-desc">{{ TEXT.emptyDesc }}</view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { fetchAlbumMemoryList } from '@/services/albums.js'
import { requireAuth } from '@/utils/auth.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'

const TEXT = {
  albumTitle: '\u751c\u871c\u76f8\u518c',
  albumEyebrow: '\u56de\u5fc6\u6536\u85cf',
  heroKicker: '\u672c\u6708\u56de\u5fc6',
  heroSummary: '\u628a\u89c1\u9762\u3001\u65c5\u884c\u3001\u751f\u65e5\u548c\u7eaa\u5ff5\u65e5\u90fd\u6536\u8fdb\u4e00\u518c\u3002',
  createButton: '\u65b0\u5efa\u56de\u5fc6',
  groupUnit: '\u6bb5\u56de\u5fc6',
  memoryWord: '\u56de\u5fc6',
  imageCountSuffix: '\u5f20\u56fe',
  videoCountSuffix: '\u4e2a\u89c6\u9891',
  emptyIcon: '\u76f8\u518c',
  emptyTitle: '\u8fd8\u6ca1\u6709\u56de\u5fc6',
  emptyDesc: '\u5148\u65b0\u5efa\u4e00\u6bb5\u5c5e\u4e8e\u4f60\u4eec\u7684\u751c\u871c\u8bb0\u5f55\u5427\u3002',
  all: '\u5168\u90e8',
  month: '\u672c\u6708',
  year: '\u4eca\u5e74',
  heroFallbackMeta: '\u628a\u6bcf\u6b21\u89c1\u9762\u90fd\u6536\u8fdb\u65f6\u95f4\u91cc',
  countSeparator: ' \u00b7 ',
  ungrouped: '\u672a\u5206\u7ec4'
}

const { themeStyle } = useThemePage()
const activeFilter = ref('all')
const memoryList = ref([])

const filters = [
  { key: 'all', label: TEXT.all },
  { key: 'month', label: TEXT.month },
  { key: 'year', label: TEXT.year }
]

const featuredMemory = computed(() => memoryList.value[0] || null)
const featuredCover = computed(() => resolveCover(featuredMemory.value))
const featuredMetaText = computed(() => {
  if (!featuredMemory.value) return TEXT.heroFallbackMeta
  return [featuredMemory.value.memoryDate, featuredMemory.value.location].filter(Boolean).join(TEXT.countSeparator)
})
const featuredCountText = computed(() => {
  if (!featuredMemory.value) return TEXT.memoryWord
  const imageCount = Number(featuredMemory.value.imageCount || 0)
  const videoCount = Number(featuredMemory.value.videoCount || 0)
  if (imageCount && videoCount) {
    return `${imageCount} ${TEXT.imageCountSuffix}${TEXT.countSeparator}${videoCount} ${TEXT.videoCountSuffix}`
  }
  if (videoCount) {
    return `${videoCount} ${TEXT.videoCountSuffix}`
  }
  return `${imageCount || 0} ${TEXT.imageCountSuffix}`
})

const filteredGroups = computed(() => {
  const list = memoryList.value.filter((item) => matchFilter(item, activeFilter.value))
  const map = new Map()

  list.forEach((item) => {
    const key = String(item.memoryDate || '').slice(0, 7) || TEXT.ungrouped
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key).push(item)
  })

  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: formatGroupLabel(key),
    range: formatGroupRange(items),
    items
  }))
})

onShow(async () => {
  if (!requireAuth()) return
  await loadList()
})

async function loadList() {
  try {
    memoryList.value = await fetchAlbumMemoryList()
  } catch (error) {
    uni.showToast({ title: error?.message || '\u751c\u871c\u76f8\u518c\u52a0\u8f7d\u5931\u8d25', icon: 'none' })
  }
}

function switchFilter(filterKey) {
  activeFilter.value = filterKey
}

function matchFilter(item, filterKey) {
  if (filterKey === 'all') return true
  const now = new Date()
  const year = String(now.getFullYear())
  const month = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`
  if (filterKey === 'year') return String(item.memoryDate || '').startsWith(year)
  if (filterKey === 'month') return String(item.memoryDate || '').startsWith(month)
  return true
}

function formatGroupLabel(key) {
  if (!key || key === TEXT.ungrouped) return TEXT.ungrouped
  const [year, month] = key.split('-')
  return `${year}\u5e74${Number(month)}\u6708`
}

function formatGroupRange(items) {
  const dates = items.map((item) => String(item.memoryDate || '')).filter(Boolean).sort()
  if (!dates.length) return ''
  const first = dates[0].slice(5)
  const last = dates[dates.length - 1].slice(5)
  return first === last ? first : `${first} - ${last}`
}

function handleCreate() {
  goPage('/pages/modules/album/edit')
}

function openMemory(item) {
  goPage(`/pages/modules/album/detail?id=${item.id}`)
}

function resolveCover(item) {
  if (!item) return ''
  const firstMedia = Array.isArray(item.mediaList) ? item.mediaList[0] : null
  const coverPath = item.coverUrl || firstMedia?.thumbnailUrl || firstMedia?.fileUrl || ''
  return resolveMediaUrl(coverPath)
}
</script>

<style scoped>
  .app-account-topbar-shell {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(255, 250, 252, 0.88);
  }
  .album-page {
    background:
      radial-gradient(circle at 12% 10%, rgba(255, 208, 225, 0.42), transparent 26%),
      radial-gradient(circle at 88% 18%, rgba(255, 234, 197, 0.38), transparent 22%),
      linear-gradient(180deg, #fff9fb 0%, #fff6f8 52%, #fffaf6 100%);
  }
  .album-hero {
    position: relative;
    overflow: hidden;
    padding: 38rpx 34rpx 34rpx;
    border-radius: 34rpx;
    background: linear-gradient(135deg, rgba(255, 248, 251, 0.98), rgba(255, 240, 245, 0.96));
    box-shadow: 0 26rpx 52rpx rgba(227, 152, 181, 0.14);
    min-height: 320rpx;
  }
  .album-hero-content {
    position: relative;
    z-index: 1;
    max-width: 62%;
  }
  .album-kicker {
    font-size: 22rpx;
    font-weight: 700;
    color: #c88498;
    letter-spacing: 4rpx;
  }
  .album-title {
    margin-top: 14rpx;
    font-size: 48rpx;
    line-height: 1.14;
    color: #4f63d8;
    font-weight: 800;
  }
  .album-meta {
    margin-top: 14rpx;
    font-size: 24rpx;
    color: #b28594;
  }
  .album-summary {
    margin-top: 14rpx;
    font-size: 25rpx;
    line-height: 1.7;
    color: #926d79;
  }
  .album-create-btn {
    width: 220rpx;
    margin: 26rpx 0 0;
  }
  .album-hero-stack {
    position: absolute;
    right: 36rpx;
    top: 38rpx;
    width: 208rpx;
    height: 224rpx;
  }
  .hero-photo {
    position: absolute;
    width: 168rpx;
    height: 212rpx;
    border-radius: 28rpx;
    box-shadow: 0 18rpx 40rpx rgba(220, 148, 176, 0.18);
    overflow: hidden;
  }
  .hero-photo-back {
    right: 0;
    top: 18rpx;
    transform: rotate(10deg);
    background: linear-gradient(135deg, #ffd6e4, #ffe7ef);
  }
  .hero-photo-front {
    left: 10rpx;
    top: 0;
    transform: rotate(-8deg);
    background: linear-gradient(135deg, #ffe2ec, #fff5f8);
  }
  .hero-photo-image,
  .hero-photo-fallback {
    width: 100%;
    height: 100%;
    display: block;
  }
  .hero-photo-fallback {
    background: linear-gradient(135deg, #ffbfd3, #ffe8ef);
  }
  .hero-photo-badge {
    position: absolute;
    left: 18rpx;
    bottom: 18rpx;
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.82);
    font-size: 22rpx;
    color: #c06a88;
    font-weight: 700;
  }
  .filter-row {
    display: flex;
    gap: 16rpx;
    margin-top: 26rpx;
    flex-wrap: wrap;
  }
  .filter-chip {
    padding: 12rpx 26rpx;
    border-radius: 999rpx;
    background: rgba(255, 245, 248, 0.92);
    color: #bf8095;
    font-size: 24rpx;
    font-weight: 700;
    box-shadow: inset 0 0 0 2rpx rgba(255, 220, 230, 0.72);
  }
  .filter-chip.active {
    background: linear-gradient(135deg, #ff7fa8, #ff9fba);
    color: #fff;
    box-shadow: none;
  }
  .memory-group-list {
    margin-top: 28rpx;
    display: grid;
    gap: 24rpx;
  }
  .memory-group {
    display: grid;
    gap: 16rpx;
  }
  .group-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }
  .group-title {
    font-size: 30rpx;
    font-weight: 800;
    color: #6e5b67;
  }
  .group-sub {
    margin-top: 6rpx;
    font-size: 22rpx;
    color: #b18a98;
  }
  .group-chip {
    padding: 10rpx 18rpx;
    border-radius: 999rpx;
    background: rgba(255, 246, 234, 0.95);
    color: #c2926c;
    font-size: 22rpx;
    font-weight: 700;
  }
  .memory-card-list {
    display: grid;
    gap: 18rpx;
  }
  .memory-card {
    overflow: hidden;
    border-radius: 30rpx;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 18rpx 36rpx rgba(219, 153, 176, 0.12);
  }
  .memory-card-active {
    transform: translateY(-2rpx) scale(0.995);
  }
  .memory-cover {
    position: relative;
    min-height: 220rpx;
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    background: linear-gradient(135deg, #fff3f7, #fffafc);
  }
  .memory-cover-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    filter: blur(16rpx) saturate(1.08);
    transform: scale(1.14);
    opacity: 0.82;
  }
  .memory-cover-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 249, 251, 0.4)),
      linear-gradient(135deg, rgba(255, 239, 245, 0.3), rgba(255, 252, 248, 0.18));
  }
  .memory-cover-top,
  .memory-cover-bottom {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
  }
  .memory-cover-chip,
  .memory-cover-count,
  .memory-cover-date,
  .memory-cover-video {
    padding: 8rpx 14rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.76);
    font-size: 22rpx;
    font-weight: 700;
    color: #946a79;
  }
  .memory-body {
    padding: 24rpx 24rpx 26rpx;
  }
  .memory-title {
    font-size: 34rpx;
    line-height: 1.28;
    color: #4e61d7;
    font-weight: 800;
  }
  .memory-location {
    margin-top: 12rpx;
    font-size: 23rpx;
    color: #bb8796;
  }
  .memory-summary {
    margin-top: 12rpx;
    font-size: 25rpx;
    line-height: 1.7;
    color: #896774;
  }
  .memory-tags {
    margin-top: 16rpx;
    display: flex;
    gap: 12rpx;
    flex-wrap: wrap;
  }
  .memory-tag {
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: #fff5f8;
    color: #c36f8f;
    font-size: 22rpx;
    font-weight: 700;
  }
  .empty-card {
    margin-top: 30rpx;
    padding: 48rpx 32rpx;
    text-align: center;
  }
  .empty-icon {
    font-size: 40rpx;
    color: #ff8dac;
    font-weight: 800;
  }
  .empty-title {
    margin-top: 16rpx;
    font-size: 30rpx;
    font-weight: 800;
    color: #6f5966;
  }
  .empty-desc {
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #a07d8a;
  }
</style>
