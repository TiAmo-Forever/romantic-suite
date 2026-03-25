const OFFLINE_FLAG_KEY = 'romantic_server_offline'
const OFFLINE_MESSAGE = '当前采用离线数据，操作后不会更新'

let offlineModalShown = false

export function isServerOffline() {
	return !!uni.getStorageSync(OFFLINE_FLAG_KEY)
}

export function markServerOnline() {
	uni.removeStorageSync(OFFLINE_FLAG_KEY)
	offlineModalShown = false
}

export function markServerOffline(message = OFFLINE_MESSAGE) {
	uni.setStorageSync(OFFLINE_FLAG_KEY, true)

	if (offlineModalShown) {
		return
	}

	offlineModalShown = true
	uni.showModal({
		title: '网络异常',
		content: message,
		showCancel: false,
		confirmText: '我知道了'
	})
}

export function ensureServerWritable() {
	if (!isServerOffline()) {
		return true
	}

	uni.showToast({
		title: '离线模式下不支持修改',
		icon: 'none'
	})
	return false
}

export function getOfflineReadonlyHint() {
	return '当前采用离线数据，暂不支持修改'
}