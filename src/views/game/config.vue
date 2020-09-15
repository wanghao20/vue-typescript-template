<template>
  <div class="app-container">
    <el-input placeholder="输入关键字搜索设置" style="margin-bottom:30px;" />
    <div
      class="custom-tree-container"
      style=" height: 600px;
    overflow-x: hidden;
    overflow-y: auto;"
    >
      <el-form ref="configForm">
        <el-form-item label="前端开关配置" prop="name">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="分享信息配置" prop="name">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="服务开关配置" prop="name">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="导出配置" prop="name">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="广告配置" prop="name">
          <el-input></el-input>
        </el-form-item>
        <el-button type="primary" style="width:100%; margin-bottom:30px;">保存</el-button>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { UserModule } from "@/store/modules/user";

@Component({
  name: "Config",
})
export default class extends Vue {}
</script>

<style lang="scss" scoped>
</style>
