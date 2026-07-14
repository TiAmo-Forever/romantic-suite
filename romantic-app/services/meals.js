import { request } from '@/utils/request.js'

export const MEAL_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'cold', label: '凉菜' },
  { key: 'hot', label: '热菜' },
  { key: 'soup', label: '汤' },
  { key: 'staple', label: '主食' }
]

export const MEAL_PREFERENCES = [
  { key: 'me', label: '我最爱' },
  { key: 'partner', label: 'TA最爱' },
  { key: 'both', label: '我们都爱' }
]

function ensureSuccess(response, fallbackMessage) {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage)
  }
  return response.data
}

function normalizePathId(value, label = '记录') {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error(`${label}参数无效`)
  }
  const id = String(value).trim()
  if (!id) {
    throw new Error(`${label}参数缺失`)
  }
  return id
}

export function normalizeDish(item = {}) {
  return {
    id: item.id || '',
    name: String(item.name || '').trim(),
    category: String(item.category || 'hot').trim() || 'hot',
    categoryLabel: String(item.categoryLabel || '').trim(),
    preference: String(item.preference || 'none').trim() || 'none',
    preferenceLabel: String(item.preferenceLabel || '').trim(),
    coverUrl: String(item.coverUrl || '').trim(),
    memory: String(item.memory || '').trim(),
    description: String(item.description || '').trim(),
    recipe: String(item.recipe || '').trim(),
    creatorUsername: String(item.creatorUsername || '').trim(),
    creatorNickname: String(item.creatorNickname || '').trim(),
    updaterUsername: String(item.updaterUsername || '').trim(),
    updaterNickname: String(item.updaterNickname || '').trim(),
    addedToday: Boolean(item.addedToday),
    selectedThisWeek: Boolean(item.selectedThisWeek),
    dailyUsedCount: Number(item.dailyUsedCount || 0),
    weeklySelectedCount: Number(item.weeklySelectedCount || 0),
    lastAddedDate: String(item.lastAddedDate || '').trim(),
    updatedAt: String(item.updatedAt || '').trim()
  }
}

function normalizeDailyItem(item = {}) {
  return {
    itemId: item.itemId || '',
    sortOrder: Number(item.sortOrder || 0),
    dish: normalizeDish(item.dish || {})
  }
}

function normalizeDailyPlan(item = {}) {
  return {
    id: item.id || '',
    planDate: String(item.planDate || '').trim(),
    weekLabel: String(item.weekLabel || '').trim(),
    remark: String(item.remark || '').trim(),
    dishCount: Number(item.dishCount || 0),
    itemList: (Array.isArray(item.itemList) ? item.itemList : []).map(normalizeDailyItem)
  }
}

function normalizeWeekly(item = {}) {
  return {
    weekStartDate: String(item.weekStartDate || '').trim(),
    dishCount: Number(item.dishCount || 0),
    dishList: (Array.isArray(item.dishList) ? item.dishList : []).map(normalizeDish)
  }
}

function normalizeDishPage(item = {}) {
  const rawList = Array.isArray(item) ? item : item.list
  return {
    page: Number(item.pageNo || 1),
    pageSize: Number(item.pageSize || 10),
    total: Number(item.total || 0),
    hasMore: Boolean(item.hasMore),
    list: (Array.isArray(rawList) ? rawList : []).map(normalizeDish)
  }
}

export async function fetchMealDishes({ category = 'all', preference = 'all', keyword = '', date = '', page = 1, pageSize = 10 } = {}) {
  const query = `category=${encodeURIComponent(category)}&preference=${encodeURIComponent(preference)}&keyword=${encodeURIComponent(keyword)}&date=${encodeURIComponent(date)}&page=${encodeURIComponent(page)}&pageSize=${encodeURIComponent(pageSize)}`
  const response = await request({ url: `/api/meals/dishes?${query}` })
  return normalizeDishPage(ensureSuccess(response, '获取菜谱失败'))
}

export async function fetchMealDishDetail(id, date = '') {
  const dishId = normalizePathId(id, '菜品')
  const response = await request({ url: `/api/meals/dishes/${encodeURIComponent(dishId)}?date=${encodeURIComponent(date)}` })
  return normalizeDish(ensureSuccess(response, '获取菜品详情失败'))
}

