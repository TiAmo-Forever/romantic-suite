"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const utils_nav = require("../../utils/nav.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
const REMEMBERED_LOGIN_KEY = "romantic_remembered_login";
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const form = common_vendor.reactive({
      username: "",
      password: ""
    });
    const hearts = common_vendor.ref([]);
    const rememberAccount = common_vendor.ref(false);
    const showPassword = common_vendor.ref(false);
    const submitting = common_vendor.ref(false);
    let heartTimer = null;
    let heartId = 1;
    let screenWidth = 375;
    let screenHeight = 667;
    const heartTexts = ["❤", "♡", "♥", "✦", "✿"];
    const heartColors = ["rgba(227, 170, 103, 0.34)", "rgba(214, 188, 148, 0.34)", "rgba(255, 255, 255, 0.45)"];
    function random(min, max) {
      return Math.random() * (max - min) + min;
    }
    function initSystemInfo() {
      const info = common_vendor.index.getSystemInfoSync();
      screenWidth = info.windowWidth || 375;
      screenHeight = info.windowHeight || 667;
    }
    function restoreRememberedUsername() {
      const rememberedLogin = common_vendor.index.getStorageSync(REMEMBERED_LOGIN_KEY);
      if (!rememberedLogin || typeof rememberedLogin !== "object") {
        return;
      }
      form.username = String(rememberedLogin.username || "").trim();
      form.password = String(rememberedLogin.password || "");
      if (!form.username || !form.password) {
        form.username = "";
        form.password = "";
        return;
      }
      rememberAccount.value = true;
    }
    function persistRememberedUsername() {
      if (rememberAccount.value && form.username && form.password) {
        common_vendor.index.setStorageSync(REMEMBERED_LOGIN_KEY, {
          username: form.username,
          password: form.password
        });
        return;
      }
      common_vendor.index.removeStorageSync(REMEMBERED_LOGIN_KEY);
    }
    function createHeart() {
      const item = {
        id: heartId++,
        left: random(0, screenWidth - 30),
        bottom: random(-20, 180),
        size: random(16, 28),
        duration: random(4, 6.5),
        drift: random(-36, 36),
        rotate: random(-18, 18),
        text: heartTexts[Math.floor(Math.random() * heartTexts.length)],
        color: heartColors[Math.floor(Math.random() * heartColors.length)]
      };
      hearts.value.push(item);
      setTimeout(() => {
        hearts.value = hearts.value.filter((value) => value.id !== item.id);
      }, item.duration * 1e3);
    }
    function getHeartStyle(item) {
      return {
        left: `${item.left}px`,
        bottom: `${item.bottom}px`,
        fontSize: `${item.size}px`,
        color: item.color,
        "--float-x": `${item.drift}px`,
        "--float-y": `${screenHeight * 0.34}px`,
        "--rotate-deg": `${item.rotate}deg`,
        "--duration": `${item.duration}s`
      };
    }
    function toggleRemember() {
      rememberAccount.value = !rememberAccount.value;
      persistRememberedUsername();
    }
    function togglePassword() {
      showPassword.value = !showPassword.value;
    }
    function handleForgotPassword() {
      common_vendor.index.showToast({
        title: "忘记密码功能暂未开放",
        icon: "none"
      });
    }
    async function handleLogin() {
      if (submitting.value) {
        return;
      }
      if (!form.username) {
        common_vendor.index.showToast({
          title: "请输入账号",
          icon: "none"
        });
        return;
      }
      if (!form.password) {
        common_vendor.index.showToast({
          title: "请输入密码",
          icon: "none"
        });
        return;
      }
      submitting.value = true;
      try {
        const res = await utils_auth.login(form.username, form.password);
        if (!res.success) {
          common_vendor.index.showToast({
            title: res.message,
            icon: "none"
          });
          return;
        }
        persistRememberedUsername();
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        setTimeout(() => {
          utils_nav.openHomePage();
        }, 400);
      } finally {
        submitting.value = false;
      }
    }
    function handlePageTap() {
      for (let index = 0; index < 4; index += 1) {
        setTimeout(() => {
          createHeart();
        }, index * 90);
      }
    }
    common_vendor.onMounted(() => {
      utils_auth.clearLoginState();
      initSystemInfo();
      restoreRememberedUsername();
      heartTimer = setInterval(createHeart, 900);
    });
    common_vendor.onUnmounted(() => {
      if (heartTimer) {
        clearInterval(heartTimer);
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(hearts.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.text),
            b: item.id,
            c: common_vendor.s(getHeartStyle(item))
          };
        }),
        b: form.username,
        c: common_vendor.o(common_vendor.m(($event) => form.username = $event.detail.value, {
          trim: true
        }), "e9"),
        d: !showPassword.value,
        e: form.password,
        f: common_vendor.o(($event) => form.password = $event.detail.value, "79"),
        g: common_vendor.t(showPassword.value ? "隐藏" : "显示"),
        h: common_vendor.o(togglePassword, "ef"),
        i: rememberAccount.value ? 1 : "",
        j: common_vendor.o(toggleRemember, "b9"),
        k: common_vendor.o(handleForgotPassword, "e7"),
        l: submitting.value,
        m: common_vendor.o(handleLogin, "e2"),
        n: common_vendor.o(handlePageTap, "e3")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
