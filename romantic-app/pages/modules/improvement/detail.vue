<template>
  <view class="page app-account-page" :style="themeStyle" @click="handleDetailTap">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader title="恋爱改进簿" eyebrow="记录详情" />
    </view>

    <view v-if="detail" class="app-account-content detail-content">
      <AccountPanel :title="detail.title" :description="detail.description || '把这件在意的小事认真记下来，后续的每次推进都会留在这里。'">
        <view class="record-head">
          <view class="record-head-main">
            <view class="identity-badge" :class="identityBadgeClass(detail)">
              <view class="identity-badge-dot"></view>
              <text>{{ identityBadgeText(detail) }}</text>
            </view>
            <view class="status-chip" :class="`status-chip-${currentStatusKey}`">{{ currentStatusText }}</view>
          </view>
          <view class="detail-manage-wrap" @click.stop>
            <view class="detail-manage-btn" @click.stop="toggleRecordMenu">管理</view>
            <view v-if="showRecordMenu" class="detail-manage-pop">
              <view class="detail-manage-item" @click.stop="handleRecordEdit">编辑主记录</view>
              <view class="detail-manage-divider"></view>
              <view class="detail-manage-item danger" @click.stop="handleRecordDelete">删除主记录</view>
            </view>
          </view>
        </view>

        <view class="detail-meta">
          <view class="detail-chip">{{ targetLabelMap[detail.targetType] || '共同努力' }}</view>
          <view class="detail-chip">{{ detail.startDate || TEXT.startDateFallback }}</view>
          <view class="detail-chip detail-chip-soft">已记录 {{ sortedFeedbackList.length }} 次反馈</view>
        </view>

        <view class="status-banner" :class="`status-banner-${currentStatusKey}`">
          <view class="status-banner-title">当前整体状态 · {{ currentStatusText }}</view>
          <view class="status-banner-desc">{{ currentStatusHint }}</view>
        </view>

        <view v-if="detail.mediaList?.length" class="fold-card" @click="toggleNoteMedia">
          <view class="fold-main">
            <view class="fold-title">主记录媒体</view>
            <view class="fold-desc">{{ mediaSummary(detail.mediaList) }}</view>
          </view>
          <view class="fold-action">{{ noteMediaExpanded ? '收起' : '展开' }}</view>
        </view>

        <view v-if="noteMediaExpanded && detail.mediaList?.length" class="media-grid">
          <view
            v-for="(item, index) in detail.mediaList"
            :key="`note_${item.id || index}`"
            class="media-card"
            @click="openViewer(detail.mediaList, index)"
          >
            <image v-if="item.mediaType === 'image'" class="media-thumb" :src="resolveMedia(item.fileUrl)" mode="aspectFill" />
            <image v-else-if="item.thumbnailUrl" class="media-thumb" :src="resolveMedia(item.thumbnailUrl)" mode="aspectFill" />
            <view v-else class="media-thumb media-video-fallback">视频</view>
            <view class="media-type">{{ item.mediaType === 'video' ? '视频' : '图片' }}</view>
          </view>
        </view>
      </AccountPanel>

      <AccountPanel title="最新进展" :description="latestFeedback ? '先看最近一次更新，再决定要不要继续翻历史记录。' : '这里会展示最近一次反馈，方便一进来就知道这件事推进到了哪里。'">
        <view v-if="latestFeedback" class="focus-card" :class="feedbackCardClass(latestFeedback)">
          <view class="feedback-top">
            <view class="feedback-leading">
              <view class="identity-badge identity-badge-feedback" :class="identityBadgeClass(latestFeedback)">
                <view class="identity-badge-dot"></view>
                <text>{{ feedbackIdentityText(latestFeedback) }}</text>
              </view>
              <view class="feedback-status" :class="`feedback-status-${latestFeedback.status}`">{{ statusLabelMap[latestFeedback.status] || '跟进中' }}</view>
            </view>
            <view class="feedback-actions">
              <view class="feedback-action-link" @click="openFeedbackSheet('edit', latestFeedback)">编辑</view>
              <view class="feedback-action-link danger" @click="confirmDeleteFeedback(latestFeedback)">删除</view>
            </view>
          </view>

          <view class="feedback-time">最近一次更新 · {{ latestFeedback.createdAt }}</view>
          <view class="feedback-content focus-content">{{ latestFeedback.content }}</view>

          <view v-if="latestFeedback.mediaList?.length" class="feedback-media-wrap">
            <view class="fold-card fold-card-plain" @click="toggleFeedbackMedia(latestFeedback.id)">
              <view class="fold-main">
                <view class="fold-title">这次还附了媒体</view>
                <view class="fold-desc">{{ mediaSummary(latestFeedback.mediaList) }}</view>
              </view>
              <view class="fold-action">{{ isFeedbackExpanded(latestFeedback.id) ? '收起' : '展开' }}</view>
            </view>

            <view v-if="isFeedbackExpanded(latestFeedback.id)" class="media-grid media-grid-feedback">
              <view
                v-for="(media, mediaIndex) in latestFeedback.mediaList"
                :key="`latest_${latestFeedback.id}_${media.id || mediaIndex}`"
                class="media-card"
                @click="openViewer(latestFeedback.mediaList, mediaIndex)"
              >
                <image v-if="media.mediaType === 'image'" class="media-thumb" :src="resolveMedia(media.fileUrl)" mode="aspectFill" />
                <image v-else-if="media.thumbnailUrl" class="media-thumb" :src="resolveMedia(media.thumbnailUrl)" mode="aspectFill" />
                <view v-else class="media-thumb media-video-fallback">视频</view>
                <view class="media-type">{{ media.mediaType === 'video' ? '视频' : '图片' }}</view>
              </view>
            </view>
          </view>

          <view class="interaction-row">
            <view class="interaction-time">{{ latestFeedback.createdAt }}</view>
            <view class="interaction-more-wrap" @click.stop>
              <view class="interaction-more-btn" @click.stop="toggleFeedbackActionMenu(latestFeedback)">
                <text class="interaction-more-dot"></text>
                <text class="interaction-more-dot"></text>
                <text class="interaction-more-dot"></text>
              </view>

              <view v-if="feedbackActionMenuId === latestFeedback.id" class="interaction-action-pop">
                <view class="interaction-pop-item" @click.stop="handleFeedbackLikeFromMenu(latestFeedback)">
                  <text class="interaction-pop-icon">{{ FILLED_HEART }}</text>
                  <text class="interaction-pop-label">{{ feedbackLikeActionText(latestFeedback) }}</text>
                </view>
                <view class="interaction-pop-divider"></view>
                <view class="interaction-pop-item comment-only" @click.stop="openFeedbackCommentComposer(latestFeedback)">
                  <text class="interaction-pop-label">{{ TEXT.feedbackCommentAction }}</text>
                </view>
              </view>
            </view>
          </view>

          <view v-if="hasFeedbackInteractionFeed(latestFeedback) || feedbackCommentVisibleId === latestFeedback.id" class="interaction-feed">
            <view v-if="latestFeedback.likeUsers?.length" class="interaction-feed-line interaction-feed-like">
              <text class="interaction-feed-heart">{{ FILLED_HEART }}</text>
              <text class="interaction-feed-text">{{ feedbackLikeUserSummary(latestFeedback) }}</text>
            </view>
            <view
              v-for="comment in latestFeedback.commentList || []"
              :key="`latest_comment_${comment.id}`"
              class="interaction-feed-line interaction-feed-comment"
            >
              <view class="interaction-comment-head">
                <text class="interaction-feed-name">{{ getCommentDisplayName(comment) }}</text>
                <view class="interaction-comment-meta">
                  <text class="interaction-comment-time">{{ formatCommentTime(comment.createdAt || comment.updatedAt) }}</text>
                  <text
                    v-if="canDeleteFeedbackComment(latestFeedback, comment)"
                    class="interaction-comment-delete"
                    @click.stop="handleDeleteFeedbackComment(latestFeedback, comment)"
                  >
                    删除
                  </text>
                </view>
              </view>
              <text class="interaction-comment-content">{{ comment.content }}</text>
            </view>

            <view v-if="feedbackCommentVisibleId === latestFeedback.id" class="comment-composer feedback-comment-composer" @click.stop>
              <input
                v-model="feedbackCommentForm.content"
                class="comment-input"
                :maxlength="200"
                :cursor-spacing="24"
                :placeholder="feedbackCommentPlaceholder(latestFeedback)"
                placeholder-class="app-account-input-placeholder"
                confirm-type="send"
                @confirm="handleSubmitFeedbackComment(latestFeedback)"
              />
              <view class="comment-composer-actions">
                <view class="comment-limit">{{ feedbackCommentLengthText }}</view>
                <button class="comment-send-btn" :disabled="submittingFeedbackComment" @click="handleSubmitFeedbackComment(latestFeedback)">
                  {{ submittingFeedbackComment ? TEXT.feedbackCommentSending : TEXT.feedbackCommentSend }}
                </button>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="empty-block">
          <view class="empty-title">还没有新的反馈</view>
          <view class="empty-desc">先记录第一条反馈，让这条改进真正开始往前推进。</view>
        </view>
      </AccountPanel>

      <AccountPanel title="历史反馈" :description="historyPanelDescription">
        <view v-if="historyFeedbackList.length" class="history-head">
          <view class="history-summary">{{ showAllFeedback ? '已展开全部历史反馈' : `先展示最近 ${visibleHistoryFeedbackList.length} 条` }}</view>
          <view v-if="historyFeedbackList.length > collapsedFeedbackCount" class="history-toggle" @click="toggleFeedbackHistory">
            {{ showAllFeedback ? '收起历史反馈' : `查看全部反馈（${historyFeedbackList.length}）` }}
          </view>
        </view>

        <view v-if="historyFeedbackList.length" class="timeline">
          <view
            v-for="item in visibleHistoryFeedbackList"
            :key="item.id"
            class="timeline-item"
            :class="isOwnFeedback(item) ? 'timeline-item-own' : 'timeline-item-other'"
          >
            <view class="timeline-card" :class="feedbackCardClass(item)">
              <view class="feedback-top">
                <view class="feedback-leading">
                  <view class="identity-badge identity-badge-feedback" :class="identityBadgeClass(item)">
                    <view class="identity-badge-dot"></view>
                    <text>{{ feedbackIdentityText(item) }}</text>
                  </view>
                  <view class="feedback-status" :class="`feedback-status-${item.status}`">{{ statusLabelMap[item.status] || '跟进中' }}</view>
                </view>
                <view class="feedback-actions">
                  <view class="feedback-action-link" @click="openFeedbackSheet('edit', item)">编辑</view>
                  <view class="feedback-action-link danger" @click="confirmDeleteFeedback(item)">删除</view>
                </view>
              </view>

              <view class="feedback-time">{{ item.createdAt }}</view>
              <view class="feedback-content">{{ item.content }}</view>

              <view v-if="item.mediaList?.length" class="feedback-media-wrap">
                <view class="fold-card fold-card-plain" @click="toggleFeedbackMedia(item.id)">
                  <view class="fold-main">
                    <view class="fold-title">反馈媒体</view>
                    <view class="fold-desc">{{ mediaSummary(item.mediaList) }}</view>
                  </view>
                  <view class="fold-action">{{ isFeedbackExpanded(item.id) ? '收起' : '展开' }}</view>
                </view>

                <view v-if="isFeedbackExpanded(item.id)" class="media-grid media-grid-feedback">
                  <view
                    v-for="(media, mediaIndex) in item.mediaList"
                    :key="`feedback_${item.id}_${media.id || mediaIndex}`"
                    class="media-card"
                    @click="openViewer(item.mediaList, mediaIndex)"
                  >
                    <image v-if="media.mediaType === 'image'" class="media-thumb" :src="resolveMedia(media.fileUrl)" mode="aspectFill" />
                    <image v-else-if="media.thumbnailUrl" class="media-thumb" :src="resolveMedia(media.thumbnailUrl)" mode="aspectFill" />
                    <view v-else class="media-thumb media-video-fallback">视频</view>
                    <view class="media-type">{{ media.mediaType === 'video' ? '视频' : '图片' }}</view>
                  </view>
                </view>
              </view>

              <view class="interaction-row">
                <view class="interaction-time">{{ item.createdAt }}</view>
                <view class="interaction-more-wrap" @click.stop>
                  <view class="interaction-more-btn" @click.stop="toggleFeedbackActionMenu(item)">
                    <text class="interaction-more-dot"></text>
                    <text class="interaction-more-dot"></text>
                    <text class="interaction-more-dot"></text>
                  </view>

                  <view v-if="feedbackActionMenuId === item.id" class="interaction-action-pop">
                    <view class="interaction-pop-item" @click.stop="handleFeedbackLikeFromMenu(item)">
                      <text class="interaction-pop-icon">{{ FILLED_HEART }}</text>
                      <text class="interaction-pop-label">{{ feedbackLikeActionText(item) }}</text>
                    </view>
                    <view class="interaction-pop-divider"></view>
                    <view class="interaction-pop-item comment-only" @click.stop="openFeedbackCommentComposer(item)">
                      <text class="interaction-pop-label">{{ TEXT.feedbackCommentAction }}</text>
                    </view>
                  </view>
                </view>
              </view>

              <view v-if="hasFeedbackInteractionFeed(item) || feedbackCommentVisibleId === item.id" class="interaction-feed">
                <view v-if="item.likeUsers?.length" class="interaction-feed-line interaction-feed-like">
                  <text class="interaction-feed-heart">{{ FILLED_HEART }}</text>
                  <text class="interaction-feed-text">{{ feedbackLikeUserSummary(item) }}</text>
                </view>
                <view
                  v-for="comment in item.commentList || []"
                  :key="`history_comment_${item.id}_${comment.id}`"
                  class="interaction-feed-line interaction-feed-comment"
                >
                  <view class="interaction-comment-head">
                    <text class="interaction-feed-name">{{ getCommentDisplayName(comment) }}</text>
                    <view class="interaction-comment-meta">
                      <text class="interaction-comment-time">{{ formatCommentTime(comment.createdAt || comment.updatedAt) }}</text>
                      <text
                        v-if="canDeleteFeedbackComment(item, comment)"
                        class="interaction-comment-delete"
                        @click.stop="handleDeleteFeedbackComment(item, comment)"
                      >
                        删除
                      </text>
                    </view>
                  </view>
                  <text class="interaction-comment-content">{{ comment.content }}</text>
                </view>

                <view v-if="feedbackCommentVisibleId === item.id" class="comment-composer feedback-comment-composer" @click.stop>
                  <input
                    v-model="feedbackCommentForm.content"
                    class="comment-input"
                    :maxlength="200"
                    :cursor-spacing="24"
                    :placeholder="feedbackCommentPlaceholder(item)"
                    placeholder-class="app-account-input-placeholder"
                    confirm-type="send"
                    @confirm="handleSubmitFeedbackComment(item)"
                  />
                  <view class="comment-composer-actions">
                    <view class="comment-limit">{{ feedbackCommentLengthText }}</view>
                    <button class="comment-send-btn" :disabled="submittingFeedbackComment" @click="handleSubmitFeedbackComment(item)">
                      {{ submittingFeedbackComment ? TEXT.feedbackCommentSending : TEXT.feedbackCommentSend }}
                    </button>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="empty-block">
          <view class="empty-title">最近还没有更早的历史反馈</view>
          <view class="empty-desc">等你们继续记录下去，这里会慢慢沉淀成一条更清楚的进展脉络。</view>
        </view>
      </AccountPanel>

    </view>

    <view class="feedback-fixed-bar">
      <button class="feedback-fixed-btn app-primary-btn app-primary-btn-shadow" @click="openFeedbackSheet('create')">记录新反馈</button>
    </view>

    <view v-if="feedbackSheetVisible" class="feedback-sheet-mask" @click="closeFeedbackSheet">
      <view class="feedback-sheet" @click.stop>
        <view class="feedback-sheet-head">
          <view>
            <view class="feedback-sheet-title">{{ feedbackSheetTitle }}</view>
            <view class="feedback-sheet-desc">{{ feedbackSheetDesc }}</view>
          </view>
          <view class="feedback-sheet-close" @click="closeFeedbackSheet">×</view>
        </view>

        <picker class="picker-row-shell" mode="selector" :range="statusOptions" range-key="label" :value="sheetStatusIndex" @change="handleSheetStatusChange">
          <view class="picker-row">
            <view class="picker-row-main">
              <view class="picker-row-label">当前状态</view>
              <view class="picker-row-value">{{ statusOptions[sheetStatusIndex]?.label || '请选择当前状态' }}</view>
            </view>
          </view>
        </picker>

        <AccountField label="反馈内容">
          <textarea
            v-model="sheetForm.content"
            maxlength="200"
            class="textarea app-textarea"
            placeholder="请输入这次的反馈内容"
            placeholder-class="app-account-input-placeholder"
          />
        </AccountField>

        <view class="status-banner mini" :class="`status-banner-${sheetForm.status}`">
          <view class="status-banner-title">当前状态 · {{ statusLabelMap[sheetForm.status] || '跟进中' }}</view>
          <view class="status-banner-desc">{{ statusHintMap[sheetForm.status] }}</view>
        </view>

        <view class="action-row">
          <button class="mini-btn" @click="chooseSheetImages">{{ feedbackSheetMode === 'edit' ? '调整图片' : '添加图片' }}</button>
          <button class="mini-btn" @click="chooseSheetVideo">{{ feedbackSheetMode === 'edit' ? '调整视频' : '添加视频' }}</button>
        </view>
        <view class="media-tips">当前已选 {{ sheetImageCount }} 张图片，{{ sheetVideoCount }} 个视频</view>

        <view v-if="sheetMediaList.length" class="media-grid compact">
          <view v-for="(item, index) in sheetMediaList" :key="item.localId" class="media-card">
            <image
              v-if="item.mediaType === 'image'"
              class="media-thumb"
              :src="item.previewUrl"
              mode="aspectFill"
              @click="previewSheetImage(item)"
            />
            <image
              v-else-if="item.previewUrl"
              class="media-thumb"
              :src="item.previewUrl"
              mode="aspectFill"
              @click="openViewer(sheetMediaList, index)"
            />
            <view v-else class="media-thumb media-video-fallback" @click="openViewer(sheetMediaList, index)">视频</view>
            <view class="media-type">{{ item.mediaType === 'image' ? '图片' : '视频' }}</view>
            <view class="media-remove" @click.stop="removeSheetMedia(index)">×</view>
          </view>
        </view>

        <view class="feedback-sheet-actions">
          <button class="mini-btn" @click="closeFeedbackSheet">取消</button>
          <button class="mini-btn primary" @click="handleSubmitSheet">{{ feedbackSheetSubmitText }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  addImprovementFeedback,
  createImprovementFeedbackComment,
  deleteImprovementFeedback,
  deleteImprovementFeedbackComment,
  deleteImprovementNote,
  fetchImprovementNoteDetail,
  toggleImprovementFeedbackLike,
  updateImprovementFeedback
} from '@/services/improvement-notes.js'
import { getUser, requireAuth } from '@/utils/auth.js'
import { previewImages } from '@/utils/image-preview.js'
import { prepareImageFile, resolveMediaUrl, uploadImprovementMedia } from '@/utils/media-upload.js'
import { openMediaViewer } from '@/utils/media-viewer.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountField from '@/pages/account/components/AccountField.vue'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const statusOptions = [
  { key: 'resolved', label: '已改善 · 已经明显好转' },
  { key: 'improving', label: '跟进中 · 还在持续努力' },
  { key: 'pending', label: '待开始 · 准备马上行动' }
]

