<template>
    <div class="app-container">
        <!-- 过滤-->
        <div class="filter-container">
            <el-select
                v-model="gameId"
                :placeholder="'游戏'"
                clearable
                class="filter-item"
                style="width: 130px"
            >
                <el-option
                    v-for="item in calendarTypeOptions"
                    :key="item.id"
                    :label="item.gameName"
                    :value="item.gameId"
                />
            </el-select>
            <el-button
                class="filter-item"
                style="margin-left: 10px"
                type="primary"
                icon="el-icon-edit"
                @click="handleCreate"
                >{{ "新增配置" }}</el-button
            >
            <el-upload
                class="filter-item"
                :show-file-list="false"
                action="https://jsonplaceholder.typicode.com/posts/"
                :before-upload="parseCgf"
                :limit="3"
            >
                <el-button
                    class=""
                    style="margin-left: 10px"
                    icon="el-icon-upload2"
                    size="small"
                    type="success"
                    >解压配置</el-button
                >
            </el-upload>
        </div>
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="服务器配置" name="serveCfg">
                <!-- 表格 -->
                <el-table
                    :key="serveTableKey"
                    v-loading="listLoading"
                    :data="serveList"
                    element-loading-text="Loading"
                    border
                    fit
                    highlight-current-row
                >
                    <el-table-column label="配置名">
                        <template slot-scope="scope">{{
                            scope.row.cfgName
                        }}</template>
                    </el-table-column>
                    <el-table-column label="配置版本">
                        <template slot-scope="scope">{{
                            scope.row.version
                        }}</template>
                    </el-table-column>
                    <el-table-column label="游戏名称">
                        <template slot-scope="scope">{{
                            scope.row.gameName
                        }}</template>
                    </el-table-column>
                    <el-table-column label="创建时间">
                        <template slot-scope="scope">{{
                            scope.row.createdTime
                        }}</template>
                    </el-table-column>
                    <!-- 操作按钮 -->
                    <el-table-column
                        :label="'操作'"
                        align="center"
                        width="230"
                        class-name="fixed-width"
                    >
                        <template slot-scope="{ row, $index }">
                            <el-button
                                type="primary"
                                size="mini"
                                @click="handleUpdate(row)"
                                >{{ "编辑配置" }}</el-button
                            >
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
                                    v-if="row.status !== 'deleted'"
                                    size="mini"
                                    type="danger"
                                    slot="reference"
                                    >{{ "删除" }}</el-button
                                >
                            </el-popconfirm>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="客户端配置" name="clientCfg">
                <!-- 表格 -->
                <el-table
                    :key="clientTableKey"
                    v-loading="listLoading"
                    :data="clientList"
                    element-loading-text="Loading"
                    border
                    fit
                    highlight-current-row
                >
                    <el-table-column label="配置名">
                        <template slot-scope="scope">{{
                            scope.row.cfgName
                        }}</template>
                    </el-table-column>
                    <el-table-column label="配置版本">
                        <template slot-scope="scope">{{
                            scope.row.version
                        }}</template>
                    </el-table-column>
                    <el-table-column label="游戏名称">
                        <template slot-scope="scope">{{
                            scope.row.gameName
                        }}</template>
                    </el-table-column>
                    <el-table-column label="创建时间">
                        <template slot-scope="scope">{{
                            scope.row.createdTime
                        }}</template>
                    </el-table-column>
                    <!-- 操作按钮 -->
                    <el-table-column
                        :label="'操作'"
                        align="center"
                        width="230"
                        class-name="fixed-width"
                    >
                        <template slot-scope="{ row, $index }">
                            <el-button
                                type="primary"
                                size="mini"
                                @click="handleUpdate(row)"
                                >{{ "编辑配置" }}</el-button
                            >
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
                                    v-if="row.status !== 'deleted'"
                                    size="mini"
                                    type="danger"
                                    slot="reference"
                                    >{{ "删除" }}</el-button
                                >
                            </el-popconfirm>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>

        <!-- 弹窗(新建编辑) -->
        <el-dialog
            width="90%"
            :title="textMap[dialogStatus]"
            :visible.sync="dialogFormVisible"
        >
            <el-row>
                <el-col :span="6">
                    <span class="demonstration">历史版本查看选择</span>
                    <div
                        class="editor-container"
                        style="
                            height: 400px;
                            overflow-x: hidden;
                            overflow-y: auto;
                        "
                    >
                        <el-timeline>
                            <el-timeline-item
                                v-for="(activity, index) in activities"
                                v-loading="loading"
                                :key="index"
                                :icon="undefined"
                                :type="undefined"
                                :color="activity.color"
                                :size="undefined"
                                :timestamp="activity.createdTime"
                            >
                                {{ activity.version }}
                                <el-button
                                    type="mini"
                                    @click="historyClick(activity)"
                                    >{{ "选择" }}</el-button
                                >
                            </el-timeline-item>
                        </el-timeline>
                    </div>
                </el-col>
                <el-col :span="6" style="border-radius: 2px">
                    <span class="demonstration">配置文件信息编辑</span>

                    <el-form
                        ref="dataForm"
                        :rules="saveRules"
                        :model="tempCfgData"
                        label-position="left"
                        autocomplete="on"
                    >
                        <el-form-item :label="'配置名'" prop="cfgName">
                            <el-input
                                v-model="tempCfgData.cfgName"
                                name="cfgName"
                                type="text"
                                style="width: 100px"
                                placeholder="请输入名称"
                            />
                        </el-form-item>
                        <el-form-item :label="'配置版本'" prop="version">
                            <el-input
                                v-model="tempCfgData.version"
                                name="version"
                                type="text"
                                style="width: 100px"
                                placeholder="请输入版本号"
                            />
                        </el-form-item>
                        <el-form-item
                            v-if="cfgType === 1"
                            :label="'是否压缩合并'"
                        >
                            <el-switch
                                v-model="mergeValue"
                                @change="changeMergeValue"
                                active-color="#13ce66"
                                inactive-color="#ff4949"
                            >
                            </el-switch>
                        </el-form-item>
                        <el-form-item v-if="cfgType === 1" :label="'是否加密'">
                            <el-switch
                                v-model="encryptionValue"
                                @change="changeEncryptionValue"
                                active-color="#13ce66"
                                inactive-color="#ff4949"
                            >
                            </el-switch>
                        </el-form-item>
                        <upload-excel-component
                            :on-success="handleSuccess"
                            :before-upload="beforeUpload"
                        />
                        <div>
                            <el-form-item :label="'导出json文件'">
                                <el-button type="primary" @click="exportJson">{{
                                    "导出"
                                }}</el-button>
                            </el-form-item>
                        </div>
                    </el-form>
                </el-col>
                <el-col :span="12">
                    <span class="demonstration">配置文件信息预览</span>
                    <div
                        class="editor-container"
                        style="
                            height: 400px;
                            overflow-x: hidden;
                            overflow-y: auto;
                        "
                    >
                        <json-editor
                            ref="jsonEditor"
                            v-model="tempCfgData.body"
                        />
                    </div>
                </el-col>
            </el-row>

            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">{{
                    "取消"
                }}</el-button>
                <el-button type="primary" @click="showDiff()">{{
                    "保存"
                }}</el-button>
            </div>
        </el-dialog>
        <el-dialog
            width="90%"
            title="对比线上版本差异"
            :visible.sync="dialogFormVisibleCode"
        >
            <div id="view" ref="view"></div>

            <!-- <p v-html="code"></p> -->
            <div slot="footer" class="dialog-footer">
                <el-button
                    type="primary"
                    @click="
                        dialogStatus === 'create' ? createData() : updateData()
                    "
                    >{{ "提交更新" }}</el-button
                >
            </div>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Form, Input } from "element-ui";
