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

1DIVN 程序的输入文件包含很多参数，而且经过改动的程序对输入文件要求也不尽相同，因此通过一个配置文件来定义输入文件内参数及其位置范围。

## 配置文件

配置文件格式为 JSON，

### 配置文件键值

| 键名        | 类型   | 说明         |
| ----------- | ------ | ------------ |
| name        | String | 配置文件标题 |
| author      | String | 配置文件作者 |
| description | String | 配置文件说明 |
| configs     | array  | 参数定义     |

参考模板如下：

```json
{
	name: 'Default Config',
	author: 'jungtravor',
	descripion: '1DIVN Input File Editor',
	configs: [
		{
			var: 'N',
			description: '压气机级数',
			type: 'number',
			row: 1,
			width: 2
		},
		{
			var: 'P1',
			description: '进口总压',
			type: 'float',
			row: 1,
			width: 2
		},
		{
			var: 'AH1',
			description: '每级压头损耗系数',
            dimension: 1,
            length: 'N',
			array: [
				{
					type: 'float',
                    label: '第&i级'
				}
			],
            vertical: true,
			row: 2
		}
	]
}
```



# Vue 组件说明

所有自定义的 Vue 组件均在 `/src/renderer/components/common` 目录下，直接在 `main.js` 中引用。

## 1、FileDrag

FileDrag 组件提供了读取文件路径的方法，其框架是 Vuetify 的 v-card。

组件每次只允许导入一个文件，后续将添加多文件导入的功能。

![FileDrag组件示例图](assets/image-20201115205907662.png)

### slot 定义

| slot 名称   | 类型   | 默认值                   | 说明                                                     |
| ----------- | ------ | ------------------------ | -------------------------------------------------------- |
| uid         | String | file                     | 提供一个唯一的标识符，用于区分 DOM 里不同的 FileDrag组件 |
| title       | String | 添加文件                 | 组件标题                                                 |
| text        | String | 拖动文件到此处以添加文件 | 组件显示说明                                             |
| overlayText | String | 松开鼠标以添加           | 鼠标拖动文件移至组件上显示的文字提示                     |

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