const targetLabelMap = { me: '我自己', lover: '对方感受', both: '共同努力' }
const statusLabelMap = { resolved: '已改善', improving: '跟进中', pending: '待开始' }
const statusHintMap = {
  resolved: '已经能明显感觉到变化了，这次努力可以先温柔地收在这里。',
  improving: '还在持续靠近更好的状态，每一次反馈都会让变化更清楚。',
  pending: '准备开始行动，把第一步认真写下来就已经很重要。'
}

const TEXT = {
  loadFailed: '记录详情加载失败',
  startDateFallback: '未设置开始日期',
  noteDeleted: '主记录已删除',
  noteDeleteFailed: '删除主记录失败',
  feedbackDeleted: '反馈已删除',
  feedbackDeleteFailed: '删除反馈失败',
  addFeedbackFailed: '记录反馈失败',
  addFeedbackSuccess: '反馈已记录',
  updateFeedbackFailed: '反馈更新失败',
  updateFeedbackSuccess: '反馈已更新',
  feedbackLikeAction: '点赞',
  feedbackUnlikeAction: '取消点赞',
  feedbackCommentAction: '评论',
  feedbackCommentPlaceholder: '写下一句想留给这条反馈的话',
  feedbackCommentSend: '发送',
  feedbackCommentSending: '发送中',
  feedbackCommentFailed: '反馈评论失败',
  feedbackCommentEmptyError: '请先写下评论内容',
  feedbackCommentSuccess: '评论已发送',
  feedbackCommentDeleted: '评论已删除',
  feedbackCommentDeleteFailed: '删除反馈评论失败',
  feedbackLikeFailed: '反馈点赞失败',
  feedbackCommentDeleteTitle: '删除反馈评论',
  feedbackCommentDeleteContent: '删除后这条评论会立即移除，是否继续？',
  commentFallbackUser: '未命名',
  commentLengthSuffix: '/200',
  sheetCreateTitle: '记录新反馈',
  sheetCreateDesc: '把这次新的变化认真记下来。',
  sheetEditTitle: '编辑反馈',
  sheetEditDesc: '调整这条反馈的状态、内容和媒体。',
  emptyFeedbackContent: '请先写一点反馈内容',
  imageLimit: '图片最多上传 9 张',
  videoLimit: '视频最多上传 1 个'
}