import { Component, Vue } from "vue-property-decorator";
import { exportJson2Excel } from "@/utils/common/excel";
import JsonEditor from "@/components/JsonEditor/index.vue";
import UploadExcelComponent from "@/components/UploadExcel/index.vue";
import {
    cfgByCfgId,
    createCfg,
    delectCfg,
    getCfgList,
    updateCfg,
} from "@/api/cfg/cfg";
import { Cfg } from "@/entity/cfg/Cfg";
import { BaseGame } from "@/entity/game/Game";
import { getGameList } from "@/api/game/game";
import XLSX from "xlsx";
import CodeMirror from "codemirror";
import {
    diff_match_patch,
    DIFF_EQUAL,
    DIFF_DELETE,
    DIFF_INSERT,
} from "diff-match-patch";
import { parse } from "path";
// 核心样式
import "codemirror/lib/codemirror.css";
// 引入主题后还需要在 options 中指定主题才会生效
import "codemirror/theme/idea.css";
// 需要引入具体的语法高亮库才会有对应的语法高亮效果
// codemirror 官方其实支持通过 /addon/mode/loadmode.js 和 /mode/meta.js 来实现动态加载对应语法高亮库
// 但 vue 貌似没有无法在实例初始化后再动态加载对应 JS ，所以此处才把对应的 JS 提前引入
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/css/css.js";
import "codemirror/mode/xml/xml.js";
import "codemirror/mode/shell/shell.js";
import "codemirror/mode/sql/sql.js";

