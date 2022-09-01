import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { VueQueryPlugin } from 'vue-query'
import { createPinia } from 'pinia'

import './styles/index.scss'

import 'element-plus/theme-chalk/src/message.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(VueQueryPlugin)
app.use(pinia)

app.mount('#app')
