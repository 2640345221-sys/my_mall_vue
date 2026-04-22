import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import {createPinia} from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementplusIconsVue from '@element-plus/icons-vue'

const app=createApp(App)
for (const [key,component] of Object.entries(ElementplusIconsVue)){
    app.component(key,component)
}
app.use(ElementPlus)
app.use(createPinia())
app.use(router)

app.mount('#app')