//代码补全提示
import "codemirror/addon/hint/anyword-hint.js";
import "codemirror/addon/hint/css-hint.js";
import "codemirror/addon/hint/html-hint.js";
import "codemirror/addon/hint/javascript-hint.js";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/sql-hint.js";
import "codemirror/addon/hint/xml-hint.js";

//代码版本差异比较
import "codemirror/addon/merge/merge.js";
import "codemirror/addon/merge/merge.css";
import { StaticStr } from "@/config/StaticStr";
import { encryption } from "@/utils/encryption";
// DiffMatchPatch config with global
window.diff_match_patch = diff_match_patch;
window.DIFF_DELETE = -1;
window.DIFF_INSERT = 1;
window.DIFF_EQUAL = 0;

const calendarTypeOptions: any = [];
@Component({
    name: "Cfg",
    components: {
        JsonEditor,
        UploadExcelComponent,
    },
})
export default class extends Vue {
    private serveTableKey = 0;
    private clientTableKey = 0;
    private serveList: Cfg[] = [];
    private clientList: Cfg[] = [];
    private listLoading = true;
    private loading = true;
    // 弹窗上的字符
    private dialogStatus = "";
    // 控制弹窗显示
    private dialogFormVisible = false;
    private dialogFormVisibleCode = false;
    private dialogFormDelete = false;
    private tempCfgData: Cfg = new Cfg();
    // 默认选中
    private activeName = "serveCfg";
    private calendarTypeOptions = calendarTypeOptions;
    private activities = new Array();
    private oldStr: any;
    private newStr: any;
    private code = "";
    // 当前配置类型 0:服务器类型,1:客户端类型
    private cfgType = 0;
    private mergeValue: boolean = this.tempCfgData.merge === 1;
    private encryptionValue: boolean = this.tempCfgData.encryption === 1;

