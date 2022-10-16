import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { VueQueryPlugin } from 'vue-query'
import { createPinia } from 'pinia'
import VueSmoothScroll from 'vue3-smooth-scroll'
import useSentry from './plugins/sentry'

import './styles/index.scss'

import 'element-plus/theme-chalk/src/message.scss'
import 'virtual:svg-icons-register'

const app = createApp(App)
const pinia = createPinia()

// useSentry(app, router)

app.use(router)
app.use(VueQueryPlugin)
app.use(pinia)
app.use(VueSmoothScroll)

app.mount('#app')
