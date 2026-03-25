<template>
  <view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader title="数据管理" eyebrow="资料与同步" />
    </view>
    <view class="app-account-content">
      <AccountPanel title="资料操作">
        <view class="app-account-action-row data-action-row">
          <button class="ghost-btn app-account-flat-btn app-account-flat-btn-soft" @click="handleResetProfile">恢复默认资料</button>
          <button class="ghost-btn warn app-account-flat-btn app-account-flat-btn-warn" @click="handleSyncRemoteProfile">重新同步资料</button>
        </view>
      </AccountPanel>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { requireAuth } from '@/utils/auth.js'
import { clearAvatarDraft } from '@/utils/avatar.js'
import { saveProfile } from '@/utils/profile.js'
import { fetchRemoteProfile, resetRemoteProfile } from '@/services/profile.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const { themeStyle } = useThemePage()

onLoad(() => {
  requireAuth()
})

async function handleResetProfile() {
  try {
    await resetRemoteProfile()
    uni.showToast({ title: '已恢复默认资料', icon: 'none' })
  } catch (error) {
    uni.showToast({ title: error?.message || '恢复默认资料失败', icon: 'none' })
  }
}

async function handleSyncRemoteProfile() {
  try {
    clearAvatarDraft()
    const remoteProfile = await fetchRemoteProfile({ allowOfflineFallback: false })
    saveProfile(remoteProfile)
    uni.showToast({ title: '已重新同步资料', icon: 'none' })
  } catch (error) {
    uni.showToast({ title: error?.message || '重新同步资料失败', icon: 'none' })
  }
}
</script>

<style scoped>
.data-action-row {
  grid-template-columns: repeat(2, 1fr) !important;
}
</style>
