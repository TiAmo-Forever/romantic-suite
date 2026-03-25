"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const utils_avatar = require("../../utils/avatar.js");
const utils_account = require("../../utils/account.js");
const utils_imagePreview = require("../../utils/image-preview.js");
const services_profile = require("../../services/profile.js");
const utils_profile = require("../../utils/profile.js");
const utils_nav = require("../../utils/nav.js");
const utils_useThemePage = require("../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
if (!Math) {
  (AccountHeader + AccountField + AccountPanel)();
}
const AccountField = () => "./components/AccountField.js";
const AccountHeader = () => "./components/AccountHeader.js";
const AccountPanel = () => "./components/AccountPanel.js";
const _sfc_main = {
  __name: "avatar",
  setup(__props) {
    const TEXT = {
      pageTitle: "头像设置",
      eyebrow: "头像编辑",
      panelTitle: "头像方式",
      panelDescription: "可以在默认头像、上传头像和字符头像之间切换。",
      presetMode: "默认头像",
      uploadMode: "上传头像",
      textMode: "字符头像",
      presetFieldLabel: "默认头像",
      presetHint: "左右滑动查看更多预设，选中后会直接应用到头像预览。",
      uploadFieldLabel: "上传头像",
      uploadHint: "如果已经上传过头像，会先展示当前预览；没有头像时才会提示重新选择。",
      emptyUpload: "还没有选择头像",
      chooseButton: "选择并裁剪",
      clearButton: "清空头像",
      textFieldLabel: "头像字符",
      textHint: "适合做简单的情绪标记，最多保留 2 个字符。",
      textPlaceholder: "💕",
      saveButton: "保存头像",
      saveSuccess: "头像已保存",
      saveError: "头像保存失败"
    };
    const { themeStyle } = utils_useThemePage.useThemePage();
    const form = common_vendor.reactive(utils_profile.getProfile());
    const avatarPresets = utils_profile.getAvatarPresets();
    const draftAvatarPath = common_vendor.ref("");
    const previewAvatarUrl = common_vendor.computed(() => utils_avatar.resolveAvatarUrl(draftAvatarPath.value || form.avatarImage));
    common_vendor.onLoad(() => {
      utils_auth.requireAuth();
    });
    common_vendor.onShow(async () => {
      if (!utils_auth.requireAuth())
        return;
      try {
        Object.assign(form, await services_profile.fetchRemoteProfile());
        utils_profile.saveProfile(form);
      } catch (error) {
        Object.assign(form, utils_profile.getProfile());
      }
      const draft = utils_avatar.getAvatarDraft();
      if (!draft)
        return;
      form.avatarType = "upload";
      draftAvatarPath.value = draft;
      utils_avatar.clearAvatarDraft();
    });
    function setAvatarType(type) {
      form.avatarType = type;
    }
    function activateUploadAvatar() {
      form.avatarType = "upload";
      if (draftAvatarPath.value || form.avatarImage) {
        return;
      }
      chooseAvatarImage();
    }
    function selectPreset(key) {
      form.avatarType = "preset";
      form.avatarPreset = key;
    }
    function chooseAvatarImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (result) => {
          var _a;
          const filePath = (_a = result.tempFilePaths) == null ? void 0 : _a[0];
          if (!filePath)
            return;
          utils_nav.goPage(`/pages/account/avatar-crop?src=${encodeURIComponent(filePath)}`);
        }
      });
    }
    function clearAvatarImage() {
      form.avatarImage = "";
      draftAvatarPath.value = "";
      form.avatarType = "upload";
    }
    function previewCurrentAvatar() {
      if (!previewAvatarUrl.value)
        return;
      utils_imagePreview.previewImages([previewAvatarUrl.value], previewAvatarUrl.value);
    }
    async function handleSave() {
      try {
        let avatarImage = form.avatarType === "upload" ? form.avatarImage : "";
        if (form.avatarType === "upload" && draftAvatarPath.value) {
          avatarImage = await utils_avatar.uploadAvatarFile(draftAvatarPath.value);
          form.avatarImage = avatarImage;
          draftAvatarPath.value = "";
        }
        await utils_account.saveProfilePatchAndBack({
          avatarType: form.avatarType,
          avatarPreset: form.avatarPreset,
          avatarText: (form.avatarText || TEXT.textPlaceholder).trim() || TEXT.textPlaceholder,
          avatarImage
        }, TEXT.saveSuccess);
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || TEXT.saveError, icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: TEXT.pageTitle,
          eyebrow: TEXT.eyebrow
        }),
        b: common_vendor.t(TEXT.presetMode),
        c: form.avatarType === "preset" ? 1 : "",
        d: common_vendor.o(($event) => setAvatarType("preset"), "4b"),
        e: common_vendor.t(TEXT.uploadMode),
        f: form.avatarType === "upload" ? 1 : "",
        g: common_vendor.o(activateUploadAvatar, "b6"),
        h: common_vendor.t(TEXT.textMode),
        i: form.avatarType === "text" ? 1 : "",
        j: common_vendor.o(($event) => setAvatarType("text"), "06"),
        k: form.avatarType === "preset"
      }, form.avatarType === "preset" ? {
        l: common_vendor.f(common_vendor.unref(avatarPresets), (item, k0, i0) => {
          return {
            a: common_vendor.t(item.text),
            b: common_vendor.t(item.label),
            c: item.key,
            d: form.avatarPreset === item.key ? 1 : "",
            e: item.gradient,
            f: common_vendor.o(($event) => selectPreset(item.key), item.key)
          };
        }),
        m: common_vendor.p({
          label: TEXT.presetFieldLabel,
          hint: TEXT.presetHint,
          bare: true
        })
      } : form.avatarType === "upload" ? common_vendor.e({
        o: previewAvatarUrl.value
      }, previewAvatarUrl.value ? {
        p: previewAvatarUrl.value,
        q: common_vendor.o(previewCurrentAvatar, "8f")
      } : {
        r: common_vendor.t(TEXT.emptyUpload)
      }, {
        s: common_vendor.t(TEXT.chooseButton),
        t: common_vendor.o(chooseAvatarImage, "53"),
        v: common_vendor.t(TEXT.clearButton),
        w: common_vendor.o(clearAvatarImage, "10"),
        x: common_vendor.p({
          label: TEXT.uploadFieldLabel,
          hint: TEXT.uploadHint,
          bare: true
        })
      }) : {
        y: TEXT.textPlaceholder,
        z: form.avatarText,
        A: common_vendor.o(($event) => form.avatarText = $event.detail.value, "e4"),
        B: common_vendor.p({
          label: TEXT.textFieldLabel,
          hint: TEXT.textHint
        })
      }, {
        n: form.avatarType === "upload",
        C: common_vendor.p({
          title: TEXT.panelTitle,
          description: TEXT.panelDescription
        }),
        D: common_vendor.t(TEXT.saveButton),
        E: common_vendor.o(handleSave, "55"),
        F: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-281c3758"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account/avatar.js.map