    // 选择游戏
    private gameId = "";
    private textMap = {
        update: "编辑",
        create: "创建",
    };
    /**
     * 绑定表单对应方法和事件
     */
    private saveRules = {
        cfgName: [{ required: true, message: "必选项", trigger: "change" }],
        version: [{ required: true, message: "必选项", trigger: "change" }],
    };
    /**
     * 生命周期方法
     * 在模板渲染成html前调用，即通常初始化某些属性值，然后再渲染成视图。
     */
    created() {
        this.getData();
    }
    /**
     * 点击切换查看列表
     */
    handleClick(tab: any, event: any) {
        if (tab.name === "clientCfg") {
            this.cfgType = 1;
        } else {
            this.cfgType = 0;
        }
    }
    /**
     * 点击选择历史版本
     */
    historyClick(row: any) {
        this.tempCfgData = row;
        try {
            this.tempCfgData.body = JSON.parse(this.tempCfgData.body);
        } catch (error) {}
    }
    /**
     * Excel读取成功
     */
    private handleSuccess({
        results,
        header,
        fileName,
    }: {
        results: any[];
        header: string[];
        fileName: string;
    }) {
        // 判断表格属性约定是否正确
        // 判断数据类型定义是否正确
        if (!this.verifyExcel(header, results)) {
            return;
        }
        // 加载文件
        this.loadExcel(header, results);
        this.$notify({
            title: StaticStr.SUCCESS_CODE_CREATE,
            message: "加载Excel完成!",
            type: "success",
            duration: StaticStr.CODE_TIME,
        });
        this.newStr = this.tempCfgData.body;
        this.tempCfgData.cfgName = fileName.substring(
            0,
            fileName.lastIndexOf(".")
        );
    }
    /**
     * 解密配置文件
     */
    private parseCgf(rawFile: File) {
        const reader = new FileReader();
        reader.readAsText(rawFile);
        const name = rawFile.name.substring(0, rawFile.name.lastIndexOf("."));
        reader.onload = async (e) => {
            const data = (e.target as FileReader).result;
            const json = encryption.aesDecrypt(data, StaticStr.CFG_KEY);
            let link = document.createElement("a");
            link.download = name + ".json";
            // 验证是否选择文件
            link.href = "data:text/plain," + json;
            link.click();
        };
    }
    /**
     * 解析加载Excel文件
     */
    private loadExcel(header: string[], results: any[]) {
        try {
            // 定义json文件
            let objJson: any = {};
            let listJson: any = [];
            // header默认为第一行,数据行对照Excel需要-1
            let valIndex = 2;
            for (let i = 0; i < results.length; i++) {
                // 数据行下标
                valIndex += 1;
                // 最后一行停止
                if (results[valIndex] === undefined) {
                    break;
                }
                // 判断数据类型
                if (results[1][header[0]] === "key") {
                    const valKeys = Object.keys(results[valIndex]);
                    // key-value对象
                    // 拿到key(数据行第一列)
                    const key = results[valIndex][valKeys[0]];
                    // 拿到value(obj)
                    const val: any = {};
                    // 拿到第二行列名称,数据行对照Excel需要-1
                    const valKeys2 = Object.keys(results[0]);
                    for (let j = 0; j < valKeys2.length; j++) {
                        // 类型
                        const type = results[1][valKeys2[j]];
                        //列名
                        const listing = results[0][valKeys2[j]];
                        // 数据
                        const data = results[valIndex][valKeys2[j]];
                        if (type !== "unexport") {
                            val[listing] = this.parseString(
                                type,
                                data,
                                key,
                                listing
                            );
                        }
                    }
                    objJson[key] = val;
                }
                if (results[1][header[0]] === "index") {
                    // 拿到key(数据行第一列)
                    let obj: any = {};
                    const valKeys2 = Object.keys(results[0]);
                    const key = results[valIndex][valKeys2[0]];
                    for (let j = 0; j < valKeys2.length; j++) {
                        // 类型
                        const type = results[1][valKeys2[j]];
                        //列名
                        const listing = results[0][valKeys2[j]];
                        // 数据
                        const data = results[valIndex][valKeys2[j]];
                        if (type !== "unexport") {
                            obj[listing] = this.parseString(
                                type,
                                data,
                                key,
                                listing
                            );
                        }
                    }
                    listJson.push(obj);
                }
                if (results[1][header[0]] === "table") {
                    const valKeys = Object.keys(results[valIndex]);
                    // key-value对象
                    // 拿到key(数据行第一列)
                    const key = results[valIndex][valKeys[0]];
                    // 拿到第二行列名称,数据行对照Excel需要-1
                    const valKeys2 = Object.keys(results[0]);
                    for (let j = 0; j < valKeys2.length; j++) {
                        // 类型
                        const type = results[1][valKeys2[j]];
                        //列名
                        const listing = results[0][valKeys2[j]];
                        // 数据
                        const data = results[valIndex][valKeys2[j]];
                        if (type !== "unexport") {
                            objJson[key] = this.parseString(
                                type,
                                data,
                                key,
                                listing
                            );
                        }
                    }
                }
            }
            if (JSON.stringify(objJson) !== "{}") {
                this.tempCfgData.body = objJson;
            }
            if (JSON.stringify(objJson) === "{}") {
                this.tempCfgData.body = listJson;
            }
        } catch (error) {
            console.error(error);
            this.$notify({
                title: "提示",
                message: "Excel解析未知错误!请检查数据是否正常",
                type: "warning",
                duration: StaticStr.CODE_TIME,
            });
        }
    }
    /**
     * 根据类型解析成对应数据
     * key:第一行数据列
     * listing:列数据
     */
    private parseString(type: string, data: any, key: string, listing: string) {
        if (data === undefined) {
            this.$notify({
                title: "提示",
                message: `Excel解析错误! 在:${key}行,${listing}列处有空字符或填写错误`,
                type: "warning",
                duration: StaticStr.CODE_TIME,
            });
            return undefined;
        }
        if (data.toString().trim() === "") {
            this.$notify({
                title: "提示",
                message: `Excel解析错误! 在:${key}行,${listing}列处有空字符或填写错误`,
                type: "warning",
                duration: StaticStr.CODE_TIME,
            });
            return undefined;
        }
        let objValue: any;
        // 判断数据类型
        if (type === "string") {
            objValue = data.toString();
            // 判断是否是数组
            if (objValue.indexOf("[") !== -1) {
                type = "array";
                objValue = this.parseString(type, data, key, listing);
            }
        }
        if (type === "array") {
            try {
                const nodeValue: any[] = eval(data);
                objValue = nodeValue;
            } catch (error) {
                this.$notify({
                    title: "提示",
                    message: `Excel解析错误! 在:${key}行,${listing}列处有空字符或填写错误`,
                    type: "warning",
                    duration: StaticStr.CODE_TIME,
                });
                return undefined;
            }
        }
        if (type === "int") {
            objValue = Math.floor(Number(data));
        }
        if (type === "float") {
            objValue = Number(data);
        }
        if (type === "mearge") {
            type = typeof data;
            objValue = this.parseString(type, data, key, listing);
        }
        // list 类型第一行会是index
        if (type === "index") {
            type = typeof data;
            objValue = this.parseString(type, data, key, listing);
        }
        if (type === "table") {
            objValue = data.toString();
        }

        return objValue;
    }
    /**
  verifyExcel(header: string[], results: any[]) {
   * 验证属性设置
   */
    private verifyExcel(header: string[], results: any[]) {
        // header[0] 多语言标记
        // cn，默认值/en/。。。其他
        const Language = ["cn", "en", "。。。"];
        // wx（小游戏）， 默认wx/app（android、ios）
        const platform = ["wx", "app"];
        // client（客户端）/server（服务端）/client&server（两端）
        const use = ["client", "server", "client&server"];
        if (Language.indexOf(header[0]) === -1) {
            this.$notify({
                title: "提示",
                message: "语言标记未设置或页面格式错误!(默认读取第一页)",
                type: "warning",
                duration: StaticStr.CODE_TIME,
            });
            return false;
        }
        // 如果字符为...则替换为en
        if (header[0] === "。。。") {
            header[0] = "cn";
        }
        if (platform.indexOf(header[1]) === -1) {
            this.$notify({
                title: "提示",
                message: "Excel平台属性未设置或格式错误!",
                type: "warning",
                duration: StaticStr.CODE_TIME,
            });
            return false;
        }
        if (use.indexOf(header[2]) === -1) {
            this.$notify({
                title: "提示",
                message: "Excel用途属性未设置或格式错误!",
                type: "warning",
                duration: StaticStr.CODE_TIME,
            });
            return false;
        }
        // 判断数据类型设置
        const tpyeP = ["index", "table", "key"];
        if (tpyeP.indexOf(results[1][header[0]]) === -1) {
            this.$notify({
                title: "提示",
                message: "第三列数据类型设置错误!(支持:index/table/key)",
                type: "warning",
                duration: StaticStr.CODE_TIME,
            });
            return false;
        }
        return true;
    }
    /**
     * 选择文件
     */
    private beforeUpload(file: File) {
        // 判断文件格式
        if (!/\.(xls|xlsx|xlsm)$/.test(file.name.toLowerCase())) {
            this.$notify({
                title: "提示",
                message: "上传格式不正确，请上传xls/xlsx/xlsm格式",
                type: "warning",
                duration: StaticStr.CODE_TIME,
            });
            return false;
        }
        return true;
    }
    /**
     * 初始化数据
     */
    private async getData() {
        const games = await getGameList();
        this.calendarTypeOptions = games.data;
        this.gameId = this.calendarTypeOptions[0].gameId;
        const data = await getCfgList({ gameId: this.gameId });
        // 获取对应服务器配置/客户端配置
        const cfgs: Array<Cfg> = data.data;
        cfgs.forEach((v) => {
            if (v.type === 0) {
                // 服务器配置
                this.serveList.push(v);
            } else {
                // 客户端配置
                this.clientList.push(v);
            }
        });
        this.listLoading = false;
    }
    /**
     * 创建
     */
    private handleCreate() {
        if (this.gameId === "") {
            this.$notify({
                title: "提示",
                message: `请先选择对应游戏!`,
                type: "warning",
                duration: StaticStr.CODE_TIME,
            });
            return;
        }
        // 清理当前对象数据
        this.tempCfgData = new Cfg();
        // 设置默认值
        // 定义类型
        this.tempCfgData.type = this.cfgType;
        this.tempCfgData.version = "0.1";
        this.tempCfgData.merge = 0;
        this.tempCfgData.encryption = 0;
        this.mergeValue = this.tempCfgData.merge === 1;
        this.encryptionValue = this.tempCfgData.encryption === 1;
        let gameName = "";
        this.newStr = undefined;
        this.oldStr = undefined;
        this.calendarTypeOptions.forEach((element: BaseGame) => {
            if (element.gameId === this.gameId) {
                gameName = element.gameName;
            }
        });
        // 设置对应的gameId
        this.tempCfgData.gameId = this.gameId;
        this.tempCfgData.gameName = gameName;
        this.dialogStatus = "create";
        this.dialogFormVisible = true;
        this.activities = [];
        this.$nextTick(() => {
            (this.$refs.dataForm as Form).clearValidate();
        });
    }
    /**
     * 状态
     */
    changeMergeValue(state: boolean) {
        state ? (this.tempCfgData.merge = 1) : (this.tempCfgData.merge = 0);
    }
    /**
     * 状态
     */
    changeEncryptionValue(state: boolean) {
        state
            ? (this.tempCfgData.encryption = 1)
            : (this.tempCfgData.encryption = 0);
    }
    /**
     * 显示对比
     */
    private showDiff() {
        if (this.dialogStatus === "create") {
            this.createData();
            return;
        }
        // 验证是否选择文件
        if (this.newStr === undefined) {
            this.updateData();
            return;
        }
        this.dialogFormVisibleCode = true;
        /**
         * 延时执行dom加载完成调用
         */
        setTimeout((v) => {
            var target: any = this.$refs["view"]; //获取dom元素
            target.innerHTML = ""; //每次dom元素的内容清空
            CodeMirror.MergeView(this.$refs.view as HTMLTextAreaElement, {
                value: JSON.stringify(this.newStr, null, 2), //上次内容
                origLeft: null,
                orig: JSON.stringify(this.oldStr, null, 2), //本次内容
                lineNumbers: false, //显示行号
                connect: "align",
                readOnly: false, //只读 不可修改
                revertButtons: false, //事件比较替换
                mode: "application/json",
            });
        }, 1000);
    }
    /**
     * 创建保存
     */
    private createData() {
        (this.$refs.dataForm as Form).validate(async (valid) => {
            if (valid) {
                const { data } = await createCfg(this.tempCfgData);
                if (data !== undefined) {
                    if (this.cfgType === 0) {
                        this.serveList.unshift(data);
                    } else {
                        this.clientList.unshift(data);
                    }
                    this.dialogFormVisibleCode = false;
                    this.dialogFormVisible = false;
                    this.$notify({
                        title: StaticStr.SUCCESS_CODE_CREATE,
                        message: StaticStr.SUCCESS_CODE_CREATE_STR,
                        type: "success",
                        duration: StaticStr.CODE_TIME,
                    });
                }
            }
        });
    }
    /**
     * 修改保存
     */
    private async updateData() {
        (this.$refs.dataForm as Form).validate(async (valid) => {
            if (valid) {
                // 设置上对应的值
                await updateCfg(this.tempCfgData);
                this.$notify({
                    title: StaticStr.SUCCESS_CODE_CREATE,
                    message: StaticStr.SUCCESS_CODE_SAVE_STR,
                    type: "success",
                    duration: StaticStr.CODE_TIME,
                });
                this.dialogFormVisible = false;
                this.dialogFormVisibleCode = false;
            }
        });
    }
    /**
     * 导出json文件
     */
    private async exportJson() {
        let link = document.createElement("a");
        link.download = this.tempCfgData.cfgName + ".json";
        // 验证是否选择文件
        if (this.newStr === undefined) {
            link.href =
                "data:text/plain," + JSON.stringify(this.tempCfgData.body);
        } else {
            link.href = "data:text/plain," + this.tempCfgData.body;
        }
        link.click();
    }
    /**
     * 编辑配置信息
     */
    private async handleUpdate(row: Cfg) {
        this.tempCfgData = row;
        try {
            this.tempCfgData.body = JSON.parse(this.tempCfgData.body);
        } catch (error) {}
        this.oldStr = this.tempCfgData.body;
        this.newStr = undefined;
        this.dialogStatus = "update";
        this.dialogFormVisible = true;
        // 获取历史版本
        const data = await cfgByCfgId({ cfgId: row.cfgId });
        this.mergeValue = this.tempCfgData.merge === 1;
        this.encryptionValue = this.tempCfgData.encryption === 1;
        this.activities = [];
        data.data.forEach((v: Cfg) => {
            const activitie = {
                color: "#dfe4ed",
                createdTime: v.createdTime,
                version: v.version,
            };
            if (v.state === 1) {
                activitie.color = "#0bbd87";
                this.tempCfgData.version = (Number(v.version) + 0.1).toFixed(1); // 自动根据最新版设置版本号, 每次自动加0.1
            }
            this.activities.push(activitie);
        });
        this.loading = false;
    }

    /**
     * 删除角色信息
     */
    private async handleDelete(row: any, index: number) {
        await delectCfg(row);
        this.$notify({
            title: StaticStr.SUCCESS_CODE_CREATE,
            message: StaticStr.SUCCESS_CODE_DEL_STR,
            type: "success",
            duration: StaticStr.CODE_TIME,
        });
        if (row.type === 0) {
            this.serveList.splice(index, 1);
        } else {
            this.clientList.splice(index, 1);
        }
    }
}
</script>
<style lang="scss" scoped>
.editor-container {
    position: relative;
    height: 100%;
}
.el-col {
    padding: 10px;
}
.el-timeline-item {
    padding: 20px 0px;
}
</style>