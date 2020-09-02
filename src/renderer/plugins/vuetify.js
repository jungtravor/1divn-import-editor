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
        primary: colors.teal.lighten1,
        secondary: '#21bfa1'
      },
      dark: {
        primary: colors.teal.lighten1
      }
    }
  }
}

export default new Vuetify(opts)
