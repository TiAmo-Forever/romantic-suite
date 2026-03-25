import { backPage } from '@/utils/nav.js'
import { updateRemotePassword, updateRemoteProfile } from '@/services/profile.js'
import { redirectToLogin } from '@/utils/auth.js'

export function finishSettingsSave(title = '已保存', delay = 250) {
  uni.showToast({
    title,
    icon: 'success'
  })
  setTimeout(() => {
    backPage()
  }, delay)
}

export async function saveProfilePatchAndBack(patch, title = '已保存', delay = 250) {
  await updateRemoteProfile(patch)
  finishSettingsSave(title, delay)
}

export async function savePasswordAndBack(password, title = '已保存', delay = 250) {
  await updateRemotePassword(password)
  uni.showToast({
    title,
    icon: 'success'
  })
  setTimeout(() => {
    redirectToLogin('密码已修改，请重新登录')
  }, delay)
}