const collapsedFeedbackCount = 2
const FILLED_HEART = '❤'
const { themeStyle } = useThemePage()
const detail = ref(null)
const noteId = ref('')
const noteMediaExpanded = ref(false)
const expandedFeedbackIds = ref([])
const showAllFeedback = ref(false)
const feedbackSheetVisible = ref(false)
const showRecordMenu = ref(false)
const feedbackActionMenuId = ref(0)
const feedbackSheetMode = ref('create')
const feedbackSheetTargetId = ref(0)
const feedbackCommentVisibleId = ref(0)
const togglingFeedbackLikeId = ref(0)
const submittingFeedbackComment = ref(false)
const sheetStatusIndex = ref(1)
const skipNextOnShowReload = ref(false)
const feedbackCommentForm = reactive({ content: '' })
const sheetForm = reactive({ status: 'improving', content: '' })
const sheetMediaList = ref([])

const currentUsername = computed(() => String(getUser()?.username || '').trim())
const sortedFeedbackList = computed(() => {
  const list = Array.isArray(detail.value?.feedbackList) ? [...detail.value.feedbackList] : []
  return list.sort((left, right) => {
    const rightTime = new Date(String(right?.createdAt || '').replace(' ', 'T')).getTime()
    const leftTime = new Date(String(left?.createdAt || '').replace(' ', 'T')).getTime()
    return (Number.isNaN(rightTime) ? 0 : rightTime) - (Number.isNaN(leftTime) ? 0 : leftTime)
  })
})
const latestFeedback = computed(() => sortedFeedbackList.value[0] || null)
const historyFeedbackList = computed(() => sortedFeedbackList.value.slice(1))
const visibleHistoryFeedbackList = computed(() => (showAllFeedback.value ? historyFeedbackList.value : historyFeedbackList.value.slice(0, collapsedFeedbackCount)))
const currentStatusKey = computed(() => latestFeedback.value?.status || detail.value?.status || 'improving')
const currentStatusText = computed(() => statusLabelMap[currentStatusKey.value] || statusLabelMap.improving)
const currentStatusHint = computed(() => statusHintMap[currentStatusKey.value] || statusHintMap.improving)
const sheetImageCount = computed(() => sheetMediaList.value.filter((item) => item.mediaType === 'image').length)
const sheetVideoCount = computed(() => sheetMediaList.value.filter((item) => item.mediaType === 'video').length)
const feedbackSheetTitle = computed(() => (feedbackSheetMode.value === 'edit' ? TEXT.sheetEditTitle : TEXT.sheetCreateTitle))
const feedbackSheetDesc = computed(() => (feedbackSheetMode.value === 'edit' ? TEXT.sheetEditDesc : TEXT.sheetCreateDesc))
const feedbackSheetSubmitText = computed(() => (feedbackSheetMode.value === 'edit' ? '保存反馈' : '记录反馈'))
const feedbackCommentLengthText = computed(() => `${String(feedbackCommentForm.content || '').length}${TEXT.commentLengthSuffix}`)
const historyPanelDescription = computed(() => {
  if (!latestFeedback.value) return '还没有反馈时，这里会保持干净，等第一条记录出现后再慢慢展开。'
  if (!historyFeedbackList.value.length) return '最近这次已经是当前唯一的一条反馈，后续的推进会继续叠在这里。'
  return `除最新进展外，这里还收着 ${historyFeedbackList.value.length} 条更早的反馈记录。`
})

