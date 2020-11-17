import Vue from 'vue'
import axios from 'axios'
import vuetify from '@/plugins/vuetify'
import '@/assets/variables.scss'

import App from './App'
import router from './router'
import store from './store'
import FileDrag from './components/common/FileDrag'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

// window.$ = window.jQuery = require('jquery')

const { remote } = require('electron')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

Vue.mixin({
  methods: {
    copy (obj) {
      const s = JSON.stringify(obj)
      if (s === '{}') return undefined
      return JSON.parse(JSON.stringify(obj))
    },
    hash (len) {
      return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len)
    },
    getRootDirPath () {
      let appPath = remote.app.getPath('exe')
      return path.dirname(appPath)
    },
    getExecPath () {
      return remote.app.getPath('exe')
    },
    getFileBaseNameFromPath (filePath) {
      return path.basename(filePath)
    },
    getFileNameAndExt (fileName) {
      let ext = path.extname(fileName)
      let name = fileName.substr(0, fileName.length - ext.length)
      return {
        name: name,
        ext: ext
      }
    },
    input_getConfigs (callback) {
      let result = {
        config: {},
        activatedConfig: {
          name: '无'
        },
        activatedIndex: 0,
        configs: []
      }
      let err = {
        code: 0,
        message: ''
      }
      // 检查配置
      let configDir = this.getRootDirPath() + '\\configs'
      let configFile = configDir + '\\config'
      if (!fs.existsSync(configDir)) fs.mkdirSync(configDir)
      if (!fs.existsSync(configFile)) {
        let initJSON = {
          activated: {
            name: '无',
            version: '',
            file: ''
          }
        }
        try {
          fs.writeFileSync(configFile, JSON.stringify(initJSON))
        } catch (e) {
          err.code = 1
          err.message = '无法写入配置，请检查文件夹权限'
          console.log(e)
        }
        if (err.code) return { err: err }
      }
      // 读取配置文件
      let configContent = fs.readFileSync(configFile, 'utf8')
      let configJSON = {}
      try {
        configJSON = JSON.parse(configContent)
      } catch (e) {
        err.code = 2
        err.message = '配置文件读取错误'
        console.log(e)
      }
      if (err.code) return { err: err }
      result.config = configJSON
      // 读取目录下文件
      let dirInfo = fs.readdirSync(configDir)
      let configsInfo = []
      dirInfo.forEach((value) => {
        let configPath = configDir + '\\' + value
        let stat = fs.statSync(configPath)
        // 检查是否为配置文件格式
        if (!stat.isFile()) return
        if ((value.slice(-4)).toLowerCase() !== '.1dc') return
        if (stat.size === 0) return
        // 读取配置基本信息
        let tmp = fs.readFileSync(configPath, 'utf8')
        let tmpJSON = {}
        try {
          tmpJSON = JSON.parse(tmp)
          tmpJSON = {
            name: tmpJSON.name,
            description: tmpJSON.description,
            author: tmpJSON.author,
            version: tmpJSON.version,
            rules: tmpJSON.rules,
            status: 0,
            file: configPath
          }
        } catch (e) {
          err.code = -1
          err.message = '配置文件有损坏情况'
          console.log(e)
        }
        if (err.code) return
        // 检查配置信息
        if (tmpJSON.name === '无') {
          err.code = -2
          err.message = '有至少一个配置的名字为“无”，这是不允许的，因此文件已被排除。'
          return
        }
        // 添加配置
        configsInfo.push(tmpJSON)
      })
      result.configs = configsInfo
      result.configs.sort(function (a, b) {
        const x = a.name.toLowerCase()
        const y = b.name.toLowerCase()
        if (x < y) return -1
        if (x > y) return 1
        const m = a.version.toLowerCase()
        const n = b.version.toLowerCase()
        if (m < n) return -1
        if (m > n) return 1
      })
      // 检查激活的配置
      result.configs.forEach((value, index) => {
        if (value.name === result.config.activated.name && value.version === result.config.activated.version) {
          value.status = 1
          result.activatedConfig = value
          this.input.defaultConfig = value
          result.activatedIndex = index
        }
      })
      // 返回结果
      return { result: result, err: err }
    },
    input_updateConfig (activatedConfig, callback) {
      let configFile = this.getRootDirPath() + '\\configs\\config'
      let { name, version, file } = activatedConfig
      let configString = JSON.stringify({
        activated: {
          name: name,
          version: version,
          file: file
        }
      })
      fs.writeFile(configFile, configString, (err) => {
        callback(err)
      })
    }
  }
})

Vue.prototype.input = {
  defaultConfig: {},
  configs: []
}

/* eslint-disable no-new */
Vue.component('file-drag', FileDrag)
new Vue({
  components: { App },
  router,
  store,
  vuetify,
  template: '<App/>'
}).$mount('#app')
