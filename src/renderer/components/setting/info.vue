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
  export default {
    name: 'info',
    data () {
      return {
        infoItems: []
      }
    },
    created () {
      this.infoItems.push({name: 'Executable File Name', value: this.getExecPath()})
      this.infoItems.push({name: 'Executable File Path', value: this.getRootDirPath()})
    }
  }
</script>

<style scoped>

</style>