onLoad(async (options) => {
  if (!requireAuth()) return
  noteId.value = options?.id || ''
  await loadDetail()
})

onShow(async () => {
  if (!noteId.value || !requireAuth()) return
  if (skipNextOnShowReload.value) {
    skipNextOnShowReload.value = false
    return
  }
  await loadDetail()
})

async function loadDetail() {
  if (!noteId.value) return
  try {
    detail.value = await fetchImprovementNoteDetail(noteId.value)
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.loadFailed, icon: 'none' })
  }
}

function resolveMedia(path) {
  return resolveMediaUrl(path)
}

function mediaSummary(mediaList = []) {
  const imageCount = mediaList.filter((item) => item.mediaType === 'image').length
  const videoCount = mediaList.filter((item) => item.mediaType === 'video').length
  const parts = []
  if (imageCount) parts.push(`${imageCount} 张图片`)
  if (videoCount) parts.push(`${videoCount} 个视频`)
  return parts.join(' · ') || '媒体'
}

function isMine(item) {
  return String(item?.creatorUsername || '').trim() === currentUsername.value
}

function isOwnFeedback(item) {
  return isMine(item)
}

function identityBadgeText(item) {
  return isMine(item) ? '我' : 'TA'
}

function feedbackIdentityText(item) {
  return isMine(item) ? '我' : 'TA'
}

function identityBadgeClass(item) {
  return isMine(item) ? 'identity-badge-mine' : 'identity-badge-other'
}

function feedbackCardClass(item) {
  return isOwnFeedback(item) ? 'feedback-card-own' : 'feedback-card-other'
}

function feedbackLikeActionText(item) {
  return item?.likedByCurrentUser ? TEXT.feedbackUnlikeAction : TEXT.feedbackLikeAction
}

function hasFeedbackInteractionFeed(item) {
  const likeUsers = Array.isArray(item?.likeUsers) ? item.likeUsers : []
  const commentList = Array.isArray(item?.commentList) ? item.commentList : []
  return likeUsers.length > 0 || commentList.length > 0
}

function feedbackLikeUserSummary(item) {
  return (Array.isArray(item?.likeUsers) ? item.likeUsers : [])
    .map((user) => user?.nickname || user?.username || TEXT.commentFallbackUser)
    .join('、')
}

function feedbackCommentPlaceholder(item) {
  return item ? `${TEXT.feedbackCommentPlaceholder}` : TEXT.feedbackCommentPlaceholder
}

function getCommentDisplayName(comment) {
  return comment?.commenterNickname || comment?.commenterUsername || TEXT.commentFallbackUser
}

function formatCommentTime(value) {
  const source = String(value || '').replace('T', ' ').trim()
  if (!source) return ''
  if (source.length >= 16) return source.slice(5, 16)
  return source
}

function isOwnFeedbackComment(comment) {
  return String(comment?.commenterUsername || '').trim() === currentUsername.value
}

function canDeleteFeedbackComment(feedback, comment) {
  return isOwnFeedbackComment(comment) || isOwnFeedback(feedback)
}

