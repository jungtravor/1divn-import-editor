# 1DIVN Editor

> An 1DIVN program input params editor.

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application and setup for production
npm run build

# run unit & end-to-end tests
npm test


# lint all JS/Vue component files in `src/`
npm run lint

```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[45a3e22](https://github.com/SimulatedGREG/electron-vue/tree/45a3e224e7bb8fc71909021ccfdcfec0f461f634) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).

# 输入文件

1DIVN 程序的输入文件包含很多参数，而且经过改动的程序对输入文件要求也不尽相同，因此需要通过一个配置文件来定义输入文件内参数及其位置范围。

## 配置文件

配置文件格式为 JSON，值类型为 `String` 、整型 `Number` 或数组 `Array` ；部分键值对出现即表示布尔型 true，无论该值为任何内容，在以下说明中以 `Bool` 表示这类键值对。

### 配置文件键值

| 键名        | 类型   | 说明         |
| ----------- | ------ | ------------ |
| name        | String | 配置文件标题 |
| author      | String | 配置文件作者 |
| description | String | 配置文件说明 |
| version     | String | 配置文件版本 |
| rules       | array  | 参数定义     |

### rules 键值

rules 数组中的每个 JSON 对象均是一个参数的说明，配置文件中必须包含这个参数的名称、类型和所在行。以下是对于 rule 对象的一些说明：

- 参数名称不可以重复，不可以使用特殊符号。
- 对于同一行的不同参数，在数组中的先后顺序是十分重要的，这个顺序决定了参数的前后位置。
- row 是参数所在行的相对位置，并非绝对位置，因为二维数组的参数通常会占有多行，因此 row 用来标记参数是否置于同一行。
- length 数组中的 String 类型表示使用之前已经定义的某个参数名，实际数组大小取决于这个参数的值。
- labels 数组中，使用 String 类型提供一个字符串模板，以特殊符号代替该维度的索引；使用 Array 类型提供该维度下对应索引的说明。

| 键名        | 必填 | 类型   | 默认值 | 说明                                                         |
| ----------- | ---- | ------ | ------ | ------------------------------------------------------------ |
| varName     | 是   | String |        | 参数名称                                                     |
| description |      | String | (空)   | 参数说明                                                     |
| type        | 是   | String | float  | 参数类型，可选 'number' 或 'float'                           |
| row         | 是   | Number |        | 参数所在行的相对位置，第一个参数的 row 值为1                 |
| width       |      | Number | 1      | 参数显示宽度所占比例，总宽度为12                             |
| dimension   |      | Number | 0      | 参数所占维度，最多支持二维数组                               |
| vertical    |      | Bool   | false  | 仅适用于dimension大于1的情况，规定了不同维度的参数是否以垂直方式显示 |
| length      |      | Array  | [1]    | 参数在不同维度的数量。数组中若只有一个元素且为1，则表示该参数只有一个；否则表示一维数组下的参数数量 |
| labels      |      | Array  |        | 参数在不同维度下的说明，用 `&i` 、 `&j` 来表示第一、二维度的索引 |

### 参考模板

```JSON
{
	"name": "Default Config",
	"version": "0.0.1",
	"author": "jungtravor",
	"description": "1DIVN Input File Editor",
	"rules": [
		{
			"varName": "N",
			"description": "压气机级数",
			"type": "number",
			"row": 1,
			"width": 2
		},
		{
			"varName": "Z",
			"description": "特性线数量",
			"type": "number",
			"row": 1,
			"width": 2
		},
		{
			"varName": "P1",
			"description": "进口总压",
			"type": "float",
			"row": 1,
			"width": 2
		},
		{
			"varName": "AH1",
			"description": "每级压头损耗系数",
            "dimension": 1,
            "length": ["N"],
			"labels": [
				"第&i级"
			],
			"row": 2
		},
		{
			"varName": "AN",
			"description": "特性线的转速百分比及流量系数计算初始点",
            "dimension": 2,
            "length": ["Z", 2],
			"labels": [
                "第&i条特性线",
                [
                    "转速百分比",
                    "流量系数计算初始点"
                ]
			],
            "vertical": 1,
			"row": 2
		}
	]
}
```



# 全局方法

## 1、getConfigs

返回值为 JSON 对象，包含 result 和 err 字段

err 包括 code 和 message 字段，code 大于 0 时表示出现错误且无法继续，小于 0 时表示过程出现差错但无伤大雅。

# Vue 组件说明

所有自定义的 Vue 组件均在 `/src/renderer/components/common` 目录下，直接在 `main.js` 中引用。

## 1、FileDrag

FileDrag 组件提供了读取文件路径的方法，其框架是 Vuetify 的 v-card。

组件每次只允许导入一个文件，后续将添加多文件导入的功能。

![FileDrag组件示例图](assets/image-20201115205907662.png)

### slot 定义

| slot 名称     | 类型   | 默认值                   | 说明                                                     |
| ------------- | ------ | ------------------------ | -------------------------------------------------------- |
| uid           | String | file                     | 提供一个唯一的标识符，用于区分 DOM 里不同的 FileDrag组件 |
| title         | String | 添加文件                 | 组件标题                                                 |
| text          | String | 拖动文件到此处以添加文件 | 组件显示说明                                             |
| overlayText   | String | 松开鼠标以添加           | 鼠标拖动文件移至组件上显示的文字提示                     |
| dialogTitle   | String | 选择文件                 | 打开选择文件对话框的标题                                 |
| dialogFilters | Array  | []                       | 选择文件的后缀名，参考 electron 文档的 dialog 部分       |

### 事件定义

#### file-in

file-in 事件接受一个 JSON 参数：

```
{
	filePath: 'C:\',
	message: '',
	result: 0
}
```

- filePath - 文件路径，包含文件名
- message - 文件路径获取提示信息
- result - 文件路径获取提示结果

| result | message          |
| ------ | ---------------- |
| 0      | (空)             |
| 1      | 文件未选择       |
| 2      | 只能选择一个文件 |
| 3      | 文件后缀不符合   |

