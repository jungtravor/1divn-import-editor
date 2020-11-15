<template>
    <v-container fluid>
        <h1>输入文件格式管理</h1>
        <v-row>
            <v-col cols="6">
                <v-card height="100%">
                    <v-card-title>当前配置文件：{{activeConfig}}</v-card-title>
                    <v-card-text v-if="activeConfig===''">

                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="6">
                <file-drag
                        uid="test"
                        title="添加文件"
                        v-on:file-in="getFilePath"
                ></file-drag>
            </v-col>
        </v-row>
        <v-card>
            <v-card-title>
                配置文件列表
                <v-spacer></v-spacer>
                <v-btn
                        dark
                        :color="configEditButtonColor[configEditing ? 1 : 0]"
                >{{configEditButtonText[configEditing ? 1 : 0]}}</v-btn>
            </v-card-title>
            <v-list
                    flat
                    :disabled="configEditing"
            >
                <v-list-item-group
                        v-model="configSelected"
                        color="primary"
                        mandatory
                >
                    <v-list-item
                            v-for="(item, i) in configs"
                            :key="i"
                            @click="activeConfig = configs[configSelected-1]"
                    >
                        <v-list-item-icon>
                            <v-icon v-if="i===configSelected">mdi-check</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            {{item.name}}
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-btn icon>
                                <v-icon>mdi-eye</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-card>
    </v-container>
</template>

<script>
  // const fs = require('fs')
  export default {
    name: 'index',
    data () {
      return {
        activeConfig: '无',
        configs: [
          {
            name: '测试文件',
            status: 0
          },
          {
            name: '测试文件2',
            status: 1
          }
        ],
        configEditing: false,
        configEditButtonText: ['编辑', '完成'],
        configEditButtonColor: ['primary', 'red'],
        configSelected: 1,
        configStatus: [
          {available: 'mdi-check'},
          {available: ''}
        ],
        fileAdderOverlay: false
      }
    },
    methods: {
      test () {
        console.log(this.configSelected)
      },
      getFilePath (event) {
        console.log(event)
      }
    },
    created () {
      // console.log(this.$router)
    }
  }
</script>

<style scoped>

</style>
