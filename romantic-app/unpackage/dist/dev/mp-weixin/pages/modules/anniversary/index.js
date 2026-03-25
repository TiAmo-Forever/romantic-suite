"use strict";
const common_vendor = require("../../../common/vendor.js");
const services_anniversaries = require("../../../services/anniversaries.js");
const utils_imagePreview = require("../../../utils/image-preview.js");
const utils_auth = require("../../../utils/auth.js");
const utils_mediaUpload = require("../../../utils/media-upload.js");
const utils_nav = require("../../../utils/nav.js");
const utils_useThemePage = require("../../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
if (!Math) {
  AccountHeader();
}
const AccountHeader = () => "../../account/components/AccountHeader.js";
const HEART = "♡";
const FILLED_HEART = "♥";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const TEXT = {
      pageTitle: "恋爱纪念日",
      eyebrow: "重要日子",
      heroBadge: "恋爱纪念日",
      heroTitle: "把重要的日子认真收藏起来",
      heroDesc: "支持过去和未来的日期，既能记录回忆，也能提前期待。",
      createButton: "新增纪念日",
      defaultType: "纪念日",
      cardFallback: "点击查看纪念日详情。",
      locationFallback: "把这一刻留给你们的回忆。",
      emptyTitle: "还没有纪念日",
      emptyDesc: "先添加一个重要的日子，列表会按时间倒序展示。",
      loadError: "纪念日加载失败",
      likeError: "点赞失败",
      creatorPrefix: "由 ",
      creatorSuffix: " 创建",
      futureToday: "就是今天",
      futurePrefix: "还有 ",
      futureSuffix: " 天",
      pastPrefix: "已过去 ",
      pastSuffix: " 天"
    };
    const filters = [
      { key: "all", label: "全部" },
      { key: "future", label: "未发生" },
      { key: "past", label: "已发生" }
    ];
    const typeLabels = {
      custom: "纪念日",
      meet: "第一次见面",
      love: "确认关系",
      travel: "第一次旅行",
      birthday: "生日"
    };
    const { themeStyle } = utils_useThemePage.useThemePage();
    const activeFilter = common_vendor.ref("all");
    const eventList = common_vendor.ref([]);
    const likeBursts = common_vendor.ref({});
    const likingMap = common_vendor.ref({});
    common_vendor.onShow(async () => {
      if (!utils_auth.requireAuth())
        return;
      await loadEvents();
    });
    async function loadEvents() {
      try {
        eventList.value = await services_anniversaries.fetchAnniversaryList(activeFilter.value);
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || TEXT.loadError, icon: "none" });
      }
    }
    async function switchFilter(filterKey) {
      if (activeFilter.value === filterKey)
        return;
      activeFilter.value = filterKey;
      await loadEvents();
    }
    function goCreate() {
      utils_nav.goPage("/pages/modules/anniversary/edit");
    }
    function openDetail(id) {
      utils_nav.goPage(`/pages/modules/anniversary/detail?id=${id}`);
    }
    function previewEventCover(item) {
      const coverUrl = utils_mediaUpload.resolveMediaUrl(item == null ? void 0 : item.coverUrl);
      if (!coverUrl)
        return;
      utils_imagePreview.previewImages([coverUrl], coverUrl);
    }
    function creatorText(item) {
      return `${TEXT.creatorPrefix}${item.creatorNickname}${TEXT.creatorSuffix}`;
    }
    function getLikeBursts(eventId) {
      return likeBursts.value[eventId] || [];
    }
    function isLiking(eventId) {
      return Boolean(likingMap.value[eventId]);
    }
    async function handleLike(item) {
      if (!(item == null ? void 0 : item.id))
        return;
      const eventId = item.id;
      item.likeCount = Number(item.likeCount || 0) + 1;
      triggerLikePulse(eventId);
      createLikeBurst(eventId);
      try {
        const latestLikeCount = await services_anniversaries.increaseAnniversaryLikeCount(eventId);
        item.likeCount = Math.max(Number(item.likeCount || 0), Number(latestLikeCount || 0));
      } catch (error) {
        item.likeCount = Math.max(0, Number(item.likeCount || 0) - 1);
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || TEXT.likeError, icon: "none" });
      }
    }
    function triggerLikePulse(eventId) {
      const pulseToken = Date.now();
      likingMap.value = { ...likingMap.value, [eventId]: pulseToken };
      setTimeout(() => {
        if (likingMap.value[eventId] !== pulseToken)
          return;
        const nextLikingMap = { ...likingMap.value };
        delete nextLikingMap[eventId];
        likingMap.value = nextLikingMap;
      }, 260);
    }
    function createLikeBurst(eventId) {
      const particles = Array.from({ length: 7 }, (_, index) => ({
        id: `${eventId}_${Date.now()}_${index}`,
        style: {
          "--drift": `${Math.round((Math.random() - 0.5) * 180)}rpx`,
          "--lift": `${-220 - Math.round(Math.random() * 80)}rpx`,
          "--duration": `${1180 + Math.round(Math.random() * 360)}ms`,
          "--delay": `${index * 70}ms`,
          "--scale": `${0.95 + Math.random() * 0.55}`,
          "--hue": `${index % 2 === 0 ? "#ff5d8f" : "#ff91b2"}`
        }
      }));
      const existingParticles = likeBursts.value[eventId] || [];
      likeBursts.value = {
        ...likeBursts.value,
        [eventId]: existingParticles.concat(particles)
      };
      setTimeout(() => {
        const currentParticles = likeBursts.value[eventId] || [];
        const particleIds = new Set(particles.map((item) => item.id));
        const remainedParticles = currentParticles.filter((item) => !particleIds.has(item.id));
        const nextBursts = { ...likeBursts.value };
        if (remainedParticles.length) {
          nextBursts[eventId] = remainedParticles;
        } else {
          delete nextBursts[eventId];
        }
        likeBursts.value = nextBursts;
      }, 1900);
    }
    function formatStatus(item) {
      if (item.timeStatus === "future") {
        if (Number(item.dayOffset) === 0)
          return TEXT.futureToday;
        return `${TEXT.futurePrefix}${item.dayOffset}${TEXT.futureSuffix}`;
      }
      return `${TEXT.pastPrefix}${Math.abs(Number(item.dayOffset || 0))}${TEXT.pastSuffix}`;
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: TEXT.pageTitle,
          eyebrow: TEXT.eyebrow
        }),
        b: common_vendor.t(TEXT.heroBadge),
        c: common_vendor.t(TEXT.heroTitle),
        d: common_vendor.t(TEXT.heroDesc),
        e: common_vendor.t(TEXT.createButton),
        f: common_vendor.o(goCreate, "b8"),
        g: common_vendor.f(filters, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.key,
            c: activeFilter.value === item.key ? 1 : "",
            d: common_vendor.o(($event) => switchFilter(item.key), item.key)
          };
        }),
        h: eventList.value.length
      }, eventList.value.length ? {
        i: common_vendor.f(eventList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.coverUrl
          }, item.coverUrl ? {
            b: common_vendor.unref(utils_mediaUpload.resolveMediaUrl)(item.coverUrl),
            c: common_vendor.o(($event) => previewEventCover(item), item.id)
          } : {
            d: common_vendor.t(HEART)
          }, {
            e: common_vendor.t(item.title),
            f: common_vendor.t(typeLabels[item.type] || TEXT.defaultType),
            g: common_vendor.t(item.eventDate),
            h: common_vendor.t(formatStatus(item)),
            i: item.creatorNickname
          }, item.creatorNickname ? {
            j: common_vendor.t(creatorText(item))
          } : {}, {
            k: common_vendor.t(item.description || item.location || TEXT.cardFallback),
            l: common_vendor.t(item.location || TEXT.locationFallback),
            m: common_vendor.f(getLikeBursts(item.id), (particle, k1, i1) => {
              return {
                a: particle.id,
                b: common_vendor.s(particle.style)
              };
            }),
            n: common_vendor.t(item.likeCount || 0),
            o: isLiking(item.id) ? 1 : "",
            p: common_vendor.o(($event) => handleLike(item), item.id),
            q: item.id,
            r: common_vendor.o(($event) => openDetail(item.id), item.id)
          });
        }),
        j: common_vendor.t(FILLED_HEART),
        k: common_vendor.t(FILLED_HEART)
      } : {
        l: common_vendor.t(HEART),
        m: common_vendor.t(TEXT.emptyTitle),
        n: common_vendor.t(TEXT.emptyDesc)
      }, {
        o: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-519a83ad"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/modules/anniversary/index.js.map
