<template>
    <v-container>

        <!-- 加载界面的遮罩 -->
        <v-overlay :value="loadingOverlay">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>

        <!-- 提醒消息 snackbar -->
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

        <!-- 操作面板 -->
        <v-row>

            <!-- 选择输入文件 -->
            <v-col cols="6">
                <file-drag
                        uid="config"
                        title="选择输入文件"
                        dialog-title="选择 1DIVN 输入文件"
                        :dialog-filters="[
                          {name: '1DIVN File', extensions: ['1D']},
                          {name: '所有文件', extensions: ['*']}
                          ]"
                        v-on:loading-start="loadingOverlay = true"
                        v-on:file-in="fileSelect"
                ></file-drag>
            </v-col>

            <!-- 选择配置文件 -->
            <v-col cols="6">
                <v-card>
                    <v-card-title>
                        当前配置文件：{{ config.name }}
                        <v-spacer></v-spacer>
                        <!-- 选择其他配置文件 -->
                        <v-btn
                                icon
                                color="primary"
                                to="/setting/input"
                        >
                            <v-icon>mdi-cog-outline</v-icon>
                        </v-btn>
<!--                        <v-menu offset-y>-->
<!--                            <template v-slot:activator="{ on, attrs }">-->
<!--                                <v-btn-->
<!--                                        color="primary"-->
<!--                                        icon-->
<!--                                        v-bind="attrs"-->
<!--                                        v-on="on"-->
<!--                                >-->
<!--                                    <v-icon>mdi-arrow-down-drop-circle</v-icon>-->
<!--                                </v-btn>-->
<!--                            </template>-->
<!--                            <v-list>-->
<!--                                <v-list-item-->
<!--                                        v-for="(item, index) in configs"-->
<!--                                        :key="index"-->
<!--                                >-->
<!--                                    <v-list-item-title>{{ item.name }} v{{ item.version }}</v-list-item-title>-->
<!--                                </v-list-item>-->
<!--                            </v-list>-->
<!--                        </v-menu>-->
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

        <!-- 输入文件数据界面 -->
        <v-card v-if="inputContent!==''">

            <!-- 输入文件信息面板 -->
            <v-btn
                    style="position: absolute;right: 12px;top: 12px"
                    color="primary"
                    @click="fileSelect({filePath: inputFile.path})"
            >
                重新加载当前文件
            </v-btn>
            <v-card-title style="width: 100%">
                输入文件：{{ inputFile.name }}
            </v-card-title>
            <v-card-text>
                <h3>文件路径：{{ inputFile.path }}</h3>
                <h3>文件大小：{{ inputFile.size }}</h3>
            </v-card-text>
            <v-divider></v-divider>

            <!-- 输入文件数据面板 -->
            <props-display
                    v-if="displayReset"
                    ref="propsDisplay"
                    :rules="rules"
                    :file-content="inputContent"
                    :error-raise="errorMessage"
                    :loading-finished="loadingOverlay = false"
            ></props-display>

            <!-- 输入文件操作按钮 -->
            <v-fade-transition>
                <v-speed-dial
                        v-if="displayReset"
                        v-model="editButton"
                        fixed
                        direction="top"
                        transition="slide-y-reverse-transition"
                        style="right: 4rem;bottom: 5rem"
                >
                    <template v-slot:activator>
                        <v-btn
                                v-model="editButton"
                                color="blue darken-2"
                                dark
                                fab
                        >
                            <v-icon v-if="editButton">mdi-close</v-icon>
                            <v-icon v-else>mdi-pencil</v-icon>
                        </v-btn>
                    </template>
                    <v-btn
                            rounded
                            dark
                            color="indigo darken-1"
                            @click="fileSave"
                    >
                        <v-icon>mdi-content-save</v-icon>&nbsp;保存文件
                    </v-btn>
                    <v-btn
                            rounded
                            dark
                            color="orange darken-3"
                            @click="fileSaveFor"
                    >
                        <v-icon>mdi-content-save-all</v-icon>&nbsp;另存为
                    </v-btn>
                </v-speed-dial>
            </v-fade-transition>
        </v-card>
    </v-container>
</template>

