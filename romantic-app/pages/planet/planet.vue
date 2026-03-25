<template>
  <view class="page app-page-shell app-page-shell-tabbed planet-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="planet-bg planet-bg-a"></view>
    <view class="planet-bg planet-bg-b"></view>

    <view class="planet-top app-fade-up">
      <view class="planet-brand-wrap">
        <view class="planet-brand-kicker">{{ TEXT.brandKicker }}</view>
        <view class="planet-brand">{{ TEXT.brand }}</view>
        <view class="planet-brand-sub">{{ TEXT.brandSub }}</view>
        <view class="planet-brand-line">
          <view class="planet-brand-sep"></view>
          <view class="planet-brand-icon-wrap">
            <view class="planet-brand-star planet-brand-star-left"></view>
            <view class="planet-brand-icon">{{ TEXT.brandIcon }}</view>
            <view class="planet-brand-star planet-brand-star-right"></view>
          </view>
          <view class="planet-brand-sep"></view>
        </view>
      </view>
    </view>

    <view class="planet-hero app-fade-up app-delay-1">
      <view class="planet-hero-title">{{ TEXT.heroTitle }}</view>
      <view class="planet-hero-desc">{{ TEXT.heroDesc }}</view>
      <view class="planet-chip-row">
        <view class="planet-chip">{{ TEXT.chipAnniversary }}</view>
        <view class="planet-chip">{{ TEXT.chipAlbum }}</view>
        <view class="planet-chip">{{ TEXT.chipPlan }}</view>
      </view>
    </view>

    <view class="planet-grid app-fade-up app-delay-2">
      <view class="planet-card app-card-soft" hover-class="surface-press" hover-stay-time="70" @click="goAnniversary">
        <view class="planet-card-head">
          <view class="status-badge status-badge-open">{{ TEXT.opened }}</view>
        </view>
        <view class="planet-icon planet-icon-frame">
          <view class="icon-calendar">
            <view class="icon-calendar-ring icon-calendar-ring-left"></view>
            <view class="icon-calendar-ring icon-calendar-ring-right"></view>
            <view class="icon-calendar-top"></view>
            <view class="icon-calendar-heart"></view>
            <view class="icon-calendar-dot icon-calendar-dot-a"></view>
            <view class="icon-calendar-dot icon-calendar-dot-b"></view>
            <view class="icon-calendar-dot icon-calendar-dot-c"></view>
            <view class="icon-calendar-dot icon-calendar-dot-d"></view>
          </view>
        </view>
        <view class="planet-card-title">{{ TEXT.anniversaryTitle }}</view>
        <view class="planet-card-desc">{{ TEXT.anniversaryDesc }}</view>
      </view>

      <view class="planet-card app-card-soft" hover-class="surface-press" hover-stay-time="70" @click="goAlbum">
        <view class="planet-card-head">
          <view class="status-badge status-badge-open">{{ TEXT.opened }}</view>
        </view>
        <view class="planet-icon planet-icon-frame">
          <view class="icon-album">
            <view class="icon-album-back"></view>
            <view class="icon-album-front">
              <view class="icon-album-sun"></view>
              <view class="icon-album-mountain icon-album-mountain-left"></view>
              <view class="icon-album-mountain icon-album-mountain-right"></view>
              <view class="icon-album-flower"></view>
            </view>
          </view>
        </view>
        <view class="planet-card-title">{{ TEXT.albumTitle }}</view>
        <view class="planet-card-desc">{{ TEXT.albumDesc }}</view>
      </view>

      <view class="planet-card app-card-soft" hover-class="surface-press" hover-stay-time="70" @click="goImprovement">
        <view class="planet-card-head">
          <view class="status-badge status-badge-open">{{ TEXT.opened }}</view>
        </view>
        <view class="planet-icon planet-icon-frame">
          <view class="icon-book">
            <view class="icon-book-cover icon-book-cover-left"></view>
            <view class="icon-book-cover icon-book-cover-right"></view>
            <view class="icon-book-page"></view>
            <view class="icon-book-line icon-book-line-a"></view>
            <view class="icon-book-line icon-book-line-b"></view>
            <view class="icon-book-pen"></view>
          </view>
        </view>
        <view class="planet-card-title">{{ TEXT.improvementTitle }}</view>
        <view class="planet-card-desc">{{ TEXT.improvementDesc }}</view>
      </view>

      <view class="planet-card planet-card-subtle app-card-soft" hover-class="surface-press" hover-stay-time="70" @click="goComingSoon(TEXT.planTitle)">
        <view class="planet-card-head">
          <view class="status-badge status-badge-reserve">{{ TEXT.reserve }}</view>
        </view>
        <view class="planet-icon planet-icon-frame">
          <view class="icon-grid">
            <view class="icon-grid-cell"></view>
            <view class="icon-grid-cell"></view>
            <view class="icon-grid-cell"></view>
            <view class="icon-grid-cell"></view>
          </view>
        </view>
        <view class="planet-card-title">{{ TEXT.planTitle }}</view>
        <view class="planet-card-desc">{{ TEXT.planDesc }}</view>
      </view>
    </view>

    <BottomTab activeKey="planet" />
  </view>