function toggleNoteMedia() {
  noteMediaExpanded.value = !noteMediaExpanded.value
}

function isFeedbackExpanded(feedbackId) {
  return expandedFeedbackIds.value.includes(feedbackId)
}

function toggleFeedbackMedia(feedbackId) {
  if (isFeedbackExpanded(feedbackId)) {
    expandedFeedbackIds.value = expandedFeedbackIds.value.filter((item) => item !== feedbackId)
    return
  }
  expandedFeedbackIds.value = [...expandedFeedbackIds.value, feedbackId]
}

function toggleFeedbackHistory() {
  showAllFeedback.value = !showAllFeedback.value
}

function syncSheetStatus(status) {
  const nextIndex = Math.max(statusOptions.findIndex((item) => item.key === status), 0)
  sheetStatusIndex.value = nextIndex
  sheetForm.status = statusOptions[nextIndex]?.key || 'improving'
}

function handleSheetStatusChange(event) {
  sheetStatusIndex.value = Number(event.detail.value || 0)
  sheetForm.status = statusOptions[sheetStatusIndex.value]?.key || 'improving'
}

function goEdit() {
  goPage(`/pages/modules/improvement/edit?id=${detail.value.id}`)
}

function toggleRecordMenu() {
  showRecordMenu.value = !showRecordMenu.value
}

function closeRecordMenu() {
  showRecordMenu.value = false
}

function toggleFeedbackActionMenu(item) {
  if (!item?.id) return
  feedbackActionMenuId.value = feedbackActionMenuId.value === item.id ? 0 : item.id
}

function closeFeedbackActionMenu() {
  feedbackActionMenuId.value = 0
}

function handleDetailTap() {
  closeRecordMenu()
  closeFeedbackActionMenu()
}

function handleRecordEdit() {
  closeRecordMenu()
  goEdit()
}

function handleRecordDelete() {
  closeRecordMenu()
  handleDelete()
}

function openFeedbackCommentComposer(item) {
  if (!item?.id) return
  closeFeedbackActionMenu()
  if (feedbackCommentVisibleId.value === item.id) {
    feedbackCommentVisibleId.value = 0
    feedbackCommentForm.content = ''
    return
  }
  feedbackCommentVisibleId.value = item.id
  feedbackCommentForm.content = ''
}

async function handleFeedbackLikeFromMenu(item) {
  closeFeedbackActionMenu()
  await handleFeedbackLike(item)
}

async function handleFeedbackLike(item) {
  if (!detail.value?.id || !item?.id || togglingFeedbackLikeId.value) return
  try {
    togglingFeedbackLikeId.value = item.id
    await toggleImprovementFeedbackLike(detail.value.id, item.id)
    await loadDetail()
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.feedbackLikeFailed, icon: 'none' })
  } finally {
    togglingFeedbackLikeId.value = 0
  }
}

async function handleSubmitFeedbackComment(item) {
  if (!detail.value?.id || !item?.id || submittingFeedbackComment.value) return
  if (!feedbackCommentForm.content.trim()) {
    uni.showToast({ title: TEXT.feedbackCommentEmptyError, icon: 'none' })
    return
  }
  try {
    submittingFeedbackComment.value = true
    await createImprovementFeedbackComment(detail.value.id, item.id, {
      content: feedbackCommentForm.content.trim()
    })
    feedbackCommentForm.content = ''
    await loadDetail()
    uni.showToast({ title: TEXT.feedbackCommentSuccess, icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.feedbackCommentFailed, icon: 'none' })
  } finally {
    submittingFeedbackComment.value = false
  }
}

function handleDeleteFeedbackComment(feedback, comment) {
  if (!detail.value?.id || !feedback?.id || !comment?.id) return
  uni.showModal({
    title: TEXT.feedbackCommentDeleteTitle,
    content: TEXT.feedbackCommentDeleteContent,
    success: async (result) => {
      if (!result.confirm) return
      try {
        await deleteImprovementFeedbackComment(detail.value.id, feedback.id, comment.id)
        await loadDetail()
        uni.showToast({ title: TEXT.feedbackCommentDeleted, icon: 'success' })
      } catch (error) {
        uni.showToast({ title: error?.message || TEXT.feedbackCommentDeleteFailed, icon: 'none' })
      }
    }
  })
}

function openFeedbackSheet(mode, item = null) {
  closeRecordMenu()
  closeFeedbackActionMenu()
  feedbackCommentVisibleId.value = 0
  feedbackCommentForm.content = ''
  feedbackSheetMode.value = mode
  feedbackSheetTargetId.value = item?.id || 0
  feedbackSheetVisible.value = true

  if (mode === 'edit' && item) {
    sheetForm.status = item.status || 'improving'
    sheetForm.content = item.content || ''
    sheetStatusIndex.value = Math.max(statusOptions.findIndex((option) => option.key === sheetForm.status), 0)
    sheetMediaList.value = (item.mediaList || []).map((media, index) => ({
      localId: `feedback_remote_${item.id}_${media.id || index}`,
      id: media.id,
      mediaType: media.mediaType,
      fileUrl: media.fileUrl,
      thumbnailUrl: media.thumbnailUrl,
      previewUrl: resolveMediaUrl(media.thumbnailUrl || media.fileUrl),
      localPath: '',
      thumbnailLocalPath: ''
    }))
    return
  }

  feedbackSheetTargetId.value = 0
  sheetForm.status = currentStatusKey.value
  sheetForm.content = ''
  syncSheetStatus(sheetForm.status)
  sheetMediaList.value = []
}

function closeFeedbackSheet() {
  feedbackSheetVisible.value = false
  feedbackSheetTargetId.value = 0
  sheetForm.status = currentStatusKey.value
  sheetForm.content = ''
  syncSheetStatus(sheetForm.status)
  sheetMediaList.value = []
}

function openViewer(mediaList = [], startIndex = 0) {
  const normalizedMediaList = mediaList.map((item) => ({
    mediaType: item.mediaType,
    fileUrl: item.fileUrl || item.localPath || '',
    thumbnailUrl: item.thumbnailUrl || item.previewUrl || ''
  }))
  openMediaViewer(normalizedMediaList, startIndex)
}

async function chooseSheetImages() {
  await chooseImagesForList(sheetMediaList.value, 9 - sheetImageCount.value)
}

async function chooseImagesForList(targetList, remain) {
  if (remain <= 0) {
    uni.showToast({ title: TEXT.imageLimit, icon: 'none' })
    return
  }
  try {
    skipNextOnShowReload.value = true
    const result = await new Promise((resolve, reject) => {
      uni.chooseImage({ count: remain, sizeType: ['compressed', 'original'], sourceType: ['album', 'camera'], success: resolve, fail: reject })
    })
    for (const path of result.tempFilePaths || []) {
      const preparedPath = await prepareImageFile(path)
      targetList.push({
        localId: `local_${Date.now()}_${Math.random()}`,
        mediaType: 'image',
        previewUrl: preparedPath,
        localPath: preparedPath,
        thumbnailLocalPath: '',
        fileUrl: '',
        thumbnailUrl: ''
      })
    }
  } catch (error) {
    if (error?.message) uni.showToast({ title: error.message, icon: 'none' })
  }
}

