<template>
  <div class="app-container">
    <!-- 过滤-->
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        :placeholder="'游戏名'"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.status"
        :placeholder="'当前状态'"
        clearable
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in calendarTypeOptions"
          :key="item.id"
          :label="item.label"
          :value="item.id"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >{{ "搜索" }}</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >{{ "新增" }}</el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >{{ "导出" }}</el-button>
    </div>
    <!-- 表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      @sort-change="sortChange"
    >
      <el-table-column fixed label="游戏图标" width="100" align="center">
        <el-avatar
          slot-scope="scope"
          shape="square"
          size="medium"
          :headers="headers"
          :src="downloadFileUrl+scope.row.icon"
        ></el-avatar>
      </el-table-column>
      <el-table-column label="游戏名" width="100" align="center">
        <template slot-scope="scope">{{ scope.row.gameName }}</template>
      </el-table-column>
      <el-table-column label="gameId" width="100" align="center">
        <template slot-scope="scope">{{ scope.row.gameId }}</template>
      </el-table-column>
      <el-table-column label="目录名" width="100" align="center">
        <template slot-scope="scope">{{ scope.row.gamePath }}</template>
      </el-table-column>
      <el-table-column label="当前状态" width="100" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.status =='0'">立项</span>
          <span v-if="scope.row.status =='1'">开发</span>
          <span v-if="scope.row.status =='2'">测试</span>
          <span v-if="scope.row.status =='3'">上线</span>
          <span v-if="scope.row.status =='4'">下线</span>
        </template>
      </el-table-column>
      <el-table-column label="公司团队" width="100" align="center">
        <template slot-scope="scope">{{ scope.row.team }}</template>
      </el-table-column>
      <el-table-column label="人员安排" width="400" align="center">
        <template slot-scope="scope">{{ scope.row.staffGear }}</template>
      </el-table-column>
      <el-table-column label="版本号" width="80" align="center">
        <template slot-scope="scope">{{ scope.row.version }}</template>
      </el-table-column>
      <el-table-column label="描述信息" width="400" align="center">
        <template slot-scope="scope">{{ scope.row.doc }}</template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="创建时间" width="180">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.createdTime}}</span>
        </template>
      </el-table-column>
      <!-- 操作按钮 -->
      <el-table-column
        fixed="right"
        :label="'操作'"
        align="center"
        width="230"
        class-name="fixed-width"
      >
        <template slot-scope="{row, $index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">{{ "编辑" }}</el-button>

          <el-popconfirm
            confirmButtonText="确认"
            cancelButtonText="取消"
            icon="el-icon-info"
            iconColor="red"
            title="确认删除吗?"
            @onConfirm="handleDelete(row, $index)"
            @keyup.enter.native="handleDelete(row, $index)"
          >
            <el-button
              v-if="row.status!=='deleted'"
              size="mini"
              type="danger"
              slot="reference"
            >{{ "删除" }}</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 弹窗(新建编辑) -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="saveRules"
        :model="tempBaseGameData"
        label-position="left"
        label-width="100px"
        autocomplete="on"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item :label="'游戏图标'" prop="status">
          <el-upload
            class="avatar-uploader"
            :action="baseUrl"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :headers="headers"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item :label="'游戏名'" prop="gameName">
          <el-input
            v-model="tempBaseGameData.gameName"
            name="gameName"
            type="text"
            style="width: 200px;"
            placeholder="请输入游戏名"
          />
        </el-form-item>
        <el-form-item :label="'gameId'" prop="gameId">
          <el-input
            v-model="tempBaseGameData.gameId"
            name="gameId"
            type="text"
            style="width: 200px;"
            placeholder="请输入gameId"
          />
        </el-form-item>
        <el-form-item :label="'目录名'" prop="gamePath">
          <el-input
            v-model="tempBaseGameData.gamePath"
            name="gamePath"
            type="text"
            style="width: 200px;"
            placeholder="请输入cdn目录名"
          />
        </el-form-item>
        <el-form-item :label="'版本号'" prop="version">
          <el-input
            v-model="tempBaseGameData.version"
            name="version"
            type="text"
            style="width: 200px;"
            placeholder="请输入版本号"
          />
        </el-form-item>
        <el-form-item :label="'公司团队'" prop="team">
          <el-input
            v-model="tempBaseGameData.team"
            name="team"
            type="text"
            style="width: 200px;"
            placeholder="请输入团队名称"
          />
        </el-form-item>
        <el-form-item :label="'人员安排'" prop="staffGear">
          <el-input
            v-model="tempBaseGameData.staffGear"
            name="staffGear"
            type="text"
            style="width: 200px;"
            placeholder="请输入人员安排"
          />
        </el-form-item>
        <el-form-item :label="'当前状态'" prop="status">
          <el-select v-model="tempBaseGameData.status" class="filter-item" placeholder="请选择">
            <el-option
              v-for="item2 in calendarTypeOptions"
              :key="item2.id"
              :label="item2.label"
              :value="item2.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="'描述信息'" prop="doc">
          <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="tempBaseGameData.doc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ "取消" }}</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >{{"保存" }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { startLoading, endLoading, formatJson } from "@/utils/common/utils";
import { exportJson2Excel } from "@/utils/common/excel";
import { Form, Input } from "element-ui";
import Pagination from "@/components/Pagination/index.vue";
import {
  getGames,
  delectBaseGame,
  updateBaseGame,
  createBaseGame,
  updateFileUrl,
  downloadFileUrl,
} from "@/api/game/game";
import { getRoles } from "@/api/auth/role";
import { BaseGame } from "@/entity/game/Game";
import { getToken } from "@/utils/cookies";
import { Paging } from "@/utils/Type";

