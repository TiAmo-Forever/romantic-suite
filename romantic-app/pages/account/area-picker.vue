<template>
  <view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader :title="pageTitle" :eyebrow="TEXT.eyebrow" />
    </view>

    <view class="app-account-content">
      <AccountPanel :title="TEXT.panelTitle" :description="TEXT.panelDesc">
        <AccountField :label="TEXT.inputLabel" :hint="TEXT.inputHint">
          <input
            v-model="manualValue"
            class="input app-field"
            :placeholder="TEXT.inputPlaceholder"
            placeholder-class="app-account-input-placeholder"
            @input="handleManualInput"
          />
        </AccountField>

        <view v-if="searchResults.length" class="search-list">
          <view
            v-for="item in searchResults"
            :key="item.id"
            class="search-item"
            @click="applySearchResult(item)"
          >
            <view class="search-name">{{ item.name }}</view>
            <view class="search-sub">{{ item.mergerName || item.name }}</view>
          </view>
        </view>

        <view class="selection-header">
          <view>
            <view class="selection-title">{{ TEXT.selectionTitle }}</view>
            <view class="selection-desc">{{ TEXT.selectionDesc }}</view>
          </view>
          <view class="selection-chip">{{ selectedLabel }}</view>
        </view>

        <view class="linkage-grid">
          <view class="linkage-col">
            <view class="linkage-label">{{ TEXT.provinceLabel }}</view>
            <scroll-view scroll-y class="linkage-list">
              <view
                v-for="item in provinceOptions"
                :key="item.id"
                class="linkage-item"
                :class="{ active: selectedProvince?.id === item.id }"
                @click="handleProvinceClick(item)"
              >
                {{ item.name }}
              </view>
            </scroll-view>
          </view>

          <view class="linkage-col">
            <view class="linkage-label">{{ TEXT.cityLabel }}</view>
            <scroll-view scroll-y class="linkage-list">
              <view
                v-for="item in cityOptions"
                :key="item.id"
                class="linkage-item"
                :class="{ active: selectedCity?.id === item.id }"
                @click="handleCityClick(item)"
              >
                {{ item.name }}
              </view>
              <view v-if="!cityOptions.length" class="linkage-empty">{{ TEXT.cityEmpty }}</view>
            </scroll-view>
          </view>

          <view class="linkage-col">
            <view class="linkage-label">{{ TEXT.districtLabel }}</view>
            <scroll-view scroll-y class="linkage-list">
              <view
                v-for="item in districtOptions"
                :key="item.id"
                class="linkage-item"
                :class="{ active: selectedDistrict?.id === item.id }"
                @click="handleDistrictClick(item)"
              >
                {{ item.name }}
              </view>
              <view v-if="!districtOptions.length" class="linkage-empty">{{ TEXT.districtEmpty }}</view>
            </scroll-view>
          </view>
        </view>

        <view class="action-row">
          <button class="ghost-btn app-account-flat-btn app-account-flat-btn-soft" @click="handleUseSelected">
            {{ TEXT.useSelected }}
          </button>
          <button class="ghost-btn app-account-flat-btn app-account-flat-btn-soft" @click="handleUseManual">
            {{ TEXT.useManual }}
          </button>
        </view>
      </AccountPanel>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { requireAuth } from '@/utils/auth.js'
