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
                >
                    关闭
                </v-btn>
            </template>
        </v-snackbar>
        <h1>输入文件配置管理</h1>
        <v-row>
            <v-col cols="6">
                <v-card height="100%">
                    <v-card-title>当前配置文件：{{ activeConfig.name }}</v-card-title>
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
                        v-on:file-in="getFilePath"
                ></file-drag>
            </v-col>
        </v-row>
        <v-card>
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
                <v-list-item
                        v-for="(item, i) in configs"
                        :key="i"
                >
                    <v-list-item-icon>
                        <v-icon v-if="i===configSelected" color="green">mdi-check-bold</v-icon>
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
                            <v-btn icon :disabled="!configEditing">
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
        fileAdderOverlay: false
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
      getFilePath (event) {
        console.log(event)
      },
      getConfigs (refresh) {
        let configDir = this.getRootDirPath() + '\\configs'
        let configFile = configDir + '\\config'
        if (!fs.existsSync(configDir)) fs.mkdirSync(configDir)
        if (!fs.existsSync(configFile)) {
          let initJSON = { activated: '' }
          let flag = 0
          try {
            fs.writeFileSync(configFile, JSON.stringify(initJSON))
          } catch (e) {
            this.errorMessage('无法写入配置，请检查文件夹权限')
            flag = 1
            console.log(e)
          }
          if (flag) return
        }
        // 读取配置文件
        let configContent = fs.readFileSync(configFile, 'utf8')
        let configJSON = {}
        try {
          configJSON = JSON.parse(configContent)
        } catch (e) {
          console.log(e)
          this.errorMessage('配置文件读取错误')
          return
        }
        this.config = configJSON
        // 读取目录下文件
        let dirInfo = fs.readdirSync(configDir)
        let configsInfo = []
        dirInfo.forEach((value) => {
          let configPath = configDir + '\\' + value
          let stat = fs.statSync(configPath)
          if (!stat.isFile()) return
          if (((value + 'a').slice(-5, -1)).toLowerCase() !== '.1dc') return
          if (stat.size === 0) return
          // 读取配置基本信息
          let tmp = fs.readFileSync(configPath, 'utf8')
          let tmpJSON = {}
          let flag = 0
          try {
            tmpJSON = JSON.parse(tmp)
            tmpJSON = {
              name: tmpJSON.name,
              description: tmpJSON.description,
              author: tmpJSON.author,
              version: tmpJSON.version,
              status: 0
            }
          } catch (e) {
            flag = 1
            console.log(e)
          }
          // 检查配置信息
          if (flag) return
          if (tmpJSON.name === '无') {
            this.errorMessage('有至少一个配置的名字为“无”，这是不允许的，因此文件已被排除。')
            return
          }
          if (tmpJSON.name === configJSON.name && tmpJSON.version === configJSON.version) {
            tmpJSON.status = 1
            this.activeConfig = tmpJSON
          }
          // 添加配置
          configsInfo.push(tmpJSON)
        })
        this.configs = configsInfo
        this.configs.forEach((value, index) => {
          if (value.name === this.activeConfig.name && value.version === this.activeConfig.version) {
            this.configSelected = index
          }
        })
        if (refresh) this.showMessage('配置文件刷新成功！')
      },
      selectConfig (index) {
        let configFile = this.getRootDirPath() + '\\configs\\config'
        let configString = JSON.stringify({
          name: this.configs[index].name,
          version: this.configs[index].version
        })
        fs.writeFile(configFile, configString, (err) => {
          if (err) {
            this.errorMessage('无法写入配置文件，请检查文件权限')
            console.log(err)
          } else {
            this.activeConfig = this.configs[index]
            this.configSelected = index
            this.showMessage('配置更新成功')
          }
        })
      }
    },
    created () {
      this.getConfigs(0)
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
