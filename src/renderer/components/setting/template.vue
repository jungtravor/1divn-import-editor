<template>
    <v-card height="100%">
        <v-navigation-drawer
                absolute
                permanent
                width="256px"
                style="background-color: transparent"
        >
            <template v-slot:prepend>
                <v-list-item two-line>
                    <v-list-item-content>
                        <h2>设置</h2>
                    </v-list-item-content>
                </v-list-item>
            </template>
            <v-list>
                <v-list-item
                        v-for="item in sideItems"
                        :key="item.title"
                        link
                        :to="item.path"
                >
                    <v-list-item-icon>
                        <v-icon>{{ item.meta.icon }}</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>{{ item.meta.title }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-container style="padding-left: 268px;" fluid>
            <router-view></router-view>
        </v-container>
    </v-card>
</template>

<script>
  export default {
    name: 'template_setting',
    data () {
      return {
        sideItems: []
      }
    },
    created () {
      this.sideItems = []
      let settingRoute = {}
      this.$router.options.routes.forEach((value) => {
        if (value.name === 'setting') settingRoute = value
      })
      this.sideItems = settingRoute.children
      for (let i = 0; i < this.sideItems.length; i++) {
        if (this.sideItems[i].name === 'setting_index') this.sideItems.splice(i--, 1)
      }
    }
  }
</script>

<style scoped>
    v-navigation-drawer * {
        color: white;
    }
</style>