export async function createMealDish(payload) {
  const response = await request({ url: '/api/meals/dishes', method: 'POST', data: payload })
  return normalizeDish(ensureSuccess(response, '保存菜品失败'))
}

export async function updateMealDish(id, payload) {
  const dishId = normalizePathId(id, '菜品')
  const response = await request({ url: `/api/meals/dishes/${encodeURIComponent(dishId)}`, method: 'PUT', data: payload })
  return normalizeDish(ensureSuccess(response, '保存菜品失败'))
}

export async function deleteMealDish(id) {
  const dishId = normalizePathId(id, '菜品')
  const response = await request({ url: `/api/meals/dishes/${encodeURIComponent(dishId)}`, method: 'DELETE' })
  return ensureSuccess(response, '删除菜品失败')
}

export async function fetchMealDailyPlan(date = '') {
  const response = await request({ url: `/api/meals/daily?date=${encodeURIComponent(date)}` })
  return normalizeDailyPlan(ensureSuccess(response, '获取今日菜单失败'))
}

export async function saveMealDailyPlan(date, payload) {
  const response = await request({ url: `/api/meals/daily?date=${encodeURIComponent(date || '')}`, method: 'PUT', data: payload })
  return normalizeDailyPlan(ensureSuccess(response, '保存今日菜单失败'))
}

export async function addDishToDailyPlan(dishId, date = '') {
  const id = normalizePathId(dishId, '菜品')
  const response = await request({ url: `/api/meals/daily/dishes/${encodeURIComponent(id)}?date=${encodeURIComponent(date)}`, method: 'POST' })
  return normalizeDailyPlan(ensureSuccess(response, '加入今日菜单失败'))
}

export async function removeDailyPlanItem(itemId, date = '') {
  const id = normalizePathId(itemId, '菜单项')
  const response = await request({ url: `/api/meals/daily/items/${encodeURIComponent(id)}?date=${encodeURIComponent(date)}`, method: 'DELETE' })
  return normalizeDailyPlan(ensureSuccess(response, '移除今日菜单失败'))
}

export async function replaceDailyPlanItem(itemId, date = '') {
  const id = normalizePathId(itemId, '菜单项')
  const response = await request({ url: `/api/meals/daily/items/${encodeURIComponent(id)}/replace?date=${encodeURIComponent(date)}`, method: 'PUT' })
  return normalizeDailyPlan(ensureSuccess(response, '替换菜单项失败'))
}

export async function copyPreviousDailyPlan(date = '') {
  const response = await request({ url: `/api/meals/daily/copy-previous?date=${encodeURIComponent(date)}`, method: 'POST' })
  return normalizeDailyPlan(ensureSuccess(response, '复制昨天菜单失败'))
}

export async function fetchMealWeeklySelection(date = '') {
  const response = await request({ url: `/api/meals/weekly?date=${encodeURIComponent(date)}` })
  return normalizeWeekly(ensureSuccess(response, '获取本周精选失败'))
}

export async function saveMealWeeklySelection(date, payload) {
  const response = await request({ url: `/api/meals/weekly?date=${encodeURIComponent(date || '')}`, method: 'PUT', data: payload })
  return normalizeWeekly(ensureSuccess(response, '保存本周精选失败'))
}

export async function addDishToWeeklySelection(dishId, date = '') {
  const id = normalizePathId(dishId, '菜品')
  const response = await request({ url: `/api/meals/weekly/dishes/${encodeURIComponent(id)}?date=${encodeURIComponent(date)}`, method: 'POST' })
  return normalizeWeekly(ensureSuccess(response, '加入本周精选失败'))
}

export async function removeDishFromWeeklySelection(dishId, date = '') {
  const id = normalizePathId(dishId, '菜品')
  const response = await request({ url: `/api/meals/weekly/dishes/${encodeURIComponent(id)}?date=${encodeURIComponent(date)}`, method: 'DELETE' })
  return normalizeWeekly(ensureSuccess(response, '移出本周精选失败'))
}
