<template>
  <div id="app">
    <v-app>
      <v-app-bar
              app
              id="vAppBar"
              ref="vAppBar"
              color="primary"
              dark
              elevate-on-scroll
      >
        <v-spacer></v-spacer>
        <v-col cols="10">
          <v-row>
            <v-toolbar-title>1DIVN</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
                    text
                    v-for="value in routeInfo"
                    :key="value.name"
                    :to="value.path"
            >
              {{value.title}}
            </v-btn>
          </v-row>
        </v-col>
        <v-spacer></v-spacer>
      </v-app-bar>
      <v-main id="main">
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </v-main>
    </v-app>
  </div>
</template>

<script>
  export default {
    name: 'app',
    data () {
      return {
        routeInfo: null
      }
    },
    mounted () {
      // 通过读取路由信息生成导航栏
      const routerOptions = this.$router.options.routes.filter(value => {
        return value.path[0] === '/'
      })
      this.routeInfo = routerOptions
      // 全局默认不允许拖拽
      const holder = document.getElementById('app')
      holder.ondragover = () => {
        return false
      }
      holder.ondragleave = holder.ondragend = () => {
        return false
      }
      holder.ondrop = (e) => {
        e.preventDefault()
        return false
      }
    }
  }
</script>
<style>
  /* CSS */
  #app {
    /*font-family: "Hiragino Sans GB W3", sans-serif;*/
    font-family: "Manrope", "Hiragino Sans GB W6";
    background-color: #26a69a;
  }
</style>
