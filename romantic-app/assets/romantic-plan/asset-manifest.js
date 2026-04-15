// 中文注释：这里统一维护“浪漫计划”模块后续正式切图的文件位与用途说明，
// 页面真正接入图片时优先从这里取路径，避免素材补齐后还要在多个页面里分散改路径。

export const romanticPlanAssetManifest = {
  listPage: {
    backgroundMain: {
      path: '@/assets/romantic-plan/backgrounds/plan-center-sky-main.png',
      status: 'planned',
      size: '1440x2200',
      usage: '列表页主背景'
    },
    titleMain: {
      path: '@/assets/romantic-plan/titles/plan-center-title-main.png',
      status: 'planned',
      size: '1200x420',
      usage: '列表页主标题字'
    },
    ribbonShared: {
      path: '@/assets/romantic-plan/ribbons/ribbon-shared-pink.png',
      status: 'planned',
      size: '420x140',
      usage: '共同安排丝带'
    },
    ribbonList: {
      path: '@/assets/romantic-plan/ribbons/ribbon-list-green.png',
      status: 'planned',
      size: '420x140',
      usage: '计划列表丝带'
    },
    createButton: {
      path: '@/assets/romantic-plan/buttons/button-create-plan-main.png',
      status: 'planned',
      size: '720x220',
      usage: '新建计划按钮底图'
    },
    emptyNotebook: {
      path: '@/assets/romantic-plan/empty-state/empty-plan-notebook.png',
      status: 'planned',
      size: '520x520',
      usage: '空状态记事本插画'
    },
    emptyCups: {
      path: '@/assets/romantic-plan/empty-state/empty-plan-cups.png',
      status: 'planned',
      size: '520x520',
      usage: '空状态双杯插画'
    },
    paperPlane: {
      path: '@/assets/romantic-plan/decor/paper-plane-soft.png',
      status: 'planned',
      size: '320x220',
      usage: '底部纸飞机装饰'
    }
  },
  detailPage: {
    backgroundMain: {
      path: '@/assets/romantic-plan/backgrounds/plan-detail-sky-main.png',
      status: 'planned',
      size: '1440x2400',
      usage: '详情页主背景'
    },
    titleMain: {
      path: '@/assets/romantic-plan/titles/plan-detail-title.png',
      status: 'planned',
      size: '1200x360',
      usage: '详情页标题字'
    },
    coverDaily: {
      path: '@/assets/romantic-plan/covers/cover-plan-default-daily.png',
      status: 'planned',
      size: '960x640',
      usage: '日程计划默认封面'
    },
    coverInterval: {
      path: '@/assets/romantic-plan/covers/cover-plan-default-interval.png',
      status: 'planned',
      size: '960x640',
      usage: '周期计划默认封面'
    },
    coverStage: {
      path: '@/assets/romantic-plan/covers/cover-plan-default-stage.png',
      status: 'planned',
      size: '960x640',
      usage: '阶段计划默认封面'
    },
    frameCorner: {
      path: '@/assets/romantic-plan/decor/frame-soft-corner.png',
      status: 'planned',
      size: '240x240',
      usage: '详情主卡边角装饰'
    }
  },
  editPage: {
    backgroundMain: {
      path: '@/assets/romantic-plan/backgrounds/plan-edit-sky-main.png',
      status: 'planned',
      size: '1440x2400',
      usage: '编辑页主背景'
    },
    titleMain: {
      path: '@/assets/romantic-plan/titles/plan-edit-title.png',
      status: 'planned',
      size: '1200x360',
      usage: '编辑页标题字'
    },
    coverPlaceholder: {
      path: '@/assets/romantic-plan/covers/cover-plan-editor-placeholder.png',
      status: 'planned',
      size: '960x640',
      usage: '编辑页封面占位图'
    },
    ribbonSteps: {
      path: '@/assets/romantic-plan/ribbons/ribbon-steps-green.png',
      status: 'planned',
      size: '420x140',
      usage: '编辑步骤丝带'
    }
  },
  sharedDecor: {
    cloudLeft: {
      path: '@/assets/romantic-plan/decor/cloud-cluster-left.png',
      status: 'planned',
      size: '700x420',
      usage: '左侧云层装饰'
    },
    cloudRight: {
      path: '@/assets/romantic-plan/decor/cloud-cluster-right.png',
      status: 'planned',
      size: '700x420',
      usage: '右侧云层装饰'
    },
    sparklePack: {
      path: '@/assets/romantic-plan/decor/sparkle-pack-soft.png',
      status: 'planned',
      size: '600x600',
      usage: '星光点缀装饰'
    },
    heartPack: {
      path: '@/assets/romantic-plan/decor/heart-pack-soft.png',
      status: 'planned',
      size: '320x320',
      usage: '爱心点缀装饰'
    },
    paperGrain: {
      path: '@/assets/romantic-plan/textures/paper-grain-soft.png',
      status: 'planned',
      size: '1024x1024',
      usage: '卡片纸张肌理'
    }
  }
}
