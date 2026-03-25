import { createSSRApp } from "vue"
import App from "./App.vue"
import GlobalNotificationBanner from "./components/GlobalNotificationBanner.vue"

export function createApp() {
  const app = createSSRApp(App)
  app.component('GlobalNotificationBanner', GlobalNotificationBanner)
  return { app }
}
