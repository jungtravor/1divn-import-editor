<template>
    <v-container>
        <h1>应用信息</h1>
        <v-simple-table>
            <template v-slot:default>
                <thead>
                <tr>
                    <th class="text-left">
                        Name
                    </th>
                    <th class="text-left">
                        Value
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr
                        v-for="item in infoItems"
                        :key="item.name"
                >
                    <td>{{ item.name }}</td>
                    <td>{{ item.value }}</td>
                </tr>
                </tbody>
            </template>
        </v-simple-table>
    </v-container>
</template>

<script>
  const { remote } = require('electron')
  const path = require('path')
  export default {
    name: 'info',
    data () {
      return {
        infoItems: []
      }
    },
    created () {
      let appPath = remote.app.getPath('exe')
      let appDirPath = path.dirname(appPath)
      this.infoItems.push({name: 'Executable File Name', value: appPath})
      this.infoItems.push({name: 'Executable File Path', value: appDirPath})
    }
  }
</script>

<style scoped>

</style>