async function chooseSheetVideo() {
  if (sheetVideoCount.value >= 1) {
    uni.showToast({ title: TEXT.videoLimit, icon: 'none' })
    return
  }
  await chooseVideoForList(sheetMediaList.value)
}

async function chooseVideoForList(targetList) {
  try {
    skipNextOnShowReload.value = true
    const result = await new Promise((resolve, reject) => {
      uni.chooseVideo({ sourceType: ['album', 'camera'], compressed: true, success: resolve, fail: reject })
    })
    targetList.push({
      localId: `local_${Date.now()}_${Math.random()}`,
      mediaType: 'video',
      previewUrl: result.thumbTempFilePath || result.tempFilePath,
      localPath: result.tempFilePath,
      thumbnailLocalPath: result.thumbTempFilePath || '',
      fileUrl: '',
      thumbnailUrl: ''
    })
  } catch (error) {
    if (error?.message) uni.showToast({ title: error.message, icon: 'none' })
  }
}

function previewSheetImage(currentItem) {
  if (currentItem?.mediaType !== 'image') return
  const imageUrls = sheetMediaList.value.filter((item) => item.mediaType === 'image').map((item) => item.previewUrl).filter(Boolean)
  if (!imageUrls.length || !currentItem.previewUrl) return
  previewImages(imageUrls, currentItem.previewUrl)
}

function removeSheetMedia(index) {
  sheetMediaList.value.splice(index, 1)
}

async function buildUploadedMedia(mediaList) {
  const uploadedMedia = []
  for (let index = 0; index < mediaList.length; index += 1) {
    const item = mediaList[index]
    let fileUrl = item.fileUrl
    let thumbnailUrl = item.thumbnailUrl
    if (item.localPath) fileUrl = await uploadImprovementMedia(item.localPath)
    if (item.thumbnailLocalPath) thumbnailUrl = await uploadImprovementMedia(item.thumbnailLocalPath)
    uploadedMedia.push({ mediaType: item.mediaType, fileUrl, thumbnailUrl: thumbnailUrl || '', sortOrder: index })
  }
  return uploadedMedia
}

async function handleSubmitSheet() {
  if (!sheetForm.content.trim()) {
    uni.showToast({ title: TEXT.emptyFeedbackContent, icon: 'none' })
    return
  }
  try {
    uni.showLoading({ title: feedbackSheetMode.value === 'edit' ? '正在保存' : '正在提交', mask: true })
    const uploadedMedia = await buildUploadedMedia(sheetMediaList.value)
    if (feedbackSheetMode.value === 'edit' && feedbackSheetTargetId.value) {
      detail.value = await updateImprovementFeedback(detail.value.id, feedbackSheetTargetId.value, {
        status: sheetForm.status,
        content: sheetForm.content.trim(),
        mediaList: uploadedMedia
      })
      uni.hideLoading()
      closeFeedbackSheet()
      uni.showToast({ title: TEXT.updateFeedbackSuccess, icon: 'success' })
      return
    }
    detail.value = await addImprovementFeedback(detail.value.id, {
      status: sheetForm.status,
      content: sheetForm.content.trim(),
      mediaList: uploadedMedia
    })
    uni.hideLoading()
    closeFeedbackSheet()
    uni.showToast({ title: TEXT.addFeedbackSuccess, icon: 'success' })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: error?.message || (feedbackSheetMode.value === 'edit' ? TEXT.updateFeedbackFailed : TEXT.addFeedbackFailed), icon: 'none' })
  }
}

function confirmDeleteFeedback(item) {
  uni.showModal({
    title: '删除反馈',
    content: '删除后，这条反馈的内容和媒体都会一起移除，是否继续？',
    success: async (result) => {
      if (!result.confirm) return
      try {
        detail.value = await deleteImprovementFeedback(detail.value.id, item.id)
        expandedFeedbackIds.value = expandedFeedbackIds.value.filter((feedbackId) => feedbackId !== item.id)
        if (feedbackCommentVisibleId.value === item.id) {
          feedbackCommentVisibleId.value = 0
          feedbackCommentForm.content = ''
        }
        uni.showToast({ title: TEXT.feedbackDeleted, icon: 'success' })
      } catch (error) {
        uni.showToast({ title: error?.message || TEXT.feedbackDeleteFailed, icon: 'none' })
      }
    }
  })
}

function handleDelete() {
  uni.showModal({
    title: '删除主记录',
    content: '删除后，这条改进记录、所有反馈和关联媒体都会一起移除，是否继续？',
    success: async (result) => {
      if (!result.confirm) return
      try {
        await deleteImprovementNote(detail.value.id)
        uni.showToast({ title: TEXT.noteDeleted, icon: 'success' })
        setTimeout(() => backPage(), 250)
      } catch (error) {
        uni.showToast({ title: error?.message || TEXT.noteDeleteFailed, icon: 'none' })
      }
    }
  })
}
</script>

