"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const utils_avatar = require("../../utils/avatar.js");
const utils_nav = require("../../utils/nav.js");
const utils_useThemePage = require("../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
if (!Math) {
  AccountHeader();
}
const AccountHeader = () => "./components/AccountHeader.js";
const MIN_SCALE = 1;
const MAX_SCALE = 3;
const _sfc_main = {
  __name: "avatar-crop",
  setup(__props) {
    const { themeStyle } = utils_useThemePage.useThemePage();
    const instance = common_vendor.getCurrentInstance();
    const imagePath = common_vendor.ref("");
    const cropSize = common_vendor.ref(300);
    const imageInfo = common_vendor.ref({ width: 0, height: 0 });
    const baseSize = common_vendor.ref({ width: 300, height: 300 });
    const scale = common_vendor.ref(MIN_SCALE);
    const offset = common_vendor.ref({ x: 0, y: 0 });
    const gestureState = common_vendor.ref({ mode: "none", startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0, startDistance: 0, startScale: MIN_SCALE, startMidX: 0, startMidY: 0 });
    const viewportStyle = common_vendor.computed(() => ({ width: `${cropSize.value}px`, height: `${cropSize.value}px` }));
    const sliderValue = common_vendor.computed(() => Math.round(scale.value * 100));
    const imageStyle = common_vendor.computed(() => ({ width: `${baseSize.value.width * scale.value}px`, height: `${baseSize.value.height * scale.value}px`, left: `${offset.value.x}px`, top: `${offset.value.y}px` }));
    common_vendor.onLoad(async (options) => {
      if (!utils_auth.requireAuth())
        return;
      imagePath.value = decodeURIComponent(options.src || "");
      const systemInfo = common_vendor.index.getSystemInfoSync();
      cropSize.value = Math.min(systemInfo.windowWidth - 48, 320);
      await initImageInfo();
      resetCrop();
    });
    async function initImageInfo() {
      if (!imagePath.value)
        return;
      const info = await new Promise((resolve, reject) => common_vendor.index.getImageInfo({ src: imagePath.value, success: resolve, fail: reject }));
      imageInfo.value = { width: info.width, height: info.height };
      const aspect = info.width / info.height;
      baseSize.value = aspect >= 1 ? { width: cropSize.value * aspect, height: cropSize.value } : { width: cropSize.value, height: cropSize.value / aspect };
    }
    function clampScale(nextScale) {
      return Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale));
    }
    function clampOffset(nextX, nextY, nextScale = scale.value) {
      const width = baseSize.value.width * nextScale;
      const height = baseSize.value.height * nextScale;
      const minX = Math.min(0, cropSize.value - width);
      const minY = Math.min(0, cropSize.value - height);
      return { x: Math.max(minX, Math.min(0, nextX)), y: Math.max(minY, Math.min(0, nextY)) };
    }
    function getViewportCenter() {
      return { x: cropSize.value / 2, y: cropSize.value / 2 };
    }
    function resetCrop() {
      scale.value = MIN_SCALE;
      offset.value = clampOffset((cropSize.value - baseSize.value.width) / 2, (cropSize.value - baseSize.value.height) / 2, MIN_SCALE);
      gestureState.value.mode = "none";
    }
    function getTouchList(event) {
      var _a, _b;
      return event.touches || event.changedTouches || ((_a = event.detail) == null ? void 0 : _a.touches) || ((_b = event.detail) == null ? void 0 : _b.changedTouches) || [];
    }
    function normalizeTouch(touch) {
      const x = typeof touch.pageX === "number" ? touch.pageX : touch.clientX;
      const y = typeof touch.pageY === "number" ? touch.pageY : touch.clientY;
      return typeof x === "number" && typeof y === "number" ? { x, y } : null;
    }
    function getTouchPoints(event) {
      return Array.from(getTouchList(event)).map(normalizeTouch).filter(Boolean);
    }
    function getDistance(first, second) {
      const dx = second.x - first.x;
      const dy = second.y - first.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    function getMidpoint(first, second) {
      return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
    }
    function beginDrag(point) {
      gestureState.value = { mode: "drag", startX: point.x, startY: point.y, startOffsetX: offset.value.x, startOffsetY: offset.value.y, startDistance: 0, startScale: scale.value, startMidX: 0, startMidY: 0 };
    }
    function beginPinch(first, second) {
      const midpoint = getMidpoint(first, second);
      gestureState.value = { mode: "pinch", startX: 0, startY: 0, startOffsetX: offset.value.x, startOffsetY: offset.value.y, startDistance: getDistance(first, second), startScale: scale.value, startMidX: midpoint.x, startMidY: midpoint.y };
    }
    function handleTouchStart(event) {
      const points = getTouchPoints(event);
      if (points.length >= 2)
        return beginPinch(points[0], points[1]);
      if (points.length === 1)
        beginDrag(points[0]);
    }
    function handleTouchMove(event) {
      const points = getTouchPoints(event);
      if (!points.length)
        return;
      if (points.length >= 2) {
        if (gestureState.value.mode !== "pinch")
          beginPinch(points[0], points[1]);
        const currentDistance = getDistance(points[0], points[1]);
        const currentMid = getMidpoint(points[0], points[1]);
        const ratio = gestureState.value.startDistance ? currentDistance / gestureState.value.startDistance : 1;
        const nextScale = clampScale(gestureState.value.startScale * ratio);
        const focusImageX = (gestureState.value.startMidX - gestureState.value.startOffsetX) / gestureState.value.startScale;
        const focusImageY = (gestureState.value.startMidY - gestureState.value.startOffsetY) / gestureState.value.startScale;
        scale.value = nextScale;
        offset.value = clampOffset(currentMid.x - focusImageX * nextScale, currentMid.y - focusImageY * nextScale, nextScale);
        return;
      }
      const point = points[0];
      if (gestureState.value.mode !== "drag")
        beginDrag(point);
      offset.value = clampOffset(gestureState.value.startOffsetX + point.x - gestureState.value.startX, gestureState.value.startOffsetY + point.y - gestureState.value.startY);
    }
    function handleTouchEnd(event) {
      const points = getTouchPoints(event);
      if (points.length >= 2)
        return beginPinch(points[0], points[1]);
      if (points.length === 1)
        return beginDrag(points[0]);
      gestureState.value.mode = "none";
    }
    function handleScaleChanging(event) {
      const nextScale = clampScale(Number(event.detail.value || 100) / 100);
      const prevScale = scale.value;
      if (!prevScale || nextScale === prevScale)
        return;
      const center = getViewportCenter();
      const imagePointX = (center.x - offset.value.x) / prevScale;
      const imagePointY = (center.y - offset.value.y) / prevScale;
      scale.value = nextScale;
      offset.value = clampOffset(center.x - imagePointX * nextScale, center.y - imagePointY * nextScale, nextScale);
    }
    async function handleCropSave() {
      const canvasSize = 600;
      const drawnWidth = baseSize.value.width * scale.value;
      const drawnHeight = baseSize.value.height * scale.value;
      const sourceX = Math.max(0, -offset.value.x / drawnWidth * imageInfo.value.width);
      const sourceY = Math.max(0, -offset.value.y / drawnHeight * imageInfo.value.height);
      const sourceWidth = Math.min(imageInfo.value.width, cropSize.value / drawnWidth * imageInfo.value.width);
      const sourceHeight = Math.min(imageInfo.value.height, cropSize.value / drawnHeight * imageInfo.value.height);
      const context = common_vendor.index.createCanvasContext("avatarCropCanvas", instance == null ? void 0 : instance.proxy);
      context.clearRect(0, 0, canvasSize, canvasSize);
      context.drawImage(imagePath.value, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvasSize, canvasSize);
      context.draw(false, () => {
        common_vendor.index.canvasToTempFilePath({ canvasId: "avatarCropCanvas", width: canvasSize, height: canvasSize, destWidth: canvasSize, destHeight: canvasSize, success: async (result) => {
          try {
            const draftPath = await utils_avatar.persistAvatarDraft(result.tempFilePath);
            utils_avatar.setAvatarDraft(draftPath);
            common_vendor.index.showToast({ title: "裁剪完成", icon: "success" });
            setTimeout(() => utils_nav.backPage(), 220);
          } catch (error) {
            common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "头像处理失败", icon: "none" });
          }
        } }, instance == null ? void 0 : instance.proxy);
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          title: "裁剪头像",
          eyebrow: "头像裁剪"
        }),
        b: imagePath.value,
        c: common_vendor.s(imageStyle.value),
        d: common_vendor.s(viewportStyle.value),
        e: common_vendor.o(handleTouchStart, "b0"),
        f: common_vendor.o(handleTouchMove, "f8"),
        g: common_vendor.o(handleTouchEnd, "1d"),
        h: common_vendor.o(handleTouchEnd, "31"),
        i: sliderValue.value,
        j: common_vendor.o(handleScaleChanging, "4a"),
        k: common_vendor.o(handleScaleChanging, "a5"),
        l: common_vendor.o(resetCrop, "1b"),
        m: common_vendor.o(handleCropSave, "ca"),
        n: common_vendor.s(common_vendor.unref(themeStyle))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-62a67396"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account/avatar-crop.js.map