</template>

<script setup>
import { onMounted } from 'vue'
import { requireAuth } from '@/utils/auth.js'
import { goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import BottomTab from '@/pages/components/BottomTab.vue'
const TEXT = {
  brandKicker: '\u6a21\u5757\u661f\u7403',
  brand: '\u6d6a\u6f2b\u661f\u7403',
  brandSub: '\u628a\u60f3\u7ee7\u7eed\u5b8c\u5584\u7684\u529f\u80fd\u90fd\u6536\u8fdb\u8fd9\u91cc',
  brandIcon: '\u2726',
  heroTitle: '\u628a\u5e38\u7528\u6a21\u5757\u653e\u5728\u66f4\u987a\u624b\u7684\u4f4d\u7f6e',
  heroDesc: '\u8fd9\u91cc\u627f\u63a5\u7eaa\u5ff5\u3001\u76f8\u518c\u3001\u6539\u8fdb\u548c\u540e\u7eed\u4f1a\u7ee7\u7eed\u6269\u5c55\u7684\u80fd\u529b\u3002',
  chipAnniversary: '\u7eaa\u5ff5\u65e5',
  chipAlbum: '\u76f8\u518c',
  chipPlan: '\u8ba1\u5212\u5361',
  opened: '\u5df2\u5f00\u653e',
  reserve: '\u9884\u7559',
  anniversaryTitle: '\u604b\u7231\u7eaa\u5ff5\u65e5',
  anniversaryDesc: '\u7eaa\u5ff5\u65e5\u8bb0\u5f55',
  albumTitle: '\u751c\u871c\u76f8\u518c',
  albumDesc: '\u7167\u7247\u8bb0\u5f55',
  improvementTitle: '\u604b\u7231\u6539\u8fdb\u7c3f',
  improvementDesc: '\u6539\u8fdb\u8bb0\u5f55',
  planTitle: '\u6d6a\u6f2b\u8ba1\u5212',
  planDesc: '\u8ba1\u5212\u8bb0\u5f55'
}

const { themeStyle } = useThemePage()

function goComingSoon(title) { goPage(`/pages/modules/coming-soon/index?title=${encodeURIComponent(title)}`) }
function goAnniversary() { goPage('/pages/modules/anniversary/index') }
function goAlbum() { goPage('/pages/modules/album/index') }
function goImprovement() { goPage('/pages/modules/improvement/index') }

onMounted(() => {
  requireAuth()
})
</script>

<style scoped>
  .planet-page {
    --planet-accent: var(--app-color-primary);
    --planet-accent-strong: var(--app-color-primary-strong);
    --planet-accent-soft: var(--app-color-primary-soft);
    --planet-text-main: var(--app-color-text-strong);
    --planet-text-sub: var(--app-color-text);
    --planet-surface: rgba(255, 255, 255, 0.96);
    --planet-surface-soft: var(--app-color-surface-soft);
    --planet-border: rgba(255, 255, 255, 0.72);
    --planet-shadow: var(--app-shadow-card);
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at top, rgba(255, 255, 255, 0.94), rgba(255, 248, 241, 0.92)),
      var(--app-page-gradient-soft);
  }

  .planet-bg {
    position: absolute;
    border-radius: 50%;
    filter: blur(10rpx);
    opacity: 0.58;
  }

  .planet-bg-a {
    width: 240rpx;
    height: 240rpx;
    top: 220rpx;
    right: -70rpx;
    background: color-mix(in srgb, var(--planet-accent-soft) 26%, #ffd7c0 74%);
  }

  .planet-bg-b {
    width: 220rpx;
    height: 220rpx;
    left: -80rpx;
    bottom: 280rpx;
    background: color-mix(in srgb, var(--planet-accent-soft) 18%, #deebd0 82%);
  }

  .planet-top,
  .planet-hero,
  .planet-grid {
    position: relative;
    z-index: 2;
  }

  .planet-top {
    margin-top: 8rpx;
  }

  .planet-brand-wrap {
    text-align: center;
  }

  .planet-brand-kicker {
    font-size: 20rpx;
    letter-spacing: 6rpx;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--planet-accent-soft) 56%, #d5c3aa 44%);
  }

  .planet-brand {
    margin-top: 8rpx;
    font-size: 66rpx;
    line-height: 1.02;
    font-weight: 500;
    letter-spacing: 2rpx;
    color: var(--planet-accent);
  }

  .planet-brand-sub {
    margin-top: 10rpx;
    font-size: 24rpx;
    line-height: 1.6;
    color: color-mix(in srgb, var(--planet-text-sub) 70%, #d1c0b1 30%);
  }

  .planet-brand-line {
    margin-top: 14rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18rpx;
    color: color-mix(in srgb, var(--planet-accent-soft) 60%, #d9c3a2 40%);
  }

  .planet-brand-sep {
    width: 118rpx;
    height: 2rpx;
    background: linear-gradient(90deg, rgba(219, 192, 154, 0), rgba(219, 192, 154, 0.8), rgba(219, 192, 154, 0));
  }

  .planet-brand-icon-wrap {
    display: inline-flex;
    align-items: center;
    gap: 12rpx;
  }

  .planet-brand-icon {
    font-size: 26rpx;
    line-height: 1;
  }

  .planet-brand-star {
    width: 10rpx;
    height: 10rpx;
    border-radius: 50%;
    background: linear-gradient(180deg, #efe3d0, #d9c0a2);
    box-shadow: 0 0 0 6rpx rgba(255, 255, 255, 0.24);
  }

  .planet-brand-star-left { transform: scale(0.88); }
  .planet-brand-star-right { transform: scale(1.02); }

  .planet-hero {
    margin-top: 28rpx;
    padding: 30rpx 28rpx;
    border-radius: 34rpx;
    background: linear-gradient(180deg, var(--planet-surface), color-mix(in srgb, var(--planet-surface-soft) 55%, #fff9f4 45%));
    box-shadow: var(--planet-shadow), inset 0 0 0 2rpx var(--planet-border);
  }

  .planet-hero-title {
    font-size: 34rpx;
    line-height: 1.5;
    font-weight: 600;
    color: var(--planet-text-main);
  }

  .planet-hero-desc {
    margin-top: 12rpx;
    font-size: 25rpx;
    line-height: 1.8;
    color: var(--planet-text-sub);
  }

  .planet-chip-row {
    margin-top: 18rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx;
  }

  .planet-chip {
    padding: 10rpx 18rpx;
    border-radius: 999rpx;
    background: color-mix(in srgb, var(--planet-accent-soft) 20%, #fff4f7 80%);
    color: var(--planet-accent-strong);
    font-size: 22rpx;
    font-weight: 700;
  }

  .planet-grid {
    margin-top: 22rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
  }

  .planet-card {
    min-height: 248rpx;
    padding: 22rpx;
    border-radius: 34rpx;
    background:
      radial-gradient(circle at 25% 92%, rgba(255, 231, 217, 0.3), transparent 26%),
      radial-gradient(circle at 82% 88%, rgba(228, 236, 208, 0.25), transparent 22%),
      linear-gradient(180deg, var(--planet-surface), color-mix(in srgb, var(--planet-surface-soft) 55%, #fff9f4 45%));
    box-shadow: var(--planet-shadow), inset 0 0 0 2rpx var(--planet-border);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  .surface-press {
    transform: translateY(2rpx) scale(0.986);
    box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.08);
  }
  .planet-card-subtle { opacity: 0.94; }

  .planet-card-head {
    display: flex;
    justify-content: flex-end;
  }

  .status-badge {
    min-width: 108rpx;
    padding: 10rpx 16rpx;
    border-radius: 999rpx;
    text-align: center;
    font-size: 21rpx;
    font-weight: 700;
    box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.45);
  }

  .status-badge-open {
    background: color-mix(in srgb, var(--planet-accent-soft) 20%, #fff4f7 80%);
    color: var(--planet-accent-strong);
  }

  .status-badge-reserve {
    background: #f7f4ee;
    color: var(--planet-text-sub);
  }

  .planet-icon {
    margin-top: 6rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .planet-icon-frame {
    height: 90rpx;
  }

  .planet-card-title {
    margin-top: 14rpx;
    text-align: center;
    font-size: 29rpx;
    line-height: 1.42;
    font-weight: 600;
    color: var(--planet-text-main);
  }

  .planet-card-desc {
    margin-top: 8rpx;
    text-align: center;
    font-size: 23rpx;
    line-height: 1.65;
    color: var(--planet-text-sub);
  }

  .icon-album {
    position: relative;
    width: 96rpx;
    height: 74rpx;
  }

  .icon-album-back,
  .icon-album-front {
    position: absolute;
    border-radius: 12rpx;
    background: #fff9ef;
    box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.06);
  }

  .icon-album-back {
    width: 64rpx;
    height: 52rpx;
    right: 6rpx;
    top: 12rpx;
    background: rgba(236, 224, 207, 0.7);
    transform: rotate(8deg);
  }

  .icon-album-front {
    width: 72rpx;
    height: 56rpx;
    left: 8rpx;
    top: 6rpx;
    overflow: hidden;
  }

  .icon-album-sun {
    position: absolute;
    top: 10rpx;
    left: 12rpx;
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background: #f1dcc3;
  }

  .icon-album-mountain {
    position: absolute;
    bottom: 8rpx;
    border-bottom: 26rpx solid #b7c29b;
    border-left: 16rpx solid transparent;
    border-right: 16rpx solid transparent;
  }

  .icon-album-mountain-left { left: 8rpx; }
  .icon-album-mountain-right { right: 8rpx; border-bottom-color: #94a56f; }

  .icon-album-flower {
    position: absolute;
    right: 2rpx;
    bottom: 0;
    width: 22rpx;
    height: 22rpx;
    border-radius: 50%;
    background:
      radial-gradient(circle at 50% 30%, #fff7ef 0 5rpx, transparent 6rpx),
      radial-gradient(circle at 30% 60%, #f0d7c7 0 6rpx, transparent 7rpx),
      radial-gradient(circle at 70% 60%, #f0d7c7 0 6rpx, transparent 7rpx),
      radial-gradient(circle at 50% 80%, #f0d7c7 0 6rpx, transparent 7rpx);
  }

  .icon-calendar {
    position: relative;
    width: 82rpx;
    height: 74rpx;
    border-radius: 16rpx;
    background: #fffaf3;
    box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .icon-calendar-top {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 22rpx;
    background: linear-gradient(180deg, #d8b779, #e7c998);
  }

  .icon-calendar-ring {
    position: absolute;
    top: -4rpx;
    width: 8rpx;
    height: 18rpx;
    border-radius: 999rpx;
    background: #f5efe4;
    box-shadow: 0 0 0 2rpx rgba(210, 186, 150, 0.45);
    z-index: 2;
  }

  .icon-calendar-ring-left { left: 18rpx; }
  .icon-calendar-ring-right { right: 18rpx; }

  .icon-calendar-heart {
    position: absolute;
    top: 28rpx;
    left: 31rpx;
    width: 20rpx;
    height: 18rpx;
    transform: rotate(-45deg);
    background: #e7a08f;
  }

  .icon-calendar-heart::before,
  .icon-calendar-heart::after {
    content: '';
    position: absolute;
    width: 20rpx;
    height: 18rpx;
    border-radius: 50%;
    background: #e7a08f;
  }

  .icon-calendar-heart::before { top: -10rpx; left: 0; }
  .icon-calendar-heart::after { left: 10rpx; top: 0; }

  .icon-calendar-dot {
    position: absolute;
    width: 6rpx;
    height: 6rpx;
    border-radius: 50%;
    background: rgba(211, 193, 168, 0.8);
  }

  .icon-calendar-dot-a { left: 16rpx; bottom: 18rpx; }
  .icon-calendar-dot-b { left: 28rpx; bottom: 18rpx; }
  .icon-calendar-dot-c { right: 28rpx; bottom: 18rpx; }
  .icon-calendar-dot-d { right: 16rpx; bottom: 18rpx; }

  .icon-book {
    position: relative;
    width: 92rpx;
    height: 72rpx;
  }

  .icon-book-cover {
    position: absolute;
    top: 10rpx;
    width: 36rpx;
    height: 48rpx;
    border-radius: 8rpx;
  }

  .icon-book-cover-left { left: 10rpx; background: #aebc94; transform: skewY(-8deg); }
  .icon-book-cover-right { right: 10rpx; background: #f4ead8; transform: skewY(8deg); }

  .icon-book-page {
    position: absolute;
    left: 26rpx;
    right: 26rpx;
    top: 6rpx;
    bottom: 10rpx;
    border-radius: 6rpx;
    background: #fffaf2;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  }

  .icon-book-line {
    position: absolute;
    left: 34rpx;
    right: 36rpx;
    height: 3rpx;
    border-radius: 999rpx;
    background: rgba(206, 189, 163, 0.82);
  }

  .icon-book-line-a { top: 24rpx; }
  .icon-book-line-b { top: 34rpx; }

  .icon-book-pen {
    position: absolute;
    right: 6rpx;
    bottom: 8rpx;
    width: 34rpx;
    height: 10rpx;
    border-radius: 999rpx;
    background: linear-gradient(90deg, #d4ae67, #c8954f);
    transform: rotate(-34deg);
  }

  .icon-book-pen::after {
    content: '';
    position: absolute;
    right: -8rpx;
    top: 0;
    border-left: 10rpx solid #d9c4a8;
    border-top: 5rpx solid transparent;
    border-bottom: 5rpx solid transparent;
  }

  .icon-grid {
    width: 68rpx;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10rpx;
  }

  .icon-grid-cell {
    width: 28rpx;
    height: 28rpx;
    border-radius: 8rpx;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(247, 241, 232, 0.98));
    box-shadow: inset 0 0 0 2rpx rgba(230, 218, 199, 0.96);
  }

</style>