<style scoped>
.detail-content { padding-bottom: 200rpx; }
.record-head, .record-head-main, .feedback-top, .feedback-leading, .feedback-actions, .detail-meta, .action-row, .history-head { display: flex; align-items: center; gap: 14rpx; flex-wrap: wrap; }
.record-head, .feedback-top, .history-head { justify-content: space-between; }
.record-head { margin-bottom: 4rpx; }
.record-head-main { flex: 1; min-width: 0; }
.identity-badge { display: inline-flex; align-items: center; gap: 8rpx; width: fit-content; padding: 6rpx 14rpx; border-radius: 999rpx; font-size: 20rpx; font-weight: 700; }
.identity-badge-feedback { font-size: 19rpx; padding: 6rpx 12rpx; }
.identity-badge-dot { width: 10rpx; height: 10rpx; border-radius: 50%; background: currentColor; opacity: 0.85; }
.identity-badge-mine { background: rgba(223, 246, 242, 0.96); color: #3e9b92; }
.identity-badge-other { background: rgba(255, 238, 229, 0.96); color: #d18264; }
.detail-manage-wrap { position: relative; flex-shrink: 0; }
.detail-manage-btn { min-width: 84rpx; padding: 10rpx 18rpx; border-radius: 999rpx; background: rgba(255, 249, 251, 0.96); box-shadow: inset 0 0 0 2rpx rgba(233, 207, 216, 0.52); font-size: 22rpx; line-height: 1; color: #ad8090; text-align: center; }
.detail-manage-pop { position: absolute; top: calc(100% + 12rpx); right: 0; min-width: 220rpx; padding: 10rpx 0; border-radius: 24rpx; background: rgba(255, 252, 253, 0.98); box-shadow: 0 16rpx 38rpx rgba(114, 80, 92, 0.18); z-index: 8; }
.detail-manage-item { padding: 22rpx 24rpx; font-size: 25rpx; line-height: 1.4; color: #7c5f68; }
.detail-manage-item.danger { color: #cf6d78; }
.detail-manage-divider { height: 1rpx; margin: 0 18rpx; background: rgba(224, 196, 206, 0.64); }
.status-chip, .detail-chip, .feedback-status { padding: 8rpx 16rpx; border-radius: 999rpx; font-size: 21rpx; font-weight: 700; }
.status-chip-resolved, .feedback-status-resolved { background: linear-gradient(135deg, #fff7d9, #ffe08d); color: #9b6a08; }
.status-chip-improving, .feedback-status-improving { background: linear-gradient(135deg, #ffeaf0, #ffc6d6); color: #b54876; }
.status-chip-pending, .feedback-status-pending { background: linear-gradient(135deg, #ffe6df, #ffbead); color: #b45745; }
.detail-meta { margin-top: 18rpx; }
.detail-chip { background: #fff5f8; color: #bc7990; }
.detail-chip-soft { color: #9b7b86; }
.status-banner { margin-top: 20rpx; padding: 22rpx 24rpx; border-radius: 28rpx; box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.42); }
.status-banner-title { font-size: 25rpx; font-weight: 800; }
.status-banner-desc { margin-top: 8rpx; font-size: 23rpx; line-height: 1.7; }
.status-banner.mini { margin-top: 16rpx; }
.status-banner-resolved { background: linear-gradient(135deg, rgba(255, 243, 200, 0.95), rgba(255, 223, 128, 0.9)); color: #8d6200; }
.status-banner-improving { background: linear-gradient(135deg, rgba(255, 233, 239, 0.95), rgba(255, 199, 214, 0.9)); color: #b84d78; }
.status-banner-pending { background: linear-gradient(135deg, rgba(255, 231, 224, 0.95), rgba(255, 189, 173, 0.9)); color: #b55647; }
.fold-card, .picker-row { margin-top: 18rpx; padding: 18rpx 20rpx; border-radius: 24rpx; background: #fff4f8; }
.fold-card { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.fold-card-plain { margin-top: 16rpx; background: rgba(255, 255, 255, 0.68); }
.fold-main { min-width: 0; flex: 1; }
.fold-title { font-size: 24rpx; font-weight: 700; color: #a85d77; }
.fold-desc { margin-top: 6rpx; font-size: 22rpx; color: #b98a99; }
.fold-action { flex-shrink: 0; font-size: 22rpx; font-weight: 700; color: #c07892; }
.focus-card, .timeline-card { border-radius: 28rpx; padding: 22rpx; }
.focus-card { box-shadow: 0 18rpx 38rpx rgba(204, 148, 166, 0.12); }
.feedback-card-own { background: linear-gradient(135deg, rgba(235, 249, 247, 0.98), rgba(223, 246, 242, 0.96)); }
.feedback-card-other { background: linear-gradient(135deg, rgba(255, 247, 241, 0.98), rgba(255, 238, 229, 0.96)); }
.feedback-actions { justify-content: flex-end; gap: 18rpx; }
.feedback-action-link { font-size: 22rpx; font-weight: 700; color: var(--app-color-primary-strong); }
.feedback-action-link.danger { color: #cf6d78; }
.feedback-time { margin-top: 12rpx; font-size: 22rpx; color: #a47f8d; }
.feedback-content { margin-top: 14rpx; font-size: 24rpx; line-height: 1.8; color: #886a75; }
.focus-content { font-size: 25rpx; color: #7f5f6c; }
.feedback-media-wrap { margin-top: 12rpx; }
.feedback-interaction-bar { margin-top: 16rpx; display: flex; align-items: center; gap: 12rpx; flex-wrap: wrap; }
.feedback-interaction-btn { padding: 10rpx 18rpx; border-radius: 999rpx; background: rgba(255, 250, 252, 0.9); box-shadow: inset 0 0 0 2rpx rgba(233, 208, 217, 0.72); color: #b26d86; font-size: 22rpx; font-weight: 700; line-height: 1; }
.feedback-interaction-btn.active { background: rgba(255, 236, 242, 0.96); color: var(--app-color-primary-strong); }
.feedback-interaction-btn.loading { opacity: 0.6; }
.feedback-interaction-feed { margin-top: 14rpx; padding: 18rpx 18rpx 16rpx; border-radius: 22rpx; background: rgba(255, 255, 255, 0.66); }
.feedback-like-summary { font-size: 22rpx; line-height: 1.7; color: #b06f86; }
.feedback-comment-item { margin-top: 12rpx; padding-top: 12rpx; border-top: 1rpx solid rgba(229, 205, 214, 0.7); }
.feedback-comment-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12rpx; }
.feedback-comment-meta { min-width: 0; display: flex; align-items: center; gap: 10rpx; flex-wrap: wrap; }
.feedback-comment-name { font-size: 22rpx; font-weight: 700; color: #8e6071; }
.feedback-comment-time { font-size: 20rpx; color: #b28b98; }
.feedback-comment-content { margin-top: 8rpx; font-size: 23rpx; line-height: 1.7; color: #876874; }
.feedback-comment-delete { flex-shrink: 0; font-size: 21rpx; color: #cf6d78; }
.feedback-comment-composer { margin-top: 14rpx; }
.feedback-comment-input { width: 100%; min-height: 84rpx; padding: 0 22rpx; border-radius: 999rpx; background: rgba(255, 255, 255, 0.96); box-shadow: inset 0 0 0 2rpx rgba(233, 208, 217, 0.7); font-size: 24rpx; color: #7e5d6a; }
.feedback-comment-actions { margin-top: 10rpx; display: flex; align-items: center; justify-content: space-between; gap: 14rpx; }
.feedback-comment-limit { font-size: 21rpx; color: #b7919d; }
.feedback-comment-send-btn { margin: 0; min-width: 120rpx; height: 72rpx; line-height: 72rpx; padding: 0 24rpx; border-radius: 999rpx; background: var(--app-gradient-primary); color: #fff; font-size: 22rpx; font-weight: 700; box-shadow: none; }
.interaction-row { margin-top: 24rpx; padding-top: 20rpx; border-top: 1rpx solid rgba(233, 214, 222, 0.72); display: flex; align-items: center; justify-content: space-between; gap: 24rpx; }
.interaction-time { font-size: 22rpx; color: #b997a4; }
.interaction-more-wrap { position: relative; flex-shrink: 0; }
.interaction-more-btn { width: 72rpx; height: 52rpx; border-radius: 16rpx; background: #f1f3f6; display: flex; align-items: center; justify-content: center; gap: 8rpx; }
.interaction-more-dot { width: 8rpx; height: 8rpx; border-radius: 50%; background: #78828f; }
.interaction-action-pop { position: absolute; right: 84rpx; top: 50%; transform: translateY(-50%); display: flex; align-items: center; padding: 0 14rpx; border-radius: 22rpx; background: rgba(30, 35, 41, 0.96); box-shadow: 0 14rpx 32rpx rgba(27, 31, 37, 0.18); white-space: nowrap; z-index: 8; }
.interaction-pop-item { min-width: 152rpx; height: 84rpx; padding: 0 24rpx; display: flex; align-items: center; justify-content: center; gap: 10rpx; color: #fff8fb; font-size: 24rpx; font-weight: 700; line-height: 1; }
.interaction-pop-item.comment-only { min-width: 108rpx; }
.interaction-pop-icon { flex-shrink: 0; font-size: 26rpx; line-height: 1; }
.interaction-pop-label { flex-shrink: 0; white-space: nowrap; line-height: 1; }
.interaction-pop-divider { width: 2rpx; height: 32rpx; background: rgba(255, 255, 255, 0.16); }
.interaction-feed { margin-top: 20rpx; border-radius: 24rpx; background: linear-gradient(180deg, rgba(244, 246, 249, 0.98), rgba(240, 243, 247, 0.94)); box-shadow: inset 0 0 0 1rpx rgba(220, 226, 235, 0.7); overflow: hidden; }
.interaction-feed-line { padding: 18rpx 20rpx; font-size: 23rpx; line-height: 1.7; color: #6d5c66; word-break: break-word; }
.interaction-feed-line + .interaction-feed-line { border-top: 1rpx solid rgba(196, 204, 214, 0.5); }
.interaction-feed-like { display: flex; align-items: flex-start; gap: 12rpx; }
.interaction-feed-heart { margin-top: 4rpx; color: #ff6b97; font-size: 24rpx; line-height: 1; }
.interaction-feed-text { color: #6d5c66; }
.interaction-feed-comment { display: flex; flex-direction: column; gap: 8rpx; }
.interaction-comment-head { display: flex; align-items: center; justify-content: space-between; gap: 18rpx; }
.interaction-comment-meta { flex-shrink: 0; display: inline-flex; align-items: center; gap: 14rpx; }
.interaction-feed-name { color: #4f7aaf; font-weight: 700; flex: 1; }
.interaction-comment-time { flex-shrink: 0; font-size: 22rpx; color: #b49eaa; }
.interaction-comment-delete { flex-shrink: 0; font-size: 21rpx; color: #cf6d78; }
.interaction-comment-content { color: #6d5c66; line-height: 1.75; }
.comment-composer { display: flex; align-items: center; gap: 18rpx; padding: 18rpx 24rpx; background: rgba(255, 251, 252, 0.94); box-shadow: 0 -16rpx 40rpx rgba(186, 146, 161, 0.12); }
.feedback-comment-composer.comment-composer { position: static; left: auto; right: auto; bottom: auto; z-index: auto; margin-top: 0; border-top: 1rpx solid rgba(196, 204, 214, 0.5); backdrop-filter: none; }
.comment-input { flex: 1; height: 76rpx; padding: 0 22rpx; border-radius: 999rpx; background: #f4f6f8; color: #6c5963; font-size: 24rpx; }
.comment-composer-actions { display: inline-flex; align-items: center; gap: 16rpx; flex-shrink: 0; }
.comment-limit { font-size: 22rpx; color: #b08a97; }
.comment-send-btn { height: 72rpx; margin: 0; padding: 0 28rpx; border: none; border-radius: 999rpx; background: linear-gradient(135deg, #ff8fb2, #ff719c); color: #fff; font-size: 24rpx; font-weight: 700; line-height: 72rpx; }
.comment-send-btn[disabled] { opacity: 0.6; }
.history-summary { font-size: 22rpx; color: #a17a87; line-height: 1.7; }
.history-toggle { padding: 10rpx 18rpx; border-radius: 999rpx; background: rgba(255, 244, 248, 0.96); box-shadow: inset 0 0 0 1rpx rgba(233, 208, 217, 0.72); color: #b97089; font-size: 22rpx; font-weight: 700; }
.timeline { display: grid; gap: 18rpx; margin-top: 18rpx; }
.timeline-item { display: flex; }
.timeline-item-other { justify-content: flex-start; }
.timeline-item-own { justify-content: flex-end; }
.timeline-card { width: min(100%, 620rpx); box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.38), 0 12rpx 28rpx rgba(204, 165, 179, 0.08); }
.empty-block { padding: 12rpx 0 4rpx; }
.empty-title { font-size: 28rpx; font-weight: 800; color: var(--app-color-primary-strong); }
.empty-desc { margin-top: 10rpx; font-size: 23rpx; line-height: 1.7; color: #9a7682; }
.media-grid { margin-top: 16rpx; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14rpx; }
.media-grid.compact { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.media-card { position: relative; border-radius: 22rpx; overflow: hidden; background: #fff3f7; }
.media-thumb { width: 100%; height: 220rpx; display: block; background: #ffeef3; }
.media-video-fallback { display: flex; align-items: center; justify-content: center; color: #fff; background: linear-gradient(135deg, #ffcedd, #ff9db7); }
.media-type { position: absolute; left: 12rpx; bottom: 12rpx; padding: 6rpx 12rpx; border-radius: 999rpx; background: rgba(0, 0, 0, 0.45); color: #fff; font-size: 20rpx; }
.media-remove { position: absolute; right: 12rpx; top: 12rpx; width: 42rpx; height: 42rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.45); color: #fff; font-size: 30rpx; }
.detail-action-btn, .mini-btn { margin: 0; padding: 0 28rpx; height: 82rpx; line-height: 82rpx; border-radius: 999rpx; background: #fff; box-shadow: inset 0 0 0 2rpx rgba(255, 214, 226, 0.7); color: var(--app-color-primary-strong); font-size: 23rpx; font-weight: 700; }
.detail-action-btn-danger { color: #cf6d78; }
.picker-row-shell { display: block; margin-top: 18rpx; }
.picker-row-main { min-width: 0; flex: 1; }
.picker-row-label { font-size: 22rpx; color: #b58b99; }
.picker-row-value { margin-top: 8rpx; font-size: 27rpx; line-height: 1.5; color: #8f6d78; font-weight: 700; }
.media-tips { margin-top: 14rpx; font-size: 22rpx; color: #bc8b9b; }
.feedback-fixed-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom)); background: rgba(255, 250, 252, 0.92); backdrop-filter: blur(16px); box-shadow: 0 -14rpx 36rpx rgba(188, 145, 160, 0.12); }
.feedback-fixed-btn { width: 100%; }
.feedback-sheet-mask { position: fixed; inset: 0; z-index: 70; background: rgba(18, 22, 28, 0.22); }
.feedback-sheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 71; max-height: 84vh; overflow-y: auto; border-radius: 32rpx 32rpx 0 0; background: rgba(255, 251, 252, 0.99); padding: 24rpx 24rpx calc(24rpx + env(safe-area-inset-bottom)); box-shadow: 0 -16rpx 42rpx rgba(76, 53, 63, 0.18); }
.feedback-sheet-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18rpx; }
.feedback-sheet-title { font-size: 32rpx; font-weight: 800; color: var(--app-color-primary-strong); }
.feedback-sheet-desc { margin-top: 8rpx; font-size: 23rpx; line-height: 1.7; color: #9a7682; }
.feedback-sheet-close { width: 60rpx; height: 60rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #fff3f7; color: #bc7f93; font-size: 34rpx; line-height: 1; flex-shrink: 0; }
.feedback-sheet-actions { display: flex; justify-content: flex-end; gap: 14rpx; margin-top: 22rpx; padding-bottom: 8rpx; }
.mini-btn.primary { background: var(--app-gradient-primary); color: #fff; box-shadow: none; }
@media screen and (max-width: 520px) {
  .media-grid, .media-grid.compact { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .timeline-card { width: 100%; }
}
</style>
