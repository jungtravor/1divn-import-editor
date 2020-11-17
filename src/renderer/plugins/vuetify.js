import Vue from 'vue'
import Vuetify from 'vuetify'
import colors from 'vuetify/lib/util/colors'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'

Vue.use(Vuetify)

const opts = {
  icons: {
    iconfont: 'mdi'
  },
  theme: {
    themes: {
      light: {
        primary: '#8B91AB',
        secondary: '#D9E1EB',
        third: '#EBDAC9',
        fourth: '#F9F6EF'
      },
      dark: {
        primary: colors.teal.lighten1
      }
    }
  }
}

export default new Vuetify(opts)
