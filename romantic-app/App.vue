<template>
  <slot />
</template>

<script setup>
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { checkAnniversaryReminderPopup } from '@/utils/anniversary-reminder.js'
import { ensureNotificationSocket } from '@/utils/notification-socket.js'
import { applyTheme } from '@/utils/theme.js'

onLaunch(() => {
  applyTheme()
  ensureNotificationSocket()
})

onShow(() => {
  applyTheme()
  checkAnniversaryReminderPopup()
  ensureNotificationSocket()
})
</script>

<style lang="scss">
@import "@/styles/common.scss";
</style>
