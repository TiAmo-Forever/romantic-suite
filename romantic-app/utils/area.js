const AREA_DRAFT_KEY = 'romantic_area_draft_map'

function readAreaDraftMap() {
  const stored = uni.getStorageSync(AREA_DRAFT_KEY)
  return stored && typeof stored === 'object' ? stored : {}
}

function writeAreaDraftMap(map) {
  uni.setStorageSync(AREA_DRAFT_KEY, map)
}

export function buildAreaPickerUrl(scene, options = {}) {
  const query = [`scene=${encodeURIComponent(scene || 'default')}`]

  Object.entries(options).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  })

  return `/pages/account/area-picker?${query.join('&')}`
}

export function saveAreaDraft(scene, area) {
  const key = String(scene || 'default')
  const map = readAreaDraftMap()
  map[key] = area || null
  writeAreaDraftMap(map)
}

export function getAreaDraft(scene) {
  const key = String(scene || 'default')
  const map = readAreaDraftMap()
  return map[key] || null
}

export function clearAreaDraft(scene) {
  if (!scene) {
    uni.removeStorageSync(AREA_DRAFT_KEY)
    return
  }

  const key = String(scene)
  const map = readAreaDraftMap()
  delete map[key]
  writeAreaDraftMap(map)
}
