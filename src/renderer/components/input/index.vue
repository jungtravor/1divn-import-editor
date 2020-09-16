<template>
    <v-container fluid style="height: 100%">
        <v-overlay :value="loadingOverlay">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <v-snackbar
                v-model="fileSnackbar"
                color="orange darken-4"
        >
            {{ fileSnackbarText }}
            <template v-slot:action="{ attrs }">
                <v-btn
                        color="white"
                        text
                        v-bind="attrs"
                        @click="fileSnackbar = false"
                >
                    关闭
                </v-btn>
            </template>
        </v-snackbar>
        <v-container fluid>
            <v-row justify="center">
                <v-col cols="6">
                    <v-card id="fileDragger">
                        <v-overlay
                                id="fileOverlay"
                                absolute
                                :value="fileDraggerOverlay"
                                :opacity="0.8"
                        >
                            <h1>松开鼠标以导入</h1>
                        </v-overlay>
                        <v-card-title>选择现有文件 或 创建新文件</v-card-title>
                        <v-card-text>
                            <v-dialog
                                    v-model="fileCreateDialogEnabled"
                                    max-width="290"
                            >
                                <v-card>
                                    <v-card-title>创建新文件</v-card-title>
                                    <v-card-text>
                                        <v-row>
                                            <v-col cols="6">
                                                <v-text-field
                                                        label="压气机级数"
                                                        v-model="fileCreateZ"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col cols="6">
                                                <v-text-field
                                                        label="特性线条数"
                                                        v-model="fileCreateN"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-btn color="primary" @click="fileCreate" style="float: right">创建空白文件</v-btn>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-dialog>
                            <v-row justify="space-around">
                                <v-col cols="auto"><h2>拖拽文件到此处 或：</h2></v-col>
                                <v-col cols="auto">
                                    <v-btn color="primary" large @click="fileSelect">读取文件</v-btn>
                                </v-col>
                                <v-col cols="auto">
                                    <v-btn color="primary" large @click="fileCreateDialogEnabled = true">创建文件</v-btn>
                                </v-col>
                            </v-row>
                            <v-slide-y-transition>
                                <div v-if="paramsPrepared" style="padding: 1rem">
                                    <hr style="margin-bottom: 1rem"/>
                                    <h3>文件名：{{ fileName }}</h3>
                                    <h3>文件路径：{{ filePath }}</h3>
                                    <h3>文件大小：{{ fileSize }} 字节</h3>
                                </div>
                            </v-slide-y-transition>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-row v-if="paramsPrepared" style="padding: 1rem">
            <v-col cols="12">
                <v-expand-transition>
                    <v-card>
                        <v-card-title>输入参数</v-card-title>
                        <v-card-text>
                            <div
                                    v-for="(value, index1) in paramsInfo"
                                    :v-key="index1"
                                    style="padding: 0 1rem"
                            >
                                <h2 v-if="index1<14" style="margin-bottom: 1rem">第 {{ index1 + 1 }} 行{{value.dimension ? '：'+value.name : '：'}}</h2>
                                <h2 v-if="index1>13">{{value.name}}</h2>
                                <v-row>
                                    <v-col
                                            cols="2"
                                            v-if="!value.dimension"
                                            v-for="(item, index2) in value"
                                            :v-key="item.name"
                                    >
                                        <v-text-field
                                                outlined
                                                v-model="paramsData[index1][index2]"
                                                :label="item.name"
                                                :placeholder="item.param"
                                                :name="index1 + '-' + index2"
                                        ></v-text-field>
                                    </v-col>
                                    <v-col
                                            cols="1"
                                            v-if="value.dimension===1"
                                            v-for="(item, index2) in paramsData[index1]"
                                    >
                                        <v-text-field
                                                outlined
                                                v-model="paramsData[index1][index2]"
                                                :label="'第'+(index2+1)+'级'"
                                                placeholder="请输入数据"
                                                :name="index1 + '-' + index2"
                                        ></v-text-field>
                                    </v-col>
                                    <v-col
                                            cols="2"
                                            v-if="index1===14"
                                            v-for="(item, index2) in paramsData[index1]"
                                    >
                                        <h3 style="text-align: center">第 {{index2+1}} 条特性线</h3><br>
                                        <v-text-field
                                                outlined
                                                v-model="paramsData[index1][index2][0]"
                                                label="转速百分比"
                                                placeholder="请输入数据"
                                                :name="index1 + '-' + index2 + '0'"
                                        ></v-text-field>
                                        <v-text-field
                                                outlined
                                                v-model="paramsData[index1][index2][1]"
                                                label="流量系数计算初始点"
                                                placeholder="请输入数据"
                                                :name="index1 + '-' + index2 + '1'"
                                        ></v-text-field>
                                    </v-col>
                                    <v-col
                                            cols="12"
                                            v-if="index1===15"
                                    >
                                        <v-row
                                                v-for="(item, index2) in paramsData[index1]"
                                        >
                                            <v-col cols="12">
                                                <h3>第 {{index2+1}} 条特性线</h3>
                                            </v-col>
                                            <v-col
                                                    cols="1"
                                                    v-for="(angle, index3) in paramsData[index1][index2]"
                                            >
                                                <v-text-field
                                                        outlined
                                                        v-model="paramsData[index1][index2][index3]"
                                                        :label="'第'+(index3+1)+'级'"
                                                        placeholder="请输入数据"
                                                        :name="index1 + '-' + index2 + '-' + index3"
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                    <v-col
                                            cols="12"
                                            v-if="index1===16"
                                    >
                                        <v-row
                                                v-for="(item, index2) in paramsData[index1]"
                                        >
                                            <v-col cols="12">
                                                <h3>第 {{index2+1}} 条特性线</h3>
                                            </v-col>
                                            <v-col
                                                    cols="1"
                                                    v-for="(angle, index3) in paramsData[index1][index2]"
                                            >
                                                <v-text-field
                                                        outlined
                                                        v-model="paramsData[index1][index2][index3]"
                                                        :label="params16(index3)"
                                                        placeholder="请输入数据"
                                                        :name="index1 + '-' + index2 + '-' + index3"
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-col>

                                </v-row>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-expand-transition>
            </v-col>
        </v-row>
        <v-fade-transition>
            <v-speed-dial
                    v-if="paramsPrepared"
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
                <v-btn
                        rounded
                        dark
                        color="red darken-3"
                        @click="fileDelete"
                >
                    <v-icon>mdi-delete</v-icon>删除
                </v-btn>
            </v-speed-dial>
        </v-fade-transition>
    </v-container>