import { fetchAreaChildren, fetchAreaDetail, fetchProvinces, searchAreas } from '@/services/areas.js'
import { clearAreaDraft, saveAreaDraft } from '@/utils/area.js'
import { backPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountField from '@/pages/account/components/AccountField.vue'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const TEXT = {
  eyebrow: '三级地点选择',
  panelTitle: '地点填写',
  panelDesc: '支持直接手动输入，也支持从左到右选择省、市、区。选好后会尽量少打断当前页面的编辑流程。',
  inputLabel: '地点名称',
  inputHint: '可以直接填写，也可以输入关键字后从下方匹配结果里选择已有地区。',
  inputPlaceholder: '例如：杭州市西湖区、上海迪士尼、广州南站',
  selectionTitle: '联动选择',
  selectionDesc: '从左到右依次选择，越往后越精确。',
  provinceLabel: '省份',
  cityLabel: '城市',
  districtLabel: '区县',
  cityEmpty: '先选择省份',
  districtEmpty: '区县可选填',
  useSelected: '使用当前选择',
  useManual: '使用手动输入',
  emptyLabel: '还没有选地点',
  pageTitleDefault: '地点选择',
  pageTitleProfile: '所在城市',
  pageTitleMeeting: '见面城市',
  pageTitleAnniversary: '纪念日地点',
  pageTitleCountdown: '见面地点',
  loadError: '地区数据加载失败',
  selectFirst: '请先选择省市区，或改用手动输入',
  inputFirst: '请先输入地点名称'
}

const { themeStyle } = useThemePage()
const pageTitle = ref(TEXT.pageTitleDefault)
const scene = ref('default')
const manualValue = ref('')
const provinceOptions = ref([])
const cityOptions = ref([])
const districtOptions = ref([])
const provinceId = ref(0)
const cityId = ref(0)
const districtId = ref(0)
const searchResults = ref([])
let searchTimer = null

const selectedProvince = computed(() => provinceOptions.value.find((item) => item.id === provinceId.value) || null)
const selectedCity = computed(() => cityOptions.value.find((item) => item.id === cityId.value) || null)
const selectedDistrict = computed(() => districtOptions.value.find((item) => item.id === districtId.value) || null)
const selectedArea = computed(() => selectedDistrict.value || selectedCity.value || selectedProvince.value || null)
const selectedLabel = computed(() => selectedArea.value?.mergerName || selectedArea.value?.name || manualValue.value.trim() || TEXT.emptyLabel)

onLoad(async (options) => {
  if (!requireAuth()) return

  scene.value = String(options?.scene || 'default')
  pageTitle.value = buildPageTitle(scene.value)
  manualValue.value = decodeRouteValue(options?.value)
  clearAreaDraft(scene.value)

  await initAreas()

  const areaId = Number(options?.areaId || 0)
  if (areaId > 0) {
    await restoreAreaSelection(areaId)
  }
})

function decodeRouteValue(value) {
  const text = String(value || '').trim()
  if (!text) return ''

  try {
    return decodeURIComponent(text)
  } catch (error) {
    return text
  }
}

function buildPageTitle(currentScene) {
  if (currentScene === 'profile_city') return TEXT.pageTitleProfile
  if (currentScene === 'relationship_meeting') return TEXT.pageTitleMeeting
  if (currentScene === 'anniversary_location') return TEXT.pageTitleAnniversary
  if (currentScene === 'countdown_place') return TEXT.pageTitleCountdown
  return TEXT.pageTitleDefault
}

async function initAreas() {
  try {
    provinceOptions.value = await fetchProvinces()
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.loadError, icon: 'none' })
  }
}

async function restoreAreaSelection(areaId) {
  try {
    const area = await fetchAreaDetail(areaId)
    if (!area) return

    if (area.level === 0) {
      await handleProvinceClick(area)
      return
    }

    const parent = await fetchAreaDetail(area.parentId)
    if (!parent) return

    if (parent.level === 0) {
      await handleProvinceClick(parent)
      await handleCityClick(area)
      return
    }

    const province = await fetchAreaDetail(parent.parentId)
    if (!province) return

    await handleProvinceClick(province)
    await handleCityClick(parent)
    handleDistrictClick(area)
  } catch (error) {
    // 回填地区失败时静默处理，保持用户当前输入不受影响。
  }
}

async function handleProvinceClick(area) {
  provinceId.value = area.id
  cityId.value = 0
  districtId.value = 0
  cityOptions.value = await fetchAreaChildren(area.id)
  districtOptions.value = []
  updateManualValueFromSelection()
}

