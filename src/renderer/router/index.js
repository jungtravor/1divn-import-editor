import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      title: '主页',
      meta: {},
      component: require('@/components/index/index').default
    },
    {
      path: '/input',
      name: 'input',
      title: '输入文件',
      meta: {title: '输入文件'},
      component: require('@/components/input/index').default
    },
    {
      path: '/landingPage',
      name: 'landing-page',
      title: '信息',
      meta: {},
      component: require('@/components/LandingPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
