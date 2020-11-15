import Vue from 'vue'
import axios from 'axios'
import vuetify from '@/plugins/vuetify'
import '@/assets/variables.scss'

import App from './App'
import router from './router'
import store from './store'
import FileDrags from './components/common/FileDrags'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

// window.$ = window.jQuery = require('jquery')

Vue.mixin({
  methods: {
    copy (obj) {
      const s = JSON.stringify(obj)
      if (s === '{}') return undefined
      return JSON.parse(JSON.stringify(obj))
    }
  }
})
/* eslint-disable no-new */
Vue.component('file-drag', FileDrags)
new Vue({
  components: { App },
  router,
  store,
  vuetify,
  template: '<App/>'
}).$mount('#app')
