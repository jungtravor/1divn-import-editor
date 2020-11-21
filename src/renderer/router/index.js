import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    // {
    //   path: '/',
    //   name: 'index',
    //   title: '主页',
    //   meta: {},
    //   component: require('@/components/index/index').default
    // },
    {
      path: '/',
      name: 'index',
      redirect: '/input'
    },
    {
      path: '/input',
      name: 'input',
      title: '输入文件',
      meta: {title: '输入文件'},
      component: require('@/components/input/index').default
    },
    {
      path: '/setting',
      name: 'setting',
      title: '设置',
      meta: {title: '设置'},
      component: require('@/components/setting/template').default,
      children: [
        {
          path: '/setting',
          name: 'setting_index',
          title: '设置',
          redirect: '/setting/input'
        },
        {
          path: '/setting/input',
          name: 'setting_input',
          title: '设置 - 输入文件',
          meta: {icon: 'mdi-application-import', title: '输入文件'},
          component: require('@/components/setting/input/index').default
        },
        // {
        //   path: '/setting/test',
        //   name: 'setting_test',
        //   title: '设置 - 测试',
        //   meta: {icon: 'mdi-application-import', title: '测试'},
        //   component: require('@/components/setting/test').default
        // },
        {
          path: '/setting/info',
          name: 'setting_info',
          title: '设置 - 关于',
          meta: {icon: 'mdi-information-outline', title: '关于'},
          component: require('@/components/setting/info').default
        }
      ]
    },
    /* {
      path: '/landingPage',
      name: 'landing-page',
      title: '信息',
      meta: {},
      component: require('@/components/LandingPage').default
    }, */
    {
      path: '*',
      redirect: '/'
    }
  ]
})
