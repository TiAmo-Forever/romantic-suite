if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const MANUAL_ENV = "production";
  const ENV_CONFIG = {
    development: {
      apiBaseUrl: "http://127.0.0.1:8081"
    },
    production: {
      apiBaseUrl: "https://romantic.allmyreasons.love"
    }
  };
  function resolveEnvName() {
    const envName = String(MANUAL_ENV).trim().toLowerCase();
    return ENV_CONFIG[envName] ? envName : "development";
  }
  function joinUrl$1(baseUrl, path) {
    const normalizedBase = String(baseUrl || "").replace(/\/+$/, "");
    const normalizedPath = String(path || "").replace(/^\/+/, "");
    return `${normalizedBase}/${normalizedPath}`;
  }
  function getAppEnv() {
    return resolveEnvName();
  }
  function getAppConfig() {
    return {
      env: getAppEnv(),
      ...ENV_CONFIG[getAppEnv()]
    };
  }
  function getApiBaseUrl() {
    return getAppConfig().apiBaseUrl;
  }
  function buildApiUrl(path) {
    return joinUrl$1(getApiBaseUrl(), path);
  }
  function buildServerAssetUrl(path) {
    return joinUrl$1(getApiBaseUrl(), path);
  }
  const OFFLINE_FLAG_KEY = "romantic_server_offline";
  const OFFLINE_MESSAGE = "当前采用离线数据，操作后不会更新";
  let offlineModalShown = false;
  function isServerOffline() {
    return !!uni.getStorageSync(OFFLINE_FLAG_KEY);
  }
  function markServerOnline() {
    uni.removeStorageSync(OFFLINE_FLAG_KEY);
    offlineModalShown = false;
  }
  function markServerOffline(message = OFFLINE_MESSAGE) {
    uni.setStorageSync(OFFLINE_FLAG_KEY, true);
    if (offlineModalShown) {
      return;
    }
    offlineModalShown = true;
    uni.showModal({
      title: "网络异常",
      content: message,
      showCancel: false,
      confirmText: "我知道了"
    });
  }
  function ensureServerWritable() {
    if (!isServerOffline()) {
      return true;
    }
    uni.showToast({
      title: "离线模式下不支持修改",
      icon: "none"
    });
    return false;
  }
  const AUTH_INVALID_MESSAGES$2 = [
    "AUTH_INVALID",
    "LOGIN_EXPIRED",
    "UNAUTHORIZED"
  ];
  const OFFLINE_STATUS_CODES = [502, 503, 504];
  function isAuthInvalid$2(statusCode, payload) {
    const message = String((payload == null ? void 0 : payload.message) || "").trim();
    return statusCode === 401 || AUTH_INVALID_MESSAGES$2.includes(message);
  }
  function isOfflineFailure(statusCode, payload) {
    const message = String((payload == null ? void 0 : payload.message) || "").trim();
    return OFFLINE_STATUS_CODES.includes(statusCode) || message.includes("Failed to obtain JDBC Connection");
  }
  function normalizeRequestFailMessage(error, requestUrl) {
    const rawMessage = String((error == null ? void 0 : error.errMsg) || "").trim();
    const apiUrl = buildApiUrl(requestUrl || "");
    if (!rawMessage) {
      return `无法连接到服务器，请确认后端服务已启动：${apiUrl}`;
    }
    if (rawMessage.includes("Failed to connect") || rawMessage.includes("statusCode:-1")) {
      return `无法连接到服务器，请确认后端服务已启动：${apiUrl}`;
    }
    if (rawMessage.toLowerCase().includes("timeout")) {
      return `连接服务器超时，请检查服务是否可用：${apiUrl}`;
    }
    if (rawMessage.toLowerCase().includes("abort")) {
      return `服务器连接已中断，请确认服务状态：${apiUrl}`;
    }
    return `请求服务器失败：${rawMessage}`;
  }
  function request(options) {
    const { url, method = "GET", data, header = {}, offlineTip = true } = options || {};
    const token = uni.getStorageSync("romantic_token");
    return new Promise((resolve, reject) => {
      uni.request({
        url: buildApiUrl(url),
        method,
        data,
        header: {
          "Content-Type": "application/json",
          ...token ? { Authorization: `Bearer ${token}` } : {},
          ...header
        },
        success(response) {
          const { statusCode, data: payload } = response;
          if (isAuthInvalid$2(statusCode, payload)) {
            const message = (payload == null ? void 0 : payload.message) || "Login expired, please sign in again";
            redirectToLogin(message);
            reject(new Error(message));
            return;
          }
          if (isOfflineFailure(statusCode, payload)) {
            if (offlineTip) {
              markServerOffline();
            }
            reject(new Error((payload == null ? void 0 : payload.message) || "Server is temporarily unavailable"));
            return;
          }
          if (statusCode >= 200 && statusCode < 300) {
            markServerOnline();
            resolve(payload);
            return;
          }
          reject(new Error((payload == null ? void 0 : payload.message) || `Request failed (${statusCode})`));
        },
        fail(error) {
          if (offlineTip) {
            markServerOffline();
          }
          reject(new Error(normalizeRequestFailMessage(error, url)));
        }
      });
    });
  }
  async function loginByServer(payload) {
    const response = await request({
      url: "/api/auth/login",
      method: "POST",
      data: payload,
      offlineTip: false
    });
    if (!(response == null ? void 0 : response.success)) {
      throw new Error((response == null ? void 0 : response.message) || "登录失败");
    }
    return response.data;
  }
  async function logoutByServer() {
    try {
      await request({
        url: "/api/auth/logout",
        method: "POST",
        offlineTip: false
      });
    } catch (error) {
    }
  }
  const PROFILE_KEY = "romantic_profile";
  const avatarPresets = [
    { key: "heart", text: "💕", label: "心动", gradient: "linear-gradient(135deg, #ff8db1, #ffc0d2)" },
    { key: "bunny", text: "🐰", label: "软萌", gradient: "linear-gradient(135deg, #ffd0dc, #fff1f5)" },
    { key: "star", text: "🌟", label: "闪耀", gradient: "linear-gradient(135deg, #ffd36e, #fff1b0)" },
    { key: "cat", text: "🐱", label: "可爱", gradient: "linear-gradient(135deg, #ffc8a8, #ffe7d5)" },
    { key: "moon", text: "🌙", label: "月光", gradient: "linear-gradient(135deg, #a8b8ff, #d9e2ff)" },
    { key: "flower", text: "🌷", label: "花语", gradient: "linear-gradient(135deg, #ffb7cc, #ffe5ef)" },
    { key: "bear", text: "🧸", label: "抱抱", gradient: "linear-gradient(135deg, #d7b58a, #f5e4cc)" },
    { key: "cloud", text: "☁️", label: "云朵", gradient: "linear-gradient(135deg, #cfe7ff, #eef7ff)" }
  ];
  const avatarPresetMap = avatarPresets.reduce((accumulator, item) => {
    accumulator[item.key] = item.text;
    return accumulator;
  }, {});
  const defaultProfile = {
    nickname: "嘉嘉",
    avatarType: "preset",
    avatarPreset: "heart",
    avatarText: "💕",
    avatarImage: "",
    bio: "把喜欢写进每一天。",
    city: "上海",
    loverNickname: "",
    anniversaryDate: "2025-02-14",
    defaultMeetingAreaId: 310100,
    defaultMeetingPlace: "上海",
    email: "",
    password: "admin"
  };
  function normalizeAvatarText(value) {
    const text = String(value || "").trim();
    if (!text || text.toUpperCase() === "LOVE") {
      return defaultProfile.avatarText;
    }
    if (/^[A-Za-z]{3,}$/.test(text)) {
      return text.slice(0, 1).toUpperCase();
    }
    return text.slice(0, 2);
  }
  function normalizeProfile(profile) {
    const payload = {
      ...defaultProfile,
      ...profile
    };
    if (!avatarPresetMap[payload.avatarPreset]) {
      payload.avatarPreset = defaultProfile.avatarPreset;
    }
    payload.avatarText = normalizeAvatarText(payload.avatarText);
    payload.nickname = payload.nickname || defaultProfile.nickname;
    payload.bio = payload.bio || defaultProfile.bio;
    payload.city = payload.city || defaultProfile.city;
    payload.loverNickname = payload.loverNickname || payload.nickname || defaultProfile.nickname;
    payload.defaultMeetingAreaId = Number(payload.defaultMeetingAreaId || defaultProfile.defaultMeetingAreaId || 0);
    payload.defaultMeetingPlace = payload.defaultMeetingPlace || payload.city || defaultProfile.defaultMeetingPlace;
    if (payload.avatarImage) {
      payload.avatarType = "upload";
    } else if (payload.avatarType !== "text" && payload.avatarType !== "preset") {
      payload.avatarType = "preset";
    }
    return payload;
  }
  function getDefaultProfile() {
    return { ...defaultProfile };
  }
  function getAvatarPresets() {
    return avatarPresets.map((item) => ({ ...item }));
  }
  function getAvatarPresetMap() {
    return { ...avatarPresetMap };
  }
  function getProfile() {
    const stored = uni.getStorageSync(PROFILE_KEY);
    if (!stored || typeof stored !== "object") {
      return getDefaultProfile();
    }
    return normalizeProfile(stored);
  }
  function saveProfile(profile) {
    const payload = normalizeProfile(profile);
    uni.setStorageSync(PROFILE_KEY, payload);
    return payload;
  }
  const TOKEN_KEY = "romantic_token";
  const USER_KEY = "romantic_user";
  const LOGIN_PAGE = "/pages/login/login";
  let redirectingToLogin = false;
  async function login(username, password) {
    var _a;
    try {
      const payload = await loginByServer({ username, password });
      const user = {
        username: payload.username,
        nickname: payload.nickname || ((_a = payload.profile) == null ? void 0 : _a.nickname) || "Romantic Space"
      };
      uni.setStorageSync(TOKEN_KEY, payload.token);
      uni.setStorageSync(USER_KEY, user);
      if (payload.profile) {
        saveProfile({
          ...payload.profile,
          password
        });
      }
      return { success: true, user };
    } catch (error) {
      return { success: false, message: (error == null ? void 0 : error.message) || "Login failed" };
    }
  }
  function clearLoginState() {
    uni.removeStorageSync(TOKEN_KEY);
    uni.removeStorageSync(USER_KEY);
  }
  async function logout(options = {}) {
    const { notifyServer = true } = options;
    if (notifyServer) {
      try {
        await logoutByServer();
      } catch (error) {
      }
    }
    clearLoginState();
  }
  function redirectToLogin(message = "Login expired, please sign in again") {
    clearLoginState();
    if (redirectingToLogin) {
      return;
    }
    redirectingToLogin = true;
    uni.showToast({
      title: message,
      icon: "none"
    });
    setTimeout(() => {
      uni.reLaunch({ url: LOGIN_PAGE });
      redirectingToLogin = false;
    }, 120);
  }
  function isLogin() {
    return !!uni.getStorageSync(TOKEN_KEY);
  }
  function getUser() {
    return uni.getStorageSync(USER_KEY) || null;
  }
  function requireAuth() {
    if (isLogin()) {
      return true;
    }
    redirectToLogin("Please sign in first");
    return false;
  }
  function goPage(url) {
    uni.navigateTo({ url, animationType: "pop-in", animationDuration: 220 });
  }
  function switchRootPage(url) {
    uni.reLaunch({ url });
  }
  function openHomePage() {
    switchRootPage("/pages/home/home");
  }
  function backPage() {
    uni.navigateBack({ animationType: "pop-out", animationDuration: 200 });
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$m = {
    __name: "login",
    setup(__props, { expose: __expose }) {
      __expose();
      const form = vue.reactive({
        username: "chenjia",
        password: "admin"
      });
      const hearts = vue.ref([]);
      let heartTimer = null;
      let heartId = 1;
      let screenWidth = 375;
      let screenHeight = 667;
      const heartTexts = ["❤", "💕", "💗", "💖", "💘", "💞"];
      const heartColors = ["#ff4d6d", "#ff5e7d", "#ff85a1", "#ff99ac", "#ffb3c1", "#ffd6e0"];
      function random(min, max) {
        return Math.random() * (max - min) + min;
      }
      function initSystemInfo() {
        const info = uni.getSystemInfoSync();
        screenWidth = info.windowWidth || 375;
        screenHeight = info.windowHeight || 667;
      }
      function createHeart() {
        const item = {
          id: heartId++,
          left: random(0, screenWidth - 30),
          bottom: -20,
          size: random(16, 36),
          duration: random(3, 5),
          drift: random(-40, 40),
          rotate: random(-20, 20),
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
          "--float-y": `${screenHeight * 0.7}px`,
          "--rotate-deg": `${item.rotate}deg`,
          "--duration": `${item.duration}s`
        };
      }
      async function handleLogin() {
        const res = await login(form.username, form.password);
        if (!res.success) {
          uni.showToast({
            title: res.message,
            icon: "none"
          });
          return;
        }
        uni.showToast({
          title: "登录成功",
          icon: "success"
        });
        setTimeout(() => {
          openHomePage();
        }, 500);
      }
      function handlePageTap() {
        for (let i = 0; i < 6; i += 1) {
          setTimeout(() => {
            createHeart();
          }, i * 60);
        }
      }
      vue.onMounted(() => {
        clearLoginState();
        initSystemInfo();
        heartTimer = setInterval(createHeart, 320);
      });
      vue.onUnmounted(() => {
        if (heartTimer) {
          clearInterval(heartTimer);
        }
      });
      const __returned__ = { form, hearts, get heartTimer() {
        return heartTimer;
      }, set heartTimer(v) {
        heartTimer = v;
      }, get heartId() {
        return heartId;
      }, set heartId(v) {
        heartId = v;
      }, get screenWidth() {
        return screenWidth;
      }, set screenWidth(v) {
        screenWidth = v;
      }, get screenHeight() {
        return screenHeight;
      }, set screenHeight(v) {
        screenHeight = v;
      }, heartTexts, heartColors, random, initSystemInfo, createHeart, getHeartStyle, handleLogin, handlePageTap, reactive: vue.reactive, ref: vue.ref, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, get clearLoginState() {
        return clearLoginState;
      }, get login() {
        return login;
      }, get openHomePage() {
        return openHomePage;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "page",
      onClick: $setup.handlePageTap
    }, [
      vue.createElementVNode("view", { class: "bg-layer" }),
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($setup.hearts, (item) => {
          return vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: item.id,
              class: "heart",
              style: vue.normalizeStyle($setup.getHeartStyle(item))
            },
            vue.toDisplayString(item.text),
            5
            /* TEXT, STYLE */
          );
        }),
        128
        /* KEYED_FRAGMENT */
      )),
      vue.createElementVNode("view", { class: "login-card app-glass-panel" }, [
        vue.createElementVNode("view", { class: "login-badge app-pill app-pill-glass" }, "Romantic Login"),
        vue.createElementVNode("view", { class: "title" }, "欢迎来到浪漫小屋"),
        vue.createElementVNode("view", { class: "subtitle" }, "每一次登录，都是奔向心动的一次靠近。"),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "label" }, "账号"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.username = $event),
              class: "input app-input-shell app-field",
              placeholder: "请输入账号",
              "placeholder-class": "input-placeholder"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.username]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "label" }, "密码"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.password = $event),
              class: "input app-input-shell app-field",
              password: "",
              placeholder: "请输入密码",
              "placeholder-class": "input-placeholder"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.password]
          ])
        ]),
        vue.createElementVNode("view", { class: "tips" }, " 可用账号：chenjia / admin，liubaohua / admin "),
        vue.createElementVNode("button", {
          class: "login-btn app-primary-btn app-primary-btn-shadow",
          onClick: $setup.handleLogin
        }, "甜蜜登录")
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$m], ["__scopeId", "data-v-e4e4508d"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/login/login.vue"]]);
  const ON_SHOW = "onShow";
  const ON_LAUNCH = "onLaunch";
  const ON_LOAD = "onLoad";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const createLifeCycleHook = (lifecycle, flag = 0) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createLifeCycleHook(
    ON_SHOW,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onLaunch = /* @__PURE__ */ createLifeCycleHook(
    ON_LAUNCH,
    1
    /* HookFlags.APP */
  );
  const onLoad = /* @__PURE__ */ createLifeCycleHook(
    ON_LOAD,
    2
    /* HookFlags.PAGE */
  );
  const THEME_KEY = "romantic_theme_settings";
  const themePresets = [
    {
      key: "pink",
      name: "心动粉",
      description: "延续现在这套粉白渐变，温柔又稳定。",
      swatches: ["#ff7ea6", "#ffb3c7", "#fff3f7"],
      variables: {
        "--app-color-primary": "#ff5e8a",
        "--app-color-primary-strong": "#ff4f7d",
        "--app-color-primary-soft": "#ff9fbc",
        "--app-color-accent": "#d89cad",
        "--app-color-text": "#8f6b77",
        "--app-color-text-strong": "#5c4550",
        "--app-color-surface": "rgba(255, 255, 255, 0.92)",
        "--app-color-surface-soft": "#fff6f9",
        "--app-gradient-primary": "linear-gradient(135deg, #ff7ea6, #ff9fbc)",
        "--app-gradient-hero": "linear-gradient(135deg, #ff8dac, #ffb3c7)",
        "--app-page-gradient-main": "linear-gradient(180deg, #fff2f6 0%, #ffe8f0 100%)",
        "--app-page-gradient-soft": "linear-gradient(180deg, #fff6fa 0%, #ffeef4 100%)",
        "--app-page-glow-strong": "rgba(255, 192, 203, 0.3)",
        "--app-page-glow-mid": "rgba(255, 182, 193, 0.24)",
        "--app-page-glow-soft": "rgba(255, 228, 236, 0.45)",
        "--app-page-orb-a": "rgba(255, 215, 228, 0.42)",
        "--app-page-orb-b": "rgba(255, 232, 238, 0.5)",
        "--app-card-gradient-soft": "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 247, 249, 0.98) 100%)",
        "--app-shadow-card": "0 18rpx 42rpx rgba(255, 128, 160, 0.12)",
        "--app-shadow-soft": "0 12rpx 24rpx rgba(255, 156, 181, 0.1)",
        "--app-page-background": "#ffd7e2"
      }
    },
    {
      key: "apricot",
      name: "奶油杏",
      description: "更柔和、更治愈，适合想把氛围做得轻一点。",
      swatches: ["#ff9f7a", "#ffd4b8", "#fff8f2"],
      variables: {
        "--app-color-primary": "#ff8b63",
        "--app-color-primary-strong": "#f26f43",
        "--app-color-primary-soft": "#ffc1a0",
        "--app-color-accent": "#d7a78e",
        "--app-color-text": "#8e6c61",
        "--app-color-text-strong": "#5f4a43",
        "--app-color-surface": "rgba(255, 255, 255, 0.94)",
        "--app-color-surface-soft": "#fff8f2",
        "--app-gradient-primary": "linear-gradient(135deg, #ff9a6e, #ffc8a7)",
        "--app-gradient-hero": "linear-gradient(135deg, #ffb28d, #ffd8bf)",
        "--app-page-gradient-main": "linear-gradient(180deg, #fff6f1 0%, #ffecdf 100%)",
        "--app-page-gradient-soft": "linear-gradient(180deg, #fff9f4 0%, #fff1e7 100%)",
        "--app-page-glow-strong": "rgba(255, 214, 189, 0.34)",
        "--app-page-glow-mid": "rgba(255, 199, 167, 0.24)",
        "--app-page-glow-soft": "rgba(255, 239, 225, 0.5)",
        "--app-page-orb-a": "rgba(255, 217, 195, 0.42)",
        "--app-page-orb-b": "rgba(255, 241, 230, 0.54)",
        "--app-card-gradient-soft": "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 248, 242, 0.98) 100%)",
        "--app-shadow-card": "0 18rpx 42rpx rgba(255, 169, 128, 0.14)",
        "--app-shadow-soft": "0 12rpx 24rpx rgba(255, 193, 148, 0.12)",
        "--app-page-background": "#ffe6d7"
      }
    },
    {
      key: "night",
      name: "星夜蓝",
      description: "更安静，也更像陪伴型产品的夜晚气质。",
      swatches: ["#6d7cff", "#9db2ff", "#eef1ff"],
      variables: {
        "--app-color-primary": "#6d7cff",
        "--app-color-primary-strong": "#5667f2",
        "--app-color-primary-soft": "#9fb0ff",
        "--app-color-accent": "#9ea8d7",
        "--app-color-text": "#6d7391",
        "--app-color-text-strong": "#48506a",
        "--app-color-surface": "rgba(255, 255, 255, 0.93)",
        "--app-color-surface-soft": "#f3f5ff",
        "--app-gradient-primary": "linear-gradient(135deg, #6d7cff, #9db2ff)",
        "--app-gradient-hero": "linear-gradient(135deg, #8390ff, #b8c4ff)",
        "--app-page-gradient-main": "linear-gradient(180deg, #f3f5ff 0%, #e8edff 100%)",
        "--app-page-gradient-soft": "linear-gradient(180deg, #f8f9ff 0%, #eff2ff 100%)",
        "--app-page-glow-strong": "rgba(175, 187, 255, 0.3)",
        "--app-page-glow-mid": "rgba(157, 178, 255, 0.24)",
        "--app-page-glow-soft": "rgba(232, 237, 255, 0.56)",
        "--app-page-orb-a": "rgba(197, 207, 255, 0.42)",
        "--app-page-orb-b": "rgba(236, 240, 255, 0.54)",
        "--app-card-gradient-soft": "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(243, 246, 255, 0.98) 100%)",
        "--app-shadow-card": "0 18rpx 42rpx rgba(120, 137, 255, 0.14)",
        "--app-shadow-soft": "0 12rpx 24rpx rgba(157, 178, 255, 0.12)",
        "--app-page-background": "#dfe5ff"
      }
    },
    {
      key: "mint",
      name: "薄荷绿",
      description: "清爽、轻盈，适合想把页面做得更干净。",
      swatches: ["#52c7b8", "#9be7dc", "#effcf9"],
      variables: {
        "--app-color-primary": "#47b9aa",
        "--app-color-primary-strong": "#309a8d",
        "--app-color-primary-soft": "#8fe0d4",
        "--app-color-accent": "#8bbeb6",
        "--app-color-text": "#64847f",
        "--app-color-text-strong": "#44615d",
        "--app-color-surface": "rgba(255, 255, 255, 0.94)",
        "--app-color-surface-soft": "#f1fffb",
        "--app-gradient-primary": "linear-gradient(135deg, #52c7b8, #93e3d7)",
        "--app-gradient-hero": "linear-gradient(135deg, #6fd5c7, #b4f0e8)",
        "--app-page-gradient-main": "linear-gradient(180deg, #f2fffb 0%, #e3f8f2 100%)",
        "--app-page-gradient-soft": "linear-gradient(180deg, #f7fffd 0%, #edfdf8 100%)",
        "--app-page-glow-strong": "rgba(155, 231, 220, 0.3)",
        "--app-page-glow-mid": "rgba(143, 224, 212, 0.24)",
        "--app-page-glow-soft": "rgba(223, 248, 243, 0.58)",
        "--app-page-orb-a": "rgba(180, 241, 232, 0.42)",
        "--app-page-orb-b": "rgba(236, 255, 250, 0.54)",
        "--app-card-gradient-soft": "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 255, 251, 0.98) 100%)",
        "--app-shadow-card": "0 18rpx 42rpx rgba(82, 199, 184, 0.14)",
        "--app-shadow-soft": "0 12rpx 24rpx rgba(147, 227, 215, 0.12)",
        "--app-page-background": "#d9f4ee"
      }
    }
  ];
  const defaultThemeSettings = {
    presetKey: "pink"
  };
  function getThemePresetMap() {
    return themePresets.reduce((accumulator, item) => {
      accumulator[item.key] = item;
      return accumulator;
    }, {});
  }
  function normalizeThemeSettings(settings) {
    const presetMap = getThemePresetMap();
    const payload = {
      ...defaultThemeSettings,
      ...settings
    };
    if (!presetMap[payload.presetKey]) {
      payload.presetKey = defaultThemeSettings.presetKey;
    }
    return payload;
  }
  function getUserThemeKey() {
    var _a;
    const username = String(((_a = getUser()) == null ? void 0 : _a.username) || "").trim();
    return username ? `${THEME_KEY}_${username}` : THEME_KEY;
  }
  function readRawThemeSettings() {
    return uni.getStorageSync(getUserThemeKey());
  }
  function migrateLegacyThemeSettings() {
    const userThemeKey = getUserThemeKey();
    if (userThemeKey === THEME_KEY) {
      return;
    }
    const currentStored = uni.getStorageSync(userThemeKey);
    if (currentStored && typeof currentStored === "object") {
      return;
    }
    const legacyStored = uni.getStorageSync(THEME_KEY);
    if (!legacyStored || typeof legacyStored !== "object") {
      return;
    }
    uni.setStorageSync(userThemeKey, normalizeThemeSettings(legacyStored));
  }
  function getThemePresets() {
    return themePresets.map((item) => ({
      ...item,
      swatches: [...item.swatches],
      variables: { ...item.variables }
    }));
  }
  function getThemeSettings() {
    migrateLegacyThemeSettings();
    const stored = readRawThemeSettings();
    if (!stored || typeof stored !== "object") {
      return { ...defaultThemeSettings };
    }
    return normalizeThemeSettings(stored);
  }
  function saveThemeSettings(settings) {
    const payload = normalizeThemeSettings(settings);
    uni.setStorageSync(getUserThemeKey(), payload);
    return payload;
  }
  function resetThemeSettings() {
    uni.setStorageSync(getUserThemeKey(), defaultThemeSettings);
    return { ...defaultThemeSettings };
  }
  function getCurrentThemePreset(settings = getThemeSettings()) {
    const presetMap = getThemePresetMap();
    const preset = presetMap[settings.presetKey] || presetMap[defaultThemeSettings.presetKey];
    return {
      ...preset,
      swatches: [...preset.swatches],
      variables: { ...preset.variables }
    };
  }
  function applyTheme(settings = getThemeSettings()) {
    const preset = getCurrentThemePreset(settings);
    const root = typeof document !== "undefined" ? document.documentElement : null;
    if (root) {
      Object.entries(preset.variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
    uni.$emit("theme:changed", { ...preset });
    return preset;
  }
  function saveAndApplyTheme(settings) {
    const payload = saveThemeSettings(settings);
    return applyTheme(payload);
  }
  function useThemePage() {
    const themeStyle = vue.ref({ ...getCurrentThemePreset(getThemeSettings()).variables });
    function syncTheme() {
      themeStyle.value = { ...getCurrentThemePreset(getThemeSettings()).variables };
    }
    const handleThemeChange = () => {
      syncTheme();
    };
    onShow(() => {
      syncTheme();
    });
    uni.$on("theme:changed", handleThemeChange);
    vue.onUnmounted(() => {
      uni.$off("theme:changed", handleThemeChange);
    });
    return {
      themeStyle,
      syncTheme
    };
  }
  const _sfc_main$l = {
    __name: "BottomTab",
    props: {
      activeKey: {
        type: String,
        default: "home"
      }
    },
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const currentActive = vue.ref(props.activeKey);
      vue.watch(
        () => props.activeKey,
        (newVal) => {
          currentActive.value = newVal;
        }
      );
      const tabs = [
        {
          key: "home",
          label: "首页",
          icon: "🏠",
          path: "/pages/home/home"
        },
        {
          key: "planet",
          label: "星球",
          icon: "🪐",
          path: "/pages/planet/planet"
        },
        {
          key: "mine",
          label: "我的",
          icon: "💞",
          path: "/pages/mine/mine"
        }
      ];
      function handleTabClick(tab) {
        if (tab.key === currentActive.value) {
          return;
        }
        currentActive.value = tab.key;
        switchRootPage(tab.path);
      }
      const __returned__ = { props, currentActive, tabs, handleTabClick, ref: vue.ref, watch: vue.watch, get switchRootPage() {
        return switchRootPage;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "bottom-tab" }, [
      (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($setup.tabs, (tab) => {
          return vue.createElementVNode("view", {
            key: tab.key,
            class: vue.normalizeClass(["tab-item", { active: tab.key === $setup.currentActive }]),
            "hover-class": "tab-item-press",
            "hover-stay-time": "60",
            onClick: ($event) => $setup.handleTabClick(tab)
          }, [
            vue.createElementVNode("view", { class: "tab-glow" }),
            vue.createElementVNode("view", { class: "tab-icon-wrap" }, [
              vue.createElementVNode(
                "view",
                { class: "icon" },
                vue.toDisplayString(tab.icon),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode(
              "view",
              { class: "label" },
              vue.toDisplayString(tab.label),
              1
              /* TEXT */
            )
          ], 10, ["onClick"]);
        }),
        64
        /* STABLE_FRAGMENT */
      ))
    ]);
  }
  const BottomTab = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$l], ["__scopeId", "data-v-41549bae"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/components/BottomTab.vue"]]);
  const _sfc_main$k = {
    __name: "home",
    setup(__props, { expose: __expose }) {
      __expose();
      const { themeStyle } = useThemePage();
      function goCountdown() {
        goPage("/pages/modules/countdown/index");
      }
      function goAnniversary() {
        goPage("/pages/modules/anniversary/index");
      }
      function goComingSoon(moduleName) {
        goPage(`/pages/modules/coming-soon/index?title=${encodeURIComponent(moduleName)}`);
      }
      vue.onMounted(() => {
        requireAuth();
      });
      const __returned__ = { themeStyle, goCountdown, goAnniversary, goComingSoon, onMounted: vue.onMounted, get requireAuth() {
        return requireAuth;
      }, get goPage() {
        return goPage;
      }, get useThemePage() {
        return useThemePage;
      }, BottomTab };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-page-shell app-page-shell-tabbed home-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "bg-layer" }),
        vue.createElementVNode("view", { class: "orb orb-a" }),
        vue.createElementVNode("view", { class: "orb orb-b" }),
        vue.createElementVNode("view", { class: "hero-card app-fade-up app-delay-1" }, [
          vue.createElementVNode("view", { class: "hero-glow hero-glow-a" }),
          vue.createElementVNode("view", { class: "hero-glow hero-glow-b" }),
          vue.createElementVNode("view", { class: "hero-badge app-pill app-pill-glass" }, "浪漫主站"),
          vue.createElementVNode("view", { class: "hero-kicker" }, "今日推荐"),
          vue.createElementVNode("view", { class: "hero-title" }, "欢迎来到你们的浪漫宇宙"),
          vue.createElementVNode("view", { class: "hero-desc" }, "把等待见面的心跳、纪念日的仪式感，还有没说出口的温柔，都收进这里。"),
          vue.createElementVNode("view", { class: "hero-meta-row" }, [
            vue.createElementVNode("view", { class: "hero-chip hero-chip-strong app-pill app-pill-glass" }, "主入口"),
            vue.createElementVNode("view", { class: "hero-chip app-pill app-pill-glass" }, "先去看看见面倒计时")
          ])
        ]),
        vue.createElementVNode("view", { class: "section-head app-fade-up app-delay-2" }, [
          vue.createElementVNode("view", { class: "app-section-kicker" }, "精选模块"),
          vue.createElementVNode("view", { class: "app-section-title" }, "把最常用的浪漫功能放近一点"),
          vue.createElementVNode("view", { class: "app-section-desc" }, "首页不再只是入口堆叠，而是给你一个更像“生活面板”的主页面。")
        ]),
        vue.createElementVNode("view", { class: "feature-grid app-fade-up app-delay-2" }, [
          vue.createElementVNode("view", {
            class: "feature-card feature-card-primary app-card-soft",
            "hover-class": "feature-card-active",
            "hover-stay-time": "70",
            onClick: $setup.goCountdown
          }, [
            vue.createElementVNode("view", { class: "feature-accent" }),
            vue.createElementVNode("view", { class: "feature-head" }, [
              vue.createElementVNode("view", { class: "feature-icon-wrap" }, [
                vue.createElementVNode("view", { class: "feature-icon" }, "⏰")
              ]),
              vue.createElementVNode("view", { class: "feature-chip" }, "推荐")
            ]),
            vue.createElementVNode("view", { class: "feature-title" }, "见面倒计时"),
            vue.createElementVNode("view", { class: "feature-summary" }, "把想念拆成天、小时和分钟，一直数到见面的那一刻。"),
            vue.createElementVNode("view", { class: "feature-preview" }, "心动值正在上升")
          ]),
          vue.createElementVNode("view", {
            class: "feature-card app-card-soft",
            "hover-class": "feature-card-active",
            "hover-stay-time": "70",
            onClick: $setup.goAnniversary
          }, [
            vue.createElementVNode("view", { class: "feature-accent accent-flower" }),
            vue.createElementVNode("view", { class: "feature-head" }, [
              vue.createElementVNode("view", { class: "feature-icon-wrap soft-peach" }, [
                vue.createElementVNode("view", { class: "feature-icon" }, "🌷")
              ]),
              vue.createElementVNode("view", { class: "feature-chip soft" }, "已开放")
            ]),
            vue.createElementVNode("view", { class: "feature-title" }, "恋爱纪念日"),
            vue.createElementVNode("view", { class: "feature-summary" }, "让每一个重要日子都拥有被认真记录的理由。"),
            vue.createElementVNode("view", { class: "feature-preview light" }, "现在就能开始记录")
          ]),
          vue.createElementVNode("view", {
            class: "feature-card app-card-soft",
            "hover-class": "feature-card-active",
            "hover-stay-time": "70",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.goComingSoon("甜蜜相册"))
          }, [
            vue.createElementVNode("view", { class: "feature-accent accent-photo" }),
            vue.createElementVNode("view", { class: "feature-head" }, [
              vue.createElementVNode("view", { class: "feature-icon-wrap soft-sky" }, [
                vue.createElementVNode("view", { class: "feature-icon" }, "📷")
              ]),
              vue.createElementVNode("view", { class: "feature-chip soft" }, "预留")
            ]),
            vue.createElementVNode("view", { class: "feature-title" }, "甜蜜相册"),
            vue.createElementVNode("view", { class: "feature-summary" }, "把照片、地点和当天的小心情一起装进回忆卡片。"),
            vue.createElementVNode("view", { class: "feature-preview light" }, "故事会慢慢长出来")
          ]),
          vue.createElementVNode("view", {
            class: "feature-card app-card-soft",
            "hover-class": "feature-card-active",
            "hover-stay-time": "70",
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.goComingSoon("情话便签"))
          }, [
            vue.createElementVNode("view", { class: "feature-accent accent-note" }),
            vue.createElementVNode("view", { class: "feature-head" }, [
              vue.createElementVNode("view", { class: "feature-icon-wrap soft-lilac" }, [
                vue.createElementVNode("view", { class: "feature-icon" }, "💌")
              ]),
              vue.createElementVNode("view", { class: "feature-chip soft" }, "预留")
            ]),
            vue.createElementVNode("view", { class: "feature-title" }, "情话便签"),
            vue.createElementVNode("view", { class: "feature-summary" }, "把那些随手想起的话保存下来，等合适的时候送给 TA。"),
            vue.createElementVNode("view", { class: "feature-preview light" }, "温柔的句子在排队")
          ])
        ]),
        vue.createVNode($setup["BottomTab"], { activeKey: "home" })
      ],
      4
      /* STYLE */
    );
  }
  const PagesHomeHome = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$k], ["__scopeId", "data-v-07e72d3c"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/home/home.vue"]]);
  const _sfc_main$j = {
    __name: "planet",
    setup(__props, { expose: __expose }) {
      __expose();
      const { themeStyle } = useThemePage();
      function goComingSoon(title) {
        goPage(`/pages/modules/coming-soon/index?title=${encodeURIComponent(title)}`);
      }
      function goAnniversary() {
        goPage("/pages/modules/anniversary/index");
      }
      vue.onMounted(() => {
        requireAuth();
      });
      const __returned__ = { themeStyle, goComingSoon, goAnniversary, onMounted: vue.onMounted, get requireAuth() {
        return requireAuth;
      }, get goPage() {
        return goPage;
      }, get useThemePage() {
        return useThemePage;
      }, BottomTab };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-page-shell app-page-shell-tabbed planet-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "planet-bg planet-bg-a" }),
        vue.createElementVNode("view", { class: "planet-bg planet-bg-b" }),
        vue.createElementVNode("view", { class: "planet-hero app-fade-up" }, [
          vue.createElementVNode("view", { class: "planet-orbit orbit-a" }),
          vue.createElementVNode("view", { class: "planet-orbit orbit-b" }),
          vue.createElementVNode("view", { class: "planet-badge" }, "浪漫星球"),
          vue.createElementVNode("view", { class: "planet-kicker" }, "回忆与期待"),
          vue.createElementVNode("view", { class: "planet-title" }, "把未来会发光的模块先种在这里"),
          vue.createElementVNode("view", { class: "planet-desc" }, "这里以后可以放你们的纪念日、照片墙、心愿清单和约会计划，让回忆和期待都慢慢长出来。"),
          vue.createElementVNode("view", { class: "planet-meta-row" }, [
            vue.createElementVNode("view", { class: "planet-chip app-pill app-pill-soft" }, "纪念日"),
            vue.createElementVNode("view", { class: "planet-chip app-pill app-pill-soft" }, "相册"),
            vue.createElementVNode("view", { class: "planet-chip app-pill app-pill-soft" }, "计划卡")
          ])
        ]),
        vue.createElementVNode("view", { class: "section-head app-fade-up app-delay-1" }, [
          vue.createElementVNode("view", { class: "app-section-kicker" }, "即将开放"),
          vue.createElementVNode("view", { class: "app-section-title" }, "预留给更完整的浪漫记录"),
          vue.createElementVNode("view", { class: "app-section-desc" }, "先把结构和情绪留出来，后面加功能时就不会显得零散。")
        ]),
        vue.createElementVNode("view", { class: "coming-grid app-fade-up app-delay-2" }, [
          vue.createElementVNode("view", {
            class: "coming-card app-card-soft",
            "hover-class": "coming-card-active",
            "hover-stay-time": "70",
            onClick: $setup.goAnniversary
          }, [
            vue.createElementVNode("view", { class: "coming-accent accent-flower" }),
            vue.createElementVNode("view", { class: "coming-head" }, [
              vue.createElementVNode("view", { class: "coming-icon-wrap peach" }, "🌷"),
              vue.createElementVNode("view", { class: "coming-chip" }, "已开放")
            ]),
            vue.createElementVNode("view", { class: "coming-title" }, "恋爱纪念日"),
            vue.createElementVNode("view", { class: "coming-desc" }, "把重要日期做成更有氛围感的纪念卡片。")
          ]),
          vue.createElementVNode("view", {
            class: "coming-card app-card-soft",
            "hover-class": "coming-card-active",
            "hover-stay-time": "70",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.goComingSoon("甜蜜相册"))
          }, [
            vue.createElementVNode("view", { class: "coming-accent accent-photo" }),
            vue.createElementVNode("view", { class: "coming-head" }, [
              vue.createElementVNode("view", { class: "coming-icon-wrap sky" }, "📷"),
              vue.createElementVNode("view", { class: "coming-chip" }, "预留")
            ]),
            vue.createElementVNode("view", { class: "coming-title" }, "甜蜜相册"),
            vue.createElementVNode("view", { class: "coming-desc" }, "照片、地点和当天心情会一起组成回忆页。")
          ]),
          vue.createElementVNode("view", {
            class: "coming-card app-card-soft",
            "hover-class": "coming-card-active",
            "hover-stay-time": "70",
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.goComingSoon("心愿清单"))
          }, [
            vue.createElementVNode("view", { class: "coming-accent accent-star" }),
            vue.createElementVNode("view", { class: "coming-head" }, [
              vue.createElementVNode("view", { class: "coming-icon-wrap gold" }, "⭐"),
              vue.createElementVNode("view", { class: "coming-chip" }, "预留")
            ]),
            vue.createElementVNode("view", { class: "coming-title" }, "心愿清单"),
            vue.createElementVNode("view", { class: "coming-desc" }, "把想一起完成的小目标和想去的地方都记下来。")
          ]),
          vue.createElementVNode("view", {
            class: "coming-card app-card-soft",
            "hover-class": "coming-card-active",
            "hover-stay-time": "70",
            onClick: _cache[2] || (_cache[2] = ($event) => $setup.goComingSoon("浪漫计划"))
          }, [
            vue.createElementVNode("view", { class: "coming-accent accent-plan" }),
            vue.createElementVNode("view", { class: "coming-head" }, [
              vue.createElementVNode("view", { class: "coming-icon-wrap lilac" }, "🎠"),
              vue.createElementVNode("view", { class: "coming-chip" }, "预留")
            ]),
            vue.createElementVNode("view", { class: "coming-title" }, "浪漫计划"),
            vue.createElementVNode("view", { class: "coming-desc" }, "把约会想法整理成一张张轻量又好看的计划卡。")
          ])
        ]),
        vue.createVNode($setup["BottomTab"], { activeKey: "planet" })
      ],
      4
      /* STYLE */
    );
  }
  const PagesPlanetPlanet = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$j], ["__scopeId", "data-v-d8c429a1"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/planet/planet.vue"]]);
  const AVATAR_DRAFT_KEY = "romantic_avatar_draft";
  const AUTH_INVALID_MESSAGES$1 = [
    "未登录或登录已失效",
    "登录已失效，请重新登录",
    "登录已失效"
  ];
  function joinUrl(baseUrl, path) {
    const normalizedBase = String(baseUrl || "").replace(/\/+$/, "");
    const normalizedPath = String(path || "").replace(/^\/+/, "");
    return `${normalizedBase}/${normalizedPath}`;
  }
  function parseUploadResponse$1(rawData) {
    if (typeof rawData === "object" && rawData !== null) {
      return rawData;
    }
    if (!rawData) {
      return null;
    }
    try {
      return JSON.parse(rawData);
    } catch (error) {
      return null;
    }
  }
  function isAuthInvalid$1(statusCode, payload) {
    const message = String((payload == null ? void 0 : payload.message) || "").trim();
    return statusCode === 401 || AUTH_INVALID_MESSAGES$1.includes(message);
  }
  function setAvatarDraft(path) {
    uni.setStorageSync(AVATAR_DRAFT_KEY, path || "");
  }
  function getAvatarDraft() {
    return uni.getStorageSync(AVATAR_DRAFT_KEY) || "";
  }
  function clearAvatarDraft() {
    uni.removeStorageSync(AVATAR_DRAFT_KEY);
  }
  function persistAvatarDraft(filePath) {
    return new Promise((resolve) => {
      if (!filePath) {
        resolve("");
        return;
      }
      if (typeof uni.saveFile !== "function") {
        resolve(filePath);
        return;
      }
      uni.saveFile({
        tempFilePath: filePath,
        success(result) {
          resolve(result.savedFilePath || filePath);
        },
        fail() {
          resolve(filePath);
        }
      });
    });
  }
  function resolveAvatarUrl(path) {
    const value = String(path || "").trim();
    if (!value) {
      return "";
    }
    if (/^(https?:|data:|file:|wxfile:|blob:)/i.test(value)) {
      return value;
    }
    return joinUrl(getApiBaseUrl(), value);
  }
  function uploadAvatarFile(filePath) {
    const token = uni.getStorageSync("romantic_token");
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: joinUrl(getApiBaseUrl(), "/api/files/avatar"),
        filePath,
        name: "file",
        header: token ? { Authorization: `Bearer ${token}` } : {},
        success(response) {
          var _a;
          const payload = parseUploadResponse$1(response.data);
          const message = (payload == null ? void 0 : payload.message) || "头像上传失败";
          if (isAuthInvalid$1(response.statusCode, payload)) {
            redirectToLogin(message);
            reject(new Error(message));
            return;
          }
          if (response.statusCode >= 200 && response.statusCode < 300 && (payload == null ? void 0 : payload.success) && ((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.path)) {
            markServerOnline();
            resolve(payload.data.path);
            return;
          }
          reject(new Error(message));
        },
        fail(error) {
          markServerOffline();
          reject(error);
        }
      });
    });
  }
  function normalizeRemoteProfile(profile) {
    const localProfile = getDefaultProfile();
    const payload = {
      ...localProfile,
      ...profile || {}
    };
    return {
      ...payload,
      defaultMeetingPlace: payload.defaultMeetingPlace || payload.city || localProfile.defaultMeetingPlace
    };
  }
  function ensureSuccess$2(response, fallbackMessage) {
    if (!(response == null ? void 0 : response.success)) {
      throw new Error((response == null ? void 0 : response.message) || fallbackMessage);
    }
    return response.data;
  }
  function syncLocalProfile(profile, extraPatch = {}) {
    const payload = normalizeRemoteProfile({
      ...profile,
      ...extraPatch
    });
    saveProfile(payload);
    return payload;
  }
  async function fetchRemoteProfile(options = {}) {
    const { allowOfflineFallback = true } = options;
    try {
      const response = await request({
        url: "/api/profiles/mine"
      });
      return syncLocalProfile(ensureSuccess$2(response, "获取资料失败"));
    } catch (error) {
      if (allowOfflineFallback && isServerOffline()) {
        return getProfile();
      }
      throw error;
    }
  }
  async function updateRemoteProfile(patch) {
    if (!ensureServerWritable()) {
      throw new Error("离线模式下不支持修改");
    }
    const response = await request({
      url: "/api/profiles/mine",
      method: "PUT",
      data: patch
    });
    return syncLocalProfile(ensureSuccess$2(response, "保存资料失败"));
  }
  async function updateRemotePassword(password) {
    if (!ensureServerWritable()) {
      throw new Error("离线模式下不支持修改");
    }
    const response = await request({
      url: "/api/profiles/mine/password",
      method: "PUT",
      data: { password }
    });
    return syncLocalProfile(ensureSuccess$2(response, "保存密码失败"), { password });
  }
  async function resetRemoteProfile() {
    if (!ensureServerWritable()) {
      throw new Error("离线模式下不支持修改");
    }
    const response = await request({
      url: "/api/profiles/mine/reset",
      method: "POST"
    });
    return syncLocalProfile(ensureSuccess$2(response, "恢复默认失败"));
  }
  const _sfc_main$i = {
    __name: "mine",
    setup(__props, { expose: __expose }) {
      __expose();
      const { themeStyle } = useThemePage();
      const user = vue.ref(null);
      const profile = vue.ref(getProfile());
      const avatarPresetMap2 = getAvatarPresetMap();
      const currentTheme = vue.ref(getCurrentThemePreset(getThemeSettings()));
      const isImageAvatar = vue.computed(() => profile.value.avatarType === "upload" && !!profile.value.avatarImage);
      const avatarImageUrl = vue.computed(() => resolveAvatarUrl(profile.value.avatarImage));
      const avatarDisplay = vue.computed(() => {
        if (profile.value.avatarType === "preset") {
          return avatarPresetMap2[profile.value.avatarPreset] || "💕";
        }
        return String(profile.value.avatarText || "").trim() || "💕";
      });
      const settingsSummary = vue.computed(() => {
        const pieces = [profile.value.nickname || "未设置真实姓名", profile.value.city || "未设置城市"];
        if (profile.value.anniversaryDate) {
          pieces.push(profile.value.anniversaryDate);
        }
        return pieces.join(" · ");
      });
      function goComingSoon(title) {
        goPage(`/pages/modules/coming-soon/index?title=${encodeURIComponent(title)}`);
      }
      function goAccountSettings() {
        goPage("/pages/account/settings");
      }
      function goThemeSettings() {
        goPage("/pages/theme/index");
      }
      async function handleLogout() {
        await logout();
        uni.reLaunch({
          url: "/pages/login/login"
        });
      }
      async function syncProfileFromServer() {
        try {
          profile.value = await fetchRemoteProfile();
        } catch (error) {
          profile.value = getProfile();
        }
      }
      onShow(async () => {
        if (!requireAuth()) {
          return;
        }
        user.value = getUser();
        await syncProfileFromServer();
        currentTheme.value = getCurrentThemePreset(getThemeSettings());
      });
      const __returned__ = { themeStyle, user, profile, avatarPresetMap: avatarPresetMap2, currentTheme, isImageAvatar, avatarImageUrl, avatarDisplay, settingsSummary, goComingSoon, goAccountSettings, goThemeSettings, handleLogout, syncProfileFromServer, computed: vue.computed, ref: vue.ref, get onShow() {
        return onShow;
      }, get getUser() {
        return getUser;
      }, get requireAuth() {
        return requireAuth;
      }, get logout() {
        return logout;
      }, get resolveAvatarUrl() {
        return resolveAvatarUrl;
      }, get getAvatarPresetMap() {
        return getAvatarPresetMap;
      }, get getProfile() {
        return getProfile;
      }, get fetchRemoteProfile() {
        return fetchRemoteProfile;
      }, get getCurrentThemePreset() {
        return getCurrentThemePreset;
      }, get getThemeSettings() {
        return getThemeSettings;
      }, get goPage() {
        return goPage;
      }, get useThemePage() {
        return useThemePage;
      }, BottomTab };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-page-shell app-page-shell-tabbed mine-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "profile-card app-fade-up" }, [
          vue.createElementVNode("view", { class: "profile-glow profile-glow-a" }),
          vue.createElementVNode("view", { class: "profile-glow profile-glow-b" }),
          vue.createElementVNode("view", { class: "profile-badge" }, "我的空间"),
          vue.createElementVNode("view", { class: "profile-head" }, [
            vue.createElementVNode("view", { class: "avatar-shell" }, [
              vue.createElementVNode("view", { class: "avatar-ring" }),
              vue.createElementVNode("view", { class: "avatar" }, [
                $setup.isImageAvatar ? (vue.openBlock(), vue.createElementBlock("image", {
                  key: 0,
                  class: "avatar-image",
                  src: $setup.avatarImageUrl,
                  mode: "aspectFill"
                }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 1,
                    class: "avatar-text"
                  },
                  vue.toDisplayString($setup.avatarDisplay),
                  1
                  /* TEXT */
                ))
              ])
            ]),
            vue.createElementVNode("view", { class: "profile-copy" }, [
              vue.createElementVNode(
                "view",
                { class: "name" },
                vue.toDisplayString($setup.profile.nickname || ((_a = $setup.user) == null ? void 0 : _a.username) || "浪漫用户"),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "intro" },
                vue.toDisplayString($setup.profile.bio),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "profile-meta-row" }, [
            vue.createElementVNode(
              "view",
              { class: "profile-chip app-pill app-pill-glass" },
              vue.toDisplayString($setup.profile.city || "城市未设置"),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "view",
              { class: "profile-chip app-pill app-pill-glass" },
              vue.toDisplayString($setup.profile.loverNickname || $setup.profile.nickname || "未设置称呼"),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "mine-section app-fade-up app-delay-1" }, [
          vue.createElementVNode("view", { class: "section-kicker" }, "快捷入口"),
          vue.createElementVNode("view", { class: "section-title" }, "管理你的浪漫空间"),
          vue.createElementVNode("view", { class: "section-desc" }, "把账号、风格和提醒放在一个更轻松的位置，日常修改会更顺手。")
        ]),
        vue.createElementVNode("view", { class: "menu-list app-fade-up app-delay-2" }, [
          vue.createElementVNode("view", {
            class: "menu-card app-card-soft",
            "hover-class": "menu-card-active",
            "hover-stay-time": "70",
            onClick: $setup.goAccountSettings
          }, [
            vue.createElementVNode("view", { class: "menu-accent accent-account" }),
            vue.createElementVNode("view", { class: "menu-main" }, [
              vue.createElementVNode("view", { class: "menu-title-row" }, [
                vue.createElementVNode("view", { class: "menu-title" }, "账号设置"),
                vue.createElementVNode("view", { class: "menu-badge" }, "已同步")
              ]),
              vue.createElementVNode(
                "view",
                { class: "menu-summary" },
                vue.toDisplayString($setup.settingsSummary),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "menu-desc" }, "资料、头像、关系信息与安全设置")
            ]),
            vue.createElementVNode("view", { class: "menu-preview-card settings-preview" }, [
              $setup.isImageAvatar ? (vue.openBlock(), vue.createElementBlock("image", {
                key: 0,
                class: "menu-preview-avatar-image",
                src: $setup.avatarImageUrl,
                mode: "aspectFill"
              }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 1,
                  class: "menu-preview-avatar-text"
                },
                vue.toDisplayString($setup.avatarDisplay),
                1
                /* TEXT */
              ))
            ]),
            vue.createElementVNode("view", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-card app-card-soft",
            "hover-class": "menu-card-active",
            "hover-stay-time": "70",
            onClick: $setup.goThemeSettings
          }, [
            vue.createElementVNode("view", { class: "menu-accent accent-theme" }),
            vue.createElementVNode("view", { class: "menu-main" }, [
              vue.createElementVNode("view", { class: "menu-title-row" }, [
                vue.createElementVNode("view", { class: "menu-title" }, "主题设置"),
                vue.createElementVNode(
                  "view",
                  { class: "menu-badge soft" },
                  vue.toDisplayString($setup.currentTheme.name),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode(
                "view",
                { class: "menu-summary" },
                vue.toDisplayString($setup.currentTheme.description),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "menu-desc" }, "主题色、背景氛围和细节动效")
            ]),
            vue.createElementVNode("view", { class: "menu-preview-card theme-preview" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.currentTheme.swatches, (color) => {
                  return vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: color,
                      class: "theme-preview-swatch",
                      style: vue.normalizeStyle({ background: color })
                    },
                    null,
                    4
                    /* STYLE */
                  );
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            vue.createElementVNode("view", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-card app-card-soft",
            "hover-class": "menu-card-active",
            "hover-stay-time": "70",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.goComingSoon("消息中心"))
          }, [
            vue.createElementVNode("view", { class: "menu-accent accent-message" }),
            vue.createElementVNode("view", { class: "menu-main" }, [
              vue.createElementVNode("view", { class: "menu-title-row" }, [
                vue.createElementVNode("view", { class: "menu-title" }, "消息中心"),
                vue.createElementVNode("view", { class: "menu-badge soft" }, "预留")
              ]),
              vue.createElementVNode("view", { class: "menu-summary" }, "以后可以接提醒、纪念日通知和重要事件推送，现在先预留入口位置。"),
              vue.createElementVNode("view", { class: "menu-desc" }, "提醒、公告和重要动态")
            ]),
            vue.createElementVNode("view", { class: "menu-preview-card message-preview" }, [
              vue.createElementVNode("view", { class: "message-dot dot-a" }),
              vue.createElementVNode("view", { class: "message-dot dot-b" }),
              vue.createElementVNode("view", { class: "message-line" }),
              vue.createElementVNode("view", { class: "message-line short" })
            ]),
            vue.createElementVNode("view", { class: "menu-arrow" }, ">")
          ])
        ]),
        vue.createElementVNode("button", {
          class: "logout-btn app-primary-btn app-primary-btn-shadow app-fade-up app-delay-3",
          onClick: $setup.handleLogout
        }, "退出登录"),
        vue.createVNode($setup["BottomTab"], { activeKey: "mine" })
      ],
      4
      /* STYLE */
    );
  }
  const PagesMineMine = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$i], ["__scopeId", "data-v-7c2ebfa5"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/mine/mine.vue"]]);
  const AREA_DRAFT_KEY = "romantic_area_draft_map";
  function readAreaDraftMap() {
    const stored = uni.getStorageSync(AREA_DRAFT_KEY);
    return stored && typeof stored === "object" ? stored : {};
  }
  function writeAreaDraftMap(map) {
    uni.setStorageSync(AREA_DRAFT_KEY, map);
  }
  function buildAreaPickerUrl(scene, options = {}) {
    const query = [`scene=${encodeURIComponent(scene || "default")}`];
    Object.entries(options).forEach(([key, value]) => {
      if (value === void 0 || value === null || value === "")
        return;
      query.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    });
    return `/pages/account/area-picker?${query.join("&")}`;
  }
  function saveAreaDraft(scene, area) {
    const key = String(scene || "default");
    const map = readAreaDraftMap();
    map[key] = area || null;
    writeAreaDraftMap(map);
  }
  function getAreaDraft(scene) {
    const key = String(scene || "default");
    const map = readAreaDraftMap();
    return map[key] || null;
  }
  function clearAreaDraft(scene) {
    if (!scene) {
      uni.removeStorageSync(AREA_DRAFT_KEY);
      return;
    }
    const key = String(scene);
    const map = readAreaDraftMap();
    delete map[key];
    writeAreaDraftMap(map);
  }
  const COUNTDOWN_PLAN_KEY = "romantic_countdown_plan";
  function createDefaultPlan() {
    const profile = getProfile();
    return {
      loverName: profile.loverNickname || profile.nickname || "未设置称呼",
      place: profile.defaultMeetingPlace || profile.city || "上海",
      note: "一起吃那家想念很久的晚餐，然后牵手散散步。",
      nextMeetingAt: "2026-04-01 18:30",
      lastMeetingAt: "2026-02-14 20:00",
      isAllDay: false
    };
  }
  function getDefaultCountdownPlan() {
    return createDefaultPlan();
  }
  function getCountdownPlan() {
    const stored = uni.getStorageSync(COUNTDOWN_PLAN_KEY);
    const defaultPlan = createDefaultPlan();
    if (!stored || typeof stored !== "object") {
      return getDefaultCountdownPlan();
    }
    return {
      ...defaultPlan,
      ...stored
    };
  }
  function saveCountdownPlan(plan) {
    const defaultPlan = createDefaultPlan();
    const payload = {
      ...defaultPlan,
      ...plan
    };
    uni.setStorageSync(COUNTDOWN_PLAN_KEY, payload);
    return payload;
  }
  function resetCountdownPlan() {
    const payload = getDefaultCountdownPlan();
    uni.setStorageSync(COUNTDOWN_PLAN_KEY, payload);
    return payload;
  }
  const _sfc_main$h = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const { themeStyle } = useThemePage();
      const countdown = vue.reactive({ days: "00", hours: "00", minutes: "00", seconds: "00" });
      const meetingPlan = vue.reactive({ loverName: "", place: "", note: "", nextMeetingAt: "", lastMeetingAt: "", isAllDay: false });
      const form = vue.reactive({ loverName: "", place: "", note: "", nextDate: "", nextTime: "00:00", lastDate: "", lastTime: "00:00", isAllDay: false });
      const hearts = vue.ref([]);
      const currentTime = vue.ref(Date.now());
      let timer = null;
      let heartTimer = null;
      let heartId = 1;
      let screenWidth = 375;
      let screenHeight = 667;
      const heartTexts = ["❤", "💕", "💗", "💖", "💘", "💞"];
      const heartColors = ["#ff4d6d", "#ff5e7d", "#ff85a1", "#ff99ac", "#ffb3c1", "#ffc2d1"];
      const switchColor = vue.computed(() => getComputedStyleSafe("--app-color-primary", "#ff7ea6"));
      const nextMeetingDate = vue.computed(() => parseDateTime(meetingPlan.nextMeetingAt));
      const lastMeetingDate = vue.computed(() => parseDateTime(meetingPlan.lastMeetingAt));
      const meetingStatus = vue.computed(() => {
        const nextDate = nextMeetingDate.value;
        if (!nextDate)
          return "unknown";
        const diff = nextDate.getTime() - currentTime.value;
        if (diff > 0) {
          if (diff <= 24 * 60 * 60 * 1e3)
            return "today";
          if (diff <= 7 * 24 * 60 * 60 * 1e3)
            return "soon";
          return "waiting";
        }
        if (isSameDay(nextDate, new Date(currentTime.value)))
          return "today";
        return "passed";
      });
      const nextMeetingDateText = vue.computed(() => formatDateText(nextMeetingDate.value));
      const nextMeetingClockText = vue.computed(() => formatTimeText(nextMeetingDate.value, meetingPlan.isAllDay));
      const lastMeetingText = vue.computed(() => formatDateTimeText(lastMeetingDate.value, false));
      const heroBadge = vue.computed(() => ({ waiting: "满心期待", soon: "很快就见面", today: "今天就相见", passed: "该约下一次啦", unknown: "等待设定" })[meetingStatus.value]);
      const heroTitle = vue.computed(() => meetingStatus.value === "today" ? "今天就是期待落地的日子。" : meetingStatus.value === "passed" ? "这次见面已经到来，记得把下一次也安排上。" : `把和${meetingPlan.loverName || "TA"}见面的时间、地点和心情都留在这里。`);
      const heroDesc = vue.computed(() => meetingPlan.note || "把下一次见面的时间、地点和想做的事都提前写下来。");
      const countdownItems = vue.computed(() => [{ label: "天", value: countdown.days }, { label: "时", value: countdown.hours }, { label: "分", value: countdown.minutes }, { label: "秒", value: countdown.seconds }]);
      const daysSinceLast = vue.computed(() => {
        const lastDate = lastMeetingDate.value;
        if (!lastDate)
          return 0;
        return Math.floor(Math.max(0, currentTime.value - lastDate.getTime()) / (24 * 60 * 60 * 1e3));
      });
      const progressPercent = vue.computed(() => {
        var _a, _b;
        const start = (_a = lastMeetingDate.value) == null ? void 0 : _a.getTime();
        const end = (_b = nextMeetingDate.value) == null ? void 0 : _b.getTime();
        if (!start || !end || end <= start)
          return 0;
        const percent = (currentTime.value - start) / (end - start) * 100;
        return Math.max(0, Math.min(100, Math.round(percent)));
      });
      const progressText = vue.computed(() => meetingStatus.value === "passed" ? "这一段等待已经走完了，去写下新的约会日期吧。" : meetingStatus.value === "today" ? "等到今天啦，把想说的话和想做的事都带上。" : `这段想念已经走过 ${progressPercent.value}%`);
      const stageMessage = vue.computed(() => meetingStatus.value === "passed" ? "这次倒计时已经结束，给下一次见面留一个新的期待吧。" : meetingStatus.value === "today" ? "今天就是期待落地的日子，记得把拥抱准备好。" : meetingStatus.value === "soon" ? "已经进入最后冲刺阶段，连风都开始替你们开心了。" : "见你的路上，风都是甜的。");
      function getComputedStyleSafe(name, fallback) {
        if (typeof window === "undefined" || typeof getComputedStyle === "undefined")
          return fallback;
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
      }
      function pad(num) {
        return String(num).padStart(2, "0");
      }
      function splitDateTime(value) {
        const [date = "", time = "00:00"] = String(value || "").split(" ");
        return { date, time: time.slice(0, 5) || "00:00" };
      }
      function parseDateTime(value) {
        if (!value)
          return null;
        const date = new Date(String(value).replace(" ", "T"));
        return Number.isNaN(date.getTime()) ? null : date;
      }
      function formatDateText(date) {
        return date ? `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日` : "暂未设置";
      }
      function formatDateTimeText(date, isAllDay = false) {
        if (!date)
          return "暂未设置";
        const dateText = formatDateText(date);
        return isAllDay ? `${dateText} · 全天` : `${dateText} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
      }
      function formatTimeText(date, isAllDay = false) {
        if (!date)
          return "等待设置时间";
        return isAllDay ? "全天见面" : `${pad(date.getHours())}:${pad(date.getMinutes())}`;
      }
      function buildDateTime(date, time, isAllDay = false) {
        return `${date} ${isAllDay ? "00:00" : time}`;
      }
      function isSameDay(dateA, dateB) {
        return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth() && dateA.getDate() === dateB.getDate();
      }
      function applyPlan(plan) {
        Object.assign(meetingPlan, { loverName: plan.loverName, place: plan.place, note: plan.note, nextMeetingAt: plan.nextMeetingAt, lastMeetingAt: plan.lastMeetingAt, isAllDay: !!plan.isAllDay });
        const nextParts = splitDateTime(plan.nextMeetingAt);
        const lastParts = splitDateTime(plan.lastMeetingAt);
        Object.assign(form, { loverName: plan.loverName, place: plan.place, note: plan.note, nextDate: nextParts.date, nextTime: nextParts.time, lastDate: lastParts.date, lastTime: lastParts.time, isAllDay: !!plan.isAllDay });
      }
      function loadPlan() {
        applyPlan(getCountdownPlan());
        updateCountdown();
      }
      function updateCountdown() {
        currentTime.value = Date.now();
        const nextDate = nextMeetingDate.value;
        if (!nextDate)
          return Object.assign(countdown, { days: "00", hours: "00", minutes: "00", seconds: "00" });
        let diff = nextDate.getTime() - currentTime.value;
        if (diff < 0)
          diff = 0;
        countdown.days = pad(Math.floor(diff / (1e3 * 60 * 60 * 24)));
        countdown.hours = pad(Math.floor(diff / (1e3 * 60 * 60) % 24));
        countdown.minutes = pad(Math.floor(diff / (1e3 * 60) % 60));
        countdown.seconds = pad(Math.floor(diff / 1e3 % 60));
      }
      function random(min, max) {
        return Math.random() * (max - min) + min;
      }
      function initSystemInfo() {
        try {
          const info = uni.getSystemInfoSync();
          screenWidth = info.windowWidth || 375;
          screenHeight = info.windowHeight || 667;
        } catch (error) {
          formatAppLog("error", "at pages/modules/countdown/index.vue:185", "获取系统信息失败", error);
        }
      }
      function createHeart(x = null, y = null) {
        const left = x !== null ? x : random(30, screenWidth - 30);
        const bottom = y !== null ? y : random(20, 120);
        const item = { id: heartId++, left: Math.max(10, Math.min(left, screenWidth - 30)), bottom, size: random(18, 42), duration: random(3.2, 5.5), drift: random(-40, 40), rotate: random(-25, 25), text: heartTexts[Math.floor(Math.random() * heartTexts.length)], color: heartColors[Math.floor(Math.random() * heartColors.length)] };
        hearts.value.push(item);
        setTimeout(() => {
          hearts.value = hearts.value.filter((value) => value.id !== item.id);
        }, item.duration * 1e3);
      }
      function getHeartStyle(heart) {
        return { left: `${heart.left}px`, bottom: `${heart.bottom}px`, fontSize: `${heart.size}px`, color: heart.color, "--float-x": `${heart.drift}px`, "--float-y": `${screenHeight - heart.bottom + 50}px`, "--rotate-deg": `${heart.rotate}deg`, "--duration": `${heart.duration}s` };
      }
      function handlePageTap(event) {
        var _a, _b;
        const x = (_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.x;
        const y = (_b = event == null ? void 0 : event.detail) == null ? void 0 : _b.y;
        if (typeof x !== "number" || typeof y !== "number")
          return;
        const bottomY = screenHeight - y;
        for (let i = 0; i < 4; i += 1)
          setTimeout(() => createHeart(x + random(-18, 18), bottomY + random(-18, 18)), i * 60);
      }
      function handleNextDateChange(event) {
        form.nextDate = event.detail.value;
      }
      function handleNextTimeChange(event) {
        form.nextTime = event.detail.value;
      }
      function handleLastDateChange(event) {
        form.lastDate = event.detail.value;
      }
      function handleLastTimeChange(event) {
        form.lastTime = event.detail.value;
      }
      function handleAllDayChange(event) {
        form.isAllDay = !!event.detail.value;
      }
      function openPlacePicker() {
        goPage(buildAreaPickerUrl("countdown_place", { value: form.place || "" }));
      }
      function handleSave() {
        if (!form.nextDate || !form.lastDate)
          return void uni.showToast({ title: "请先把见面日期补完整", icon: "none" });
        const nextMeetingAt = buildDateTime(form.nextDate, form.nextTime, form.isAllDay);
        const lastMeetingAt = buildDateTime(form.lastDate, form.lastTime, false);
        const nextDate = parseDateTime(nextMeetingAt);
        const lastDate = parseDateTime(lastMeetingAt);
        if (!nextDate || !lastDate)
          return void uni.showToast({ title: "日期格式不正确", icon: "none" });
        if (nextDate.getTime() <= lastDate.getTime())
          return void uni.showToast({ title: "下次见面要晚于上次见面", icon: "none" });
        const payload = saveCountdownPlan({ loverName: (form.loverName || "宝贝").trim() || "宝贝", place: (form.place || "未设置地点").trim() || "未设置地点", note: (form.note || "").trim(), nextMeetingAt, lastMeetingAt, isAllDay: form.isAllDay });
        applyPlan(payload);
        updateCountdown();
        uni.showToast({ title: "见面计划已保存", icon: "success" });
      }
      function handleReset() {
        const payload = resetCountdownPlan();
        applyPlan(payload);
        updateCountdown();
        uni.showToast({ title: "已恢复默认计划", icon: "none" });
      }
      function goBack() {
        backPage();
      }
      onShow(() => {
        const draft = getAreaDraft("countdown_place");
        if (!draft)
          return;
        form.place = draft.displayText || draft.mergerName || draft.name || "";
        clearAreaDraft("countdown_place");
      });
      vue.onMounted(() => {
        if (!requireAuth())
          return;
        initSystemInfo();
        loadPlan();
        timer = setInterval(updateCountdown, 1e3);
        heartTimer = setInterval(createHeart, 1200);
      });
      vue.onUnmounted(() => {
        if (timer)
          clearInterval(timer);
        if (heartTimer)
          clearInterval(heartTimer);
        hearts.value = [];
      });
      const __returned__ = { themeStyle, countdown, meetingPlan, form, hearts, currentTime, get timer() {
        return timer;
      }, set timer(v) {
        timer = v;
      }, get heartTimer() {
        return heartTimer;
      }, set heartTimer(v) {
        heartTimer = v;
      }, get heartId() {
        return heartId;
      }, set heartId(v) {
        heartId = v;
      }, get screenWidth() {
        return screenWidth;
      }, set screenWidth(v) {
        screenWidth = v;
      }, get screenHeight() {
        return screenHeight;
      }, set screenHeight(v) {
        screenHeight = v;
      }, heartTexts, heartColors, switchColor, nextMeetingDate, lastMeetingDate, meetingStatus, nextMeetingDateText, nextMeetingClockText, lastMeetingText, heroBadge, heroTitle, heroDesc, countdownItems, daysSinceLast, progressPercent, progressText, stageMessage, getComputedStyleSafe, pad, splitDateTime, parseDateTime, formatDateText, formatDateTimeText, formatTimeText, buildDateTime, isSameDay, applyPlan, loadPlan, updateCountdown, random, initSystemInfo, createHeart, getHeartStyle, handlePageTap, handleNextDateChange, handleNextTimeChange, handleLastDateChange, handleLastTimeChange, handleAllDayChange, openPlacePicker, handleSave, handleReset, goBack, computed: vue.computed, reactive: vue.reactive, ref: vue.ref, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, get onShow() {
        return onShow;
      }, get requireAuth() {
        return requireAuth;
      }, get buildAreaPickerUrl() {
        return buildAreaPickerUrl;
      }, get clearAreaDraft() {
        return clearAreaDraft;
      }, get getAreaDraft() {
        return getAreaDraft;
      }, get backPage() {
        return backPage;
      }, get goPage() {
        return goPage;
      }, get getCountdownPlan() {
        return getCountdownPlan;
      }, get resetCountdownPlan() {
        return resetCountdownPlan;
      }, get saveCountdownPlan() {
        return saveCountdownPlan;
      }, get useThemePage() {
        return useThemePage;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page countdown-page",
        style: vue.normalizeStyle($setup.themeStyle),
        onClick: $setup.handlePageTap
      },
      [
        vue.createElementVNode("view", { class: "bg" }),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.hearts, (heart) => {
            return vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: heart.id,
                class: "heart",
                style: vue.normalizeStyle($setup.getHeartStyle(heart))
              },
              vue.toDisplayString(heart.text),
              5
              /* TEXT, STYLE */
            );
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        vue.createElementVNode("view", {
          class: "top-bar app-topbar",
          onClick: _cache[0] || (_cache[0] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", {
            class: "top-nav-btn app-topbar-btn",
            onClick: vue.withModifiers($setup.goBack, ["stop"])
          }, [
            vue.createElementVNode("text", { class: "top-nav-icon app-topbar-icon" }, "‹"),
            vue.createElementVNode("text", { class: "top-nav-text app-topbar-text" }, "返回")
          ]),
          vue.createElementVNode("view", { class: "page-title-wrap app-topbar-center" }, [
            vue.createElementVNode("view", { class: "page-eyebrow app-topbar-eyebrow" }, "倒计时计划"),
            vue.createElementVNode("view", { class: "page-title app-topbar-title" }, "见面倒计时")
          ]),
          vue.createElementVNode("view", {
            class: "top-ghost-btn app-topbar-btn",
            onClick: vue.withModifiers($setup.handleReset, ["stop"])
          }, "重置计划")
        ]),
        vue.createElementVNode("view", {
          class: "content",
          onClick: _cache[3] || (_cache[3] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "hero-card" }, [
            vue.createElementVNode(
              "view",
              { class: "hero-badge app-pill app-pill-glass" },
              vue.toDisplayString($setup.heroBadge),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "hero-plan-label" }, "下次见面"),
            vue.createElementVNode(
              "view",
              { class: "hero-date" },
              vue.toDisplayString($setup.nextMeetingDateText),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "hero-meta-row" }, [
              vue.createElementVNode(
                "view",
                { class: "hero-chip hero-chip-strong app-pill app-pill-glass" },
                vue.toDisplayString($setup.nextMeetingClockText),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "hero-chip app-pill app-pill-glass" },
                "📍 " + vue.toDisplayString($setup.meetingPlan.place || "还没有设置地点"),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode(
              "view",
              { class: "hero-title" },
              vue.toDisplayString($setup.heroTitle),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "view",
              { class: "hero-desc" },
              vue.toDisplayString($setup.heroDesc),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "countdown-card app-card app-card-gradient" }, [
            vue.createElementVNode("view", { class: "app-section-kicker" }, "倒计时"),
            vue.createElementVNode("view", { class: "app-section-title" }, "距离这次见面"),
            vue.createElementVNode("view", { class: "app-section-desc" }, "把想念拆成一格一格的时间，慢慢靠近相见。"),
            vue.createElementVNode("view", { class: "countdown-grid" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.countdownItems, (item) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: item.label,
                    class: "time-box app-card-soft"
                  }, [
                    vue.createElementVNode("view", { class: "time-cap" }),
                    vue.createElementVNode(
                      "text",
                      { class: "num" },
                      vue.toDisplayString(item.value),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "unit" },
                      vue.toDisplayString(item.label),
                      1
                      /* TEXT */
                    )
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            vue.createElementVNode(
              "view",
              { class: "love-text" },
              vue.toDisplayString($setup.stageMessage),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "overview-grid" }, [
            vue.createElementVNode("view", { class: "info-card app-card" }, [
              vue.createElementVNode("view", { class: "info-icon" }, "💖"),
              vue.createElementVNode("view", { class: "info-label" }, "上次见面"),
              vue.createElementVNode(
                "view",
                { class: "info-value" },
                vue.toDisplayString($setup.lastMeetingText),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "info-sub" },
                "已经想念了 " + vue.toDisplayString($setup.daysSinceLast) + " 天",
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-card app-card" }, [
              vue.createElementVNode("view", { class: "info-icon" }, "✨"),
              vue.createElementVNode("view", { class: "info-label" }, "进度值"),
              vue.createElementVNode(
                "view",
                { class: "info-value" },
                vue.toDisplayString($setup.progressPercent) + "%",
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "progress-bar" }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: "progress-fill",
                    style: vue.normalizeStyle({ width: `${$setup.progressPercent}%` })
                  },
                  null,
                  4
                  /* STYLE */
                )
              ]),
              vue.createElementVNode(
                "view",
                { class: "info-sub" },
                vue.toDisplayString($setup.progressText),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "editor-card app-card app-card-gradient" }, [
            vue.createElementVNode("view", { class: "section-row" }, [
              vue.createElementVNode("view", null, [
                vue.createElementVNode("view", { class: "app-section-kicker" }, "见面计划"),
                vue.createElementVNode("view", { class: "app-section-title" }, "见面计划")
              ]),
              vue.createElementVNode("view", { class: "section-tip" }, "保存后会自动刷新倒计时")
            ]),
            vue.createElementVNode("view", { class: "editor-desc" }, "把时间、地点和想做的事情整理好，这一页就会变成你们的约会提示板。"),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("view", { class: "label" }, "称呼"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.loverName = $event),
                  class: "input app-input-shell app-field",
                  placeholder: "比如：宝贝、小朋友",
                  "placeholder-class": "input-placeholder"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.form.loverName]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("view", { class: "label" }, "见面地点"),
              vue.createElementVNode("view", {
                class: "picker app-input-shell app-field location-picker",
                onClick: $setup.openPlacePicker
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "picker-value" },
                  vue.toDisplayString($setup.form.place || "请选择或填写见面地点"),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("view", { class: "label" }, "下次见面"),
              vue.createElementVNode("view", { class: "picker-row" }, [
                vue.createElementVNode("picker", {
                  class: "picker app-input-shell app-field",
                  mode: "date",
                  value: $setup.form.nextDate,
                  onChange: $setup.handleNextDateChange
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "picker-value" },
                    vue.toDisplayString($setup.form.nextDate),
                    1
                    /* TEXT */
                  )
                ], 40, ["value"]),
                !$setup.form.isAllDay ? (vue.openBlock(), vue.createElementBlock("picker", {
                  key: 0,
                  class: "picker app-input-shell app-field",
                  mode: "time",
                  value: $setup.form.nextTime,
                  onChange: $setup.handleNextTimeChange
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "picker-value" },
                    vue.toDisplayString($setup.form.nextTime),
                    1
                    /* TEXT */
                  )
                ], 40, ["value"])) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "picker app-input-shell app-field picker-static"
                }, [
                  vue.createElementVNode("view", { class: "picker-value" }, "全天见面")
                ]))
              ]),
              vue.createElementVNode("view", { class: "switch-row" }, [
                vue.createElementVNode("view", { class: "switch-label" }, "按全天见面计算"),
                vue.createElementVNode("switch", {
                  checked: $setup.form.isAllDay,
                  color: $setup.switchColor,
                  onChange: $setup.handleAllDayChange
                }, null, 40, ["checked", "color"])
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("view", { class: "label" }, "上次见面"),
              vue.createElementVNode("view", { class: "picker-row" }, [
                vue.createElementVNode("picker", {
                  class: "picker app-input-shell app-field",
                  mode: "date",
                  value: $setup.form.lastDate,
                  onChange: $setup.handleLastDateChange
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "picker-value" },
                    vue.toDisplayString($setup.form.lastDate),
                    1
                    /* TEXT */
                  )
                ], 40, ["value"]),
                vue.createElementVNode("picker", {
                  class: "picker app-input-shell app-field",
                  mode: "time",
                  value: $setup.form.lastTime,
                  onChange: $setup.handleLastTimeChange
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "picker-value" },
                    vue.toDisplayString($setup.form.lastTime),
                    1
                    /* TEXT */
                  )
                ], 40, ["value"])
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("view", { class: "label" }, "这次想一起做什么"),
              vue.withDirectives(vue.createElementVNode(
                "textarea",
                {
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.note = $event),
                  class: "textarea app-input-shell app-textarea",
                  maxlength: "120",
                  placeholder: "写下见面时最想完成的小计划",
                  "placeholder-class": "input-placeholder"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.form.note]
              ])
            ]),
            vue.createElementVNode("button", {
              class: "save-btn app-primary-btn app-primary-btn-shadow",
              onClick: vue.withModifiers($setup.handleSave, ["stop"])
            }, "保存见面计划")
          ])
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesModulesCountdownIndex = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$h], ["__scopeId", "data-v-93ae544c"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/modules/countdown/index.vue"]]);
  const ANNIVERSARY_CACHE_KEY = "romantic_anniversary_list";
  function saveAnniversaryListCache(list) {
    uni.setStorageSync(ANNIVERSARY_CACHE_KEY, Array.isArray(list) ? list : []);
  }
  function getAnniversaryListCache() {
    const cached = uni.getStorageSync(ANNIVERSARY_CACHE_KEY);
    return Array.isArray(cached) ? cached : [];
  }
  function ensureSuccess$1(response, fallbackMessage) {
    if (!(response == null ? void 0 : response.success)) {
      throw new Error((response == null ? void 0 : response.message) || fallbackMessage);
    }
    return response.data;
  }
  async function fetchAnniversaryList(status = "all", options = {}) {
    const { allowOfflineFallback = true } = options;
    try {
      const response = await request({
        url: `/api/anniversaries?status=${encodeURIComponent(status)}`
      });
      const list = ensureSuccess$1(response, "获取纪念日列表失败") || [];
      saveAnniversaryListCache(list);
      return list;
    } catch (error) {
      if (allowOfflineFallback && isServerOffline()) {
        return getAnniversaryListCache();
      }
      throw error;
    }
  }
  async function fetchAnniversaryDetail(id) {
    const response = await request({
      url: `/api/anniversaries/${encodeURIComponent(id)}`
    });
    return ensureSuccess$1(response, "获取纪念日详情失败");
  }
  async function createAnniversary(payload) {
    const response = await request({
      url: "/api/anniversaries",
      method: "POST",
      data: payload
    });
    return ensureSuccess$1(response, "创建纪念日失败");
  }
  async function updateAnniversary(id, payload) {
    const response = await request({
      url: `/api/anniversaries/${encodeURIComponent(id)}`,
      method: "PUT",
      data: payload
    });
    return ensureSuccess$1(response, "保存纪念日失败");
  }
  async function deleteAnniversary(id) {
    const response = await request({
      url: `/api/anniversaries/${encodeURIComponent(id)}`,
      method: "DELETE"
    });
    return ensureSuccess$1(response, "删除纪念日失败");
  }
  async function increaseAnniversaryLikeCount(id) {
    const response = await request({
      url: `/api/anniversaries/${encodeURIComponent(id)}/likes`,
      method: "POST"
    });
    return ensureSuccess$1(response, "点赞失败");
  }
  async function checkAnniversaryReminders() {
    const response = await request({
      url: "/api/anniversaries/reminders/check",
      method: "POST",
      offlineTip: false
    });
    return ensureSuccess$1(response, "检查纪念日提醒失败") || [];
  }
  const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
  const AUTH_INVALID_MESSAGES = [
    "AUTH_INVALID",
    "LOGIN_EXPIRED",
    "UNAUTHORIZED"
  ];
  function parseUploadResponse(rawData) {
    if (typeof rawData === "object" && rawData !== null) {
      return rawData;
    }
    if (!rawData) {
      return null;
    }
    try {
      return JSON.parse(rawData);
    } catch (error) {
      return null;
    }
  }
  function isAuthInvalid(statusCode, payload) {
    const message = String((payload == null ? void 0 : payload.message) || "").trim();
    return statusCode === 401 || AUTH_INVALID_MESSAGES.includes(message);
  }
  function resolveMediaUrl(path) {
    const value = String(path || "").trim();
    if (!value) {
      return "";
    }
    if (/^(https?:|data:|file:|wxfile:|blob:)/i.test(value)) {
      return value;
    }
    return buildServerAssetUrl(value);
  }
  function getFileSize(filePath) {
    return new Promise((resolve, reject) => {
      uni.getFileInfo({
        filePath,
        success(result) {
          resolve(Number(result.size || 0));
        },
        fail: reject
      });
    });
  }
  async function compressImageToLimit(filePath) {
    let currentPath = filePath;
    let currentSize = await getFileSize(filePath);
    if (currentSize <= IMAGE_MAX_SIZE) {
      return currentPath;
    }
    for (const quality of [80, 60, 40]) {
      currentPath = await new Promise((resolve, reject) => {
        uni.compressImage({
          src: currentPath,
          quality,
          success(result) {
            resolve(result.tempFilePath);
          },
          fail: reject
        });
      });
      currentSize = await getFileSize(currentPath);
      if (currentSize <= IMAGE_MAX_SIZE) {
        return currentPath;
      }
    }
    throw new Error("Image is still larger than 5MB after compression");
  }
  async function prepareImageFile(filePath) {
    return compressImageToLimit(filePath);
  }
  function uploadAnniversaryMedia(filePath) {
    const token = uni.getStorageSync("romantic_token");
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: buildApiUrl("/api/files/anniversary-media"),
        filePath,
        name: "file",
        header: token ? { Authorization: `Bearer ${token}` } : {},
        success(response) {
          var _a;
          const payload = parseUploadResponse(response.data);
          const message = (payload == null ? void 0 : payload.message) || "Upload failed";
          if (isAuthInvalid(response.statusCode, payload)) {
            redirectToLogin(message);
            reject(new Error(message));
            return;
          }
          if (response.statusCode >= 200 && response.statusCode < 300 && (payload == null ? void 0 : payload.success) && ((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.path)) {
            markServerOnline();
            resolve(payload.data.path);
            return;
          }
          reject(new Error(message));
        },
        fail(error) {
          markServerOffline();
          reject(new Error((error == null ? void 0 : error.errMsg) || "Upload failed"));
        }
      });
    });
  }
  const _sfc_main$g = {
    __name: "AccountHeader",
    props: {
      title: {
        type: String,
        required: true
      },
      eyebrow: {
        type: String,
        default: "Account"
      }
    },
    setup(__props, { expose: __expose }) {
      __expose();
      function handleBack() {
        backPage();
      }
      const __returned__ = { handleBack, get backPage() {
        return backPage;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "app-topbar app-account-topbar" }, [
      vue.createElementVNode("view", {
        class: "top-nav-btn app-topbar-btn",
        onClick: $setup.handleBack
      }, [
        vue.createElementVNode("text", { class: "top-nav-icon app-topbar-icon" }, "<"),
        vue.createElementVNode("text", { class: "top-nav-text app-topbar-text" }, "返回")
      ]),
      vue.createElementVNode("view", { class: "page-title-wrap app-topbar-center" }, [
        vue.createElementVNode(
          "view",
          { class: "page-eyebrow app-topbar-eyebrow" },
          vue.toDisplayString($props.eyebrow),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "view",
          { class: "page-title app-topbar-title" },
          vue.toDisplayString($props.title),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "top-placeholder app-topbar-placeholder" })
    ]);
  }
  const AccountHeader = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$g], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/account/components/AccountHeader.vue"]]);
  const HEART = "♡";
  const _sfc_main$f = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
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
      const { themeStyle } = useThemePage();
      const activeFilter = vue.ref("all");
      const eventList = vue.ref([]);
      const likeBursts = vue.ref({});
      const likingMap = vue.ref({});
      onShow(async () => {
        if (!requireAuth())
          return;
        await loadEvents();
      });
      async function loadEvents() {
        try {
          eventList.value = await fetchAnniversaryList(activeFilter.value);
        } catch (error) {
          uni.showToast({ title: (error == null ? void 0 : error.message) || TEXT.loadError, icon: "none" });
        }
      }
      async function switchFilter(filterKey) {
        if (activeFilter.value === filterKey)
          return;
        activeFilter.value = filterKey;
        await loadEvents();
      }
      function goCreate() {
        goPage("/pages/modules/anniversary/edit");
      }
      function openDetail(id) {
        goPage(`/pages/modules/anniversary/detail?id=${id}`);
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
          const latestLikeCount = await increaseAnniversaryLikeCount(eventId);
          item.likeCount = Math.max(Number(item.likeCount || 0), Number(latestLikeCount || 0));
        } catch (error) {
          item.likeCount = Math.max(0, Number(item.likeCount || 0) - 1);
          uni.showToast({ title: (error == null ? void 0 : error.message) || TEXT.likeError, icon: "none" });
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
      const __returned__ = { HEART, TEXT, filters, typeLabels, themeStyle, activeFilter, eventList, likeBursts, likingMap, loadEvents, switchFilter, goCreate, openDetail, creatorText, getLikeBursts, isLiking, handleLike, triggerLikePulse, createLikeBurst, formatStatus, ref: vue.ref, get onShow() {
        return onShow;
      }, get fetchAnniversaryList() {
        return fetchAnniversaryList;
      }, get increaseAnniversaryLikeCount() {
        return increaseAnniversaryLikeCount;
      }, get requireAuth() {
        return requireAuth;
      }, get resolveMediaUrl() {
        return resolveMediaUrl;
      }, get goPage() {
        return goPage;
      }, get useThemePage() {
        return useThemePage;
      }, AccountHeader };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-page-shell app-page-shell-tabbed anniversary-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "app-account-topbar-shell" }, [
          vue.createVNode($setup["AccountHeader"], {
            title: $setup.TEXT.pageTitle,
            eyebrow: $setup.TEXT.eyebrow
          }, null, 8, ["title", "eyebrow"])
        ]),
        vue.createElementVNode("view", { class: "hero-card app-fade-up" }, [
          vue.createElementVNode(
            "view",
            { class: "hero-badge app-pill app-pill-glass" },
            vue.toDisplayString($setup.TEXT.heroBadge),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "view",
            { class: "hero-title" },
            vue.toDisplayString($setup.TEXT.heroTitle),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "view",
            { class: "hero-desc" },
            vue.toDisplayString($setup.TEXT.heroDesc),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "hero-actions" }, [
            vue.createElementVNode(
              "button",
              {
                class: "hero-btn app-primary-btn app-primary-btn-shadow",
                onClick: $setup.goCreate
              },
              vue.toDisplayString($setup.TEXT.createButton),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "filter-row app-fade-up app-delay-1" }, [
          (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.filters, (item) => {
              return vue.createElementVNode("view", {
                key: item.key,
                class: vue.normalizeClass(["filter-chip", { active: $setup.activeFilter === item.key }]),
                onClick: ($event) => $setup.switchFilter(item.key)
              }, vue.toDisplayString(item.label), 11, ["onClick"]);
            }),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        $setup.eventList.length ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "event-list app-fade-up app-delay-2"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.eventList, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: item.id,
                class: "event-card app-card-soft",
                "hover-class": "event-card-active",
                "hover-stay-time": "70",
                onClick: ($event) => $setup.openDetail(item.id)
              }, [
                item.coverUrl ? (vue.openBlock(), vue.createElementBlock("image", {
                  key: 0,
                  class: "event-cover",
                  src: $setup.resolveMediaUrl(item.coverUrl),
                  mode: "aspectFill"
                }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "event-cover event-cover-placeholder"
                }, [
                  vue.createElementVNode("view", { class: "event-cover-icon" }, vue.toDisplayString($setup.HEART))
                ])),
                vue.createElementVNode("view", { class: "event-body" }, [
                  vue.createElementVNode("view", { class: "event-title-row" }, [
                    vue.createElementVNode(
                      "view",
                      { class: "event-title" },
                      vue.toDisplayString(item.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      { class: "event-type" },
                      vue.toDisplayString($setup.typeLabels[item.type] || $setup.TEXT.defaultType),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode(
                    "view",
                    { class: "event-date" },
                    vue.toDisplayString(item.eventDate),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "view",
                    { class: "event-status" },
                    vue.toDisplayString($setup.formatStatus(item)),
                    1
                    /* TEXT */
                  ),
                  item.creatorNickname ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 0,
                      class: "event-creator"
                    },
                    vue.toDisplayString($setup.creatorText(item)),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode(
                    "view",
                    { class: "event-summary" },
                    vue.toDisplayString(item.description || item.location || $setup.TEXT.cardFallback),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "event-footer" }, [
                    vue.createElementVNode(
                      "view",
                      { class: "event-location" },
                      vue.toDisplayString(item.location || $setup.TEXT.locationFallback),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "like-wrap" }, [
                      vue.createElementVNode("view", { class: "like-burst" }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList($setup.getLikeBursts(item.id), (particle) => {
                            return vue.openBlock(), vue.createElementBlock(
                              "text",
                              {
                                key: particle.id,
                                class: "like-particle",
                                style: vue.normalizeStyle(particle.style)
                              },
                              " ❤ ",
                              4
                              /* STYLE */
                            );
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ]),
                      vue.createElementVNode("view", {
                        class: vue.normalizeClass(["like-button", { liking: $setup.isLiking(item.id) }]),
                        onClick: vue.withModifiers(($event) => $setup.handleLike(item), ["stop"])
                      }, [
                        vue.createElementVNode("text", { class: "like-icon" }, "❤"),
                        vue.createElementVNode(
                          "text",
                          { class: "like-count" },
                          vue.toDisplayString(item.likeCount || 0),
                          1
                          /* TEXT */
                        )
                      ], 10, ["onClick"])
                    ])
                  ])
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "empty-card app-card-soft app-fade-up app-delay-2"
        }, [
          vue.createElementVNode("view", { class: "empty-icon" }, vue.toDisplayString($setup.HEART)),
          vue.createElementVNode(
            "view",
            { class: "empty-title" },
            vue.toDisplayString($setup.TEXT.emptyTitle),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "view",
            { class: "empty-desc" },
            vue.toDisplayString($setup.TEXT.emptyDesc),
            1
            /* TEXT */
          )
        ]))
      ],
      4
      /* STYLE */
    );
  }
  const PagesModulesAnniversaryIndex = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$f], ["__scopeId", "data-v-519a83ad"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/modules/anniversary/index.vue"]]);
  const _sfc_main$e = {
    __name: "AccountPanel",
    props: {
      title: {
        type: String,
        default: ""
      },
      description: {
        type: String,
        default: ""
      }
    },
    setup(__props, { expose: __expose }) {
      __expose();
      const __returned__ = {};
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "app-card app-account-section app-account-panel" }, [
      $props.title || $props.description ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "app-account-panel-head"
      }, [
        $props.title ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: "app-account-panel-title"
          },
          vue.toDisplayString($props.title),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true),
        $props.description ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 1,
            class: "app-account-panel-desc"
          },
          vue.toDisplayString($props.description),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true)
      ])) : vue.createCommentVNode("v-if", true),
      vue.renderSlot(_ctx.$slots, "default")
    ]);
  }
  const AccountPanel = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$e], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/account/components/AccountPanel.vue"]]);
  const _sfc_main$d = {
    __name: "detail",
    setup(__props, { expose: __expose }) {
      __expose();
      const { themeStyle } = useThemePage();
      const detail = vue.ref(null);
      const eventId = vue.ref("");
      onLoad(async (options) => {
        if (!requireAuth())
          return;
        eventId.value = (options == null ? void 0 : options.id) || "";
        await loadDetail();
      });
      onShow(async () => {
        if (!eventId.value || !requireAuth())
          return;
        await loadDetail();
      });
      async function loadDetail() {
        if (!eventId.value)
          return;
        try {
          detail.value = await fetchAnniversaryDetail(eventId.value);
        } catch (error) {
          uni.showToast({ title: (error == null ? void 0 : error.message) || "纪念日详情加载失败", icon: "none" });
        }
      }
      function formatStatus(item) {
        if (item.timeStatus === "future") {
          if (Number(item.dayOffset) === 0)
            return "就是今天";
          return `还有 ${item.dayOffset} 天`;
        }
        return `已过去 ${Math.abs(Number(item.dayOffset || 0))} 天`;
      }
      function goEdit() {
        goPage(`/pages/modules/anniversary/edit?id=${detail.value.id}`);
      }
      function handleDelete() {
        uni.showModal({
          title: "删除纪念日",
          content: "删除后会一并移除相关图片和视频，是否继续？",
          success: async (result) => {
            if (!result.confirm)
              return;
            try {
              await deleteAnniversary(detail.value.id);
              uni.showToast({ title: "已删除", icon: "success" });
              setTimeout(() => backPage(), 250);
            } catch (error) {
              uni.showToast({ title: (error == null ? void 0 : error.message) || "删除失败", icon: "none" });
            }
          }
        });
      }
      const __returned__ = { themeStyle, detail, eventId, loadDetail, formatStatus, goEdit, handleDelete, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get deleteAnniversary() {
        return deleteAnniversary;
      }, get fetchAnniversaryDetail() {
        return fetchAnniversaryDetail;
      }, get requireAuth() {
        return requireAuth;
      }, get resolveMediaUrl() {
        return resolveMediaUrl;
      }, get backPage() {
        return backPage;
      }, get goPage() {
        return goPage;
      }, get useThemePage() {
        return useThemePage;
      }, AccountHeader, AccountPanel };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-account-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "app-account-topbar-shell" }, [
          vue.createVNode($setup["AccountHeader"], {
            title: "纪念日详情",
            eyebrow: "回忆卡片"
          })
        ]),
        $setup.detail ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "app-account-content"
        }, [
          vue.createVNode($setup["AccountPanel"], {
            title: $setup.detail.title,
            description: $setup.detail.location || "把这一天的故事留在这里。"
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", { class: "detail-meta" }, [
                vue.createElementVNode(
                  "view",
                  { class: "detail-chip" },
                  vue.toDisplayString($setup.detail.eventDate),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "view",
                  { class: "detail-chip strong" },
                  vue.toDisplayString($setup.formatStatus($setup.detail)),
                  1
                  /* TEXT */
                )
              ]),
              $setup.detail.creatorNickname ? (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 0,
                  class: "detail-creator"
                },
                "由 " + vue.toDisplayString($setup.detail.creatorNickname) + " 创建",
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode(
                "view",
                { class: "detail-desc" },
                vue.toDisplayString($setup.detail.description || "还没有补充文字说明。"),
                1
                /* TEXT */
              )
            ]),
            _: 1
            /* STABLE */
          }, 8, ["title", "description"]),
          vue.createVNode($setup["AccountPanel"], {
            title: "图片与视频",
            description: "支持多张图片和一个视频，一起组成完整的纪念卡片。"
          }, {
            default: vue.withCtx(() => {
              var _a;
              return [
                ((_a = $setup.detail.mediaList) == null ? void 0 : _a.length) ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "media-list"
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.detail.mediaList, (item) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: item.id,
                        class: "media-item"
                      }, [
                        item.mediaType === "image" ? (vue.openBlock(), vue.createElementBlock("image", {
                          key: 0,
                          class: "media-preview",
                          src: $setup.resolveMediaUrl(item.fileUrl),
                          mode: "aspectFill"
                        }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("video", {
                          key: 1,
                          class: "media-preview",
                          src: $setup.resolveMediaUrl(item.fileUrl),
                          controls: "",
                          objectFit: "cover"
                        }, null, 8, ["src"]))
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "detail-empty"
                }, "当前还没有上传图片或视频。"))
              ];
            }),
            _: 1
            /* STABLE */
          }),
          vue.createElementVNode("view", { class: "detail-actions" }, [
            vue.createElementVNode("button", {
              class: "ghost-btn app-account-flat-btn app-account-flat-btn-soft",
              onClick: $setup.goEdit
            }, "编辑"),
            vue.createElementVNode("button", {
              class: "ghost-btn app-account-flat-btn app-account-flat-btn-warn",
              onClick: $setup.handleDelete
            }, "删除")
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ],
      4
      /* STYLE */
    );
  }
  const PagesModulesAnniversaryDetail = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$d], ["__scopeId", "data-v-cf83378e"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/modules/anniversary/detail.vue"]]);
  const _sfc_main$c = {
    __name: "AccountField",
    props: {
      label: {
        type: String,
        default: ""
      },
      hint: {
        type: String,
        default: ""
      },
      bare: {
        type: Boolean,
        default: false
      },
      compact: {
        type: Boolean,
        default: false
      }
    },
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const wrapperClass = vue.computed(() => ({
        "app-account-form-item-compact": props.compact
      }));
      const contentClass = vue.computed(() => props.bare ? "" : "app-input-shell");
      const __returned__ = { props, wrapperClass, contentClass, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["app-account-form-item", $setup.wrapperClass])
      },
      [
        $props.label ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: "app-account-label"
          },
          vue.toDisplayString($props.label),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass($setup.contentClass)
          },
          [
            vue.renderSlot(_ctx.$slots, "default")
          ],
          2
          /* CLASS */
        ),
        $props.hint ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 1,
            class: "app-account-field-hint"
          },
          vue.toDisplayString($props.hint),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true)
      ],
      2
      /* CLASS */
    );
  }
  const AccountField = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$c], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/account/components/AccountField.vue"]]);
  const _sfc_main$b = {
    __name: "edit",
    setup(__props, { expose: __expose }) {
      __expose();
      const { themeStyle } = useThemePage();
      const instance = vue.getCurrentInstance();
      const eventId = vue.ref("");
      const form = vue.reactive({
        title: "",
        type: "custom",
        eventDate: "",
        location: "",
        description: "",
        reminderType: "none"
      });
      const typeOptions = [
        { key: "custom", label: "自定义" },
        { key: "meet", label: "第一次见面" },
        { key: "love", label: "确认关系" },
        { key: "travel", label: "第一次旅行" },
        { key: "birthday", label: "生日" }
      ];
      const reminderOptions = [
        { key: "none", label: "不提醒" },
        { key: "on_day", label: "当天提醒" },
        { key: "one_day_before", label: "提前 1 天" },
        { key: "three_days_before", label: "提前 3 天" }
      ];
      const typeIndex = vue.ref(0);
      const reminderIndex = vue.ref(0);
      const mediaList = vue.ref([]);
      const dragState = vue.reactive({
        dragging: false,
        activeIndex: -1,
        targetIndex: -1,
        reboundIndex: -1,
        containerTop: 0,
        itemHeight: 0
      });
      const pageTitle = vue.computed(() => eventId.value ? "编辑纪念日" : "新增纪念日");
      const imageCount = vue.computed(() => mediaList.value.filter((item) => item.mediaType === "image").length);
      const videoCount = vue.computed(() => mediaList.value.filter((item) => item.mediaType === "video").length);
      onLoad(async (options) => {
        if (!requireAuth())
          return;
        eventId.value = (options == null ? void 0 : options.id) || "";
        if (eventId.value) {
          await loadDetail(eventId.value);
        }
      });
      onShow(() => {
        const draft = getAreaDraft("anniversary_location");
        if (!draft)
          return;
        form.location = draft.displayText || draft.mergerName || draft.name || "";
        clearAreaDraft("anniversary_location");
      });
      async function loadDetail(id) {
        try {
          const detail = await fetchAnniversaryDetail(id);
          form.title = detail.title || "";
          form.type = detail.type || "custom";
          form.eventDate = detail.eventDate || "";
          form.location = detail.location || "";
          form.description = detail.description || "";
          form.reminderType = detail.reminderType || "none";
          typeIndex.value = Math.max(typeOptions.findIndex((item) => item.key === form.type), 0);
          reminderIndex.value = Math.max(reminderOptions.findIndex((item) => item.key === form.reminderType), 0);
          mediaList.value = (detail.mediaList || []).map((item) => ({
            localId: `remote_${item.id}`,
            id: item.id,
            mediaType: item.mediaType,
            fileUrl: item.fileUrl,
            thumbnailUrl: item.thumbnailUrl,
            previewUrl: resolveMediaUrl(item.fileUrl),
            localPath: ""
          }));
        } catch (error) {
          uni.showToast({ title: (error == null ? void 0 : error.message) || "纪念日详情加载失败", icon: "none" });
        }
      }
      function handleTypeChange(event) {
        var _a;
        typeIndex.value = Number(event.detail.value || 0);
        form.type = ((_a = typeOptions[typeIndex.value]) == null ? void 0 : _a.key) || "custom";
      }
      function handleReminderChange(event) {
        var _a;
        reminderIndex.value = Number(event.detail.value || 0);
        form.reminderType = ((_a = reminderOptions[reminderIndex.value]) == null ? void 0 : _a.key) || "none";
      }
      function handleDateChange(event) {
        form.eventDate = event.detail.value;
      }
      function openLocationPicker() {
        goPage(buildAreaPickerUrl("anniversary_location", {
          value: form.location || ""
        }));
      }
      async function chooseImages() {
        const remain = 10 - imageCount.value;
        if (remain <= 0) {
          uni.showToast({ title: "图片最多 10 张", icon: "none" });
          return;
        }
        try {
          const result = await new Promise((resolve, reject) => {
            uni.chooseImage({
              count: remain,
              sizeType: ["compressed", "original"],
              sourceType: ["album", "camera"],
              success: resolve,
              fail: reject
            });
          });
          for (const path of result.tempFilePaths || []) {
            const preparedPath = await prepareImageFile(path);
            mediaList.value.push({
              localId: `local_${Date.now()}_${Math.random()}`,
              mediaType: "image",
              fileUrl: "",
              thumbnailUrl: "",
              previewUrl: preparedPath,
              localPath: preparedPath
            });
          }
        } catch (error) {
          if (error == null ? void 0 : error.message) {
            uni.showToast({ title: error.message, icon: "none" });
          }
        }
      }
      async function chooseVideo() {
        if (videoCount.value >= 1) {
          uni.showToast({ title: "视频最多 1 个", icon: "none" });
          return;
        }
        try {
          const result = await new Promise((resolve, reject) => {
            uni.chooseVideo({
              sourceType: ["album", "camera"],
              success: resolve,
              fail: reject
            });
          });
          mediaList.value.push({
            localId: `local_${Date.now()}_${Math.random()}`,
            mediaType: "video",
            fileUrl: "",
            thumbnailUrl: "",
            previewUrl: result.tempFilePath,
            localPath: result.tempFilePath
          });
        } catch (error) {
          if (error == null ? void 0 : error.message) {
            uni.showToast({ title: error.message, icon: "none" });
          }
        }
      }
      function removeMedia(index) {
        mediaList.value.splice(index, 1);
        finishDrag();
      }
      function startDrag(index) {
        if (mediaList.value.length < 2)
          return;
        dragState.reboundIndex = -1;
        dragState.dragging = true;
        dragState.activeIndex = index;
        dragState.targetIndex = index;
        vue.nextTick(() => {
          const query = uni.createSelectorQuery().in(instance == null ? void 0 : instance.proxy);
          query.select(".sort-list").boundingClientRect();
          query.select(".sort-item").boundingClientRect();
          query.exec((result) => {
            const listRect = result == null ? void 0 : result[0];
            const itemRect = result == null ? void 0 : result[1];
            if (!listRect || !itemRect) {
              finishDrag();
              return;
            }
            dragState.containerTop = listRect.top;
            dragState.itemHeight = itemRect.height + 12;
            if (typeof uni.vibrateShort === "function") {
              uni.vibrateShort({ type: "light" });
            }
          });
        });
      }
      function handleDragMove(event) {
        var _a, _b;
        if (!dragState.dragging || dragState.itemHeight <= 0)
          return;
        const touch = ((_a = event.touches) == null ? void 0 : _a[0]) || ((_b = event.changedTouches) == null ? void 0 : _b[0]);
        if (!touch)
          return;
        const relativeY = touch.clientY - dragState.containerTop;
        const maxIndex = mediaList.value.length - 1;
        const nextIndex = Math.max(0, Math.min(maxIndex, Math.floor(relativeY / dragState.itemHeight)));
        if (nextIndex === dragState.activeIndex)
          return;
        moveMedia(dragState.activeIndex, nextIndex);
        dragState.activeIndex = nextIndex;
        dragState.targetIndex = nextIndex;
      }
      function finishDrag() {
        const finishedIndex = dragState.activeIndex;
        dragState.dragging = false;
        dragState.activeIndex = -1;
        dragState.targetIndex = -1;
        dragState.containerTop = 0;
        dragState.itemHeight = 0;
        if (finishedIndex >= 0) {
          dragState.reboundIndex = finishedIndex;
          setTimeout(() => {
            if (dragState.reboundIndex === finishedIndex) {
              dragState.reboundIndex = -1;
            }
          }, 220);
        }
      }
      function moveMedia(fromIndex, toIndex) {
        if (fromIndex === toIndex)
          return;
        const nextList = [...mediaList.value];
        const [movedItem] = nextList.splice(fromIndex, 1);
        nextList.splice(toIndex, 0, movedItem);
        mediaList.value = nextList;
      }
      async function handleSave() {
        if (!form.title.trim()) {
          uni.showToast({ title: "请先填写纪念日标题", icon: "none" });
          return;
        }
        if (!form.eventDate) {
          uni.showToast({ title: "请选择纪念日日期", icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: "正在保存", mask: true });
          const uploadedMedia = [];
          for (let index = 0; index < mediaList.value.length; index += 1) {
            const item = mediaList.value[index];
            let fileUrl = item.fileUrl;
            if (item.localPath) {
              fileUrl = await uploadAnniversaryMedia(item.localPath);
            }
            uploadedMedia.push({
              mediaType: item.mediaType,
              fileUrl,
              thumbnailUrl: item.thumbnailUrl || "",
              sortOrder: index
            });
          }
          const payload = {
            title: form.title.trim(),
            type: form.type,
            eventDate: form.eventDate,
            location: form.location.trim(),
            description: form.description.trim(),
            reminderType: form.reminderType,
            mediaList: uploadedMedia
          };
          if (eventId.value) {
            await updateAnniversary(eventId.value, payload);
          } else {
            await createAnniversary(payload);
          }
          uni.hideLoading();
          uni.showToast({ title: "纪念日已保存", icon: "success" });
          setTimeout(() => backPage(), 250);
        } catch (error) {
          uni.hideLoading();
          uni.showToast({ title: (error == null ? void 0 : error.message) || "纪念日保存失败", icon: "none" });
        }
      }
      const __returned__ = { themeStyle, instance, eventId, form, typeOptions, reminderOptions, typeIndex, reminderIndex, mediaList, dragState, pageTitle, imageCount, videoCount, loadDetail, handleTypeChange, handleReminderChange, handleDateChange, openLocationPicker, chooseImages, chooseVideo, removeMedia, startDrag, handleDragMove, finishDrag, moveMedia, handleSave, computed: vue.computed, getCurrentInstance: vue.getCurrentInstance, nextTick: vue.nextTick, reactive: vue.reactive, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get createAnniversary() {
        return createAnniversary;
      }, get fetchAnniversaryDetail() {
        return fetchAnniversaryDetail;
      }, get updateAnniversary() {
        return updateAnniversary;
      }, get requireAuth() {
        return requireAuth;
      }, get buildAreaPickerUrl() {
        return buildAreaPickerUrl;
      }, get clearAreaDraft() {
        return clearAreaDraft;
      }, get getAreaDraft() {
        return getAreaDraft;
      }, get prepareImageFile() {
        return prepareImageFile;
      }, get resolveMediaUrl() {
        return resolveMediaUrl;
      }, get uploadAnniversaryMedia() {
        return uploadAnniversaryMedia;
      }, get backPage() {
        return backPage;
      }, get goPage() {
        return goPage;
      }, get useThemePage() {
        return useThemePage;
      }, AccountField, AccountHeader, AccountPanel };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-account-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "app-account-topbar-shell" }, [
          vue.createVNode($setup["AccountHeader"], {
            title: $setup.pageTitle,
            eyebrow: "纪念日编辑"
          }, null, 8, ["title"])
        ]),
        vue.createElementVNode("view", { class: "app-account-content" }, [
          vue.createVNode($setup["AccountPanel"], {
            title: "基础信息",
            description: "支持过去和未来的日期，保存后会按时间倒序展示。"
          }, {
            default: vue.withCtx(() => [
              vue.createVNode($setup["AccountField"], { label: "纪念日标题" }, {
                default: vue.withCtx(() => [
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.title = $event),
                      class: "input app-field",
                      placeholder: "例如：第一次见面",
                      "placeholder-class": "app-account-input-placeholder"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.form.title]
                  ])
                ]),
                _: 1
                /* STABLE */
              }),
              vue.createElementVNode("view", { class: "app-account-form-row" }, [
                vue.createElementVNode("view", { class: "app-account-form-col" }, [
                  vue.createVNode($setup["AccountField"], { label: "纪念日类型" }, {
                    default: vue.withCtx(() => {
                      var _a;
                      return [
                        vue.createElementVNode("picker", {
                          class: "picker app-field",
                          mode: "selector",
                          range: $setup.typeOptions,
                          "range-key": "label",
                          value: $setup.typeIndex,
                          onChange: $setup.handleTypeChange
                        }, [
                          vue.createElementVNode(
                            "view",
                            { class: "picker-value" },
                            vue.toDisplayString(((_a = $setup.typeOptions[$setup.typeIndex]) == null ? void 0 : _a.label) || "请选择类型"),
                            1
                            /* TEXT */
                          )
                        ], 40, ["value"])
                      ];
                    }),
                    _: 1
                    /* STABLE */
                  })
                ]),
                vue.createElementVNode("view", { class: "app-account-form-col" }, [
                  vue.createVNode($setup["AccountField"], { label: "日期" }, {
                    default: vue.withCtx(() => [
                      vue.createElementVNode("picker", {
                        class: "picker app-field",
                        mode: "date",
                        value: $setup.form.eventDate,
                        onChange: $setup.handleDateChange
                      }, [
                        vue.createElementVNode(
                          "view",
                          { class: "picker-value" },
                          vue.toDisplayString($setup.form.eventDate || "请选择日期"),
                          1
                          /* TEXT */
                        )
                      ], 40, ["value"])
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ])
              ]),
              vue.createVNode($setup["AccountField"], { label: "地点" }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode("view", {
                    class: "picker app-field location-picker",
                    onClick: $setup.openLocationPicker
                  }, [
                    vue.createElementVNode(
                      "view",
                      { class: "picker-value" },
                      vue.toDisplayString($setup.form.location || "请选择或填写地点"),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                _: 1
                /* STABLE */
              }),
              vue.createVNode($setup["AccountField"], { label: "文字说明" }, {
                default: vue.withCtx(() => [
                  vue.withDirectives(vue.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.description = $event),
                      maxlength: "500",
                      class: "textarea app-textarea",
                      placeholder: "写下这一天的故事和心情",
                      "placeholder-class": "app-account-input-placeholder"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.form.description]
                  ])
                ]),
                _: 1
                /* STABLE */
              }),
              vue.createVNode($setup["AccountField"], { label: "提醒设置" }, {
                default: vue.withCtx(() => {
                  var _a;
                  return [
                    vue.createElementVNode("picker", {
                      class: "picker app-field",
                      mode: "selector",
                      range: $setup.reminderOptions,
                      "range-key": "label",
                      value: $setup.reminderIndex,
                      onChange: $setup.handleReminderChange
                    }, [
                      vue.createElementVNode(
                        "view",
                        { class: "picker-value" },
                        vue.toDisplayString(((_a = $setup.reminderOptions[$setup.reminderIndex]) == null ? void 0 : _a.label) || "请选择提醒方式"),
                        1
                        /* TEXT */
                      )
                    ], 40, ["value"])
                  ];
                }),
                _: 1
                /* STABLE */
              })
            ]),
            _: 1
            /* STABLE */
          }),
          vue.createVNode($setup["AccountPanel"], {
            title: "图片与视频",
            description: "图片最多 10 张，单张超过 5MB 会尝试压缩；视频最多 1 个。"
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", { class: "media-toolbar" }, [
                vue.createElementVNode("button", {
                  class: "ghost-btn app-account-flat-btn app-account-flat-btn-soft",
                  onClick: $setup.chooseImages
                }, "添加图片"),
                vue.createElementVNode("button", {
                  class: "ghost-btn app-account-flat-btn app-account-flat-btn-soft",
                  onClick: $setup.chooseVideo
                }, "添加视频")
              ]),
              vue.createElementVNode(
                "view",
                { class: "media-tips" },
                "当前已选 " + vue.toDisplayString($setup.imageCount) + " 张图片，" + vue.toDisplayString($setup.videoCount) + " 个视频。长按拖动可调整顺序，第一项会优先作为封面。",
                1
                /* TEXT */
              ),
              $setup.mediaList.length ? (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 0,
                  class: "sort-list",
                  onTouchmove: vue.withModifiers($setup.handleDragMove, ["stop", "prevent"]),
                  onTouchend: $setup.finishDrag,
                  onTouchcancel: $setup.finishDrag
                },
                [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.mediaList, (item, index) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: item.localId,
                        class: vue.normalizeClass(["sort-item", {
                          dragging: $setup.dragState.dragging && $setup.dragState.activeIndex === index,
                          shifting: $setup.dragState.dragging && $setup.dragState.activeIndex !== index,
                          rebound: $setup.dragState.reboundIndex === index
                        }]),
                        onLongpress: ($event) => $setup.startDrag(index)
                      }, [
                        vue.createElementVNode("view", { class: "sort-thumb-wrap" }, [
                          item.mediaType === "image" ? (vue.openBlock(), vue.createElementBlock("image", {
                            key: 0,
                            class: "sort-thumb",
                            src: item.previewUrl,
                            mode: "aspectFill"
                          }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("video", {
                            key: 1,
                            class: "sort-thumb",
                            src: item.previewUrl,
                            objectFit: "cover"
                          }, null, 8, ["src"])),
                          vue.createElementVNode(
                            "view",
                            { class: "media-tag" },
                            vue.toDisplayString(item.mediaType === "image" ? "图片" : "视频"),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "sort-body" }, [
                          vue.createElementVNode("view", { class: "sort-top" }, [
                            vue.createElementVNode(
                              "view",
                              { class: "sort-order" },
                              "第 " + vue.toDisplayString(index + 1) + " 项",
                              1
                              /* TEXT */
                            ),
                            index === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                              key: 0,
                              class: "cover-badge"
                            }, "当前封面")) : vue.createCommentVNode("v-if", true)
                          ]),
                          vue.createElementVNode(
                            "view",
                            { class: "sort-desc" },
                            vue.toDisplayString(item.mediaType === "image" ? "长按后上下拖动，调整图片显示顺序。" : "视频也可以一起排序，封面将优先取第一项。"),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode("view", { class: "sort-actions" }, [
                            vue.createElementVNode("view", { class: "drag-hint" }, "长按拖动排序"),
                            vue.createElementVNode("view", {
                              class: "media-remove media-remove-inline",
                              onClick: vue.withModifiers(($event) => $setup.removeMedia(index), ["stop"])
                            }, "x", 8, ["onClick"])
                          ])
                        ])
                      ], 42, ["onLongpress"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                32
                /* NEED_HYDRATION */
              )) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "media-empty"
              }, "还没有添加图片或视频"))
            ]),
            _: 1
            /* STABLE */
          }),
          vue.createElementVNode("button", {
            class: "save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn",
            onClick: $setup.handleSave
          }, "保存纪念日")
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesModulesAnniversaryEdit = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$b], ["__scopeId", "data-v-6de94c79"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/modules/anniversary/edit.vue"]]);
  const _sfc_main$a = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const { themeStyle } = useThemePage();
      const title = vue.ref("敬请期待");
      function goBack() {
        backPage();
      }
      onLoad((options) => {
        title.value = decodeURIComponent(options.title || "敬请期待");
      });
      const __returned__ = { themeStyle, title, goBack, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get backPage() {
        return backPage;
      }, get useThemePage() {
        return useThemePage;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page coming-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "bg-orb orb-a" }),
        vue.createElementVNode("view", { class: "bg-orb orb-b" }),
        vue.createElementVNode("view", { class: "top-bar app-topbar app-fade-up" }, [
          vue.createElementVNode("view", {
            class: "top-nav-btn app-topbar-btn",
            onClick: $setup.goBack
          }, [
            vue.createElementVNode("text", { class: "top-nav-icon app-topbar-icon" }, "‹"),
            vue.createElementVNode("text", { class: "top-nav-text app-topbar-text" }, "返回")
          ]),
          vue.createElementVNode("view", { class: "page-title-wrap app-topbar-center" }, [
            vue.createElementVNode("view", { class: "page-eyebrow app-topbar-eyebrow" }, "功能预告"),
            vue.createElementVNode("view", { class: "page-title app-topbar-title" }, "敬请期待")
          ]),
          vue.createElementVNode("view", { class: "top-placeholder app-topbar-placeholder" })
        ]),
        vue.createElementVNode("view", { class: "content-shell" }, [
          vue.createElementVNode("view", { class: "card app-card app-fade-up app-delay-1" }, [
            vue.createElementVNode("view", { class: "card-glow glow-a" }),
            vue.createElementVNode("view", { class: "card-glow glow-b" }),
            vue.createElementVNode("view", { class: "badge app-pill app-pill-soft" }, "开发中"),
            vue.createElementVNode("view", { class: "icon" }, "💫"),
            vue.createElementVNode(
              "view",
              { class: "title" },
              vue.toDisplayString($setup.title),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "desc" }, "这个浪漫模块正在精心准备中，先把结构和氛围铺好，后面会补上更完整的体验。"),
            vue.createElementVNode("view", { class: "meta-row" }, [
              vue.createElementVNode("view", { class: "meta-chip app-pill app-pill-soft" }, "灵感整理中"),
              vue.createElementVNode("view", { class: "meta-chip app-pill app-pill-soft" }, "内容即将上线")
            ]),
            vue.createElementVNode("view", { class: "note-card app-card-soft app-card-gradient" }, [
              vue.createElementVNode("view", { class: "note-title" }, "预计会包含"),
              vue.createElementVNode("view", { class: "note-text" }, "更完整的记录方式、更细腻的页面互动，以及和其他模块之间的联动体验。")
            ]),
            vue.createElementVNode("button", {
              class: "back-btn app-primary-btn app-primary-btn-shadow",
              onClick: $setup.goBack
            }, "先回上一页")
          ])
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesModulesComingSoonIndex = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$a], ["__scopeId", "data-v-f3f0e89a"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/modules/coming-soon/index.vue"]]);
  const _sfc_main$9 = {
    __name: "settings",
    setup(__props, { expose: __expose }) {
      __expose();
      const { themeStyle } = useThemePage();
      const profile = vue.ref(getProfile());
      const avatarPresetMap2 = getAvatarPresetMap();
      const isImageAvatar = vue.computed(() => profile.value.avatarType === "upload" && !!profile.value.avatarImage);
      const avatarImageUrl = vue.computed(() => resolveAvatarUrl(profile.value.avatarImage));
      const avatarDisplay = vue.computed(() => {
        if (profile.value.avatarType === "preset") {
          return avatarPresetMap2[profile.value.avatarPreset] || "💕";
        }
        return String(profile.value.avatarText || "").trim() || "💕";
      });
      const anniversaryDisplay = vue.computed(() => profile.value.anniversaryDate || "未设置");
      const passwordDots = vue.computed(() => "•".repeat(Math.max((profile.value.password || "").length, 4)));
      const profileSummaryTag = vue.computed(() => profile.value.city || "未设置");
      const profileSummary = vue.computed(() => {
        const pieces = [profile.value.nickname || "未设置真实姓名"];
        if (profile.value.email)
          pieces.push(profile.value.email);
        return pieces.join(" · ");
      });
      const avatarModeLabel = vue.computed(() => {
        if (profile.value.avatarType === "upload" && profile.value.avatarImage)
          return "已上传";
        if (profile.value.avatarType === "text")
          return "字符头像";
        return "默认头像";
      });
      const avatarSummary = vue.computed(() => {
        if (profile.value.avatarType === "upload" && profile.value.avatarImage)
          return "当前正在使用已同步到服务端的头像";
        if (profile.value.avatarType === "text")
          return `当前字符：${String(profile.value.avatarText || "").trim() || "💕"}`;
        return `当前预设：${avatarDisplay.value}`;
      });
      const relationshipSummaryTag = vue.computed(() => profile.value.loverNickname || "未设置称呼");
      const relationshipSummary = vue.computed(() => {
        const pieces = [];
        if (profile.value.anniversaryDate)
          pieces.push(profile.value.anniversaryDate);
        pieces.push(profile.value.defaultMeetingPlace || "未设置地点");
        return pieces.join(" · ");
      });
      const securitySummaryTag = vue.computed(() => (profile.value.password || "").length >= 4 ? "已设置" : "待完善");
      const securitySummary = vue.computed(() => {
        const length = (profile.value.password || "").length;
        return length ? `当前密码长度 ${length} 位` : "还没有设置可用密码";
      });
      onShow(async () => {
        if (!requireAuth())
          return;
        try {
          profile.value = await fetchRemoteProfile();
        } catch (error) {
          profile.value = getProfile();
        }
      });
      const __returned__ = { themeStyle, profile, avatarPresetMap: avatarPresetMap2, isImageAvatar, avatarImageUrl, avatarDisplay, anniversaryDisplay, passwordDots, profileSummaryTag, profileSummary, avatarModeLabel, avatarSummary, relationshipSummaryTag, relationshipSummary, securitySummaryTag, securitySummary, computed: vue.computed, ref: vue.ref, get onShow() {
        return onShow;
      }, get requireAuth() {
        return requireAuth;
      }, get resolveAvatarUrl() {
        return resolveAvatarUrl;
      }, get fetchRemoteProfile() {
        return fetchRemoteProfile;
      }, get goPage() {
        return goPage;
      }, get getAvatarPresetMap() {
        return getAvatarPresetMap;
      }, get getProfile() {
        return getProfile;
      }, get useThemePage() {
        return useThemePage;
      }, AccountHeader, AccountPanel };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-account-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "app-account-topbar-shell" }, [
          vue.createVNode($setup["AccountHeader"], {
            title: "账号设置",
            eyebrow: "设置中心"
          })
        ]),
        vue.createElementVNode("view", { class: "app-account-content" }, [
          vue.createElementVNode("view", { class: "hero-card app-fade-up" }, [
            vue.createElementVNode("view", { class: "hero-glow hero-glow-a" }),
            vue.createElementVNode("view", { class: "hero-glow hero-glow-b" }),
            vue.createElementVNode("view", { class: "hero-left" }, [
              vue.createElementVNode("view", { class: "hero-avatar" }, [
                $setup.isImageAvatar ? (vue.openBlock(), vue.createElementBlock("image", {
                  key: 0,
                  class: "hero-avatar-image",
                  src: $setup.avatarImageUrl,
                  mode: "aspectFill"
                }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 1,
                    class: "hero-avatar-text"
                  },
                  vue.toDisplayString($setup.avatarDisplay),
                  1
                  /* TEXT */
                ))
              ]),
              vue.createElementVNode("view", { class: "hero-copy" }, [
                vue.createElementVNode(
                  "view",
                  { class: "hero-title" },
                  vue.toDisplayString($setup.profile.nickname),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "view",
                  { class: "hero-desc" },
                  vue.toDisplayString($setup.profile.bio),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "hero-tags" }, [
              vue.createElementVNode(
                "view",
                { class: "hero-chip app-pill app-pill-glass" },
                vue.toDisplayString($setup.profile.city),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "hero-chip app-pill app-pill-glass" },
                vue.toDisplayString($setup.profile.loverNickname),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createVNode($setup["AccountPanel"], {
            title: "资料与外观",
            description: "先处理最常改的个人展示内容，让主页和我的页始终保持一致。"
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", { class: "menu-list menu-list-tight app-fade-up app-delay-1" }, [
                vue.createElementVNode("view", {
                  class: "menu-card app-card-soft",
                  "hover-class": "menu-card-active",
                  "hover-stay-time": "70",
                  onClick: _cache[0] || (_cache[0] = ($event) => $setup.goPage("/pages/account/profile"))
                }, [
                  vue.createElementVNode("view", { class: "menu-accent accent-profile" }),
                  vue.createElementVNode("view", { class: "menu-main" }, [
                    vue.createElementVNode("view", { class: "menu-title-row" }, [
                      vue.createElementVNode("view", { class: "menu-title" }, "个人资料"),
                      vue.createElementVNode(
                        "view",
                        { class: "menu-summary-chip" },
                        vue.toDisplayString($setup.profileSummaryTag),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "view",
                      { class: "menu-summary" },
                      vue.toDisplayString($setup.profileSummary),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "menu-desc" }, "真实姓名、城市、签名和邮箱")
                  ]),
                  vue.createElementVNode("view", { class: "menu-preview-card profile-preview" }, [
                    vue.createElementVNode("view", { class: "preview-kicker" }, "当前城市"),
                    vue.createElementVNode(
                      "view",
                      { class: "preview-value" },
                      vue.toDisplayString($setup.profile.city || "未设置"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      { class: "preview-sub" },
                      vue.toDisplayString($setup.profile.email || "邮箱未填写"),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "menu-arrow" }, ">")
                ]),
                vue.createElementVNode("view", {
                  class: "menu-card app-card-soft",
                  "hover-class": "menu-card-active",
                  "hover-stay-time": "70",
                  onClick: _cache[1] || (_cache[1] = ($event) => $setup.goPage("/pages/account/avatar"))
                }, [
                  vue.createElementVNode("view", { class: "menu-accent accent-avatar" }),
                  vue.createElementVNode("view", { class: "menu-main" }, [
                    vue.createElementVNode("view", { class: "menu-title-row" }, [
                      vue.createElementVNode("view", { class: "menu-title" }, "头像设置"),
                      vue.createElementVNode(
                        "view",
                        { class: "menu-summary-chip" },
                        vue.toDisplayString($setup.avatarModeLabel),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "view",
                      { class: "menu-summary" },
                      vue.toDisplayString($setup.avatarSummary),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "menu-desc" }, "默认头像、上传头像、字符头像")
                  ]),
                  vue.createElementVNode("view", { class: "menu-preview-card avatar-preview" }, [
                    $setup.isImageAvatar ? (vue.openBlock(), vue.createElementBlock("image", {
                      key: 0,
                      class: "menu-preview-avatar-image",
                      src: $setup.avatarImageUrl,
                      mode: "aspectFill"
                    }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: 1,
                        class: "menu-preview-avatar-text"
                      },
                      vue.toDisplayString($setup.avatarDisplay),
                      1
                      /* TEXT */
                    ))
                  ]),
                  vue.createElementVNode("view", { class: "menu-arrow" }, ">")
                ])
              ])
            ]),
            _: 1
            /* STABLE */
          }),
          vue.createVNode($setup["AccountPanel"], {
            title: "恋爱与安全",
            description: "关系信息和登录密码分开放，后面继续扩展提醒或隐私功能也更顺手。"
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", { class: "menu-list menu-list-tight app-fade-up app-delay-2" }, [
                vue.createElementVNode("view", {
                  class: "menu-card app-card-soft",
                  "hover-class": "menu-card-active",
                  "hover-stay-time": "70",
                  onClick: _cache[2] || (_cache[2] = ($event) => $setup.goPage("/pages/account/relationship"))
                }, [
                  vue.createElementVNode("view", { class: "menu-accent accent-relationship" }),
                  vue.createElementVNode("view", { class: "menu-main" }, [
                    vue.createElementVNode("view", { class: "menu-title-row" }, [
                      vue.createElementVNode("view", { class: "menu-title" }, "关系信息"),
                      vue.createElementVNode(
                        "view",
                        { class: "menu-summary-chip" },
                        vue.toDisplayString($setup.relationshipSummaryTag),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "view",
                      { class: "menu-summary" },
                      vue.toDisplayString($setup.relationshipSummary),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "menu-desc" }, "对方对你的称呼、纪念日、默认见面地点")
                  ]),
                  vue.createElementVNode("view", { class: "menu-preview-card anniversary-preview" }, [
                    vue.createElementVNode("view", { class: "preview-kicker" }, "纪念日"),
                    vue.createElementVNode(
                      "view",
                      { class: "preview-value preview-date" },
                      vue.toDisplayString($setup.anniversaryDisplay),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      { class: "preview-sub" },
                      vue.toDisplayString($setup.profile.defaultMeetingPlace || "未设置地点"),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "menu-arrow" }, ">")
                ]),
                vue.createElementVNode("view", {
                  class: "menu-card app-card-soft",
                  "hover-class": "menu-card-active",
                  "hover-stay-time": "70",
                  onClick: _cache[3] || (_cache[3] = ($event) => $setup.goPage("/pages/account/security"))
                }, [
                  vue.createElementVNode("view", { class: "menu-accent accent-security" }),
                  vue.createElementVNode("view", { class: "menu-main" }, [
                    vue.createElementVNode("view", { class: "menu-title-row" }, [
                      vue.createElementVNode("view", { class: "menu-title" }, "账号安全"),
                      vue.createElementVNode(
                        "view",
                        { class: "menu-summary-chip" },
                        vue.toDisplayString($setup.securitySummaryTag),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "view",
                      { class: "menu-summary" },
                      vue.toDisplayString($setup.securitySummary),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "menu-desc" }, "修改密码")
                  ]),
                  vue.createElementVNode("view", { class: "menu-preview-card security-preview" }, [
                    vue.createElementVNode("view", { class: "preview-kicker" }, "密码状态"),
                    vue.createElementVNode(
                      "view",
                      { class: "preview-value" },
                      vue.toDisplayString($setup.securitySummaryTag),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      { class: "preview-sub" },
                      vue.toDisplayString($setup.passwordDots),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "menu-arrow" }, ">")
                ])
              ])
            ]),
            _: 1
            /* STABLE */
          }),
          vue.createVNode($setup["AccountPanel"], {
            title: "数据管理",
            description: "涉及服务端资料恢复和缓存同步，单独放在底部会更安全。"
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", { class: "menu-list menu-list-tight app-fade-up app-delay-3" }, [
                vue.createElementVNode("view", {
                  class: "menu-card app-card-soft",
                  "hover-class": "menu-card-active",
                  "hover-stay-time": "70",
                  onClick: _cache[4] || (_cache[4] = ($event) => $setup.goPage("/pages/account/data"))
                }, [
                  vue.createElementVNode("view", { class: "menu-accent accent-data" }),
                  vue.createElementVNode("view", { class: "menu-main" }, [
                    vue.createElementVNode("view", { class: "menu-title-row" }, [
                      vue.createElementVNode("view", { class: "menu-title" }, "本地数据"),
                      vue.createElementVNode("view", { class: "menu-summary-chip warn" }, "谨慎操作")
                    ]),
                    vue.createElementVNode("view", { class: "menu-summary" }, "资料以服务端为准，异常时会回退到本地缓存"),
                    vue.createElementVNode("view", { class: "menu-desc" }, "恢复默认和重新同步资料")
                  ]),
                  vue.createElementVNode("view", { class: "menu-preview-card data-preview" }, [
                    vue.createElementVNode("view", { class: "preview-kicker" }, "同步状态"),
                    vue.createElementVNode("view", { class: "preview-value" }, "账号资料"),
                    vue.createElementVNode("view", { class: "preview-sub" }, "服务端主数据 / 本地缓存兜底")
                  ]),
                  vue.createElementVNode("view", { class: "menu-arrow" }, ">")
                ])
              ])
            ]),
            _: 1
            /* STABLE */
          })
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesAccountSettings = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$9], ["__scopeId", "data-v-de3d62c9"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/account/settings.vue"]]);
  function finishSettingsSave(title = "已保存", delay = 250) {
    uni.showToast({
      title,
      icon: "success"
    });
    setTimeout(() => {
      backPage();
    }, delay);
  }
  async function saveProfilePatchAndBack(patch, title = "已保存", delay = 250) {
    await updateRemoteProfile(patch);
    finishSettingsSave(title, delay);
  }
  async function savePasswordAndBack(password, title = "已保存", delay = 250) {
    await updateRemotePassword(password);
    uni.showToast({
      title,
      icon: "success"
    });
    setTimeout(() => {
      redirectToLogin("密码已修改，请重新登录");
    }, delay);
  }
  const _sfc_main$8 = {
    __name: "profile",
    setup(__props, { expose: __expose }) {
      __expose();
      const { themeStyle } = useThemePage();
      const form = vue.reactive(getProfile());
      onLoad(() => {
        requireAuth();
      });
      onShow(() => {
        const draft = getAreaDraft("profile_city");
        if (!draft)
          return;
        form.city = draft.displayText || draft.mergerName || draft.name || "";
        clearAreaDraft("profile_city");
      });
      function openCityPicker() {
        goPage(buildAreaPickerUrl("profile_city", {
          value: form.city || ""
        }));
      }
      async function handleSave() {
        if (!form.nickname.trim()) {
          uni.showToast({ title: "请先填写真实姓名", icon: "none" });
          return;
        }
        try {
          await saveProfilePatchAndBack({
            nickname: form.nickname.trim(),
            city: form.city.trim(),
            email: form.email.trim(),
            bio: (form.bio || "").trim() || "把喜欢写进每一天。"
          }, "资料已保存");
        } catch (error) {
          uni.showToast({ title: (error == null ? void 0 : error.message) || "资料保存失败", icon: "none" });
        }
      }
      const __returned__ = { themeStyle, form, openCityPicker, handleSave, reactive: vue.reactive, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get requireAuth() {
        return requireAuth;
      }, get saveProfilePatchAndBack() {
        return saveProfilePatchAndBack;
      }, get buildAreaPickerUrl() {
        return buildAreaPickerUrl;
      }, get clearAreaDraft() {
        return clearAreaDraft;
      }, get getAreaDraft() {
        return getAreaDraft;
      }, get getProfile() {
        return getProfile;
      }, get goPage() {
        return goPage;
      }, get useThemePage() {
        return useThemePage;
      }, AccountField, AccountHeader, AccountPanel };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-account-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "app-account-topbar-shell" }, [
          vue.createVNode($setup["AccountHeader"], {
            title: "个人资料",
            eyebrow: "资料编辑"
          })
        ]),
        vue.createElementVNode("view", { class: "app-account-content" }, [
          vue.createVNode($setup["AccountPanel"], {
            title: "基础资料",
            description: "这里会影响“我的”页和设置页顶部的展示内容。"
          }, {
            default: vue.withCtx(() => [
              vue.createVNode($setup["AccountField"], {
                label: "真实姓名",
                hint: "这里填写你自己的真实姓名，用于个人资料展示。"
              }, {
                default: vue.withCtx(() => [
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.nickname = $event),
                      class: "input app-field",
                      placeholder: "比如：陈佳",
                      "placeholder-class": "app-account-input-placeholder"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.form.nickname]
                  ])
                ]),
                _: 1
                /* STABLE */
              }),
              vue.createElementVNode("view", { class: "app-account-form-row" }, [
                vue.createElementVNode("view", { class: "app-account-form-col" }, [
                  vue.createVNode($setup["AccountField"], { label: "所在城市" }, {
                    default: vue.withCtx(() => [
                      vue.createElementVNode("view", {
                        class: "picker app-field location-picker",
                        onClick: $setup.openCityPicker
                      }, [
                        vue.createElementVNode(
                          "view",
                          { class: "picker-value" },
                          vue.toDisplayString($setup.form.city || "请选择所在城市"),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ]),
                vue.createElementVNode("view", { class: "app-account-form-col" }, [
                  vue.createVNode($setup["AccountField"], { label: "邮箱" }, {
                    default: vue.withCtx(() => [
                      vue.withDirectives(vue.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.email = $event),
                          class: "input app-field",
                          placeholder: "选填，用作展示",
                          "placeholder-class": "app-account-input-placeholder"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [vue.vModelText, $setup.form.email]
                      ])
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ])
              ]),
              vue.createVNode($setup["AccountField"], {
                label: "个性签名",
                hint: "建议控制在 60 字以内，视觉上会更舒服。"
              }, {
                default: vue.withCtx(() => [
                  vue.withDirectives(vue.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.bio = $event),
                      maxlength: "60",
                      class: "textarea app-textarea",
                      placeholder: "写下一句想留下的话",
                      "placeholder-class": "app-account-input-placeholder"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.form.bio]
                  ])
                ]),
                _: 1
                /* STABLE */
              })
            ]),
            _: 1
            /* STABLE */
          }),
          vue.createElementVNode("button", {
            class: "save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn",
            onClick: $setup.handleSave
          }, "保存资料")
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesAccountProfile = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$8], ["__scopeId", "data-v-062f0fcd"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/account/profile.vue"]]);
  const _sfc_main$7 = {
    __name: "avatar",
    setup(__props, { expose: __expose }) {
      __expose();
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
      const { themeStyle } = useThemePage();
      const form = vue.reactive(getProfile());
      const avatarPresets2 = getAvatarPresets();
      const draftAvatarPath = vue.ref("");
      const previewAvatarUrl = vue.computed(() => resolveAvatarUrl(draftAvatarPath.value || form.avatarImage));
      onLoad(() => {
        requireAuth();
      });
      onShow(async () => {
        if (!requireAuth())
          return;
        try {
          Object.assign(form, await fetchRemoteProfile());
          saveProfile(form);
        } catch (error) {
          Object.assign(form, getProfile());
        }
        const draft = getAvatarDraft();
        if (!draft)
          return;
        form.avatarType = "upload";
        draftAvatarPath.value = draft;
        clearAvatarDraft();
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
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (result) => {
            var _a;
            const filePath = (_a = result.tempFilePaths) == null ? void 0 : _a[0];
            if (!filePath)
              return;
            goPage(`/pages/account/avatar-crop?src=${encodeURIComponent(filePath)}`);
          }
        });
      }
      function clearAvatarImage() {
        form.avatarImage = "";
        draftAvatarPath.value = "";
        form.avatarType = "upload";
      }
      async function handleSave() {
        try {
          let avatarImage = form.avatarType === "upload" ? form.avatarImage : "";
          if (form.avatarType === "upload" && draftAvatarPath.value) {
            avatarImage = await uploadAvatarFile(draftAvatarPath.value);
            form.avatarImage = avatarImage;
            draftAvatarPath.value = "";
          }
          await saveProfilePatchAndBack({
            avatarType: form.avatarType,
            avatarPreset: form.avatarPreset,
            avatarText: (form.avatarText || TEXT.textPlaceholder).trim() || TEXT.textPlaceholder,
            avatarImage
          }, TEXT.saveSuccess);
        } catch (error) {
          uni.showToast({ title: (error == null ? void 0 : error.message) || TEXT.saveError, icon: "none" });
        }
      }
      const __returned__ = { TEXT, themeStyle, form, avatarPresets: avatarPresets2, draftAvatarPath, previewAvatarUrl, setAvatarType, activateUploadAvatar, selectPreset, chooseAvatarImage, clearAvatarImage, handleSave, computed: vue.computed, reactive: vue.reactive, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get requireAuth() {
        return requireAuth;
      }, get clearAvatarDraft() {
        return clearAvatarDraft;
      }, get getAvatarDraft() {
        return getAvatarDraft;
      }, get resolveAvatarUrl() {
        return resolveAvatarUrl;
      }, get uploadAvatarFile() {
        return uploadAvatarFile;
      }, get saveProfilePatchAndBack() {
        return saveProfilePatchAndBack;
      }, get fetchRemoteProfile() {
        return fetchRemoteProfile;
      }, get getAvatarPresets() {
        return getAvatarPresets;
      }, get getProfile() {
        return getProfile;
      }, get saveProfile() {
        return saveProfile;
      }, get goPage() {
        return goPage;
      }, get useThemePage() {
        return useThemePage;
      }, AccountField, AccountHeader, AccountPanel };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-account-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "app-account-topbar-shell" }, [
          vue.createVNode($setup["AccountHeader"], {
            title: $setup.TEXT.pageTitle,
            eyebrow: $setup.TEXT.eyebrow
          }, null, 8, ["title", "eyebrow"])
        ]),
        vue.createElementVNode("view", { class: "app-account-content" }, [
          vue.createVNode($setup["AccountPanel"], {
            title: $setup.TEXT.panelTitle,
            description: $setup.TEXT.panelDescription
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", { class: "avatar-mode-row" }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["avatar-mode", { active: $setup.form.avatarType === "preset" }]),
                    onClick: _cache[0] || (_cache[0] = ($event) => $setup.setAvatarType("preset"))
                  },
                  vue.toDisplayString($setup.TEXT.presetMode),
                  3
                  /* TEXT, CLASS */
                ),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["avatar-mode", { active: $setup.form.avatarType === "upload" }]),
                    onClick: $setup.activateUploadAvatar
                  },
                  vue.toDisplayString($setup.TEXT.uploadMode),
                  3
                  /* TEXT, CLASS */
                ),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["avatar-mode", { active: $setup.form.avatarType === "text" }]),
                    onClick: _cache[1] || (_cache[1] = ($event) => $setup.setAvatarType("text"))
                  },
                  vue.toDisplayString($setup.TEXT.textMode),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              $setup.form.avatarType === "preset" ? (vue.openBlock(), vue.createBlock($setup["AccountField"], {
                key: 0,
                label: $setup.TEXT.presetFieldLabel,
                hint: $setup.TEXT.presetHint,
                bare: ""
              }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode("scroll-view", {
                    class: "preset-scroll",
                    "scroll-x": "",
                    "show-scrollbar": "false"
                  }, [
                    vue.createElementVNode("view", { class: "preset-row" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.avatarPresets, (item) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: item.key,
                            class: vue.normalizeClass(["preset-card", { active: $setup.form.avatarPreset === item.key }]),
                            style: vue.normalizeStyle({ background: item.gradient }),
                            onClick: ($event) => $setup.selectPreset(item.key)
                          }, [
                            vue.createElementVNode(
                              "view",
                              { class: "preset-icon" },
                              vue.toDisplayString(item.text),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "view",
                              { class: "preset-name" },
                              vue.toDisplayString(item.label),
                              1
                              /* TEXT */
                            )
                          ], 14, ["onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ]),
                _: 1
                /* STABLE */
              }, 8, ["label", "hint"])) : $setup.form.avatarType === "upload" ? (vue.openBlock(), vue.createBlock($setup["AccountField"], {
                key: 1,
                label: $setup.TEXT.uploadFieldLabel,
                hint: $setup.TEXT.uploadHint,
                bare: ""
              }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode("view", { class: "upload-panel app-input-shell" }, [
                    $setup.previewAvatarUrl ? (vue.openBlock(), vue.createElementBlock("image", {
                      key: 0,
                      class: "upload-preview",
                      src: $setup.previewAvatarUrl,
                      mode: "aspectFill"
                    }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: 1,
                        class: "upload-empty"
                      },
                      vue.toDisplayString($setup.TEXT.emptyUpload),
                      1
                      /* TEXT */
                    )),
                    vue.createElementVNode("view", { class: "upload-actions" }, [
                      vue.createElementVNode(
                        "button",
                        {
                          class: "small-btn",
                          onClick: $setup.chooseAvatarImage
                        },
                        vue.toDisplayString($setup.TEXT.chooseButton),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "button",
                        {
                          class: "small-btn ghost",
                          onClick: $setup.clearAvatarImage
                        },
                        vue.toDisplayString($setup.TEXT.clearButton),
                        1
                        /* TEXT */
                      )
                    ])
                  ])
                ]),
                _: 1
                /* STABLE */
              }, 8, ["label", "hint"])) : (vue.openBlock(), vue.createBlock($setup["AccountField"], {
                key: 2,
                label: $setup.TEXT.textFieldLabel,
                hint: $setup.TEXT.textHint
              }, {
                default: vue.withCtx(() => [
                  vue.withDirectives(vue.createElementVNode("input", {
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.avatarText = $event),
                    maxlength: "2",
                    class: "input app-field",
                    placeholder: $setup.TEXT.textPlaceholder,
                    "placeholder-class": "app-account-input-placeholder"
                  }, null, 8, ["placeholder"]), [
                    [vue.vModelText, $setup.form.avatarText]
                  ])
                ]),
                _: 1
                /* STABLE */
              }, 8, ["label", "hint"]))
            ]),
            _: 1
            /* STABLE */
          }, 8, ["title", "description"]),
          vue.createElementVNode(
            "button",
            {
              class: "save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn",
              onClick: $setup.handleSave
            },
            vue.toDisplayString($setup.TEXT.saveButton),
            1
            /* TEXT */
          )
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesAccountAvatar = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$7], ["__scopeId", "data-v-281c3758"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/account/avatar.vue"]]);
  const MIN_SCALE = 1;
  const MAX_SCALE = 3;
  const _sfc_main$6 = {
    __name: "avatar-crop",
    setup(__props, { expose: __expose }) {
      __expose();
      const { themeStyle } = useThemePage();
      const instance = vue.getCurrentInstance();
      const imagePath = vue.ref("");
      const cropSize = vue.ref(300);
      const imageInfo = vue.ref({ width: 0, height: 0 });
      const baseSize = vue.ref({ width: 300, height: 300 });
      const scale = vue.ref(MIN_SCALE);
      const offset = vue.ref({ x: 0, y: 0 });
      const gestureState = vue.ref({ mode: "none", startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0, startDistance: 0, startScale: MIN_SCALE, startMidX: 0, startMidY: 0 });
      const viewportStyle = vue.computed(() => ({ width: `${cropSize.value}px`, height: `${cropSize.value}px` }));
      const sliderValue = vue.computed(() => Math.round(scale.value * 100));
      const imageStyle = vue.computed(() => ({ width: `${baseSize.value.width * scale.value}px`, height: `${baseSize.value.height * scale.value}px`, left: `${offset.value.x}px`, top: `${offset.value.y}px` }));
      onLoad(async (options) => {
        if (!requireAuth())
          return;
        imagePath.value = decodeURIComponent(options.src || "");
        const systemInfo = uni.getSystemInfoSync();
        cropSize.value = Math.min(systemInfo.windowWidth - 48, 320);
        await initImageInfo();
        resetCrop();
      });
      async function initImageInfo() {
        if (!imagePath.value)
          return;
        const info = await new Promise((resolve, reject) => uni.getImageInfo({ src: imagePath.value, success: resolve, fail: reject }));
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
        const context = uni.createCanvasContext("avatarCropCanvas", instance == null ? void 0 : instance.proxy);
        context.clearRect(0, 0, canvasSize, canvasSize);
        context.drawImage(imagePath.value, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvasSize, canvasSize);
        context.draw(false, () => {
          uni.canvasToTempFilePath({ canvasId: "avatarCropCanvas", width: canvasSize, height: canvasSize, destWidth: canvasSize, destHeight: canvasSize, success: async (result) => {
            try {
              const draftPath = await persistAvatarDraft(result.tempFilePath);
              setAvatarDraft(draftPath);
              uni.showToast({ title: "裁剪完成", icon: "success" });
              setTimeout(() => backPage(), 220);
            } catch (error) {
              uni.showToast({ title: (error == null ? void 0 : error.message) || "头像处理失败", icon: "none" });
            }
          } }, instance == null ? void 0 : instance.proxy);
        });
      }
      const __returned__ = { themeStyle, MIN_SCALE, MAX_SCALE, instance, imagePath, cropSize, imageInfo, baseSize, scale, offset, gestureState, viewportStyle, sliderValue, imageStyle, initImageInfo, clampScale, clampOffset, getViewportCenter, resetCrop, getTouchList, normalizeTouch, getTouchPoints, getDistance, getMidpoint, beginDrag, beginPinch, handleTouchStart, handleTouchMove, handleTouchEnd, handleScaleChanging, handleCropSave, computed: vue.computed, getCurrentInstance: vue.getCurrentInstance, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get requireAuth() {
        return requireAuth;
      }, get persistAvatarDraft() {
        return persistAvatarDraft;
      }, get setAvatarDraft() {
        return setAvatarDraft;
      }, get backPage() {
        return backPage;
      }, get useThemePage() {
        return useThemePage;
      }, AccountHeader };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-account-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "app-account-topbar-shell" }, [
          vue.createVNode($setup["AccountHeader"], {
            title: "裁剪头像",
            eyebrow: "头像裁剪"
          })
        ]),
        vue.createElementVNode("view", { class: "app-account-content" }, [
          vue.createElementVNode("view", { class: "crop-card app-card app-account-section" }, [
            vue.createElementVNode("view", { class: "crop-tip" }, "拖动图片、双指缩放并调整取景，头像会裁成正方形。"),
            vue.createElementVNode("view", { class: "crop-shell" }, [
              vue.createElementVNode(
                "view",
                {
                  class: "crop-viewport",
                  style: vue.normalizeStyle($setup.viewportStyle),
                  onTouchstart: vue.withModifiers($setup.handleTouchStart, ["stop"]),
                  onTouchmove: vue.withModifiers($setup.handleTouchMove, ["stop", "prevent"]),
                  onTouchend: vue.withModifiers($setup.handleTouchEnd, ["stop"]),
                  onTouchcancel: vue.withModifiers($setup.handleTouchEnd, ["stop"])
                },
                [
                  vue.createElementVNode("image", {
                    class: "crop-image",
                    src: $setup.imagePath,
                    style: vue.normalizeStyle($setup.imageStyle),
                    mode: "aspectFill"
                  }, null, 12, ["src"])
                ],
                36
                /* STYLE, NEED_HYDRATION */
              )
            ]),
            vue.createElementVNode("slider", {
              class: "crop-slider",
              value: $setup.sliderValue,
              min: 100,
              max: 300,
              step: 1,
              activeColor: "#ff7ea6",
              "block-color": "#ff7ea6",
              onChanging: $setup.handleScaleChanging,
              onChange: $setup.handleScaleChanging
            }, null, 40, ["value"]),
            vue.createElementVNode("view", { class: "crop-actions" }, [
              vue.createElementVNode("button", {
                class: "ghost-btn app-account-flat-btn app-account-flat-btn-soft",
                onClick: $setup.resetCrop
              }, "重置位置"),
              vue.createElementVNode("button", {
                class: "save-btn app-primary-btn app-primary-btn-shadow app-account-flat-btn",
                onClick: $setup.handleCropSave
              }, "确认裁剪")
            ])
          ])
        ]),
        vue.createElementVNode("canvas", {
          "canvas-id": "avatarCropCanvas",
          id: "avatarCropCanvas",
          class: "crop-canvas"
        })
      ],
      4
      /* STYLE */
    );
  }
  const PagesAccountAvatarCrop = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$6], ["__scopeId", "data-v-62a67396"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/account/avatar-crop.vue"]]);
  function ensureSuccess(response, fallbackMessage) {
    if (!(response == null ? void 0 : response.success)) {
      throw new Error((response == null ? void 0 : response.message) || fallbackMessage);
    }
    return response.data || [];
  }
  async function fetchProvinces() {
    const response = await request({
      url: "/api/areas/provinces"
    });
    return ensureSuccess(response, "获取省份列表失败");
  }
  async function fetchAreaChildren(parentId) {
    const response = await request({
      url: `/api/areas/children?parentId=${encodeURIComponent(parentId)}`
    });
    return ensureSuccess(response, "获取下级地区失败");
  }
  async function fetchAreaDetail(id) {
    const response = await request({
      url: `/api/areas/${encodeURIComponent(id)}`
    });
    const data = ensureSuccess(response, "获取地区详情失败");
    return data || null;
  }
  async function searchAreas(keyword, level = null, limit = 20) {
    const query = [`keyword=${encodeURIComponent(keyword)}`, `limit=${encodeURIComponent(limit)}`];
    if (level !== null && level !== void 0) {
      query.push(`level=${encodeURIComponent(level)}`);
    }
    const response = await request({
      url: `/api/areas/search?${query.join("&")}`
    });
    return ensureSuccess(response, "搜索地区失败");
  }
  function cleanRegionParts(parts = []) {
    return parts.map((item) => String(item || "").trim()).filter(Boolean);
  }
  function formatRegionLabel(parts = []) {
    const cleaned = cleanRegionParts(parts);
    return cleaned.join(" ");
  }
  function extractLocationLabel(location = {}) {
    const parts = cleanRegionParts([
      location.province,
      location.city,
      location.district
    ]);
    if (parts.length) {
      return formatRegionLabel(parts);
    }
    return String(location.address || "").trim();
  }
  function getCurrentLocationInfo() {
    return new Promise((resolve, reject) => {
      uni.getLocation({
        type: "gcj02",
        geocode: true,
        success(result) {
          var _a, _b, _c;
          const location = {
            province: String(((_a = result.addressInfo) == null ? void 0 : _a.province) || result.province || "").trim(),
            city: String(((_b = result.addressInfo) == null ? void 0 : _b.city) || result.city || "").trim(),
            district: String(((_c = result.addressInfo) == null ? void 0 : _c.district) || result.district || "").trim(),
            label: extractLocationLabel(result)
          };
          if (!location.label) {
            reject(new Error("暂时无法识别当前位置"));
            return;
          }
          resolve(location);
        },
        fail(error) {
          reject(error);
        }
      });
    });
  }
  const _sfc_main$5 = {
    __name: "relationship",
    setup(__props, { expose: __expose }) {
      __expose();
      const { themeStyle } = useThemePage();
      const form = vue.reactive(getProfile());
      onLoad(() => {
        requireAuth();
      });
      onShow(() => {
        const draft = getAreaDraft("relationship_meeting");
        if (!draft)
          return;
        form.defaultMeetingAreaId = draft.id || 0;
        form.defaultMeetingPlace = draft.displayText || draft.mergerName || draft.name || "";
        clearAreaDraft("relationship_meeting");
      });
      function handleAnniversaryChange(event) {
        form.anniversaryDate = event.detail.value;
      }
      function openAreaPicker() {
        goPage(buildAreaPickerUrl("relationship_meeting", {
          value: form.defaultMeetingPlace || "",
          areaId: Number(form.defaultMeetingAreaId || 0)
        }));
      }
      async function useCurrentLocation() {
        try {
          const location = await getCurrentLocationInfo();
          const keywords = [location.district, location.city, location.province].filter(Boolean);
          let matchedArea = null;
          for (const keyword of keywords) {
            const result = await searchAreas(keyword, null, 10);
            matchedArea = result.find((item) => item.name === keyword || item.shortName === keyword) || result[0];
            if (matchedArea) {
              break;
            }
          }
          form.defaultMeetingAreaId = (matchedArea == null ? void 0 : matchedArea.id) || 0;
          form.defaultMeetingPlace = (matchedArea == null ? void 0 : matchedArea.mergerName) || location.label;
        } catch (error) {
          uni.showToast({ title: (error == null ? void 0 : error.message) || "定位失败，请稍后再试", icon: "none" });
        }
      }
      async function handleSave() {
        try {
          await saveProfilePatchAndBack({
            loverNickname: (form.loverNickname || "").trim() || (form.nickname || "").trim() || "嘉嘉",
            defaultMeetingAreaId: Number(form.defaultMeetingAreaId || 0),
            defaultMeetingPlace: (form.defaultMeetingPlace || "").trim() || "上海",
            anniversaryDate: form.anniversaryDate
          }, "关系信息已保存");
        } catch (error) {
          uni.showToast({ title: (error == null ? void 0 : error.message) || "关系信息保存失败", icon: "none" });
        }
      }
      const __returned__ = { themeStyle, form, handleAnniversaryChange, openAreaPicker, useCurrentLocation, handleSave, reactive: vue.reactive, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get requireAuth() {
        return requireAuth;
      }, get saveProfilePatchAndBack() {
        return saveProfilePatchAndBack;
      }, get buildAreaPickerUrl() {
        return buildAreaPickerUrl;
      }, get clearAreaDraft() {
        return clearAreaDraft;
      }, get getAreaDraft() {
        return getAreaDraft;
      }, get searchAreas() {
        return searchAreas;
      }, get getCurrentLocationInfo() {
        return getCurrentLocationInfo;
      }, get getProfile() {
        return getProfile;
      }, get goPage() {
        return goPage;
      }, get useThemePage() {
        return useThemePage;
      }, AccountField, AccountHeader, AccountPanel };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-account-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "app-account-topbar-shell" }, [
          vue.createVNode($setup["AccountHeader"], {
            title: "关系信息",
            eyebrow: "恋爱资料"
          })
        ]),
        vue.createElementVNode("view", { class: "app-account-content" }, [
          vue.createVNode($setup["AccountPanel"], {
            title: "关系设定",
            description: "这里维护对方平时怎么称呼你，以及纪念日和默认见面城市。"
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", { class: "app-account-form-row" }, [
                vue.createElementVNode("view", { class: "app-account-form-col" }, [
                  vue.createVNode($setup["AccountField"], {
                    label: "对方对你的称呼",
                    hint: "比如：宝贝、佳佳、小朋友"
                  }, {
                    default: vue.withCtx(() => [
                      vue.withDirectives(vue.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.loverNickname = $event),
                          class: "input app-field",
                          placeholder: "比如：宝贝",
                          "placeholder-class": "app-account-input-placeholder"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [vue.vModelText, $setup.form.loverNickname]
                      ])
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ]),
                vue.createElementVNode("view", { class: "app-account-form-col" }, [
                  vue.createVNode($setup["AccountField"], { label: "见面城市" }, {
                    default: vue.withCtx(() => [
                      vue.createElementVNode("view", {
                        class: "picker app-field location-picker",
                        onClick: $setup.openAreaPicker
                      }, [
                        vue.createElementVNode(
                          "view",
                          { class: "picker-value" },
                          vue.toDisplayString($setup.form.defaultMeetingPlace || "请选择见面城市"),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ])
              ]),
              vue.createElementVNode("view", { class: "location-actions" }, [
                vue.createElementVNode("button", {
                  class: "ghost-btn app-account-flat-btn app-account-flat-btn-soft",
                  onClick: $setup.openAreaPicker
                }, "全国地点选择"),
                vue.createElementVNode("button", {
                  class: "ghost-btn app-account-flat-btn app-account-flat-btn-soft",
                  onClick: $setup.useCurrentLocation
                }, "使用当前位置")
              ]),
              vue.createVNode($setup["AccountField"], { label: "纪念日" }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode("picker", {
                    class: "picker app-field",
                    mode: "date",
                    value: $setup.form.anniversaryDate,
                    onChange: $setup.handleAnniversaryChange
                  }, [
                    vue.createElementVNode(
                      "view",
                      { class: "picker-value" },
                      vue.toDisplayString($setup.form.anniversaryDate || "请选择日期"),
                      1
                      /* TEXT */
                    )
                  ], 40, ["value"])
                ]),
                _: 1
                /* STABLE */
              })
            ]),
            _: 1
            /* STABLE */
          }),
          vue.createElementVNode("button", {
            class: "save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn",
            onClick: $setup.handleSave
          }, "保存关系信息")
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesAccountRelationship = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$5], ["__scopeId", "data-v-fad2fa27"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/account/relationship.vue"]]);
  const _sfc_main$4 = {
    __name: "security",
    setup(__props, { expose: __expose }) {
      __expose();
      const { themeStyle } = useThemePage();
      const form = vue.reactive({ nextPassword: "", confirmPassword: "" });
      onLoad(() => {
        requireAuth();
      });
      async function handleSave() {
        if (form.nextPassword.length < 4)
          return void uni.showToast({ title: "新密码至少 4 位", icon: "none" });
        if (form.nextPassword !== form.confirmPassword)
          return void uni.showToast({ title: "两次密码输入不一致", icon: "none" });
        try {
          await savePasswordAndBack(form.nextPassword, "密码已保存");
        } catch (error) {
          uni.showToast({ title: (error == null ? void 0 : error.message) || "密码保存失败", icon: "none" });
        }
      }
      const __returned__ = { themeStyle, form, handleSave, reactive: vue.reactive, get onLoad() {
        return onLoad;
      }, get requireAuth() {
        return requireAuth;
      }, get savePasswordAndBack() {
        return savePasswordAndBack;
      }, get useThemePage() {
        return useThemePage;
      }, AccountField, AccountHeader, AccountPanel };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-account-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "app-account-topbar-shell" }, [
          vue.createVNode($setup["AccountHeader"], {
            title: "账号安全",
            eyebrow: "密码管理"
          })
        ]),
        vue.createElementVNode("view", { class: "app-account-content" }, [
          vue.createVNode($setup["AccountPanel"], {
            title: "登录密码",
            description: "密码会同步保存到服务端，修改后下次登录会立即生效。"
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", { class: "app-account-form-row" }, [
                vue.createElementVNode("view", { class: "app-account-form-col" }, [
                  vue.createVNode($setup["AccountField"], { label: "新密码" }, {
                    default: vue.withCtx(() => [
                      vue.withDirectives(vue.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.nextPassword = $event),
                          password: "",
                          class: "input app-field",
                          placeholder: "至少 4 位",
                          "placeholder-class": "app-account-input-placeholder"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [vue.vModelText, $setup.form.nextPassword]
                      ])
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ]),
                vue.createElementVNode("view", { class: "app-account-form-col" }, [
                  vue.createVNode($setup["AccountField"], { label: "确认密码" }, {
                    default: vue.withCtx(() => [
                      vue.withDirectives(vue.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.confirmPassword = $event),
                          password: "",
                          class: "input app-field",
                          placeholder: "再次输入密码",
                          "placeholder-class": "app-account-input-placeholder"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [vue.vModelText, $setup.form.confirmPassword]
                      ])
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ])
              ])
            ]),
            _: 1
            /* STABLE */
          }),
          vue.createElementVNode("button", {
            class: "save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn",
            onClick: $setup.handleSave
          }, "保存密码")
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesAccountSecurity = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$4], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/account/security.vue"]]);
  const _sfc_main$3 = {
    __name: "data",
    setup(__props, { expose: __expose }) {
      __expose();
      const { themeStyle } = useThemePage();
      onLoad(() => {
        requireAuth();
      });
      async function handleResetProfile() {
        try {
          await resetRemoteProfile();
          uni.showToast({ title: "已恢复默认设置", icon: "none" });
        } catch (error) {
          uni.showToast({ title: (error == null ? void 0 : error.message) || "恢复默认失败", icon: "none" });
        }
      }
      async function handleSyncRemoteProfile() {
        try {
          clearAvatarDraft();
          const remoteProfile = await fetchRemoteProfile({ allowOfflineFallback: false });
          saveProfile(remoteProfile);
          uni.showToast({ title: "已重新同步资料", icon: "none" });
        } catch (error) {
          uni.showToast({ title: (error == null ? void 0 : error.message) || "同步资料失败", icon: "none" });
        }
      }
      const __returned__ = { themeStyle, handleResetProfile, handleSyncRemoteProfile, get onLoad() {
        return onLoad;
      }, get requireAuth() {
        return requireAuth;
      }, get clearAvatarDraft() {
        return clearAvatarDraft;
      }, get saveProfile() {
        return saveProfile;
      }, get fetchRemoteProfile() {
        return fetchRemoteProfile;
      }, get resetRemoteProfile() {
        return resetRemoteProfile;
      }, get useThemePage() {
        return useThemePage;
      }, AccountField, AccountHeader, AccountPanel };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-account-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "app-account-topbar-shell" }, [
          vue.createVNode($setup["AccountHeader"], {
            title: "数据管理",
            eyebrow: "服务端同步"
          })
        ]),
        vue.createElementVNode("view", { class: "app-account-content" }, [
          vue.createVNode($setup["AccountPanel"], {
            title: "数据同步",
            description: "资料以服务端为准，这里主要用于恢复默认和重新同步资料缓存。"
          }, {
            default: vue.withCtx(() => [
              vue.createVNode($setup["AccountField"], {
                label: "操作说明",
                bare: "",
                compact: ""
              }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode("view", { class: "tips" }, "恢复默认会直接重置当前账号的服务端资料，重新同步会清掉当前资料缓存并重新拉取服务端数据。")
                ]),
                _: 1
                /* STABLE */
              }),
              vue.createElementVNode("view", { class: "app-account-action-row data-action-row" }, [
                vue.createElementVNode("button", {
                  class: "ghost-btn app-account-flat-btn app-account-flat-btn-soft",
                  onClick: $setup.handleResetProfile
                }, "恢复默认"),
                vue.createElementVNode("button", {
                  class: "ghost-btn warn app-account-flat-btn app-account-flat-btn-warn",
                  onClick: $setup.handleSyncRemoteProfile
                }, "重新同步")
              ])
            ]),
            _: 1
            /* STABLE */
          })
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesAccountData = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$3], ["__scopeId", "data-v-72805356"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/account/data.vue"]]);
  const _sfc_main$2 = {
    __name: "area-picker",
    setup(__props, { expose: __expose }) {
      __expose();
      const TEXT = {
        eyebrow: "三级地点选择",
        panelTitle: "地点填写",
        panelDesc: "支持直接手动输入，也支持从左到右选择省、市、区。选好后会尽量少打断当前页面的编辑流程。",
        inputLabel: "地点名称",
        inputHint: "可以直接填写，也可以输入关键字后从下方匹配结果里选择已有地区。",
        inputPlaceholder: "例如：杭州市西湖区、上海迪士尼、广州南站",
        selectionTitle: "联动选择",
        selectionDesc: "从左到右依次选择，越往后越精确。",
        provinceLabel: "省份",
        cityLabel: "城市",
        districtLabel: "区县",
        cityEmpty: "先选择省份",
        districtEmpty: "区县可选填",
        useSelected: "使用当前选择",
        useManual: "使用手动输入",
        emptyLabel: "还没有选地点",
        pageTitleDefault: "地点选择",
        pageTitleProfile: "所在城市",
        pageTitleMeeting: "见面城市",
        pageTitleAnniversary: "纪念日地点",
        pageTitleCountdown: "见面地点",
        loadError: "地区数据加载失败",
        selectFirst: "请先选择省市区，或改用手动输入",
        inputFirst: "请先输入地点名称"
      };
      const { themeStyle } = useThemePage();
      const pageTitle = vue.ref(TEXT.pageTitleDefault);
      const scene = vue.ref("default");
      const manualValue = vue.ref("");
      const provinceOptions = vue.ref([]);
      const cityOptions = vue.ref([]);
      const districtOptions = vue.ref([]);
      const provinceId = vue.ref(0);
      const cityId = vue.ref(0);
      const districtId = vue.ref(0);
      const searchResults = vue.ref([]);
      let searchTimer = null;
      const selectedProvince = vue.computed(() => provinceOptions.value.find((item) => item.id === provinceId.value) || null);
      const selectedCity = vue.computed(() => cityOptions.value.find((item) => item.id === cityId.value) || null);
      const selectedDistrict = vue.computed(() => districtOptions.value.find((item) => item.id === districtId.value) || null);
      const selectedArea = vue.computed(() => selectedDistrict.value || selectedCity.value || selectedProvince.value || null);
      const selectedLabel = vue.computed(() => {
        var _a, _b;
        return ((_a = selectedArea.value) == null ? void 0 : _a.mergerName) || ((_b = selectedArea.value) == null ? void 0 : _b.name) || manualValue.value.trim() || TEXT.emptyLabel;
      });
      onLoad(async (options) => {
        if (!requireAuth())
          return;
        scene.value = String((options == null ? void 0 : options.scene) || "default");
        pageTitle.value = buildPageTitle(scene.value);
        manualValue.value = decodeRouteValue(options == null ? void 0 : options.value);
        clearAreaDraft(scene.value);
        await initAreas();
        const areaId = Number((options == null ? void 0 : options.areaId) || 0);
        if (areaId > 0) {
          await restoreAreaSelection(areaId);
        }
      });
      function decodeRouteValue(value) {
        const text = String(value || "").trim();
        if (!text)
          return "";
        try {
          return decodeURIComponent(text);
        } catch (error) {
          return text;
        }
      }
      function buildPageTitle(currentScene) {
        if (currentScene === "profile_city")
          return TEXT.pageTitleProfile;
        if (currentScene === "relationship_meeting")
          return TEXT.pageTitleMeeting;
        if (currentScene === "anniversary_location")
          return TEXT.pageTitleAnniversary;
        if (currentScene === "countdown_place")
          return TEXT.pageTitleCountdown;
        return TEXT.pageTitleDefault;
      }
      async function initAreas() {
        try {
          provinceOptions.value = await fetchProvinces();
        } catch (error) {
          uni.showToast({ title: (error == null ? void 0 : error.message) || TEXT.loadError, icon: "none" });
        }
      }
      async function restoreAreaSelection(areaId) {
        try {
          const area = await fetchAreaDetail(areaId);
          if (!area)
            return;
          if (area.level === 0) {
            await handleProvinceClick(area);
            return;
          }
          const parent = await fetchAreaDetail(area.parentId);
          if (!parent)
            return;
          if (parent.level === 0) {
            await handleProvinceClick(parent);
            await handleCityClick(area);
            return;
          }
          const province = await fetchAreaDetail(parent.parentId);
          if (!province)
            return;
          await handleProvinceClick(province);
          await handleCityClick(parent);
          handleDistrictClick(area);
        } catch (error) {
        }
      }
      async function handleProvinceClick(area) {
        provinceId.value = area.id;
        cityId.value = 0;
        districtId.value = 0;
        cityOptions.value = await fetchAreaChildren(area.id);
        districtOptions.value = [];
        updateManualValueFromSelection();
      }
      async function handleCityClick(area) {
        cityId.value = area.id;
        districtId.value = 0;
        districtOptions.value = await fetchAreaChildren(area.id);
        updateManualValueFromSelection();
      }
      function handleDistrictClick(area) {
        districtId.value = area.id;
        updateManualValueFromSelection();
      }
      function updateManualValueFromSelection() {
        if (selectedArea.value) {
          manualValue.value = selectedArea.value.mergerName || selectedArea.value.name;
        }
      }
      function handleManualInput(event) {
        var _a;
        manualValue.value = ((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.value) || manualValue.value;
        scheduleSearch();
      }
      function scheduleSearch() {
        if (searchTimer)
          clearTimeout(searchTimer);
        const keyword = manualValue.value.trim();
        if (keyword.length < 2) {
          searchResults.value = [];
          return;
        }
        searchTimer = setTimeout(async () => {
          try {
            searchResults.value = await searchAreas(keyword, null, 8);
          } catch (error) {
            searchResults.value = [];
          }
        }, 180);
      }
      async function applySearchResult(area) {
        manualValue.value = area.mergerName || area.name;
        searchResults.value = [];
        await restoreAreaSelection(area.id);
      }
      function saveAndBack(payload) {
        saveAreaDraft(scene.value, payload);
        backPage();
      }
      function handleUseSelected() {
        if (!selectedArea.value) {
          uni.showToast({ title: TEXT.selectFirst, icon: "none" });
          return;
        }
        saveAndBack({
          id: selectedArea.value.id,
          name: selectedArea.value.name,
          mergerName: selectedArea.value.mergerName || selectedArea.value.name,
          displayText: selectedArea.value.mergerName || selectedArea.value.name,
          isManual: false
        });
      }
      function handleUseManual() {
        const value = manualValue.value.trim();
        if (!value) {
          uni.showToast({ title: TEXT.inputFirst, icon: "none" });
          return;
        }
        saveAndBack({
          id: 0,
          name: value,
          mergerName: value,
          displayText: value,
          isManual: true
        });
      }
      const __returned__ = { TEXT, themeStyle, pageTitle, scene, manualValue, provinceOptions, cityOptions, districtOptions, provinceId, cityId, districtId, searchResults, get searchTimer() {
        return searchTimer;
      }, set searchTimer(v) {
        searchTimer = v;
      }, selectedProvince, selectedCity, selectedDistrict, selectedArea, selectedLabel, decodeRouteValue, buildPageTitle, initAreas, restoreAreaSelection, handleProvinceClick, handleCityClick, handleDistrictClick, updateManualValueFromSelection, handleManualInput, scheduleSearch, applySearchResult, saveAndBack, handleUseSelected, handleUseManual, computed: vue.computed, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get requireAuth() {
        return requireAuth;
      }, get fetchAreaChildren() {
        return fetchAreaChildren;
      }, get fetchAreaDetail() {
        return fetchAreaDetail;
      }, get fetchProvinces() {
        return fetchProvinces;
      }, get searchAreas() {
        return searchAreas;
      }, get clearAreaDraft() {
        return clearAreaDraft;
      }, get saveAreaDraft() {
        return saveAreaDraft;
      }, get backPage() {
        return backPage;
      }, get useThemePage() {
        return useThemePage;
      }, AccountField, AccountHeader, AccountPanel };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-account-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "app-account-topbar-shell" }, [
          vue.createVNode($setup["AccountHeader"], {
            title: $setup.pageTitle,
            eyebrow: $setup.TEXT.eyebrow
          }, null, 8, ["title", "eyebrow"])
        ]),
        vue.createElementVNode("view", { class: "app-account-content" }, [
          vue.createVNode($setup["AccountPanel"], {
            title: $setup.TEXT.panelTitle,
            description: $setup.TEXT.panelDesc
          }, {
            default: vue.withCtx(() => [
              vue.createVNode($setup["AccountField"], {
                label: $setup.TEXT.inputLabel,
                hint: $setup.TEXT.inputHint
              }, {
                default: vue.withCtx(() => [
                  vue.withDirectives(vue.createElementVNode("input", {
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.manualValue = $event),
                    class: "input app-field",
                    placeholder: $setup.TEXT.inputPlaceholder,
                    "placeholder-class": "app-account-input-placeholder",
                    onInput: $setup.handleManualInput
                  }, null, 40, ["placeholder"]), [
                    [vue.vModelText, $setup.manualValue]
                  ])
                ]),
                _: 1
                /* STABLE */
              }, 8, ["label", "hint"]),
              $setup.searchResults.length ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "search-list"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.searchResults, (item) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: item.id,
                      class: "search-item",
                      onClick: ($event) => $setup.applySearchResult(item)
                    }, [
                      vue.createElementVNode(
                        "view",
                        { class: "search-name" },
                        vue.toDisplayString(item.name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "view",
                        { class: "search-sub" },
                        vue.toDisplayString(item.mergerName || item.name),
                        1
                        /* TEXT */
                      )
                    ], 8, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("view", { class: "selection-header" }, [
                vue.createElementVNode("view", null, [
                  vue.createElementVNode(
                    "view",
                    { class: "selection-title" },
                    vue.toDisplayString($setup.TEXT.selectionTitle),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "view",
                    { class: "selection-desc" },
                    vue.toDisplayString($setup.TEXT.selectionDesc),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "view",
                  { class: "selection-chip" },
                  vue.toDisplayString($setup.selectedLabel),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "linkage-grid" }, [
                vue.createElementVNode("view", { class: "linkage-col" }, [
                  vue.createElementVNode(
                    "view",
                    { class: "linkage-label" },
                    vue.toDisplayString($setup.TEXT.provinceLabel),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("scroll-view", {
                    "scroll-y": "",
                    class: "linkage-list"
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.provinceOptions, (item) => {
                        var _a;
                        return vue.openBlock(), vue.createElementBlock("view", {
                          key: item.id,
                          class: vue.normalizeClass(["linkage-item", { active: ((_a = $setup.selectedProvince) == null ? void 0 : _a.id) === item.id }]),
                          onClick: ($event) => $setup.handleProvinceClick(item)
                        }, vue.toDisplayString(item.name), 11, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ]),
                vue.createElementVNode("view", { class: "linkage-col" }, [
                  vue.createElementVNode(
                    "view",
                    { class: "linkage-label" },
                    vue.toDisplayString($setup.TEXT.cityLabel),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("scroll-view", {
                    "scroll-y": "",
                    class: "linkage-list"
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.cityOptions, (item) => {
                        var _a;
                        return vue.openBlock(), vue.createElementBlock("view", {
                          key: item.id,
                          class: vue.normalizeClass(["linkage-item", { active: ((_a = $setup.selectedCity) == null ? void 0 : _a.id) === item.id }]),
                          onClick: ($event) => $setup.handleCityClick(item)
                        }, vue.toDisplayString(item.name), 11, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    !$setup.cityOptions.length ? (vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: 0,
                        class: "linkage-empty"
                      },
                      vue.toDisplayString($setup.TEXT.cityEmpty),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true)
                  ])
                ]),
                vue.createElementVNode("view", { class: "linkage-col" }, [
                  vue.createElementVNode(
                    "view",
                    { class: "linkage-label" },
                    vue.toDisplayString($setup.TEXT.districtLabel),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("scroll-view", {
                    "scroll-y": "",
                    class: "linkage-list"
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.districtOptions, (item) => {
                        var _a;
                        return vue.openBlock(), vue.createElementBlock("view", {
                          key: item.id,
                          class: vue.normalizeClass(["linkage-item", { active: ((_a = $setup.selectedDistrict) == null ? void 0 : _a.id) === item.id }]),
                          onClick: ($event) => $setup.handleDistrictClick(item)
                        }, vue.toDisplayString(item.name), 11, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    !$setup.districtOptions.length ? (vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: 0,
                        class: "linkage-empty"
                      },
                      vue.toDisplayString($setup.TEXT.districtEmpty),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true)
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "action-row" }, [
                vue.createElementVNode(
                  "button",
                  {
                    class: "ghost-btn app-account-flat-btn app-account-flat-btn-soft",
                    onClick: $setup.handleUseSelected
                  },
                  vue.toDisplayString($setup.TEXT.useSelected),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "button",
                  {
                    class: "ghost-btn app-account-flat-btn app-account-flat-btn-soft",
                    onClick: $setup.handleUseManual
                  },
                  vue.toDisplayString($setup.TEXT.useManual),
                  1
                  /* TEXT */
                )
              ])
            ]),
            _: 1
            /* STABLE */
          }, 8, ["title", "description"])
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesAccountAreaPicker = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2], ["__scopeId", "data-v-905c5663"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/account/area-picker.vue"]]);
  const _sfc_main$1 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const { themeStyle } = useThemePage();
      const presets = getThemePresets();
      const themeSettings = vue.ref(getThemeSettings());
      const draftPresetKey = vue.ref(themeSettings.value.presetKey);
      const currentPreset = vue.computed(() => getCurrentThemePreset({ presetKey: draftPresetKey.value }));
      const heroStyle = vue.computed(() => ({ background: currentPreset.value.variables["--app-gradient-hero"] }));
      onLoad(() => {
        requireAuth();
      });
      onShow(() => {
        if (!requireAuth())
          return;
        themeSettings.value = getThemeSettings();
        draftPresetKey.value = themeSettings.value.presetKey;
      });
      function getPreviewStyle(item) {
        return {
          background: item.variables["--app-gradient-hero"]
        };
      }
      function selectPreset(key) {
        draftPresetKey.value = key;
        saveAndApplyTheme({ presetKey: key });
      }
      function handleReset() {
        const payload = resetThemeSettings();
        draftPresetKey.value = payload.presetKey;
        saveAndApplyTheme(payload);
        uni.showToast({ title: "已恢复默认主题", icon: "none" });
      }
      function handleSave() {
        themeSettings.value = { presetKey: draftPresetKey.value };
        saveAndApplyTheme(themeSettings.value);
        uni.showToast({ title: "主题已保存", icon: "success" });
      }
      const __returned__ = { themeStyle, presets, themeSettings, draftPresetKey, currentPreset, heroStyle, getPreviewStyle, selectPreset, handleReset, handleSave, computed: vue.computed, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get requireAuth() {
        return requireAuth;
      }, get getCurrentThemePreset() {
        return getCurrentThemePreset;
      }, get getThemePresets() {
        return getThemePresets;
      }, get getThemeSettings() {
        return getThemeSettings;
      }, get resetThemeSettings() {
        return resetThemeSettings;
      }, get saveAndApplyTheme() {
        return saveAndApplyTheme;
      }, get useThemePage() {
        return useThemePage;
      }, AccountHeader, AccountPanel };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page app-account-page",
        style: vue.normalizeStyle($setup.themeStyle)
      },
      [
        vue.createElementVNode("view", { class: "app-account-topbar-shell" }, [
          vue.createVNode($setup["AccountHeader"], {
            title: "主题设置",
            eyebrow: "视觉风格"
          })
        ]),
        vue.createElementVNode("view", { class: "app-account-content" }, [
          vue.createVNode($setup["AccountPanel"], {
            title: "当前主题",
            description: "切换后会立即应用到首页、星球、我的和设置页。"
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode(
                "view",
                {
                  class: "theme-hero",
                  style: vue.normalizeStyle($setup.heroStyle)
                },
                [
                  vue.createElementVNode("view", { class: "theme-hero-glow" }),
                  vue.createElementVNode(
                    "view",
                    { class: "theme-hero-kicker" },
                    vue.toDisplayString($setup.currentPreset.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "view",
                    { class: "theme-hero-title" },
                    vue.toDisplayString($setup.currentPreset.description),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "theme-hero-swatches" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.currentPreset.swatches, (color) => {
                        return vue.openBlock(), vue.createElementBlock(
                          "view",
                          {
                            key: color,
                            class: "theme-hero-dot",
                            style: vue.normalizeStyle({ background: color })
                          },
                          null,
                          4
                          /* STYLE */
                        );
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ],
                4
                /* STYLE */
              )
            ]),
            _: 1
            /* STABLE */
          }),
          vue.createVNode($setup["AccountPanel"], {
            title: "预设主题",
            description: "第一期先提供 4 套预设主题，保证整体视觉统一。"
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", { class: "theme-grid" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.presets, (item) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: item.key,
                      class: vue.normalizeClass(["theme-card app-card-soft", { active: $setup.draftPresetKey === item.key }]),
                      "hover-class": "theme-card-hover",
                      "hover-stay-time": "60",
                      onClick: ($event) => $setup.selectPreset(item.key)
                    }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: "theme-card-preview",
                          style: vue.normalizeStyle($setup.getPreviewStyle(item))
                        },
                        [
                          vue.createElementVNode("view", { class: "theme-card-orb orb-a" }),
                          vue.createElementVNode("view", { class: "theme-card-orb orb-b" }),
                          vue.createElementVNode(
                            "view",
                            { class: "theme-card-chip" },
                            vue.toDisplayString(item.name),
                            1
                            /* TEXT */
                          )
                        ],
                        4
                        /* STYLE */
                      ),
                      vue.createElementVNode("view", { class: "theme-card-copy" }, [
                        vue.createElementVNode("view", { class: "theme-card-title-row" }, [
                          vue.createElementVNode(
                            "view",
                            { class: "theme-card-title" },
                            vue.toDisplayString(item.name),
                            1
                            /* TEXT */
                          ),
                          $setup.draftPresetKey === item.key ? (vue.openBlock(), vue.createElementBlock("view", {
                            key: 0,
                            class: "theme-card-tag"
                          }, "当前")) : vue.createCommentVNode("v-if", true)
                        ]),
                        vue.createElementVNode(
                          "view",
                          { class: "theme-card-desc" },
                          vue.toDisplayString(item.description),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "theme-card-swatches" }, [
                          (vue.openBlock(true), vue.createElementBlock(
                            vue.Fragment,
                            null,
                            vue.renderList(item.swatches, (color) => {
                              return vue.openBlock(), vue.createElementBlock(
                                "view",
                                {
                                  key: color,
                                  class: "theme-card-dot",
                                  style: vue.normalizeStyle({ background: color })
                                },
                                null,
                                4
                                /* STYLE */
                              );
                            }),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])
                      ])
                    ], 10, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            _: 1
            /* STABLE */
          }),
          vue.createElementVNode("view", { class: "theme-actions" }, [
            vue.createElementVNode("button", {
              class: "ghost-btn app-account-flat-btn app-account-flat-btn-soft",
              onClick: $setup.handleReset
            }, "恢复默认"),
            vue.createElementVNode("button", {
              class: "save-btn app-primary-btn app-primary-btn-shadow app-account-flat-btn",
              onClick: $setup.handleSave
            }, "保存主题")
          ])
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesThemeIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__scopeId", "data-v-55b8e6b7"], ["__file", "D:/JavaProject/romantic-suite/romantic-app/pages/theme/index.vue"]]);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/home/home", PagesHomeHome);
  __definePage("pages/planet/planet", PagesPlanetPlanet);
  __definePage("pages/mine/mine", PagesMineMine);
  __definePage("pages/modules/countdown/index", PagesModulesCountdownIndex);
  __definePage("pages/modules/anniversary/index", PagesModulesAnniversaryIndex);
  __definePage("pages/modules/anniversary/detail", PagesModulesAnniversaryDetail);
  __definePage("pages/modules/anniversary/edit", PagesModulesAnniversaryEdit);
  __definePage("pages/modules/coming-soon/index", PagesModulesComingSoonIndex);
  __definePage("pages/account/settings", PagesAccountSettings);
  __definePage("pages/account/profile", PagesAccountProfile);
  __definePage("pages/account/avatar", PagesAccountAvatar);
  __definePage("pages/account/avatar-crop", PagesAccountAvatarCrop);
  __definePage("pages/account/relationship", PagesAccountRelationship);
  __definePage("pages/account/security", PagesAccountSecurity);
  __definePage("pages/account/data", PagesAccountData);
  __definePage("pages/account/area-picker", PagesAccountAreaPicker);
  __definePage("pages/theme/index", PagesThemeIndex);
  let checking = false;
  async function checkAnniversaryReminderPopup() {
    if (checking || !isLogin()) {
      return;
    }
    checking = true;
    try {
      const reminders = await checkAnniversaryReminders();
      if (!Array.isArray(reminders) || !reminders.length) {
        return;
      }
      const content = reminders.map((item) => `${item.title}（${item.eventDate}）`).join("\n");
      uni.showModal({
        title: "纪念日提醒",
        content,
        showCancel: false,
        confirmText: "知道了"
      });
    } catch (error) {
    } finally {
      checking = false;
    }
  }
  const _sfc_main = {
    __name: "App",
    setup(__props, { expose: __expose }) {
      __expose();
      onLaunch(() => {
        applyTheme();
      });
      onShow(() => {
        applyTheme();
        checkAnniversaryReminderPopup();
      });
      const __returned__ = { get onLaunch() {
        return onLaunch;
      }, get onShow() {
        return onShow;
      }, get checkAnniversaryReminderPopup() {
        return checkAnniversaryReminderPopup;
      }, get applyTheme() {
        return applyTheme;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.renderSlot(_ctx.$slots, "default");
  }
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "D:/JavaProject/romantic-suite/romantic-app/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return { app };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