<script>
  import PropsDisplay from './propsDisplay'
  const fs = require('fs')
  const { dialog } = require('electron').remote
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
        editButton: false,
        rules: [],
        displayReset: false,
        inputContent: '',
        inputFile: {
          name: '',
          path: '',
          size: ''
        },
        MessageColor: 'primary',
        MessageShow: false,
        MessageText: '',
        loadingOverlay: false
      }
    },
    methods: {
      /**
       * 显示普通提醒消息
       * @param text
       */
      showMessage (text) {
        this.MessageShow = false
        this.MessageColor = 'primary'
        this.MessageText = text
        this.MessageShow = true
      },
      /**
       * 显示错误提醒消息
       * @param text
       */
      errorMessage (text) {
        this.MessageShow = false
        this.MessageColor = 'red lighten-1'
        this.MessageText = text
        this.MessageShow = true
      },
      /**
       * 当有新文件传入时，读取文件的操作
       * res 参数可以是一个对象，也可以是一个字符串
       * @param res
       */
      fileSelect (res) {
        this.loadingOverlay = true
        let { filePath, message, result } = res
        // 检查传入数据
        if (result) {
          this.errorMessage(message)
          this.loadingOverlay = false
          return
        }
        // 强制关闭组件
        this.displayReset = false
        // 读取输入文件
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            this.errorMessage('无法读取输入文件')
            console.log(err)
            // 关闭加载遮罩
            this.loadingOverlay = false
          } else {
            if (data === '') {
              this.errorMessage('输入文件为空')
              // 关闭加载遮罩
              this.loadingOverlay = false
              return
            }
            // 更新文件信息
            this.inputContent = data
            this.inputFile.name = this.getFileBaseNameFromPath(filePath)
            this.inputFile.path = filePath
            this.inputFile.size = this.getFileSize(filePath)
            // 数据传入 propsDisplay 组件自动解析，重置 propsDisplay 组件
            this.$nextTick(() => {
              this.displayReset = true
              this.showMessage('加载成功')
              // 关闭加载遮罩
              this.loadingOverlay = false
            })
          }
        })
      },
      /**
       * 保存 propsDisplay 组件中的 varData 数据到指定路径
       * @param newFilePath
       */
      fileSave (newFilePath) {
        // 启动加载遮罩
        this.loadingOverlay = true
        // 读取需要保存的数据
        let data = this.$refs['propsDisplay'].varData
        let fileContent = ''
        data.forEach(value => {
          if (!value) return
          let fileLine = value.join(' ')
          fileContent += fileLine + '\n'
        })
        // 写入文件
        let filePath = typeof newFilePath === 'string' ? newFilePath : this.inputFile.path
        fs.writeFile(filePath, fileContent, (e) => {
          if (e) {
            // 提示错误消息
            this.errorMessage('无法写入文件')
            // 控制台输出错误
            console.log(e)
          } else {
            // 更新文件信息
            if (filePath === newFilePath) {
              this.inputFile.name = this.getFileBaseNameFromPath(newFilePath)
              this.inputFile.path = newFilePath
              this.inputFile.size = this.getFileSize(newFilePath)
            }
            // 显示提示消息
            this.showMessage('保存完成')
            // 关闭加载遮罩
            this.loadingOverlay = false
          }
        })
      },
      fileSaveFor () {
        // 选择保存路径
        const result = dialog.showSaveDialog({
          title: '选择保存路径',
          filters: [{name: '1DIVN File', extensions: ['1D']}]
        })
        if (result) this.fileSave(result)
      }
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
          fs.readFile(result.activatedConfig.file, 'utf8', (err, data) => {
            if (err) {
              // 提示错误消息
              this.errorMessage('读取配置文件出错')
              // 控制台输出错误
              console.log(err)
            } else {
              try {
                // 尝试读取文本数据
                vm.config = JSON.parse(data)
                // 传入数据
                vm.rules = vm.config.rules
                vm.configs = result.configs
                vm.input.configs = result.configs
              } catch (e) {
                // 提示错误消息
                this.errorMessage('配置文件格式有误')
                // 控制台输出错误
                console.log(e)
              }
            }
          })
        }
      })
    }
  }
</script>

<style scoped>

</style>
