<template>
    <v-card id="fileAdder" height="100%">
        <v-overlay
                id="fileAdderOverlay"
                absolute
                :value="fileAdderOverlay"
                :opacity="0.8"
        >
            <h1>松开鼠标以添加</h1>
        </v-overlay>
        <v-card-title>添加配置文件
            <v-spacer></v-spacer>
            <v-btn
                    fab
                    dark
                    small
                    color="primary"
            >
                <v-icon dark>mdi-plus</v-icon>
            </v-btn>
        </v-card-title>
        <v-card-text style="text-align: center">
            <h3>拖动文件到此处以添加配置文件</h3>
        </v-card-text>
    </v-card>
</template>

<script>
  export default {
    name: 'FileDrags',
    methods: {
      mountedOverlay () {
        const holder = document.getElementById('fileDragger')
        holder.ondragover = holder.ondragenter = () => {
          this.fileDraggerOverlay = true
          return false
        }
        holder.ondragleave = () => {
          return false
        }
        const overlay = document.getElementById('fileOverlay')
        overlay.ondragover = overlay.ondragenter = () => {
          return false
        }
        overlay.ondragleave = () => {
          this.fileDraggerOverlay = false
          return false
        }
        overlay.ondrop = (e) => {
          e.preventDefault()
          this.fileDraggerOverlay = false
          // 调用读取文件函数
          const files = e.dataTransfer.files
          if (files.length > 1) {
            this.fileMessage('只能选择一个文件')
            return false
          }
          this.filePath = files[0].path
          // 加载等待
          this.loadingOverlay = true
          this.fileRead()
          return false
        }
      }
    },
    data () {
      return {
        fileAdderOverlay: false
      }
    }
  }
</script>

<style scoped>

</style>
