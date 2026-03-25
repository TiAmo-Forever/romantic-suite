const ANNIVERSARY_CACHE_KEY = 'romantic_anniversary_list'

export function saveAnniversaryListCache(list) {
  uni.setStorageSync(ANNIVERSARY_CACHE_KEY, Array.isArray(list) ? list : [])
}

export function getAnniversaryListCache() {
  const cached = uni.getStorageSync(ANNIVERSARY_CACHE_KEY)
  return Array.isArray(cached) ? cached : []
}
