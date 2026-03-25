"use strict";
const common_vendor = require("../../../common/vendor.js");
const services_albums = require("../../../services/albums.js");
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
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const TEXT = {
      albumTitle: "甜蜜相册",
      albumEyebrow: "回忆收藏",
      heroKicker: "本月回忆",
      heroSummary: "把见面、旅行、生日和纪念日都收进一册。",
      createButton: "新建回忆",
      groupUnit: "段回忆",
      memoryWord: "回忆",
      imageCountSuffix: "张图",
      videoCountSuffix: "个视频",
      emptyIcon: "相册",
      emptyTitle: "还没有回忆",
      emptyDesc: "先新建一段属于你们的甜蜜记录吧。",
      all: "全部",
      month: "本月",
      year: "今年",
      heroFallbackMeta: "把每次见面都收进时间里",
      countSeparator: " · ",
      ungrouped: "未分组"
    };
    const { themeStyle } = utils_useThemePage.useThemePage();
    const activeFilter = common_vendor.ref("all");
    const memoryList = common_vendor.ref([]);
    const filters = [
      { key: "all", label: TEXT.all },
      { key: "month", label: TEXT.month },
      { key: "year", label: TEXT.year }
    ];
    const featuredMemory = common_vendor.computed(() => memoryList.value[0] || null);
    const featuredCover = common_vendor.computed(() => resolveCover(featuredMemory.value));
    const featuredMetaText = common_vendor.computed(() => {
      if (!featuredMemory.value)
        return TEXT.heroFallbackMeta;
      return [featuredMemory.value.memoryDate, featuredMemory.value.location].filter(Boolean).join(TEXT.countSeparator);
    });
    const featuredCountText = common_vendor.computed(() => {
      if (!featuredMemory.value)
        return TEXT.memoryWord;
      const imageCount = Number(featuredMemory.value.imageCount || 0);
      const videoCount = Number(featuredMemory.value.videoCount || 0);
      if (imageCount && videoCount) {
        return `${imageCount} ${TEXT.imageCountSuffix}${TEXT.countSeparator}${videoCount} ${TEXT.videoCountSuffix}`;
      }
      if (videoCount) {
        return `${videoCount} ${TEXT.videoCountSuffix}`;
      }
      return `${imageCount || 0} ${TEXT.imageCountSuffix}`;
    });
    const filteredGroups = common_vendor.computed(() => {
      const list = memoryList.value.filter((item) => matchFilter(item, activeFilter.value));
      const map = /* @__PURE__ */ new Map();
      list.forEach((item) => {
        const key = String(item.memoryDate || "").slice(0, 7) || TEXT.ungrouped;
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key).push(item);
      });
      return Array.from(map.entries()).map(([key, items]) => ({
        key,
        label: formatGroupLabel(key),
        range: formatGroupRange(items),
        items
      }));
    });
    common_vendor.onShow(async () => {
      if (!utils_auth.requireAuth())
        return;
      await loadList();
    });
    async function loadList() {
      try {
        memoryList.value = await services_albums.fetchAlbumMemoryList();
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "甜蜜相册加载失败", icon: "none" });
      }
    }
    function switchFilter(filterKey) {
      activeFilter.value = filterKey;
    }
    function matchFilter(item, filterKey) {
      if (filterKey === "all")
        return true;
      const now = /* @__PURE__ */ new Date();
      const year = String(now.getFullYear());
      const month = `${year}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      if (filterKey === "year")
        return String(item.memoryDate || "").startsWith(year);
      if (filterKey === "month")
        return String(item.memoryDate || "").startsWith(month);
      return true;
    }
    function formatGroupLabel(key) {
      if (!key || key === TEXT.ungrouped)
        return TEXT.ungrouped;
      const [year, month] = key.split("-");
      return `${year}年${Number(month)}月`;
    }
    function formatGroupRange(items) {
      const dates = items.map((item) => String(item.memoryDate || "")).filter(Boolean).sort();
      if (!dates.length)
        return "";
      const first = dates[0].slice(5);
      const last = dates[dates.length - 1].slice(5);
      return first === last ? first : `${first} - ${last}`;
    }
    function handleCreate() {
      utils_nav.goPage("/pages/modules/album/edit");
    }
    function openMemory(item) {
      utils_nav.goPage(`/pages/modules/album/detail?id=${item.id}`);
    }
    function resolveCover(item) {
      if (!item)
        return "";
      const firstMedia = Array.isArray(item.mediaList) ? item.mediaList[0] : null;
      const coverPath = item.coverUrl || (firstMedia == null ? void 0 : firstMedia.thumbnailUrl) || (firstMedia == null ? void 0 : firstMedia.fileUrl) || "";
      return utils_mediaUpload.resolveMediaUrl(coverPath);
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.p({
          title: TEXT.albumTitle,
          eyebrow: TEXT.albumEyebrow
        }),
        b: common_vendor.t(TEXT.heroKicker),
        c: common_vendor.t(((_a = featuredMemory.value) == null ? void 0 : _a.title) || TEXT.albumTitle),
        d: common_vendor.t(featuredMetaText.value),
        e: common_vendor.t(((_b = featuredMemory.value) == null ? void 0 : _b.summary) || TEXT.heroSummary),
        f: common_vendor.t(TEXT.createButton),
        g: common_vendor.o(handleCreate, "7a"),
        h: featuredCover.value
      }, featuredCover.value ? {
        i: featuredCover.value
      } : {}, {
        j: common_vendor.t(featuredCountText.value),
        k: common_vendor.f(filters, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.key,
            c: activeFilter.value === item.key ? 1 : "",
            d: common_vendor.o(($event) => switchFilter(item.key), item.key)
          };
        }),
        l: filteredGroups.value.length
      }, filteredGroups.value.length ? {
        m: common_vendor.f(filteredGroups.value, (group, k0, i0) => {
          return {
            a: common_vendor.t(group.label),
            b: common_vendor.t(group.items.length),
            c: common_vendor.t(group.range),
            d: common_vendor.f(group.items, (item, k1, i1) => {
              return common_vendor.e({
                a: resolveCover(item)
              }, resolveCover(item) ? {
                b: resolveCover(item)
              } : {}, {
                c: common_vendor.t(item.tags[0] || TEXT.memoryWord),
                d: common_vendor.t(item.imageCount),
                e: common_vendor.t(item.memoryDate),
                f: item.videoCount
              }, item.videoCount ? {
                g: common_vendor.t(item.videoCount),
                h: common_vendor.t(TEXT.videoCountSuffix)
              } : {}, {
                i: common_vendor.t(item.title),
                j: item.location
              }, item.location ? {
                k: common_vendor.t(item.location)
              } : {}, {
                l: item.summary
              }, item.summary ? {
                m: common_vendor.t(item.summary)
              } : {}, {
                n: item.tags.length
              }, item.tags.length ? {
                o: common_vendor.f(item.tags.slice(0, 4), (tag, k2, i2) => {
                  return {
                    a: common_vendor.t(tag),
                    b: tag
                  };
                })
              } : {}, {
                p: item.id,
                q: common_vendor.o(($event) => openMemory(item), item.id)
              });
            }),
            e: group.key
          };
        }),
        n: common_vendor.t(TEXT.groupUnit),
        o: common_vendor.t(TEXT.imageCountSuffix)
      } : {
        p: common_vendor.t(TEXT.emptyIcon),
        q: common_vendor.t(TEXT.emptyTitle),
        r: common_vendor.t(TEXT.emptyDesc)
      }, {
        s: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0de51c35"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/modules/album/index.js.map
