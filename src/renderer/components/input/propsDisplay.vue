<template>
    <v-container fluid>
        <h1>参数设定</h1>
        <v-container
                v-for="(label, index1) in varLabels"
                :key="index1"
        >
            <h2 v-if="label.length !== 1 || !label[0].length">第 {{ index1+1 }} 项</h2>
            <h2 v-if="label.length === 1 && label[0].length">{{ label[0].description }}</h2>
            <v-row>
                <v-col
                        v-for="item in label"
                        :key="item.varName"
                        :cols="item.width"
                >
                    <v-text-field
                            outlined
                            v-model="item.value"
                            :label="item.description"
                            :placeholder="item.varName"
                    ></v-text-field>
                </v-col>
            </v-row>
        </v-container>
    </v-container>
</template>

<script>
  export default {
    props: {
      rules: Array,
      fileContent: String
    },
    name: 'propsDisplay',
    data () {
      return {
        globalVars: {},
        stickyVars: {},
        varLabels: [],
        varData: []
      }
    },
    methods: {
      storeData () {
        console.log(this.fileContent)
        let lines = this.fileContent.split('\n')
        lines.forEach(value => {
          let vs = value.split(' ')
          this.varData.push(vs)
        })
      },
      setArray () {
        console.log(this.rules)
        function pushInLabels (t, i, item) {
          while (!t.varLabels[i]) t.varLabels.push([])
          t.varLabels[i].push(item)
        }
        let lastRow = 1
        let indexOfArray = 0
        let index2 = 0
        try {
          this.rules.forEach(rule => {
            let { varName, description, type, row, width, dimension, length, labels, vertical } = rule
            if (!width) width = 1
            if (!dimension) {
              /**
               * 单变量，计入动态变量
               */
              // 检查动态变量是否重复
              if (this.globalVars[varName]) {
                throw new Error('存在重复的变量名称：' + varName)
              }
              let item = {
                varName: varName,
                description: description,
                width: width
              }
              let val
              // 处理行指针
              if (row !== lastRow) {
                // 下一行
                indexOfArray++
                index2 = 0
                val = this.varData[indexOfArray][0]
              } else {
                // 添加至本行
                lastRow = row
                val = this.varData[indexOfArray][index2++]
              }
              // 处理数据类型
              if (type === 'number') this.globalVars[varName] = parseInt(val)
              else this.globalVars[varName] = parseFloat(val)
              // 推入标签数组
              pushInLabels(this, indexOfArray, item)
            } else if (dimension === 1) {
              /**
               * 一维数组变量
               */
              let item = {
                varName: varName,
                description: description,
                dimension: 1,
                width: width,
                length: length,
                labels: []
              }
              // 计算长度
              let len = 0
              length.forEach(value => {
                if (isNaN(value)) {
                  // 动态变量
                  len += this.globalVars[value]
                  // 记录变量至 stickyVar
                } else {
                  len += value
                }
              })
              item.length = len
              // 计算标签
              let labelTemplate = labels[0]
              if (Array.isArray(labelTemplate)) item.labels = labelTemplate
              else {
                let keyword = '&i'
                for (let i = 0; i < len; i++) {
                  item.labels.push(labelTemplate.replace(keyword, (i + 1).toString()))
                }
              }
              // 更新行指针
              indexOfArray++
              index2 = 0
              // 推入标签数组
              pushInLabels(this, indexOfArray, item)
            } else if (dimension === 2) {
              /**
               * 二维数组变量
               */
              let item = {
                varName: varName,
                description: description,
                dimension: 2,
                width: width,
                length: length,
                labels: [],
                vertical: vertical
              }
              // 计算长度
              let len = [0, 0]
              len = length.map(lenTmp => {
                let tmp = 0
                lenTmp.forEach(value => {
                  if (isNaN(value)) {
                    tmp += this.globalVars[value]
                  } else {
                    tmp += value
                  }
                })
                return tmp
              })
              item.length = len
              // 计算标签
              let labelTemplates = labels
              item.labels = labelTemplates.map((value, index) => {
                if (Array.isArray(value)) return value
                else {
                  let tmp = []
                  let keyword = '&' + String.fromCharCode(index + 105)
                  for (let i = 0; i < len[index]; i++) {
                    tmp.push(value.replace(keyword, (i + 1).toString()))
                  }
                  return tmp
                }
              })
              // 更新行指针
              indexOfArray++
              index2 = 0
              // 推入标签数组
              pushInLabels(this, indexOfArray, item)
            }
          })
        } catch (e) {
          this.$emit('error-raise', e.message)
          console.log('read data error', e)
        }
        console.log(this.globalVars)
        console.log(this.varLabels)
        console.log(this.varData)
      },
      inputChanged (item) {
        console.log(item)
      }
    },
    watch: {
      fileContent: function (oldVal, newVal) {
        if (oldVal === newVal) return
        this.setArray()
        console.log('newVal')
      }
    },
    created () {
      this.storeData()
      this.setArray()
    }
  }
</script>

<style scoped>

</style>
