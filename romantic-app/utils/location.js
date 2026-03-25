function cleanRegionParts(parts = []) {
  return parts
    .map((item) => String(item || '').trim())
    .filter(Boolean)
}

export function formatRegionLabel(parts = []) {
  const cleaned = cleanRegionParts(parts)
  return cleaned.join(' ')
}

export function extractLocationLabel(location = {}) {
  const parts = cleanRegionParts([
    location.province,
    location.city,
    location.district
  ])

  if (parts.length) {
    return formatRegionLabel(parts)
  }

  return String(location.address || '').trim()
}

export function getCurrentLocationInfo() {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      geocode: true,
      success(result) {
        const location = {
          province: String(result.addressInfo?.province || result.province || '').trim(),
          city: String(result.addressInfo?.city || result.city || '').trim(),
          district: String(result.addressInfo?.district || result.district || '').trim(),
          label: extractLocationLabel(result)
        }

        if (!location.label) {
          reject(new Error('暂时无法识别当前位置'))
          return
        }
        resolve(location)
      },
      fail(error) {
        reject(error)
      }
    })
  })
}

export function getCurrentLocationLabel() {
  return getCurrentLocationInfo().then((location) => location.label)
}

export function chooseLocationLabel() {
  return new Promise((resolve, reject) => {
    uni.chooseLocation({
      success(result) {
        const label = extractLocationLabel(result)
        if (!label) {
          reject(new Error('暂时无法识别所选地点'))
          return
        }
        resolve(label)
      },
      fail(error) {
        reject(error)
      }
    })
  })
}
