<template>
    <v-container fluid style="padding: 16px">
        <h1 style="margin-bottom: 4px">参数设定</h1>
        <v-row>
            <v-col
                    v-for="(label, index1) in varLabels"
                    :key="index1"
                    :cols="label.width"
                    class="column-container"
            >
                <div v-if="!label.subtitle">
                    <h2 class="column-title">{{ label.description }}</h2>
                    <v-row>
                        <v-col
                                v-for="(item, index2) in label.labels"
                                :key="item.varName"
                                :cols="item.width"
                                class="column-container"
                        >
                            <v-text-field
                                    outlined
                                    v-model="varData[index1][index2]"
                                    :label="item.description"
                                    :placeholder="item.varName"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </div>
                <h2 v-if="label.first && label.subtitle" class="first-vertical-title">{{label.description}}</h2>
                <h3
                        v-if="label.subtitle && label.vertical"
                        v-bind:class="['column-title', label.labels[0].verticalCount <= 12 ? 'first-vertical-subtitle' : '']"
                >
                    {{ label.subtitle }}
                </h3>
                <h3
                        v-if="label.subtitle && !label.vertical"
                        v-bind:class="['column-subtitle', label.first ? 'first-vertical-subtitle' : '']"
                >
                    {{ label.subtitle }}
                </h3>
                <div v-if="label.subtitle && !label.vertical">
                    <v-row>
                        <v-col
                                v-for="(item, index2) in label.labels"
                                :key="item.varName"
                                :cols="item.width"
                                class="column-container"
                        >
                            <v-text-field
                                    outlined
                                    v-model="varData[index1][index2]"
                                    :label="item.description"
                                    :placeholder="item.varName"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </div>
                <v-text-field
                        v-if="label.subtitle && label.vertical"
                        v-for="(item, index2) in label.labels"
                        :key="item.varName"
                        v-bind:class="index2 ? '' : 'first-vertical-textField'"
                        outlined
                        v-model="varData[index1][index2]"
                        :label="item.description"
                        :placeholder="item.varName"
                ></v-text-field>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
  export default {
    props: {
      rules: Array,
      fileContent: String,
      loadingOverlay: Boolean
    },
    name: 'propsDisplay',
    data () {
      return {
        globalVars: {},
        varLabels: [],
        varData: []
      }
    },
    methods: {
      setArray () {
        // 存储原始数据
        let lines = this.fileContent.split('\n')
        lines.forEach(value => {
          let vs = value.match(/-?[0-9]+[Ee]?\.?[0-9]*/g)
          this.varData.push(vs)
        })
        // 在 varLabels 的第 i 个数组中推入对象
        function pushInLabels (t, i, item, single = true, description = '', vertical = false, subtitle = '', width = 12, first = false) {
          if (!t.varLabels[i]) {
            // 创建行对象
            if (single) {
              t.varLabels.push({
                description: '第' + (i + 1).toString() + '项',
                labels: [],
                vertical,
                width
              })
            } else {
              let des = description === '' ? '第' + (i + 1).toString() + '项' : description
              t.varLabels.push({
                description: des,
                labels: [],
                vertical,
                first,
                width: vertical ? width : 12,
                subtitle: subtitle === '' ? undefined : subtitle
              })
            }
          }
          t.varLabels[i].labels.push(item)
        }
        let lastRow = 1
        let index1 = 0
        let index2 = 0
        try {
          // 遍历生成数据标签数组
          this.rules.forEach(rule => {
            let { varName, description, type, row, width, dimension, length, labels, vertical } = rule
            if (!width) width = 2
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
              // 行指针预处理
              if (row !== lastRow) {
                // 下一行
                index1++
                index2 = 0
                lastRow = row
              }
              // 插入 varLabels 数组
              pushInLabels(this, index1, item)
              // 处理数据类型
              let value
              if (type === 'number') value = parseInt(this.varData[index1][index2])
              else value = parseFloat(this.varData[index1][index2])
              // 更新数据
              this.globalVars[varName] = value
              this.varData[index1][index2] = value
              // 行指针后处理
              index2++
            } else if (dimension === 1) {
              /**
               * 一维数组变量
               */
              // 行指针预处理
              index1++
              // 计算数组长度
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
              // 计算标签
              let itemLabels = []
              let labelTemplate = labels[0]
              if (Array.isArray(labelTemplate)) itemLabels = labelTemplate
              else {
                let keyword = '&i'
                for (let i = 0; i < len; i++) {
                  itemLabels.push(labelTemplate.replace(keyword, (i + 1).toString()))
                }
              }
              // 推入标签数组
              for (let i = 0; i < len; i++) {
                let item = {
                  varName: varName,
                  description: description,
                  width: width
                }
                item.varName = varName + '(' + (i + 1).toString() + ')'
                item.description = itemLabels[i]
                pushInLabels(this, index1, item, false, description)
              }
              // 行指针后处理
              index2 = 0
            } else if (dimension === 2) {
              /**
               * 二维数组变量
               */
              // 行指针预处理
              index1++
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
              // 计算标签
              let itemLabels = labels.map((value, index) => {
                // TODO: 目前不支持字符串中存在两个变量，可以加入该功能
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
              // 推入标签数组
              for (let i = 0; i < len[0]; i++) {
                let subtitle = itemLabels[0][i]
                for (let j = 0; j < len[1]; j++) {
                  let item = {
                    varName: varName,
                    description: description,
                    width: width,
                    verticalCount: i * width
                  }
                  item.varName = varName + '(' + (i + 1).toString() + ',' + (j + 1).toString() + ')'
                  item.description = itemLabels[1][j]
                  let first = i === 0
                  pushInLabels(this, index1, item, false, description, vertical, subtitle, width, first)
                }
                index1++
              }
              // 行指针后处理
              index1--
              index2 = 0
            }
          })
        } catch (e) {
          this.$emit('error-raise', e.message)
          console.log('read data error', e)
        }
        // 完成
        this.$emit('loading-finished')
      }
    },
    created () {
      this.setArray()
    }
  }
</script>

<style scoped>
    .first-vertical-subtitle {
        padding-top: 36px;
    }
    .first-vertical-textField {
        padding-top: 4px;
    }
    .first-vertical-title {
        position: absolute;
    }
    .column-container {
        padding: 0 12px
    }
    .column-title {
        margin-bottom: 8px
    }
    .column-subtitle {
        margin-bottom: 12px
    }
</style>
