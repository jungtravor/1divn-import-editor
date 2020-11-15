<template>
    <v-container fluid>
        <h1>输入文件格式管理</h1>
        <v-row>
            <v-col cols="6">
                <v-card height="100%">
                    <v-card-title>当前配置文件：{{activeConfig}}</v-card-title>
                    <v-card-text v-if="activeConfig===''">

                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="6">
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
                                @click="handleFileAdd"
                        >
                            <v-icon dark>mdi-plus</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-card-text style="text-align: center">
                        <h3>拖动文件到此处以添加配置文件</h3>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-card>
            <v-card-title>
                配置文件列表
                <v-spacer></v-spacer>
                <v-btn
                        dark
                        :color="configEditButtonColor[configEditing ? 1 : 0]"
                >{{configEditButtonText[configEditing ? 1 : 0]}}</v-btn>
            </v-card-title>
            <v-list
                    flat
                    :disabled="configEditing"
            >
                <v-list-item-group
                        v-model="configSelected"
                        color="primary"
                        mandatory
                >
                    <v-list-item
                            v-for="(item, i) in configs"
                            :key="i"
                            @click="activeConfig = configs[configSelected-1]"
                    >
                        <v-list-item-icon>
                            <v-icon v-if="i===configSelected">mdi-check</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            {{item.name}}
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-btn icon>
                                <v-icon>mdi-eye</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-card>
    </v-container>
</template>

<script>
  // const fs = require('fs')
  const { dialog } = require('electron').remote
  export default {
    name: 'index',
    data () {
      return {
        activeConfig: '无',
        configs: [
          {
            name: '测试文件',
            status: 0
          },
          {
            name: '测试文件2',
            status: 1
          }
        ],
        configEditing: false,
        configEditButtonText: ['编辑', '完成'],
        configEditButtonColor: ['primary', 'red'],
        configSelected: 1,
        configStatus: [
          {available: 'mdi-check'},
          {available: ''}
        ],
        fileAdderOverlay: false
      }
    },
    methods: {
      test () {
        console.log(this.configSelected)
      },
      handleFileAdd () {
        const result = dialog.showOpenDialog({
          title: '选择 1DIVN 输入文件格式配置文件',
          filters: [{name: '1DIVN Config File', extensions: ['1DCF']}]
        })
        if (result) {
          // 更新文件信息
          this.filePath = result[0]
          this.fileRead()
        }
      },
      mountedOverlay () {
        const holder = document.getElementById('fileAdder')
        holder.ondragover = holder.ondragenter = () => {
          this.fileAdderOverlay = true
          return false
        }
        holder.ondragleave = () => {
          return false
        }
        const overlay = document.getElementById('fileAdderOverlay')
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
    created () {
      // console.log(this.$router)
    },
    mounted () {
      this.mountedOverlay()
    }
  }
</script>

<style scoped>

</style>