async function handleCityClick(area) {
  cityId.value = area.id
  districtId.value = 0
  districtOptions.value = await fetchAreaChildren(area.id)
  updateManualValueFromSelection()
}

function handleDistrictClick(area) {
  districtId.value = area.id
  updateManualValueFromSelection()
}

function updateManualValueFromSelection() {
  if (selectedArea.value) {
    manualValue.value = selectedArea.value.mergerName || selectedArea.value.name
  }
}

function handleManualInput(event) {
  manualValue.value = event?.detail?.value || manualValue.value
  scheduleSearch()
}

function scheduleSearch() {
  if (searchTimer) clearTimeout(searchTimer)

  const keyword = manualValue.value.trim()
  if (keyword.length < 2) {
    searchResults.value = []
    return
  }

  searchTimer = setTimeout(async () => {
    try {
      searchResults.value = await searchAreas(keyword, null, 8)
    } catch (error) {
      searchResults.value = []
    }
  }, 180)
}

async function applySearchResult(area) {
  manualValue.value = area.mergerName || area.name
  searchResults.value = []
  await restoreAreaSelection(area.id)
}

function saveAndBack(payload) {
  saveAreaDraft(scene.value, payload)
  backPage()
}

function handleUseSelected() {
  if (!selectedArea.value) {
    uni.showToast({ title: TEXT.selectFirst, icon: 'none' })
    return
  }

  saveAndBack({
    id: selectedArea.value.id,
    name: selectedArea.value.name,
    mergerName: selectedArea.value.mergerName || selectedArea.value.name,
    displayText: selectedArea.value.mergerName || selectedArea.value.name,
    isManual: false
  })
}

function handleUseManual() {
  const value = manualValue.value.trim()
  if (!value) {
    uni.showToast({ title: TEXT.inputFirst, icon: 'none' })
    return
  }

  saveAndBack({
    id: 0,
    name: value,
    mergerName: value,
    displayText: value,
    isManual: true
  })
}
</script>

<style scoped>
.search-list {
  margin-top: 16rpx;
  display: grid;
  gap: 12rpx;
}

.search-item {
  padding: 20rpx 22rpx;
  border-radius: 22rpx;
  background: #fff7fa;
  box-shadow: inset 0 0 0 2rpx rgba(255, 143, 179, 0.08);
}

.search-name {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--app-color-primary-strong);
}

.search-sub {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: #98707d;
}

.selection-header {
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.selection-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #8c6673;
}

.selection-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #ab808d;
}

.selection-chip {
  max-width: 46%;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: #fff1f5;
  color: var(--app-color-primary-strong);
  font-size: 22rpx;
  text-align: center;
}

.linkage-grid {
  margin-top: 18rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
}

.linkage-col {
  min-width: 0;
}

.linkage-label {
  margin-bottom: 12rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #8c6673;
}

.linkage-list {
  height: 360rpx;
  padding: 10rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: inset 0 0 0 2rpx rgba(255, 143, 179, 0.08);
}

.linkage-item,
.linkage-empty {
  padding: 18rpx 16rpx;
  border-radius: 18rpx;
  font-size: 23rpx;
  line-height: 1.5;
  color: #8f6b77;
}

.linkage-item + .linkage-item {
  margin-top: 10rpx;
}

.linkage-item.active {
  background: linear-gradient(135deg, rgba(255, 151, 181, 0.2), rgba(255, 208, 222, 0.34));
  color: var(--app-color-primary-strong);
  font-weight: 700;
}

.linkage-empty {
  color: #b18a96;
}

.action-row {
  margin-top: 24rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

@media screen and (max-width: 520px) {
  .linkage-grid {
    gap: 10rpx;
  }

  .selection-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .selection-chip {
    max-width: 100%;
  }
}
</style>
