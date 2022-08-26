import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/main.css'
import './styles/index.scss'

// If you want to use ElMessage, import it.
import 'element-plus/theme-chalk/src/message.scss'

const app = createApp(App)

app.use(router)

app.mount('#app')