</template>

<script>
  const fs = require('fs')
  const { dialog } = require('electron').remote
  export default {
    name: 'index',
    data () {
      return {
        isDebug: false,
        editButton: false,
        fileContent: undefined,
        fileCreateDialogEnabled: false,
        fileCreateN: 1,
        fileCreateZ: 1,
        filePath: '',
        fileSize: 0,
        fileDraggerOverlay: false,
        fileSnackbar: false,
        fileSnackbarText: '',
        loadingOverlay: false,
        paramsPrepared: false,
        paramsIZ: 0,
        paramsN: 0,
        paramsData: [
          [0.0, 0.0, 1.0, 1.0, 0.0, 0.0],
          [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
          [0, 0, 0, 0.0, 0],
          [],
          [],
          [],
          [],
          [],
          [0.0, 0.0, 0.0, 0.0, 0.0],
          [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
          [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
          [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
          [0.0, 0.0, 0.0, 0.0, 0.0],
          [0.0, 0.0, 0.0, 1],
          [],
          [],
          []
        ],
        paramsInfo: [
          [
            {name: '压气机入口处空气总压', param: 'P1'},
            {name: '压气机前空气总温', param: 'T1'},
            {name: '入口壳体的总压恢复系数', param: 'SP'},
            {name: '入口导叶的总压恢复系数', param: 'SVNA'},
            {name: '第一级工作轮前绝对气流角', param: 'ID1(4)'},
            {name: '末级轴流级导向器气流出口角', param: 'ID1(32)'}
          ],
          [
            {name: '转子物理转速（转/分）', param: 'OB'},
            {name: '轴流总增压比', param: 'PK'},
            {name: '物理空气流量（千克/秒）', param: 'G'},
            {name: '期望等熵效率', param: 'XTA3'},
            {name: '空气流量增大系数', param: 'ID1(13)'},
            {name: '轴流压比增大系数', param: 'AKP'}
          ],
          [
            {name: '给定轴流级数', param: 'IZ'},
            {name: '亚音速级初始叶片形状类型符号', param: 'KF'},
            {name: '压气机方案参数', param: 'IOCK'},
            {name: '型面最大厚度值变化系数', param: 'CMKA'},
            {name: '攻角落后角计算方法控制参数', param: 'CATAK'}
          ],
          {name: '每级入口处工作轮外径和压气机出口外径', param: 'D31(I)', dimension: 1},
          {name: '每级工作轮前及压气机出口的气流轴向分速度', param: 'C1AS(I)', dimension: 1},
          {name: '每级工作轮后及压气机出口的气流轴向分速度', param: 'C2AS(I)', dimension: 1},
          {name: '每级压头损耗系数', param: 'AH1(I)', dimension: 1},
          {name: '每级叶冠的展弦比变化系数', param: 'YK(I)', dimension: 1},
          [
            {name: '轴流第一级中径上反力度', param: 'ID1(5)'},
            {name: '在IZ>N的每一级中反力度变化步长', param: 'ID1(6)'},
            {name: '第一级理论压头减小系数', param: 'ID1(10)'},
            {name: '依次各级中理论压头系数减小步长', param: 'ID1(11)'},
            {name: '理论压头减小系数的最小值', param: 'ID1(12)'}
          ],
          [
            {name: '第一级工作轮叶片结构展弦比', param: 'ID1(14)'},
            {name: '最后级工作轮叶片结构展弦比', param: 'ID1(15)'},
            {name: '入口导向器叶片最大挠度处相对坐标', param: 'ID1(16)'},
            {name: '工作轮叶片最大挠度处的相对坐标', param: 'ID1(17)'},
            {name: '导向器叶片中线最大挠度处的相对坐标', param: 'ID1(18)'},
            {name: '第一超音速级工作轮叶片的受风度', param: 'ID1(24)'}
          ],
          [
            {name: '入口导叶受风度', param: 'ID1(19)'},
            {name: '入口导叶的展弦比', param: 'ID1(20)'},
            {name: '入口导叶中径处的叶栅稠度', param: 'ID1(21)'},
            {name: '入口导叶中径处的叶片型面最大相对厚度', param: 'ID1(27)'},
            {name: '第一级相对轴向间隙', param: 'ID1(25)'},
            {name: '最后一级与第一级相对轴向间隙差', param: 'ID1(26)'}
          ],
          [
            {name: '离心轮盘总增压比', param: 'BXD1(1)'},
            {name: '轴流和离心级之间过渡段的支架个数', param: 'BXD1(2)'},
            {name: '过渡段轮毂母线的倾斜角', param: 'BXD1(3)'},
            {name: '过渡段出口气流角', param: 'ALF1'},
            {name: '离心级入口气流角', param: 'BXD1(8)'},
            {name: '工作轮出口通道中线与转轴法线的夹角', param: 'PSI'}
          ],
          [
            {name: '轮盘入口处外缘直径', param: 'BXD1(6)'},
            {name: '轮盘入口处轮毂直径', param: 'BXD1(7)'},
            {name: '离心级工作轮叶片出口结构角', param: 'BXD1(4)'},
            {name: '离心轮转速与轴流转子转速之比', param: 'BXD1(9)'},
            {name: '离心级入口与轴流级组入口空气流量之比', param: 'BXD1(10)'}
          ],
          [
            {name: '沿流量特性线q(λ)支线计算的步长', param: 'GB(8)'},
            {name: '寻找垂直段支线原点的精度指标', param: 'GB(9)'},
            {name: '计算垂直段支线时寻找顺序级截止点的精度指标', param: 'GB(10)'},
            {name: '计算特性线的条数', param: 'N'}
          ],
          {name: '特性线的转速百分比及流量系数计算初始点', param: 'AN(I,J)', dimension: 2},
          {name: '可调叶冠转动角', param: 'TETA(I,J)', dimension: 2},
          {name: '级间引气流量百分比', param: 'MOUT', dimension: 2}
        ]
      }
    },
    watch: {
      fileCreateDialogEnabled: function (oldVal) {
        if (oldVal === true) {
          this.fileCreateN = 1
          this.fileCreateZ = 1
        }
      }
    },
    computed: {
      fileName () {
        const fp = this.filePath.split('\\')
        return fp.pop()
      }
    },
    methods: {
      debug (message, position = undefined) {
        if (this.isDebug) {
          if (position) console.log(position)
          console.log(message)
        }
      },
      params16 (index) {
        if (index === 0) return '第1级动叶前'
        if (index % 2 === 1) return '第' + (index + 1) / 2 + '级动叶后'
        else return '第' + index / 2 + '级静叶后'
      },
      contentConvert (content) {
        // 获取文件信息
        this.fileGetInfo()
        // 尝试进行数据处理
        let tmp = []
        try {
          const lines = content.split('\n')
          for (let i = 0; i < 14; i++) {
            tmp[i] = lines[i].split(' ').map(Number)
            if (i === 2) this.paramsIZ = tmp[i][0]
            if (i === 13) this.paramsN = tmp[i][3]
          }
          let AN = [] // 读取转速百分比和流量系数计算初始点
          for (let i = 0; i < this.paramsN; i++) {
            AN.push(lines[14 + i].split(' '))
          }
          tmp[14] = AN
          AN = [] // 可调叶冠转动角数组
          for (let i = 0; i < this.paramsN; i++) {
            AN.push(lines[14 + this.paramsN + i].split(' '))
          }
          tmp[15] = AN
          AN = [] // 级间引气参数数组
          for (let i = 0; i < this.paramsN; i++) {
            AN.push(lines[14 + this.paramsN * 2 + i].split(' '))
          }
          tmp[16] = AN
        } catch (e) {
          this.debug(e, '数据处理时出错')
          this.fileMessage('读取文件时出错，请确认文件内容是否正确')
          // 不显示数据
          this.paramsPrepared = false
          // 等待遮罩层关闭
          this.loadingOverlay = false
          return
        }
        this.paramsData = tmp
        // 加载结束
        this.loadingOverlay = false
        this.paramsPrepared = true
      },
      fileCreate () {
        // 检查两个数据是否正确
        const check = /^[0-9]*$/
        if (!check.test(this.fileCreateN) || !check.test(this.fileCreateZ)) {
          this.fileMessage('输入的数据格式不对')
          return
        }
        // 开始保存文件
        const result = dialog.showSaveDialog({
          title: '选择保存路径',
          filters: [{name: '1DIVN File', extensions: ['1D']}]
        })
        if (result) {
          // 加载等待
          this.loadingOverlay = true
          // 存储文件路径
          this.filePath = result
          // 创建初始文件字符串
          const cz = nums => {
            let res = ''
            nums.forEach((num) => {
              let tmp = []
              for (let i = 0; i < num; i++) tmp[i] = 0
              res += tmp.join(' ') + '\n'
            })
            return res
          }
          let fileString = ''
          const n = parseInt(this.fileCreateN)
          const z = parseInt(this.fileCreateZ)
          fileString += cz([6, 6])
          fileString += [z, 0, 0, 0, 0].join(' ') + '\n'
          fileString += cz([(z + 1), (z + 1), z, z, z])
          fileString += cz([5, 6, 6, 6, 5])
          fileString += [0, 0, 0, n].join(' ') + '\n'
          for (let i = 0; i < n; i++) fileString += cz([2])
          for (let i = 0; i < n; i++) fileString += cz([(z + 1)])
          for (let i = 0; i < n; i++) fileString += cz([(2 * z + 1)])
          this.debug(fileString, '创建文件时生成的字符串')
          this.contentConvert(fileString)
          // 写入文件
          fs.writeFile(result, fileString, 'utf8', (err) => {
            if (err) {
              this.fileMessage('创建文件失败，请检查文件是否被占用')
              this.debug(err, '创建文件失败')
              return
            }
            this.fileMessage('创建成功！')
          })
          // 关闭弹窗
          this.fileCreateDialogEnabled = false
        }
      },
      fileDelete () {
        this.fileMessage('暂不支持删除功能')
      },
      fileGetInfo () {
        // 文件信息获取
        const f = fs.statSync(this.filePath)
        this.fileSize = f.size
      },
      fileMessage (message) {
        this.fileSnackbar = true
        this.fileSnackbarText = message
      },
      fileRead () {
        // 尝试读取文件
        fs.readFile(this.filePath, 'utf8', (err, data) => {
          if (err) {
            this.fileMessage('读取文件错误，请检查文件是否被占用')
            this.debug(err, '读取文件失败')
            return
          }
          // 处理读取的数据
          this.debug(data, '读取文件得到的数据')
          this.contentConvert(data)
        })
      },
      fileSave () {
        // 将数组转化为字符串
        let result = ''
        for (let i = 0; i < 14; i++) {
          result += this.paramsData[i].join(' ') + '\n'
        }
        for (let i = 0; i < this.paramsN; i++) {
          result += this.paramsData[14][i].join(' ') + '\n'
        }
        for (let i = 0; i < this.paramsN; i++) {
          result += this.paramsData[15][i].join(' ') + '\n'
        }
        this.debug(result)
        // 写入当前文件
        fs.writeFile(this.filePath, result, 'utf8', (err) => {
          if (err) {
            this.fileMessage('保存文件失败，请检查文件是否被占用')
            this.debug(err, '保存文件失败')
            return
          }
          this.fileMessage('保存成功！')
        })
      },
      fileSaveFor () {
        // 选择保存路径
        const result = dialog.showSaveDialog({
          title: '选择保存路径',
          filters: [{name: '1DIVN File', extensions: ['1D']}]
        })
        if (result) {
          this.filePath = result
          this.fileSave()
          this.fileGetInfo()
        }
      },
      fileSelect () {
        const result = dialog.showOpenDialog({
          title: '选择 1DIVN 输入文件',
          filters: [{name: '1DIVN File', extensions: ['1D']}]
        })
        // 加载等待
        this.loadingOverlay = true
        if (result) {
          // 更新文件信息
          this.filePath = result[0]
          this.fileRead()
        } else {
          // 等待结束
          this.loadingOverlay = false
        }
      },
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
    mounted () {
      // 拖拽文件到窗口事件
      this.mountedOverlay()
    }
  }
</script>

<style scoped>
</style>