const calendarTypeOptions: any = [];
@Component({
  name: "Table",
  components: {
    Pagination,
  },
})
export default class extends Vue {
  private tableKey = 0;
  private list: BaseGame[] = [];
  private listLoading = true;
  private baseUrl = updateFileUrl;
  private downloadFileUrl = downloadFileUrl;
  // 分页对象
  private total = 0;
  private listQuery: Paging = {
    page: 1,
    limit: 10,
    condition: {
      name: "",
      status: "",
    },
  };
  private downloadLoading = false;
  // 弹窗上的字符
  private dialogStatus = "";
  // 控制弹窗显示
  private dialogFormVisible = false;
  private dialogFormDelete = false;
  private imageUrl = "";
  private tempBaseGameData: BaseGame = new BaseGame();
  private textMap = {
    update: "编辑",
    create: "创建",
  };
  //select
  private calendarTypeOptions = calendarTypeOptions;
  private pageviewsData = [];
  private headers = { authentication: getToken() };
  private rolesData: any = null;
  /**
   * 绑定表单对应方法和事件
   */
  private saveRules = {
    name: [{ required: true, message: "必填项", trigger: "blur" }],
  };
  /**
   * 生命周期方法
   * 在模板渲染成html前调用，即通常初始化某些属性值，然后再渲染成视图。
   */
  created() {
    this.getList();
  }
  /**
   * 文件上传成功
   */
  handleAvatarSuccess(res: any, file: { raw: any }) {
    this.tempBaseGameData.icon = res.data;
    this.imageUrl = URL.createObjectURL(file.raw);
  }
  /**
   * 文件上传以前
   */
  beforeAvatarUpload(file: any) {
    const isJPG = file.type === "image/jpeg";
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isJPG) {
      this.$message.error("上传头像图片只能是 JPG 格式!");
    }
    if (!isLt2M) {
      this.$message.error("上传头像图片大小不能超过 2MB!");
    }
    return isJPG && isLt2M;
  }
  /**
   * 获取游戏数据
   */
  private async getList() {
    startLoading(this.listLoading);
    const { data } = await getGames(this.listQuery);
    this.calendarTypeOptions = [
      { id: 0, label: "立项" },
      { id: 1, label: "开发" },
      { id: 2, label: "测试" },
      { id: 3, label: "上线" },
      { id: 4, label: "下线" },
    ];
    this.list = data.items;
    this.total = data.total;
    // 模拟加载中结束
    this.listLoading = false;
  }
  /**
   * 创建游戏
   */
  private handleCreate() {
    // 清理当前对象数据
    this.imageUrl = "";
    this.tempBaseGameData = new BaseGame();
    this.dialogStatus = "create";
    this.dialogFormVisible = true;
    this.$nextTick(() => {
      (this.$refs.dataForm as Form).clearValidate();
    });
  }
  /**
   * 搜索
   */
  private async handleFilter() {
    this.listQuery.page = 1;
    startLoading(this.listLoading);
    const { data } = await getGames(this.listQuery);
    this.list = data.items;
    this.total = data.total;
    // 模拟加载中结束
    this.listLoading = false;
  }
  /**
   * 导出Excel
   */
  private handleDownload() {
    this.downloadLoading = true;
    const tHeader = ["gameName", "title", "type", "importance", "status"];
    const filterVal = ["gameName", "title", "type", "importance", "status"];
    const data = formatJson(filterVal, this.list);
    exportJson2Excel(tHeader, data, "table-list");
    this.downloadLoading = false;
  }
  private sortChange(data: any) {
    const { prop, order } = data;
    if (prop === "id") {
    }
  }
  /**
   * 创建游戏信息
   */
  private createData() {
    (this.$refs.dataForm as Form).validate(async (valid) => {
      if (valid) {
        const { data } = await createBaseGame(this.tempBaseGameData);
        data.timestamp = Date.parse(data.timestamp);
        this.list.unshift(data);
        this.dialogFormVisible = false;
        this.$notify({
          title: "成功",
          message: "创建成功",
          type: "success",
          duration: 2000,
        });
      }
    });
  }
  /**
   * 修改游戏信息
   */
  private updateData() {
    (this.$refs.dataForm as Form).validate(async (valid) => {
      if (valid) {
        const tempData = Object.assign({}, this.tempBaseGameData);
        const { data } = await updateBaseGame(tempData);
        const index = this.list.findIndex((v) => v.id === data.id);
        this.list.splice(index, 1, data);
        this.dialogFormVisible = false;
        this.$notify({
          title: "成功",
          message: "更新成功",
          type: "success",
          duration: 2000,
        });
      }
    });
  }

  /**
   * 编辑游戏信息
   */
  private handleUpdate(row: BaseGame) {
    this.imageUrl = downloadFileUrl + row.icon;
    this.tempBaseGameData = Object.assign({}, row);
    this.dialogStatus = "update";
    this.dialogFormVisible = true;
    this.$nextTick(() => {
      (this.$refs.dataForm as Form).clearValidate();
    });
  }

  /**
   * 删除游戏信息
   */
  private async handleDelete(row: any, index: number) {
    const { data } = await delectBaseGame(row);
    this.$notify({
      title: "成功",
      message: "删除成功",
      type: "success",
      duration: 200,
    });
    this.list.splice(index, 1);
  }
}
</script>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 68px;
  height: 48px;
  line-height: 58px;
  text-align: center;
}
.avatar {
  width: 68px;
  height: 48px;
  display: block;
}
</style>