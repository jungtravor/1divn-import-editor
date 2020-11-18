<template>
    <v-container>
        <v-snackbar
                v-model="MessageShow"
                :color="MessageColor"
        >
            {{ MessageText }}
            <template v-slot:action="{ attrs }">
                <v-btn
                        color="white"
                        text
                        v-bind="attrs"
                        @click="MessageShow = false"
                >关闭</v-btn>
            </template>
        </v-snackbar>
        <v-row>
            <v-col cols="6">
                <file-drag
                        uid="config"
                        title="选择输入文件"
                        dialog-title="选择 1DIVN 输入文件"
                        :dialog-filters="[{name: '1DIVN File', extensions: ['1D']}]"
                        v-on:file-in="fileSelect"
                ></file-drag>
            </v-col>
            <v-col cols="6">
                <v-card>
                    <v-card-title>
                        当前配置文件：{{ config.name }}
                        <v-spacer></v-spacer>
                        <v-menu offset-y>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                        color="primary"
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                >
                                    <v-icon>mdi-arrow-down-drop-circle</v-icon>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item
                                        v-for="(item, index) in configs"
                                        :key="index"
                                >
                                    <v-list-item-title>{{ item.name }} v{{ item.version }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-card-title>
                    <v-card-text v-if="config.name !== '无'">
                        <h3 style="margin-bottom: 4px">作者：{{ config.author }}，
                            版本：{{ config.version }}</h3>
                        <h4>描述：{{ config.description }}</h4>
                    </v-card-text>
                    <v-divider></v-divider>
                </v-card>
            </v-col>
        </v-row>
        <v-card v-if="inputContent!==''">
            <v-card-title>输入文件：{{ inputFile.name }}</v-card-title>
            <v-card-text>
                <h3>文件路径：{{ inputFile.path }}</h3>
                <h3>文件大小：{{ inputFile.size }}</h3>
            </v-card-text>
            <v-divider></v-divider>
            <props-display
                    :rules="rules"
                    :file-content="inputContent"
                    :error-raise="errorMessage"
            ></props-display>
        </v-card>
    </v-container>
</template>

<script>
  import PropsDisplay from './propsDisplay'
  const fs = require('fs')
  /*
  * config: 当前配置文件
  * configs: 所有配置文件
  * rules: 当前配置文件的规则
  * inputContent: 输入文件的字符串
  */
  export default {
    name: 'index',
    components: {PropsDisplay},
    data () {
      return {
        config: {
          name: '无'
        },
        configs: [],
        rules: [],
        inputContent: '',
        inputFile: {
          name: '',
          path: '',
          size: ''
        },
        MessageColor: 'primary',
        MessageShow: false,
        MessageText: ''
      }
    },
    methods: {
      showMessage (text) {
        this.MessageColor = 'primary'
        this.MessageShow = true
        this.MessageText = text
      },
      errorMessage (text) {
        this.MessageColor = 'red lighten-1'
        this.MessageShow = true
        this.MessageText = text
      },
      fileSelect (res) {
        let { filePath, message, result } = res
        // 检查传入数据
        if (result) {
          this.errorMessage(message)
          return
        }
        // 读取输入文件
        try {
          this.inputContent = fs.readFileSync(filePath, 'utf8')
        } catch (e) {
          this.errorMessage('无法读取输入文件')
          return
        }
        if (this.inputContent === '') {
          this.errorMessage('输入文件为空')
          return
        }
        this.inputFile.name = this.getFileBaseNameFromPath(filePath)
        this.inputFile.path = filePath
        this.inputFile.size = this.getFileSize(filePath)
        // 数据传入 propsDisplay 组件自动解析
      },
      newContent (event) {}
    },
    beforeRouteEnter (to, from, next) {
      next(vm => {
        // 默认从 prototype 中获取 config 信息
        if (vm.input.defaultConfig.name) {
          vm.config = vm.input.defaultConfig
          vm.configs = vm.input.configs
          vm.rules = vm.config.rules
        } else {
          // 获取配置文件
          let { result, err } = vm.input_getConfigs()
          if (err.code) {
            vm.errorMessage('无法读取配置文件')
            return
          }
          // 读取配置文件
          if (!result.activatedConfig.status) {
            vm.showMessage('还没有已启用的配置文件，请确保有可用的配置文件，再导入输入文件')
            return
          }
          let configString = ''
          try {
            configString = fs.readFileSync(result.activatedConfig.file, 'utf8')
            vm.config = JSON.parse(configString)
            vm.rules = vm.config.rules
            vm.configs = result.configs
            vm.input.configs = result.configs
          } catch (e) {
            vm.errorMessage('读取配置文件出错')
          }
        }
      })
    },
    created () {
    }
  }
</script>

<style scoped>

</style>
