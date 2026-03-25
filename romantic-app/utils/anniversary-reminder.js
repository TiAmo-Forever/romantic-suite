import { isLogin } from '@/utils/auth.js'
import { checkAnniversaryReminders } from '@/services/anniversaries.js'

let checking = false

export async function checkAnniversaryReminderPopup() {
  if (checking || !isLogin()) {
    return
  }

  checking = true
  try {
    const reminders = await checkAnniversaryReminders()
    if (!Array.isArray(reminders) || !reminders.length) {
      return
    }

    const content = reminders
      .map((item) => `${item.title}（${item.eventDate}）`)
      .join('\n')

    uni.showModal({
      title: '纪念日提醒',
      content,
      showCancel: false,
      confirmText: '知道了'
    })
  } catch (error) {
    // 提醒检查失败时不影响应用继续使用。
  } finally {
    checking = false
  }
}
