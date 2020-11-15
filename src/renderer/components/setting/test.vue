<template>
    <v-container fluid>
        <file-drag
                uid="test"
                title="添加配置文件"
                v-on:file-in="getFile"
        >

        </file-drag>
    </v-container>
</template>

<script>
  export default {
    name: 'test',
    methods: {
      getFile (event) {
        console.log(event)
      }
    }
  }
</script>

<style scoped>

</style>
