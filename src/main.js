import { createApp } from "vue"
import "./style.css"
import "./styles/v6.css"
import AppShell from "./AppShell.vue"
import router from "./router.js"
import i18n, { initialLocale, loadLocaleMessages } from "./i18n.js"
import { vZoom } from "./v6/zoom.js"

loadLocaleMessages(initialLocale).then(() => {
  // the prerendered snapshot is hidden until here; mount() replaces it
  document.getElementById("app").removeAttribute("data-prerendered")
  createApp(AppShell).use(router).use(i18n).directive("zoom", vZoom).mount("#app")
})
