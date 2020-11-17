<template>
    <v-container fluid>
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
        <h1>输入文件配置管理</h1>
        <v-row>
            <v-col cols="6">
                <v-card height="100%">
                    <v-card-title>默认配置文件：{{ activeConfig.name }}</v-card-title>
                    <v-card-text v-if="activeConfig.name !== '无'">
                        <h3 style="margin-bottom: 4px">作者：{{ activeConfig.author }}，
                            版本：{{ activeConfig.version }}</h3>
                        <h4>描述：{{ activeConfig.description }}</h4>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="6">
                <file-drag
                        uid="config"
                        title="添加配置文件"
                        dialog-title="选择 1DIVN 输入配置文件"
                        :dialog-filters="[{name: '1DIVN Config File', extensions: ['1DC']}]"
                        v-on:file-in="addNewConfig"
                ></file-drag>
            </v-col>
        </v-row>
        <v-card>
            <v-dialog v-model="deleteDialog" width="500" >
                <v-card>
                    <v-card-title>删除配置文件</v-card-title>
                    <v-card-text>是否要删除这个配置文件？</v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="deleteDialog = false">否</v-btn>
                        <v-btn color="red lighten-1" text @click="deleteConfig">是</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-card-title>
                配置文件列表
                <v-btn icon color="primary" style="margin-left: 4px" @click="getConfigs(1)">
                    <v-icon>mdi-refresh</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                        dark
                        :color="configEditing ? 'red lighten-1' : 'primary'"
                        :outlined="!configEditing"
                        @click="configEditing = !configEditing"
                >{{ configEditing ? '完成' : '编辑' }}</v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-list flat>
                <v-list-item v-for="(item, i) in configs" :key="i" >
                    <v-list-item-icon>
                        <v-icon
                                v-if="i===configSelected && activeConfig.name !== '无'"
                                color="green"
                        >mdi-check-bold</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-row style="padding: 0 16px 0 32px">
                            {{ item.name }}&nbsp&nbsp v{{ item.version }}
                            <v-spacer></v-spacer>
                            <h5>by @{{ item.author }}</h5>
                        </v-row>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-row class="list-action-row">
                            <v-btn
                                    icon
                                    :disabled="configEditing"
                                    @click="selectConfig(i)"
                            >
                                <v-icon color="blue lighten-1">mdi-check</v-icon>
                            </v-btn>
                            <v-btn
                                    icon
                                    :disabled="!configEditing"
                                    @click="showDeleteDialog(i)"
                            >
                                <v-icon color="red lighten-1">mdi-delete</v-icon>
                            </v-btn>
                        </v-row>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-card>
    </v-container>
</template>

<script>
  const fs = require('fs')
  export default {
    name: 'index',
    data () {
      return {
        activeConfig: { name: '无' },
        config: {},
        configs: [],
        configEditing: false,
        configSelected: 1,
        MessageColor: 'primary',
        MessageShow: false,
        MessageText: '',
        fileAdderOverlay: false,
        deleteDialog: false,
        deleteConfigIndex: 0
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
      addNewConfig (res) {
        let { filePath, message, result } = res
        if (result) {
          this.errorMessage(message)
          return
        }
        // 检查配置文件冲突
        try {
          let newConfig = fs.readFileSync(filePath, 'utf8')
          let { name, version, author } = JSON.parse(newConfig)
          this.configs.forEach((value) => {
            if (value.name === name && value.version === version && value.author === author) {
              throw new Error('exists')
            }
          })
        } catch (e) {
          if (e.message === 'exists') this.errorMessage('与现有配置文件发生冲突，添加失败')
          this.errorMessage('无法读取文件，添加失败')
          return
        }
        // 检查并生成随机文件名
        let fileName = this.getFileBaseNameFromPath(filePath)
        let configDir = this.getRootDirPath() + '\\configs'
        let dirInfo = fs.readdirSync(configDir)
        let { name, ext } = this.getFileNameAndExt(fileName)
        name = this.hash(8)
        while (dirInfo.includes(name + ext)) {
          name = this.hash(8)
        }
        // 拷贝文件到config目录
        fileName = configDir + '\\' + name + ext
        try {
          fs.copyFileSync(filePath, fileName)
        } catch (e) {
          this.errorMessage('无法复制文件，请检查文件夹权限')
          return
        }
        this.getConfigs(0)
      },
      getConfigs (refresh) {
        let { result, err } = this.input_getConfigs()
        if (err.code) {
          this.errorMessage(err.message)
          if (err.code > 0) return
        }
        this.activeConfig = result.activatedConfig
        this.configSelected = result.activatedIndex
        this.config = result.config
        this.configs = result.configs
        if (refresh) this.showMessage('配置文件更新完成')
        console.log(result)
      },
      selectConfig (index) {
        this.input_updateConfig(this.configs[index], (err) => {
          if (err) {
            this.errorMessage('无法写入配置文件，请检查文件权限')
            console.log(err)
          } else {
            this.activeConfig = this.configs[index]
            this.configSelected = index
            this.input.defaultConfig = this.configs[index]
            this.showMessage('配置更新成功')
          }
        })
      },
      showDeleteDialog (index) {
        this.deleteConfigIndex = index
        this.deleteDialog = true
      },
      deleteConfig () {
        this.deleteDialog = false
        let { file } = this.configs[this.deleteConfigIndex]
        try {
          fs.unlinkSync(file)
        } catch (e) {
          this.errorMessage(e.message)
          return
        }
        this.showMessage('已成功删除')
        this.getConfigs(0)
      }
    },
    beforeRouteEnter (to, from, next) {
      next(vm => {
        vm.getConfigs(0)
      })
    }
  }
</script>

<style scoped>
.list-action-row {
    padding: 0 6px;
}
.list-action-row button {
    margin: 0 4px;
}
</style>
