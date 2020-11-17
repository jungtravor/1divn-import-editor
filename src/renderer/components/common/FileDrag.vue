<template>
    <v-card :id="AdderID" height="100%">
        <v-overlay
                :id="OverlayID"
                absolute
                :value="fileAdderOverlay"
                :opacity="0.8"
        >
            <h1>{{ propSlot.overlayText }}</h1>
        </v-overlay>
        <v-card-title>{{ propSlot.title }}
            <v-spacer></v-spacer>
            <v-btn
                    fab
                    dark
                    small
                    color="primary"
                    @click="fileSelect"
            >
                <v-icon dark>mdi-plus</v-icon>
            </v-btn>
        </v-card-title>
        <v-card-text style="text-align: center">
            <h3>{{ propSlot.text }}</h3>
        </v-card-text>
    </v-card>
</template>

<script>
  const { dialog } = require('electron').remote
  export default {
    props: {
      uid: String,
      title: String,
      text: String,
      overlayText: String,
      dialogTitle: String,
      dialogFilters: Array
    },
    name: 'FileDrags',
    methods: {
      mountedOverlay () {
        const holder = document.getElementById(this.AdderID)
        holder.ondragover = holder.ondragenter = () => {
          this.fileAdderOverlay = true
          return false
        }
        holder.ondragleave = () => {
          return false
        }
        const overlay = document.getElementById(this.OverlayID)
        overlay.ondragover = overlay.ondragenter = () => {
          return false
        }
        overlay.ondragleave = () => {
          this.fileAdderOverlay = false
          return false
        }
        overlay.ondrop = (e) => {
          e.preventDefault()
          this.fileAdderOverlay = false
          // 调用读取文件函数
          const files = e.dataTransfer.files
          if (files.length > 1) {
            this.$emit('file-in', {
              filePath: '',
              message: '只能选择一个文件',
              result: 2
            })
            return false
          }
          let filePath = files[0].path
          let { ext } = this.getFileNameAndExt(filePath)
          if (ext.toLowerCase() !== '.1dc') {
            this.$emit('file-in', {
              filePath: '',
              message: '文件后缀错误',
              result: 3
            })
            return false
          }
          this.$emit('file-in', {
            filePath: filePath,
            message: '',
            result: 0
          })
          return false
        }
      },
      fileSelect () {
        const result = dialog.showOpenDialog({
          title: this.propSlot.dialogTitle,
          filters: this.propSlot.dialogFilters
        })
        if (result) {
          // 更新文件信息
          let filePath = result[0]
          this.$emit('file-in', {
            filePath: filePath,
            result: 0
          })
        } else {
          this.$emit('file-in', {
            filePath: '',
            message: '文件未选择',
            result: 1
          })
        }
      }
    },
    data () {
      return {
        componentID: 'file',
        fileAdderOverlay: false,
        propSlot: {
          title: '添加文件',
          text: '拖动文件到此处以添加文件',
          overlayText: '松开鼠标以添加',
          dialogTitle: '选择文件',
          dialogFilters: []
        }
      }
    },
    created () {
      if (this.uid || this.uid !== '') {
        this.componentID = this.uid
      } else {
        console.log('Warning: You\'d better use uid to make sure all file-drag component are unique.')
      }
      function props (t, prop) {
        if (t[prop] && t[prop] !== '' && t[prop] !== []) t.propSlot[prop] = t[prop]
      }
      props(this, 'title')
      props(this, 'text')
      props(this, 'overlayText')
      props(this, 'dialogTitle')
      props(this, 'dialogFilters')
    },
    mounted () {
      this.mountedOverlay()
    },
    computed: {
      AdderID () {
        return this.componentID + 'Adder'
      },
      OverlayID () {
        return this.componentID + 'AdderOverlay'
      }
    }
  }
</script>

<style scoped>

</style>
