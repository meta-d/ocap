import * as SQL from '@metad/ocap-sql'
import { createApp } from 'vue'
import App from './App.vue'

if (SQL) {
  console.log(`加载 SQL`)
}

createApp(App).mount('#app')
