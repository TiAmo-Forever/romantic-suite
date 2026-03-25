<template>
  <view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader title="数据管理" eyebrow="资料与同步" />
    </view>
    <view class="app-account-content">
      <view class="app-account-stack">
        <AccountIntroCard
          eyebrow="谨慎操作"
          title="在这里管理当前账号的资料同步"
          description="如果你想把本地资料重新和服务端对齐，或者回到默认资料状态，可以在这里操作。请先确认这是不是你现在真正想要的结果。"
          :tags="['仅影响当前账号', '不会直接删除共享模块内容']"
        />
        <AccountPanel title="资料操作" description="恢复默认会重置当前账号资料；重新同步会以服务端资料为准回填本地缓存。">
          <view class="app-account-action-row data-action-row">
            <button class="ghost-btn app-account-flat-btn app-account-flat-btn-soft" @click="handleResetProfile">恢复默认资料</button>
            <button class="ghost-btn warn app-account-flat-btn app-account-flat-btn-warn" @click="handleSyncRemoteProfile">重新同步资料</button>
          </view>
        </AccountPanel>
        <view class="app-account-action-note">
          <view class="app-account-action-note-title">操作前先确认当前意图</view>
          <view class="app-account-action-note-desc">如果只是想改头像、名字、邮箱或关系信息，建议回到对应设置页直接修改，不必先做重置或同步。</view>
        </view>
      </view>
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
import AccountIntroCard from '@/pages/account/components/AccountIntroCard.vue'
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
