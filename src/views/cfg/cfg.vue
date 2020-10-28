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
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="success"
        icon="el-icon-upload2"
        @click="parseCgf"
        >{{ "解压配置" }}</el-button
      >
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
            <template slot-scope="scope">{{ scope.row.cfgName }}</template>
          </el-table-column>
          <el-table-column label="配置版本">
            <template slot-scope="scope">{{ scope.row.version }}</template>
          </el-table-column>
          <el-table-column label="游戏名称">
            <template slot-scope="scope">{{ scope.row.gameName }}</template>
          </el-table-column>
          <el-table-column label="创建时间">
            <template slot-scope="scope">{{ scope.row.createdTime }}</template>
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
            <template slot-scope="scope">{{ scope.row.cfgName }}</template>
          </el-table-column>
          <el-table-column label="配置版本">
            <template slot-scope="scope">{{ scope.row.version }}</template>
          </el-table-column>
          <el-table-column label="游戏名称">
            <template slot-scope="scope">{{ scope.row.gameName }}</template>
          </el-table-column>
          <el-table-column label="创建时间">
            <template slot-scope="scope">{{ scope.row.createdTime }}</template>
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
            style="height: 400px; overflow-x: hidden; overflow-y: auto"
          >
            <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in activities"
                v-loading="loading"
                :key="index"
                :icon="undefined"
                :type="undefined"
                :color="activity.state === 1 ? '#0bbd87' : 'large'"
                :size="undefined"
                :timestamp="activity.createdTime"
              >
                {{ activity.version }}
                <el-button type="mini" @click="historyClick(activity)">{{
                  "选择"
                }}</el-button>
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
            <el-form-item v-if="cfgType === 1" :label="'是否压缩合并'">
              <el-switch
                v-model="mergeValue"
                active-color="#13ce66"
                inactive-color="#ff4949"
              >
              </el-switch>
            </el-form-item>
            <el-form-item v-if="cfgType === 1" :label="'是否加密'">
              <el-switch
                v-model="encryptionValue"
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
            style="height: 400px; overflow-x: hidden; overflow-y: auto"
          >
            <json-editor ref="jsonEditor" v-model="tempCfgData.body" />
          </div>
        </el-col>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ "取消" }}</el-button>
        <el-button type="primary" @click="showDiff()">{{ "保存" }}</el-button>
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
          @click="dialogStatus === 'create' ? createData() : updateData()"
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
import { isNull, isUndefined } from "util";
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
  // 是否加密
  private encryptionValue = false;
  // 是否压缩合并
  private mergeValue = false;

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
  }: {
    results: any[];
    header: string[];
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
  }
  /**
   * 解密配置文件
   */
  private parseCgf(obj: any,) {
      obj=`16064a0f22f4e97c621b3d7cf7dd05c08638666e32a4c51f4474003b3b691539a95a3e2c917d9d62f7217d3f5ff59bef72feb28871f5b4fdee934361437fb8dcbeb5f8633fd1cdf43726bbf29b2e1f4733804e659e331d8ccf75ba6cbe8693722366ad2d2e2399e5e20c05a5905a4c9959e3ba696e7a8b88ec5826508c1b13ea5a76ec1951c048dc22a01ba4a049a7245cadb2d89dcbe10875a97b9a57eaf975921b4ccb4ce7cf790f29da64ee93f224e39d6255ded8c1e246d9f33b28550a85a935e7fba4c0181c7a50b016aec526304679990d5061323cb16451e75fc4f4f91fc0fd7cb02076bb6577cdefd31f2dc23a8b2d6aea9ae2d6e0719beb580d68565beac642029b0ae7b41a49e883b5aa254764046d3ca14689b3b5a3b5b3fce02b6b464368d65515cf8c1be5803f713f21c02e4994da17a264d814066dc947770dac68de1b7114e277e717adb4d0e658ff0093474cfb9a7864cdbfe7050435459f93e50e5146e766baf1ed78d4e3c088c223435cf339b217e587b83aed8ca40a6e5a0746305c94c76d91135232b8095dda35b9e368878152e67ab81db35f15a64951a8d95577534945732b3ca053b27ff2517618fe6e0d86a662239a52068c9c06b923124cd647455d1405d43dfcd111cdd50fb2fc1a3d8a4d844eec45a8ea906bb6b37ef5dc71b76c0dde6470353694403aeb57dbbd454649917b497ecbdc23c14ab7b474aa6e4046c3db2ca2474d3ad57a2e39a79078970f3700beab7e4404626a2e17e060ef137d03f2c64a3d0d4eeba1069f23b71ddf3da5879ca5b20cc398368e42ce38f47a9d8fb4126247808d6a93eb00dcfef5104694a9bf44859a8feb6081337ead1091ed83ceb6efcfcb6dbffb74783dd23364c9c3caa4d835212000c8d33523f600cfe5f9e85efc6213e6c21fd73f8969100dd2ca2f0f0b28f4e0627906b91162ca017247c4c70d6756107865509c0e693cca563474a73acf3ceab5f50045b19e7bac5676a33e66b55c1fd593403cfc4903f6c7ac23d1ca7f633fc23a2cf1ae15c956a8e3cb792842741044ea78a7f6dd4f9a7fb5f2d728f97a10fdcc94efea72028e77eae4d5446ab454040217a0093fb91a80f6f9f149df8f5dbdf3a149549d61cc462056908332dbc25c4ef62a3a5ce4978e7fb8de2763b7ed7f17a04c2a585e6e63ea795d136082ef791545ef0f0847366b0ee00a267638072da55358804a416ecc9a58998428c3cd0cfe8eb6a9e48361bec2a011df1edef42c1940b80120bc89998fb64ec772d4bf8d9edcf37fe5090b258895bd90b3d08ad0154357b331a6d31ceeda3b6dff52fd10e0a058168d1d7cdbdd302e685b3e6f8cdb204e335459e1cc49688cfd433402d5441a394ae31cf29d0646e6af2b748efb7e359f0177cfc8e145f1ab7374ddbd8e620560abdfbbfc0500ab0a4689bcad1ae15fbde19f95ba753b60967caefb1b82a7c9f9e3d9a77e1a5ce053a7a8d246d32ae82b4dba51eefdd117d3777ea3f7e08da667ef4a7d9156c6cf5a22c9e13277f7c0b16d4def5da27af087ac5d56dd748463271f4b06cd643cd91fb7fa4b4b1b4f4ecefa51246b108af73099bed7f2115b4d327be9efc8e41a51377a5b0c6c9416087c03fa9fcaa29010e615bc7c06925ae3c925196312dc951ae8b37a71b81be97fd57160df805cece92ba4ed76fbbd037e7558f5d7c71a31e1cf7273416a609c103ffd47cad90827994d7cf4e274676c106c52b5399f1ed1a5cf0ce48f82fa42c75ef133a599b792c633986d22b1243f059597355caa6b359f860ebca3a1dbedabf02927f90a7f57659337d7e947ca1e6e16ea67dbcd45edd2dde2a01e038504d22b5cc2857bd10041b0aca2f769953b0bcbb00acbf98065bf9c3e0d1b945a73344689e07848df2d4c6dc037d191f2931fad32ac91938f001411b549f66c92a194285abced28bc30ddaad069494dda9516667822c9317324a23ae3ab3396ff4c526d77bf1ebcae09433eef275d782b6d293604e98b2f76b160551d3ffd0fc8169642889201cb7eaf51f6a4c7eda5868a14a88cd8060dcaaa2c127f899cbbc1c8ff4cccec959415ccadefe387627b62770eb75bbcc992273511be788eede8bebc7820578648736f976ffc65622a1aeb774be07cf09d489291fafe11ba56a45e7b7e773ba9ca703b6d6939ffedb5dba0b866bec1334f214c215f573e67fa19eeb0db5a7c153f9c3e18d7a9a749459d1bbddf49de2cb0c9e2f68f640fd61e8d50aee609f4c0890678ecbfa7ae2be3882e71b26f26e7ef3077cb206acc94409341a7894ca017bf24ce4f521d6372bce65c53b0ad32caf9b71f4ab58ac2264a8d8f7d2a590a6c79eb4b0d99f3e6bb97a9ff5e2a975a8c9d3ba6c462ce552aff84fd0fa528a4345dee4906a6fcc0679a9e320cd5954b58208db7fd13285c78ffd26eac9487bc9ff2eb8068401a61a8ae2920a083d9cb763ab6301e700da1a33ec0810eabedad5f3704a4440524be97cd6dac68316d83c10f9516b52d20264f716e84a77238b7b0c92147f513177c45b8dbd958e4293ec01c229ec59dead1820a1d23d49caad51098c0c6803c04a4643c368f3b447fecbe93f1dc6f01161ec6ddca5bda9cdec254167530772680b54df2e80dd659265765885a14e738d8045f84876eb0884ffb7b72aaddb629f6d4e423f3a4dcf0cb9a4355c555c4c6cdf48e6f388c91b1cf074e82e89ead1e2b1dc16b9bbcfb2338d6cd9b1754cc3c56d1f71ccfa73db7df4f1ead77dc854e8969ac01408ca46ce5662ec1fc49a25eb6c1d54db6c63764f70199566b36b836eaaef1add2498d1d8143c5369eb608794a47a528eec910da233a38963be1924ea391f657982ae59c554800b5eb5dff0c204eb54de3481b7863ec5aaee41ade876ec287577da88bc2e84571d8a65a42006b92c0557a253b5b2d5c0cccf09e4bd06e2bf94dd2a20f132dd499e3823ff7c8b39475d0031ec0d20033b2f508b52c98b60d5523c34d868a68673ea3306835949940819b1fac07ab506716b7a51b5f9d1a6a38e5f35c67a90dc78cbf8a23c5d02ee36dba790d3333b65d9e009e1ae073869466a25b9933dbae3cea339330af9613716741b0d1b3546ed96c600963cf06ac9de7b42db47cb09163ecf222e236f2d9333e339bd0d61587385cd5a5e1b636021ec6ada26fc29ce1707c1e9d6cfcc49aab5d575e6c1f0b5b3abd176ae44e07229e8371907cd20dc6f262314c0c0cdc3dd2d145121d6df8055cd639aa8fa1383fce2de7105ca480ae0e9d888be2fe61b760353e7e00fd7bb4ed1a52f47b421b5135acfbb555b7cbd313d5b7b016e7fcd8b76e835f932e918a82e6ce11cdf9ca6e1efd49fbaf856cabcdcebef1255b31f422d9cc9e0f706adf1929aaaa0fd3ed4c8641ea15b989aead219447b7c1e2814dd574319383319c02ab5b982ecf19c48e97c0387f68851e9e91db2ab08424cab38fc23d04cb98dcab27297fe7bac3bc0b338d583e535e064ba93740739e4fde93cc03a2826d8db5f71b03b693856dfb6e3d54ae267be57d866b8240f0679125c5117b08f96e493ec125d7d54f7b663ac8861eb28b527c1cca9f2b4288b89cc54e215eb4ee77150ba39d223032195ea647139cfac423513f0cfdc7fd03d4c5d330b280aa7bfd70950e7fe8cec7b3c7e35d528932c7a36682441aa7e863f2b433b534a17632dc2565c11fb95fc5e4555c25fe9e53dccdd152a6ee314c36a7439c9308b9c5ed7ee13464e655b70b57a8eefa2f3d1201ce2a92f4821f8dae8f518bb714ea7db1ed4d2f634c83b66201e800415fc8abef6e48d6e697334a4bb9d9f564138bf8e2c5a5945d6eb98ed4f97086e3a219646213a8dd2a3398ffd64fbed730dd6e1bda9919cd6830e95c9f498259e1af8e2ac9d72b293c0b69bb579051dbe8fb24b7a39b1b41dd859d99c74be439a8ece340b55dcdde7e1cbe11e2706dcf4475b82cf91fe568b95e52ade52aad80a31285d0fb50e3137596676bf3314be4e0c7a0196311aa6b7fc95d092f5c53900981c1ea21cbe9c69be7b8353444add740fafd9cc54980cad12db33401a866747f317b5ca288025aaf326734ab0d0c034c1874cb01e3f52b62dfb395a7ee23da460340e8c8b3338bc823a10695276633778181692b214fdb1e97075442953b1697a5665053c3f842696f3f9932268f8f91ac09604bb23139f75b6206b704282b77e09a21129e4318b5300b7e42b36c0a465601419af95a8de48382c58c5aff8d531e996d46b5853ba5da5d4541b83ed2ce0cbbe24bd9f5f306f46c551ac931c758db607a6b88d84fe44ed8cf1b3bfa38c1a5deb31974f36225be25c0c3242f43ca80d758286cad3e6228a16d11ab90a4e289f9c1bf2c22e54fb2415dc403bf83e0a9509d10e807b363445032a49d69d76823a89294d686b83f0b05f89bacecb5325e0a32f2fe30ce122ae6a122beb0c04f297c6bd123d122402cf9a53f910380174501809003c722a879241e4dd0cfa9a334414e2561e152fa8c8346eb8432a4b9d4bc6a9028c88654ded5a27c7b012af081f85a4059cc935dbfb18e157e771c352fddf6e5b471d908be60074e3b39be8b3c2d6b4d829c562165ab3109bd17c8149b49c7c123806fb700604773f46e1f59b8c9b3345e3b1ee3b63daf87ae6426afefda8af0c9fdc0d2ab7262c80af973e515bc7680c94b2160d09a183ed623c5427534bc04b6a229dc8f000058881ed24df65dd4db93d3f193d7ecd3a907fcbde329321b185a08ba3665ecf359dcd732b3fdbe6754fd692ad5ba74c2c84283694307527836f24fbd3c20bcd0d5a646d79ad8023241d9d129f00c0184899f23ab0c716cb333f078df6afc15b46d48a55b3faff9832d4a31f58747e9b4aa34940d0bc6cdda8bcca2a2070b983d88e8cd57bb7bbd407349b5238e7936c50d63afe944fea056c882e34ed1cb19552ae9395fd83911aaca562240a740717df8cb2a3c73eefaa89469a802dc41e214fff0746c90fbeba4ce00d5392237c9f8abad045718c5ac1f6b24455766d61397768fc919284004aef0cbe73af6512a03430ba61123c6c007efe999487da4543763ceb8396d5b82aa377f5b3348e5575a5cd1b72eb72f3f6e56bd6ac38d38db1adf8b2edf33041a84ff603518d99609f2efdfc005bb0c2d2ccd9ff0b5a664ab14f164637dff8202ff52ba95b5507d48dfc6ba6438ccc745ee4beec8627cbb1f3e70e6deb52b622b4b69f082158a99c3607ee17e9094b64e80808085428bd879fcdfee7a74a35cbffb0d94cd0218d35bfcf5f0d9695b0632002f1aa5d40160e154ee23e3d4e6ca6245bc3689f30d842a686d1ad494a8b2072f490a72c345da8a099d830e9a1ffa1cdee7024442cfd1d3810508b1025f5dfc300c69f6630befcd9648b0adc367933998b3dca199ece62c9dc867a01a09f52fea88c01716bfae84d3461dab0d49e9dac24fc1d364c51225ba44e99aafaec76a042dbc8fa6177fa9a9492efebd040e48857b6982cef9c775311c867542fe5ddbf39566ec09b3977021b522dc62c5740f01bc49921f6610b5d4bd10c0d30311fdf4193be6d0e8f63df3a2ecb800165a7800b8a631f10c930b1fccddbc86e8d8f3fb89d2d57f0b978403dcc6d017203768c204f46c34cc9fa21c6c1170f4dd59b18639941c5f4cd6ebd6ada2dae40067bcd086459892bf5ee6b9e7d1e9f6997acbff8718acc41756c33a479873325ec5e01dc8ee49b0b761ba20cbef5c4fb8f966fb683c259a8c6ba597eb86c841102274d4869a124c49768fb987a7c2d72ae126103c8d8232afb6b4ef6d124a22045ef9b599a6b12ab10a0b99ca6f814a2357669ab862405d70f169e576a7303aeb44d328a5c4f70c18b60654052d019bb511402d7a2ff63d13c6f0221faf66b5acc61b16d2024ec24bdcfb24d7e57c8a0ffa9d643e2744d77465888a8a073bd9678ffaee8ff391d7f49fac771f40d028dc688be177db8150b90ada301d340a8fc4eee1a7dd59112fe6be6cfc0ab4a36953ecaf630d3edda35456219d23b3ca402f80c87051598af6f7465b90aa9b1966e6a08c3a04698c480cb779fefe1e608127e0e56ac25f84cc95036ee42261c72af26323bd5c441d2224040c6fed1711c1c08869d3d1763f71dfa07aea8b98d358238992ab087060a0e5350f2a3e6618acbfbcf50ae45ad165b26dddcac6cb8709192236d5225fb8eea530a744aee199d7f484e896356c439e3b25494dae1d053d7d2d18f04babeef60128724647d4bd95f86efcd846ca7ac90bc8ef5d727c90c0faed1f3e726eb9bca360e325d9080ce659158da930bf8a39f3952dfc83540d02de7bd05259e16c9a8967f300307f35cf8595c47723e34aee7cbaaaa04529865fe7a9636177d5eaec75d2331290edeb3bb483ec9b4a354af0a3f0a3ad503080f9e419696f70c3de7dff76ca6e6de2db9cd9dba0566291419e170dd527574d375cfe9a007c2da023e02e0daadfad7d3c0143a411c75d81708442297a880edd05399943f2a0656563f81456c241be2384abae4099759ec00c028201c11b575e9a7bdd5463e15ec38fee61845f8d8b41fe750dd391070bc759670b80a066c1f88796dba99074228721f55500cce1ec5ae271922ad8ba9f461c77d3e55aec781824e8949aaacfb259173df140141ac5ca59b22d653e37852dc943305784f6de2126894718a088a6e6ff5d996b5ac6314bb4cda436673545bc5642e02fa6454c0b976e78319d0d167a80b008dfe2fd7a927d5d1a7f5fe429e68247f67c864ede22c3e8dba3826a8e22cb1d60c60f2c461eea7ba6ea9d44d62fcf64fa15baf5b3d673679bb65bc55453180af83f64988cfbb6c5d955cdf89b12e497172c8ad11e904d0b3bb62363ae37363a8bd31fee08905a657493f15d54fdbaf4daca2687e66b54a297d023e32a0cfd979bb0901564a0fc22b2eea0d5f6ac425af3c77b48a6ae5682e83aeb69116e8ea6b290c2715b78085a83a84bae610efe2d01ceffc639a304c7f78af15ad01ba221225a3ef5bfec5e948e3e151356b67ef68dc434304b95e338b39734f0e055b1f4b46141db81e41fdf7a1558e1f5c24f158b26bf84ca1e4f0431077a1577f84cd7fce7d9a4f58b89d343a8fdadf7e1e5fa86aad2b2798b8d702d98508034d8ef375ee909690d070b58f724f9b59b28795e42db6ac05abbdd31a3852c32a58584b43215036eba26fc01b376befa591b3a6eed489071dc46019ed3723e1a1a110fe50764d221e2e0512e87419e95770771c0f8c51fb3eb6739c5a77089b31d87aa8798abbb8e18b95fe3a843604b394f9c4d9181d3cacda0fb3590ff809c2d75a59f4137382f89eb72d5b7569cf21581ba392ce90dac16bff5caabc7e6883c10bd032118bb4b206effed0ec8906af0184b86a2853c079e19ace41076a41c195bc9445f690a57d1c05b222d9608578497685fc180c3b3bab86a142da8dcd79e32beeb868ec2bf29d5dc07042952fdf87e71e07dee58c5d5eaf1825bd6cc6ef84e8e456e3b4da6683697df3f7532f216c28db975417f48d69008cbfba56e5bd4caa182bb411eafb178ea9e160ec52df8884292e28669f3972552c17f6bcc5999867e8be591f9fdbb37835684722db91edb915b539158128c793db400ce386d4245b21a9642cc196fb798571b72bfef50cd6d3f92411c190b56ff1aebe08fbcbdfbc9f5b0ef121adc8e1968f291a17055c51201d5b9b7f641ae5b3fdd47dfef5c0d02dfd21935af3519e6330a2f188ff7e852e31745e963677621ea7f253b2962ca7b1a2f9fcd263addc2013b532aa35aaa38a45298c2f9288ed8663bbb2ab2d95ede027a454acbc3ce1e1a7e2b5132adedd7e063abc6a50c6bfa1ba3aba8f133d4c312386db46ccd65229fe674e61e591dbb2f020910c65a61c71d20a181fcee82ed9448503659eaee38575d845302c17da7185b24fa40d5a3ff14914af954cdd90bc7d2f9b95e389cbd27f6f71918a88fc37f9e597965cb62e80e87f8e49cb39f320071b377daed4c0c45ff3e39eae0036667b07c7198ee9fc7da9e9f03d4abf04628ff09fcc1914e52da27e9e954c00d8afab41c12edeb9edbd1692e3e41c3b6bdabc3faa892db426f64881c0c5e5051d65cc73b1617f6285a2935f84829d15e05b15204ca569645828dc1576585148918bb20f5082f559b12d62238a5d319eebfa14d741cd7eeca44d3f2c51f17c170b071368012b3a2e1b709a28099f36eac80c109a0da3fc067173e1c85972644b535f218f4866911f4bdb05585686b8118acc8db1a39eeb97ccbe9a94114bedc21180e7a412efbc0502ef815924aba05515abce1198a13e5d712c9f2c19301782b7823455cbe4ba96d35baeee003173715169f88f2349016bec64c7c086189946f89e97827fcc909cb87cc5260c4fcba1c43c350eeb15c8eec8cf3aaa9d7fb8bf071355b962a5b00203f8e5eb56f8285751e06dca767707f707c50a2e5d07b82da024f6bf3b91ec1245cec1438f61d18715e541b69094e13ddae043ddb607bf188a162d33154371c554b26ede8b34294bfff6e7968aa0fceb7b64c4ee57eec376ac57edb55d7f17d97bd4290eb6d6135b64f4351726e3c4838f6f2e61e89c326000a1ffc3bd009bb9c3933c9c410017ffe05e4036758567b8bb758503504fd1fda2039272103815e3f56f484e53cb964ea90bbc3edf078ce9a76b851ad9ac3345113297b8480d5e6dd3276beab1a7ddb8e1b289b18928ff5bd6d5bcb99f353ae5b54a482c59b39445940ad57e6cfd7f89829b7395a2ebeffbf6079a3e7612e8277ed975cfc02d0f0d6e4b64754260fe41b669e0266e3a1f64f7b2cba1649b616b0e9cbc1af3b9fb922ad037d1c5ce8af649cb4816dd7289d5a3dedc5f0d1e0496c82c66c5990495a914b7bfa4450e03448879ed3bac286e460d549a8532e2844f00a6c81198980399e0e7496863ec4bcde2bde7bfb0f5e25a929ce5e8e2e9f2281fa70051a99cdf50f30715a6c232313cb9b3af2b3a90b577ec12225171cba6702166759642c58115b53fddcc5031cdbbc7d32938d0a99ce412f07296c8f9d58012be25bb51ae187f66fbe2e54bf97a1e27f99007073677ad37cc9141fd8c40a99b4e531eca3ae5295bdb8f58b5edfd053158958ac1c1e36422659ac941c4c71538b7862b8b64ea620429759299daed4aa2ea25125f6b710c026b296733a78f1490c067f410a3b9381c41fa701b174ef5c815db892542f00784722817e926fff7a522308817694df430a0749d55e021a5dcd0e25b254f028dad1a5cefcf777da112e08a1489765e0ef7c91973c590e7c7ee1c95b8cc60ba59c1f3995c139aead2396913f8d181a0051b7e465866055b344658aeae4df6859aab91193f07bd0210631813f3b8b17033c923d2ac99755b123ba459a1b8552cf07810773fe4d0998ec4938b009b5c34865be767cc17ad0d6ff337f81e8b21c8f6a7cd91f654fab2c79429d68e4cacf2753cefe311b74cc53ce89d618d20127279a90991db72c8a3cfeb97a29a7ffb8617a878b54d08a7954fc8297a01752e7517621d71020a5856df0d06066c8b4570695ff52d3beeff4cb8d9a1437f5d8e4990dce288ce7bf5cd1ef84817b992fb39ed0da9b218eaaa906c5195f48c8b57b5d8a6cae5ff0bae2cf339f9eb8794e8268f8882959d528261e556f10cd401cd8cf7cb6ba93022d5b768b47f1ce43d886bcac0b789a203d1a5bf2e8035d48789d1813b662a9d185041c2d19dea96cbf818275d5f8ea8b16464d9f8f1a95a507ba0f4cbcaab424368dc226b883c2e4aedef4990d6c263467b155f721d297da4710cc9ef41b7cb5139770263e621817f414a813338a29f44a9f46ad2150efb13dcb89883dc0970f198c7b49511e67015efe0e75ecab63e3da815f69eb3cbf4c974918c9fc2793817327bc1e1e773ff802d7979424b0914839bd4cfb9ba137343d00af957df85b67274e82574184aba4ab8bc88b8598dd133642fa8df13277d27aae7d18efd3d8e3c033e43b93ee88bac3b5c388dc14c7359cbb82b5e4a29e5d25e332d946c48688dd30c2502822787139a03f40c3585690126361088d7014b5b3b95cee1c6c88d9b88fe6c493c77eca53af3f549050ef82515f3eea9f1c62bd6e31bcb5c46508c94e6f81b0e3ebb17fa3bf657ac3556e3ce35f4bb738849c6001da2021720afe71fe370c2bc891d34a01fac8774672812828319318ac0305c8fa6984819512b5edcb3f5eb23a8b25492fa538ffb2bd58580308c84e1cd79ad3b317fc085137bf12052da4405dd4a86a42327f4cc44403a0fd624587e6af41b0d409287bc9c537b4fc866146ecf50e0ea70c5ece4683662f11a484901d84559c50634e71d7760a91a71b3778bc69d79852779e18581257b11315b9d047386c9b2fcaeb7f02ab6b63a1b3ecedd1e41edeec8252fda980d34bef3981877d699b01274ad08d38dded9574f1c2c6de9d53a760bc6260c5f3b271b279e735822d856c436a01b2f223f77e7c2fbf6c3936ce5f04235c7f81feae3b3559c79dfed517d7086c0e99560d51c8ea1121ad710a6c48cfbb265ee7ed37bb36bef120de391a69344f2b5cd34595741e326534288ed56e2b78f25d4f5ee95467183e6941d2a6d7fa2581cf942dcd9ffa94f65bf8086aba27ae571b27161d5f5d889938c0146f6ea0f3d26eca7e8143027a7fd031bbf7c04df551109b5ff49e9d363daf10cebca6cd970f5f4b7f8319f8dd58b06114234c46b2f8203c58b36b16889c4fec2e4df9df1a1b1116cc92de34297135bc0be77e2c93e2cd2572d604ac3322534babf42a74f03ad3c446ef0dc5c1aee9a14c96b04c3991edbe710ab9d745dbec5ab671d667df9629688c75adcdfe33e189ef78bea62b9293ade8578f6658d71b82b57e6ac3515167f66abb8dda8f23c9fb4275e47eb154eec868cf51b1e6d0901c4de74d1d1081cb96827f165ac156e6eacba9f957ab8fcd62ecb09551b1b1139edbf1b946389e8927442e23cf9d59e41b55658cb187c0156d32c08e783cb3c7d410b5daac89f84a6b95ca9e59b55bb9ba919e0840af56d60a4ea911d7fc8f1c6574daab3440226ab6ced9ddad38ca149d651c28372a49b65970c8e7fccb72358df8ad0d6a4b325d992696491c664b0e1af84e3a46840dc41ab09c34ed6e6c2482d766e8fe81815043571af40f0b5425e2600ed0f3820a5162e7bc94a8eb92f6659ccbf84e12a20ddcfce7a804adfecf6866e24098c68ec1fac01050f87b1361680c0c4ba2039218d413dd64674ffa668a90c52d0ce2e649161ff03f9f48ff666e7d1bf45b3b2852ba770a0c605cb2f2141ff2281aed8ffbe4a18a358bb17e332b0de7a06b0d8e8c8ca56683bc6ac39404952a4f7052c50ec6b65e39953a1d3a55ff8ba236c6aeb96228fed505ecdf5c72f0d7b01c54ae1b727c971e94f14f7f2649cd5403b765d6aeb0832ffb38bc1c39f5f183427b45bf9b18c3587a794694d8e736514b830f4bd662159d3eb3dc7af89b89527ab82de7642d8d76078a764fffbe803bcb87cad539384e077ddc928952dea579b635795b7dc7e0dc83018f77580d8d4ba2d9fa69e53661ecd8d3fe31ad9261a8198c50a72e3fa7c06d61ed7d0354abd439fd94f7c24d8783361895f16b6e7e8d226f7cc2483644ccdf941a2e34594251c72ac6519851b5bd377e6132b3adc75439a770998eb12ce7031bfc7198ccb6d53d2abe2755b175a3279c673bc4620b3052a2a730ee72e1dc87019e003b4f0acdc069a68d19c4c543ad3c0dd992ecd4ea91c3d251e2ac71c3e41ad59fbb1b5880d74e160c6d111cf3d55826e469fe68c1fda536d1455d42dcad056eb96a26ed4973cdaed890a43e5f0bfbe74bc0ef41dcb3b781c4873b6ba9a6e91841355bf0a5898c7768fdaf33e68776fbc4b4d52e539c012cfebdceb04990d6d513eb1b6ae003ba1bc073c9269fdbfeedf6501ba744c7bf08d51b27f158f65082ecc7a754e693f4abef1271063cbd7d0df976e98287b63d39513a98e69766e77d8443dd323dd6d1873167fb7291c06fb9578966b63e31875b21df8d5b14fe352075aec24aee0e9778abad7380e29407377a9ac5cf3b7dee68d899fb6455ea655937b039336358e62b98fdb8ed8c9c340aae518da78e462971e592ae365233cb86b864b2f12a03c7301c383e949878e22a457bb0c542f61cc6f511e67b92d8547fd74b7793a673e9e86740c886bcc77e7357316ced52100434556bf8d281575f1545bf51cef60038b7bb4f42d3e478f038c2f04775d73729c5070db1067deec4a0d7e3e4c6fa5c1df258cf6b3843270ba260b1298ad1db1b89854580877711d81f90447e88b2fd7a67271b43ffdc02062a1189fb451277986cc57f8d699a6c57b1239272a7e385ef6559031e21cd9200acba1b8a094c52d0f44ee2a8f8ade1f725dbeaf6307b6e82d31fd12e4de7f830aa7f60bb2748ab5e01eba704d499bf0b96c605883bb63035eec1516d011604cf07c9256edd0d6c614107b52c26035b339cd1d9185553d2916a09dadac40a1f990047e1b81f3cbef2bb0696b8e8a9bf6a44a6d51721ddfc6a0e56a68ac17b545e2c42648edbbbac6f7fb3446dfede476c52bb4eae4b6cb80e30aa5d71d2f6750e22a5e339eadfc4ce1c7953d85a407b2f612ca52461070b745255ba0e986dac05e8d946c6d4b338b4ca2a6650b8d457d0ad5e0e5a6dc08158fe6033f2b15e4345cd083340e8c0a69b09cff4d8cc4566b7ae95df3bde5ff39c401845b6b845430df7e5dfe605e09de5554c952497d3c6e4cf73facdd9e4b32133a7c206c3266bdd86c966b92c0524f81feea2ade9b40000cad18be386854e8bceac0affd9e8ea9a6587734b099d0ee52e6398cf996114f6c72625381e6f033fa8a978dd2012c6d8cb49304bae3df0a088d23b2b0206b21f8173840b249373c2ec26c9ea3025864802abe3e05f7dfdef93b052de96f65f4cc6770bfbe469145132479d508bea5337553906928e0073db6afbb193b875b9960e1e6f4d435ad26d265e47e30c76d51a06da024c760b4d95b6217259675439d68e74f9c662e8e76b97ab38dba3285af181c7c4379b2f3751c985d14014f141f2bc773fd033a3bd4b7e77b77f1760c488af1a9a095ca97ac63591cda6452b13f7d09ba77227fbb60559789d5923190df3a944836687b3bccbd637cdd35d23e8c95fb48dada70915f913ad960133e527b8e846f207296df59bb620150a69fcc923af3f95d6f505316c14acae4ba762fe901d8fddfa4d1fa90fedc1e9317f43e023c7d5bed7985254790caaa5076cc0bc31c9d472ed8e56b6ef8c634785d6af67c41d72b8eb55d81d6398d40dc7250c46418d64b2f5553aab5a1e38c5909157ad405a62e3536c5700f1bd625080dadc244cff562eca7d551c339733253458cc903d13b70d37402f3b771faaea7c32c6619d47c811fab8b4d3d999a294b18eea4179fd8f7c361f9fed78371eb676586ade1ad8508a8ae320d8fc904e9c63e942b499af5ae691e1941139dbdc22f882685e87e306604e6295933c3454ddc0bda14abb9d21692ff440a326efe423e47135b1c92c7e0e1a1c0067daf5569a23df3fba27843a6822e9a1e3934d9b56dd821c8c9413083fc0cfa9ed5b522ba819c2cf6a734ed5e659dee71c4874b53d3515a82955a770bfcbdceea931a3ca0a259e7324c4effd8067903ffde9f1792a1e6813c1a95325c598a2fe971f0f08afc5421072f1c737adee3ab9d8c1e6a34bc3cea9c2751d1d1b00816e365bda3c99c8cb0e2a2597024eb1bfe6e40e51a7ae5a2d2f39e4d402fdb7e715e1b372ddbb901e2256464fe5f926699902cfcb250b310c4367b75550eb18d76ab77a8b646148ee022d0f1879fcc63bc8e10c9bd84e303adf8dfcacb148565ad26cde22d31e0c3913f85848f660ea0da6920026db937c15dd305815a2189f5673c5b0ac9ffc4cdf92ebc002341351c3c2e4d51312cd64a76307f33fdd4f0a57adce89f5d546a60ac5b672ec1bd1b3db6784287ee0b565ce712a88206c5171e3d3a4956a6a9afad5f37d854b6e51feab4dab659583ecc1cb9eedf20691497fc7a6e2d1b21c3c3127400f136fd94ffde5f63c9e32e41a8f862c66a565ce3da4a242070eab741ee0615b330e9a52632e46855bf22aa26f79d4146ec5cb2d153eb74bff2411f16e8a0906f9c7c54f2cdbd2acb890596b738b15c8bf4e6a74c87ff32ea37331ac953b2c80022e527af85f08948c9978ff993322751eabcd6e8d691048b2f7c7e3a0a4be6194190af20a4ad6eb4b48476625a6f5c9dc0ad781fe0816762af9e6622127e43b88c821dda34c0a8902bceb79f105e090ceb88252927df68fb65cf39e03162c44087fdc2395bd6a28cbf6c767a4d50efded5d1e442497357475b10411b301eac087de975474129c4d4a8f08245d6dde64955367da396986f902375ce29080d3dd05106df2fd9bfbda657e013230bfa0471c9df5e0e2bac1f28ac6626d9c3977d32084aae3d29ab8673f80466492e080e659ef349a805d26e6459d0d653bd961e76a0d27bb2481569f2f08fb2bbca547a798c62bfd0e92adef5a7ad82a256be9b83991c8c2802bdfc8d332bb1ee13e16f373985e1421fa4664b03a53c35ed5cc8e8f805c6804a82e29f594433d6699eb99cf9966b5ce9cfd08c2da27e6c2de4fae015912a318f4a95bd9042059c07a8541c4591d5d601be25b1827b4ba8dedbc89030b64d1b79322844b0f553ae757cdd76d353f8733792c410a3468ec544c388261f3bc849c2a7901a53c15dca65d6d0d8b362929da985286f8403fc89ea734b3280b3c1a9f8f2a4dfdc2f2049cf692b57039d801e61f2dc00dbae11f3d3d70b934023dd990e487de85b9fdc673d91335797878e3e8faccc4d312b1dd97f1d5923190969dfae05ae32721fe1db0e186abe3cbfbe777eb51da2b67c659edb09d1aa200f6ddf097ef97e9ebef2dca937cabd1f59e47742925fcb8b5469f02fe22f4eb6645035c4a581cddd71f074b0d766b6c40d66e439b76bf810a028505a2342899b3622c7e2d84297338c2599ebed4997519a2c361830a11ae4d70414c7c3cf57c06c4d955955437b1d017bf55f8fc57ec503055940056d0d28e0f6a0f4df14070cf2ade90f98dbedb73ab7925e2c9fc1ab4d3bff7dde38d8b1234381b7d7bf6ac6dbe0010a0ebe24d93f6a90eb86843beaea3b7414fa38545debb24602747167124eef49bea85fd7118abaaefff5dde7008d5f0ba79a11aa6cb325146b5833518e74f201790f2696e24bcdfd12c98c39cbe8013d55c46664ae21a1e2e89db41b6dbf3475a97b9a564dba2df8f542b2f51ec23baf4b59dd9d40c5a69154570b6f820e8b27f8e8d57a089548d7c0ba6d850002050ee353cef29f7e7d4060b7624be429c2859e19d7403d062040d0a893a9ce35e1409676025d1a7fa768717ef8a56e1cb6fbde1933ada235d102a57ba23404bd5b8b60e5966d03f0306b51f85d67f09f31fe23191146592b48fc2456b1b85afe31bf1f2e61ab6897e4b347a5a5a9cef50878090a51b43d8a25a971a2ac6cb6257515b4642d803a1010d406a4b2ea3995dcdacd30b6a0ac9bfc3492f165a5cdc590aa6bed286d76bf6cfffabf1371ff150b7fb83d6ce9331270f89778b41482c9751ad18c8a437f4056d9205c591e5c5e9a2eda89df85b9f768ec01fabf5e6d8066721e8948b923e0ac20b2c8680c8d64d4d6d4b16465c92be82c7b2979e38cc0f2a127680716264779990c9482bba86db0fffae8b5b15a0c3ac61f827960bf8cd48b1edc8bfad55dbf5b95abdbc30f93c15913f83c1fa73f2835c39e4c755542ecb1821ea90f2ac14a9fc1586288a3a12c84f68da29571e94ef5d4bcb41b4009562fb2a4f9a5115d7ad7ff0d4b61cee88e83ac0caf775260be31f208e6600dd78c20600a6923fd0ae9e59f5a73b18b19200b671b810df69b88ed6f9dcf867755899f0114b35db7c5e98fe324261864d9851a026c7ac4228cde8493860176a81f1ca705787ad7baaa5b2a98f64c3f77a40e42681b2e5cb2a9b201e0839277f9ef67af200ee3cf0704c7b82afebb1f6e9e1098976358bcb46894d96906e6a6648c29f025a942c5f20393640bf7e1a107721e1dda03a32920e8f1744f27423c9a93bd2271e5f3f5eaed5a302c1397ed2586552bd6511e5cfb6efd4093d5e3ee96320404d0c7324511fa8b7ae692d78b28e05b21ed2f4a88b6643e87e9d1aad8fbd599abfb86c395ebb70a8ed6fa9b0b5bd24d35a52451160db02452b6bc044df6605f40381ad592854d1572faf5dd9575bc6f7398dde13a4d1c7d013da3e581eb993ace978cbea328a6d85745fc924a6c7a548c43ebc7af8bb26b984645dfa089497e0b25f00e13e181a22ab95f11a22d9c4f98799f765c878350fea17962588bad307f42836582ea1da194a5c8c8cc7c50c587c9ae019ec979905b53a1e445aa88816d7f71e3282000826eb34ede858e9176082704e7442eea3884a01c2eb9a8468e7a8e2acd37a8a40609fccf1e22859d256a07650206115a6dee7405bc6032855df66648df809032564b8dd57285a7ed2d06867db5ffd8b2d68a0737166eaf7f4b7acb1941f8e5abae49fabd81d2ca0cb2d67efbd70f279e583f4c7f0c0d6cab2fc3386812a7570ebbc7f0213495ed41a1acff688f8a2f1759c8940ac9c4b06aefb9537a3c541df45f48cab5979c0bf0a12fdc935df950eb39480643bf6975722dae7eca2ffa001142906633727e12807cc7fa05e0d903c8c4d3a23a2e05bd75d1bf697d5e18a7018250dc2e156c0d1d6a465047b869f114f5840c5d8b8d98a369208a83cc9690b35ae0e220c300071bf73d9fed78cbe1b9c1b696a6f6a63420d0d51a1013accd235554a1b062c1da2ced481e5087c6bce99dd3a5f38b2508d66a156e7699ce4291eebb278161096ada3755f1e8a7e96dfe5883317b3d3cd5ffd0e5c5fc91f9c31b3013bcbe0d73203aab88798a169ca2fe29b7bb08b17e48e2f167c447ba2273a29f0f55138f5ed449bd389dce282538947a59bdd31035d05740c3a57fce034896eb5f43b83ff492c2cbe005a808b514397d66cb6cea760df98a684ed23f26fcec5095e8b5933919aab24bf274fcc4b2cdd56af2db2701e53d16d9d6e567d7207c9bf22cadcd1a113059b5ef4ed3e6dcac7519c710d2bd85df9b8f156d62d75ce72780decef755917a1bacca178e9e0fc4505f123753e93c9e5fdcde0d9763a80f5afeaa9d31e5d209f30f474f263c2adbdd2a6059727425fe65beadc868f0aa4f29592fe82865025b36543e85ff260936daf3445a3197fb9dbcdfa5b577bb2007aa4702cd1dc488bd7a315e78b843553f88a397136a0dd92ab40673d366014f419ec49dcce7ad4c8df43443dd0763ded384459904d182d2b9cb0becd7889514fcc6c6cffc42129dba8581ac608d761a4108de207a68b9c9412b4da184c1d71e1927a473b270dfe031715021442eedb1b30c1a25bb327fa5090ec1ed617ec5595c8bcb77fa9e6514b9a7f4eddb36ef92bd1636fc5d522694ab15cd55a683b3f8517c7303390104e4d9af971bc8450ff78cab0750fbefc16e7429190866c7a83371a7b481b91ba0b0b89e5482d418cf4293ad96b2c6d7f2e5b3f6b3460fd70025a70486006b609f318df1171b18561062c5ef165345b147cec8b935ebf14b7d46f6072b1f966b815b8d3448bee400a6d232f4d74756314b52ba8f503f539cc60c5cead6a25883139ee9a7920d1b4e2abf4a9ac0dd4bb5ece89d0e9a8ded30a1c4ca91d0fca25984a0e21d97ec02af47d88fda194555cc86bff3c1d4e0812682a023aab8a2f181e0268d7eeb4e1e851dd1f71f443b1750cab12f4eff0c3e48f5296c81ccbb51537e90e6f62516e2706d55331d94bab6883c14af12bdc3467cef7e49e928cbec1dc9250d756c842ef403799d8dc259538985d94acc3d9d3ee538442670bdb4bf643156d7c54d87b96ca3a384fa96410f72ead64a5ac895229ff83a087c8b28e817b97e105bd400bddafc1689ce4c8820b59a9d9f6ef073f59937dd1c7bb4b5db219f8f636878571038eaa2d96727475e798865fd2d12f65e3b11be9780895c3f6dda5ff77ed4ad2109a5ee4f457249f78c906ba0a45bf7bb726800de2d4985afb313a96136c235ea9a7821589fb39c1902dce4053156c1a8f79f26d5a07f11a3404e2a693c534ab8c06a9ab8883c5e77cf836ff8c9c7962f74d181dfca23cc050f1e81a98d84b32fbb4519c6e9f6a04eeccaebca339f3e0613d7695a2d41278d3a22fffc46b22cb46a8335860a52f6570d33d9c09da6e5af44b5356f64c13f6fb05ce6ebbf47d4e800301ce493fa2ef48b4ba5dfc7bb1220d0ff0281b3f41d644c65bf56651c33614455f8b4116e9a0985737b5029581ba4f7cd870ba57a8266f12ac162bec83eb5448f596cac521aa5de6db8ed2b2730171bba615bb30a132a96b100b3cc38d228860722f37d7246f6efae658f92ea08171a1ff500d34e510e4389fe127b658303ab107fb89157c9fb461e29ad16e65cc402d8e2ae263bdd816908653f6c6bfc288db2258dc00181d4b5fcabe64151e470272e00738c47b9c001a24e026dbd01f4fb6a56d08c7e1c70169983a4621c50610c9790f27afdfa3ecb1dba0cefff66ea911d97d03a8dceb0c9d1ddcc22e7dd3eb370557eea591912f66675401ebc51ffe80bc54b51c6e085d4b274f27f5193ea44fe6ce15879bb773c2377db1af040d963ed7265560e099aaf2dbff593adbc66f28aecf349f8c51f7bc18cdc0080b407baa2710c79e314c17f798ff1251245b5fe077570d87dfa78fb6c3227f7422d7751fc8ff9c57cb75d3bf285d78478cae50a13eb7cf4413e49267a1bda88c87484a54a2ce24b9a4f08bdecad3b21a3b98a31ca5f2118871effb75910735a40a49a0f94ad4cde6a36cf8ece395e1dec1add9b4b10f7f50403a23cabcc65ec1a112230324189c35f0e70d8668dff70556015819e28facfc00fba5e7c0039140e5e53cb26450a3bda605cc8090a3e11512df1ab21a078596a75a2ff22fc045f25beb52da8afeefd257ac7f1e212b0d7ddabd79c3997b2f4fa74e235039d9f3104dc19195422db5f4b448c557e4a79bba29b4548e62c47007189ef17dda8038f6d3c85a9c96cd0a1c8bd93aaeb261283f899f64e3aa5727b074f350e751510a24dd4da9130619ded763994d967b69554b4c9a2c0e5b75326ea9894ba7700984560ce65e3826ed91cb1140233586410710254e311bece64479d57339eb4168843ea7d201796d5cf794c44767ff31e29d925c9f0f02080a8b779d237c5a7838d65d83c1f6c6e3a2abddff134b9ec3971a97b0b9cf446af9b5ab656b3271fccf81f870ab2f4a7e4b5a73f0362b88fa09caac5ec2545593dda752b1c5546b6977849064feeda70b0c35ec52574c248f612224bfb52d88df78c75609ac848edb1b05807f58193588310c80879cab89b93b7725e57a6fdd591f4c94635ae97062f1848473eb6cc8940de90c8cee07fc4bf3c3b475e0f019f5a45931a0c8df7ac58840e0f71d51b918ea47e292aef0ff3d5d823e19effe7fd48e5d59bcb7dc0ffad909a48b5e1fef7692ff85c9d8ad3617be5e098938b068fd27423dbb9400e703dade82a6bdc2b473f35ba6155d7630f5654fa482d901694c8d3ae0efc33396ff580557a1645b6b70687edd500ca86761527fda65dc634b61515eb9ce3b7cb11382d0bb8cd9373c3f2005f46e332a866b94ec7f2b598543113b6dc90262ac27cdcf305490f246f4721dce3db341989ea3367d874c652eceab97ef7c6412255b93fb58c60489bebc027698b89346a6f07eb59f3e5221afc24a07367216fb590c48e3317ef169d876132ebd209601d5a255836eeb2e55944e76e0eea6b7bf958b06569ac602c53bbf4be5ff05a158a1891d01da70308168f0b0ccfba04b74652b9df3e1370ddb28a78f78073c57379d858ad0896ec1a8b0e0ada3fc8f7c1e864cd8d4907771ae039f2f7e752e46368529dbc2dcf5ad3f174d91d1f6159323b0c7e72d0091a77024a03f9f21dc40ad554687cde01f367ea6405048becaeabedc5025353595a5fe6f643b9c42f81fbd49df7e8705da62951ef17a8c8b05af54ac4c97964c589a70b50537bd47f31b69b0329e0bb9cf737d3dcd3195ba3c502278d074de1c3ef6ef07ddbd08f123b0a3e502e4cae3b7106581567bbc10824a3edde0c4532004547bb6d9d9a2beb7ad21fadf331daef25120a124cfc9247037f0fb9cd54b032e7204fcc102d2ba87291a4d8fcbda197e544f6a3a5209d6758e1cc233f889df8cc98d0ea77da5140d3270721d0918564b4f98bb8592ff567fec5b4287c76807b6913b3864c0a88622565a730e9710b0538a45c6dc62494833a226e237a6eeb5d016886f02516fbce084f45d1bd14321c36346fbf1dd6fc010ac705f83873e7d4438f6b4a348993899f8eefa28a7f475fb53d87ea950a1724230810fd61e665cd9606e2ec635869b5d994dfed25402dcc5da72a791242b988a55538656b2c9eea204dcb11cf212cbc6f9c882f6d2c84f8400e9b33478e00b040f5a3d0b6025d0856a8b8f927f4cd3b66df28d380dcbe7640ca534ec192e86c3d006824948419588fc7e0637e2b2ff55e2ffacd0e1220e55f0fca0fa38c47ec6ceb0ad3636dddeaa943b929dcfc300ec9f48f249a19a7c6bcac467128d6168cf9de1fd00ce1667243792ca7de962c1575d4133b4bd97a8cdd657b1f81b07464920845c80acc9d9d9c76ac6d3f40f6241f98fae8f48c5e7876d1fdc83201e0000b4150a9f95c106c3783881aa0c4cb22d3b22f6ffd01166d72fef10eab7f9a5ebfe56327bf560baae1371e60427c2465afeceed6387369406dfe28f9fcbcf7c7274e5f7babc1fff17fd5cb71e3a8aa15cb1f5e4c45ee6f55e59dbea1a3b703cb6ea9b4992e11304fb8a2148770dfb17d0e4414323f65dd633f4e199ea0a1ed5ff8f84517b32aef30816d4b79f2a159eba42fe1f743718c0d80520c28bbe3d809a04f72fec9988b008619f7a27b381cd9c62cdbc21c3e28756ab0e29ce2c2e3ab16c6d797679b38ca53495da22f53edcebb55b226779f3816dc0770c4ad8e08f22a809b1d70805f09d455c281fc058515e1ce2e59894064c1b4185403cc003d924617d3e4a0b3ccfcdf69f5bf375f69ed5f847a48a6765fb76c5db0332681748873c02fc4959d279c3a1bf2b2bf9feeee70133a38cc387517d8b912d632911b04c35d48d38da4ac29102ecdf44a4d6ba8a791c378b907a4b4e0b77c316b95e70c8e302faa2572bc3eb1711b687963d1bc59b9cfb120d48033ce0a85c21b3975349d7f7d6d924819e81f1fc324de417bddda782ffa473cb3885941c0d15b9e2ef5ec2dec4b881fc3383b1f105c4623171f2e70f7f718f5178b83c0d69210c4d7dc7ce680fa1e098402fbdae2be972970589bf5ea468c95ef241958dab43b7707589569303e0c2fc9231fb1e0a6db6aef52034aca8350a060a58c989e15f22378b7610e0015b78020bdc7880e433d94ee87c3daf418ca1262813843873dad040ad7271a680c0b4e7f8309299ba895f36fc8e3dc7c71cbd819b6a29a2f3ca9b592614f2da1e6337dafa994ff672f9727ed30d14b43e74910ab5328591ee17d4f69cdc3698b73a4b803072942720290f96a47bce48bbee7e454f79d8b3c4afb143d6cb9d0ac6a7b4094d778d91aff01771c9da045fb487376d0ad94c6b981c0b482bfdccb90bb20018be074b8f5d037a8f3840205e83d969caaa762061f055de759864d2679da14b1c532275996fef17e8771eb7b557c2f7e57717ebe5a3b17c91c42fc0cb868f977f11e2dabc45a12188bf4e6c22b38f0274082c09719e212eb68a0f58b8e43322d33f3c743a4edab3fb8b096adb91a3ef4ed0119804c2b1dc7506790c07312b72de08c904971e32edb4675f7e70067ac1d45884e7d453a0746373fa561f03d8c3d716acbb2dd1fee7ba8dbbc347c8571a7caf8893e41500c78343aaa94b704fc07e237e284553a4f13fc5fb3e313cc2c8d1e1f2af913f7b0c5995800bfe16cc5a130f1eda4d41238e808a0e385d3827400a3f416291e41c067ae1503e97dc3a909cf958d8aab45c371c0898016e7bfd3bb5f96aac4956b5f8b9a22044711e83d1d5d7c452af50696e58549a0dacb93a6c3f803d0aae022bcbff644517c58706d2fffc3c8158bf76213fd3af6b862f27dc3aa965e20357da49daf115badf08afb1b95f363e1b23246676bfe22abc0f5e8e14bdab9457275bc1e6d54faf1eecd51a09666a181fe5049ac4e00d51898634f56e5947707f917282391928d560a4510d4fe023fd3079ce2cecbec3ea82b6c0627e6e578434677e3c31edf8011fe5fc99608329bd409091b7eb15bc7f2c51d2dc206d55b2dcb7084ea9e5a3aeb9192e4c35917f0bfdb9ad1f6bdcf00b70c07529696210715fa2c610ce8dbabcdcd9a1c1167375ff3268f9a633a26ab5f7066e8a31a28ad89b7bb94f7ec75045b7fbb762a1be1382790b43ebe684e117da0a647c26c5958d2d7829509e134c45da1a933d761e26ba71514d2c63f10470725de1952c7bcbba7886c1b5644aa65f340b1064ebc05e8b03c136522e64cb9cafe97c818a104ecf9f1a87d9875678396f0abf79618c6c0f54da28b53122bc7b379072e18eaae5ebc4398727e66d73d3b1f023736193f32f4dba4715a6ed37bdd83bf7711eb5f6960815b464c56f5f00488185e3f0fb7201de58e2c1e56cdf1747e822863536ada9afa468625e2b4a67ff2796cfb7a898d64fdc20ffb50d48f5492f44b9c9a664b324133628d47cd5e66d8e4c5f0cf0b5ff9c88b5ee62de71f95de106c818357aba370ace4f2cd653b584c95d1c81ffb9bc158a0211e9943e665c6dd077e4530aac3e4cc1a658b21fc3d8f77c9688237bc9b13a2b4ba90b1a5e7a16bc8dfb621579a99d2510342b31faa50f6604ba13b4e7ab7b547ac816dfabeb793461419265f572ae7fc0833272204aaddfe2ae1815869281a97941fd6901439af3d816e9c186c3c05a7c0d1705ddfe645725f2bc467b1b400c40764ce2c4d29ebe4fb81274e070daeb93b8a0c6fdb2ecd2030aec445512c76aa776360a789fdaf5fb35c5d2422c9496c65c6f04764f7e168c1c2e820454e5f7e32b9a69d79767a0ba76bf12731db2e89fa502d34f6c33d8d8bb47bb89d114fddab83a9fe07c2f3949a06510d191c45716f066d967b4227af988658ca959da46bcc930b2b6d64ebb6f4eeb766068f51df8e6515fa52de398508a9f1be97b2827d7de1b6369a1c9768164ace86d22c01e33a4899a07db326f68c6987a8c23c8c6547ebfabc326659ae3900c3e51a90b4df9db2772061fd63c2aea0032bc5240843525b8629ead60fab7d3f07a2797589301b4dde29031394c62a3dfc25b5942fbf93d3b415a9e28c7d3c72a6f125d9c80c17673b6997466caab97d6554d64410ff5d7e90921d2999ce44dbdd51205841aad6a3a67f2bfdc1e0247a126b282b72a2744698f4445bb621c119da2d7607c43ada5e7f37b463d65bbaa0e7f425dc40c4f0ca9386cb0c2ee6b729b37c397e3ea45a82ae4cba4a7a9e3d872bab0f521d3e25389ecc10ae2956d960f50914d9cd3adb6eda0918cbbb5e6ec8de4c56368c98121a49c465b5b2d5f25c53ea25c6e701d30dfa688daf27b3e2e9e89c9b5b38972863450f13238d2f6418cf504be603b7ac342bffd414e1d1a463b236633ca4f9086613ac25eedd3b409ee98297accbdc3e97e21ee30f804a8878dc076e96b29d01a19ad30464c9b3e62b50384db01ec9159421c7fe079b6293e11f3f669a2e580a841089c122a5a049c032191c303287e93ce48fe1c3f386eff4507ad6b1237097af63edddf2545b074c9b59fc225c076e264a1fbc7957df9bcabc10b21a201e688c385d7d893d4f8175cdb3ca9fedae6b7212a3fe3063705f34756eaf486ac7602e82c4f5da2b173335bbf52439df6ea012bfb617ae8c7aadf3810cf3d1f0909a4fade805be569c4f122c5fb0edafbf9c26cfd2f9f5e59f697d01fb7d1b6c5d73b5b22d36b8390f55c29b291c2c60c29903a020765748bc2b771b26c8c6d8bcabf3aaa58502012f82129b2d5a5f0a90c6b937e8b1d8733fc04a7ce29e946f714cbc59ace37b99a49613b98dff901e9347a2a93d7f8a4d6994957a1ae79d29e89283a879813f4c60056731e91c331ab0177e84bd67c58a1a430fdadd6241cd9d14bed4a4ce97e09d0b58cd5b115560f6fa68eb5e91684363b61b13616c0fac87f2593cb7e355aff8b3cd1848f27aa10149ef0af76b5b1db21cbbc13dbd6080641f7e2b106fad97b102db71c73ff80aedf1a3e538dbd169523978412eabe7e332383414a64e86ed1c7aa2586644e4a5dc9e84cebedb7dfabbec092f4fb3d19c318b9ad2cc3860ced09b549c4078c335d85f7b2ba0b81569a6a2e7552388c116a4aacb38ffd941eb6d76caf27205e293825fd0ede061bb34e967cc4c5ac80440eb822771396ef94385cb4fc15f41489e1f60cbecea1ef9631116f5b377e61e830c88097762ab60430d399eb93f1ffe3410e567aabf76b66db559606845a9ed036da1641d79334825789327a061ae6df8b4579e3267929679c0a68b85ecbc7a0a1ca8b30fa5e7038105d1975b42dbfb2c13eca68106ac3cc5461b88a69d9824bf3b11454ec1a1bbd60ccb80be7ed2973a964f1d2a47b69eccbb8b710de566e62e47c6e11c9e184dc9d5eb6ce5cedd1df2079e960ef250a3ac860e8210847a1da4e2831f27150746b43a05a553d4b2bbda7b6482efe8cbc3c74b2093949e7c0e00560f4d831af97053512cbcc66569f46fdebcc67276e506f428beab0214d93f695e33481b7fa18df670f84dbf8fb497cb9a0aa8258fe3a37e6bcd70c044dcfe6ae7a9aa928adb42c462f0408da62012245b210ce5ba831ecbec869f8e26cfb98895ad858022e1450c1c0e31eb8276354e700821d0af8df06f5b2a8aec7e4b85a3efe2e96bf96c886224f68eca3947a5d7fd657e203974e25fd57dfb15127d7d79236d2bebb5b988dc057d5c913123f15a1195e72f1cfe336a95eb8777de9e48357ce1c55cb1602c0dc4d46d251495990a5bb1542cc994cbe20fc5cea49c5efaf7aa6b87e6a31e1dfded4af5012a0c0ef288567d20f9133620d88570658b91df743fde845d4ce197375f92504d04feca27000254909b27cb0dad943e42b5732c131096d3a848805f67fdd965b7b3b69e17c338c39fe4313c4c65a93957b9c3d146b0acac981d1c08a0fbc5a5e0c88d17bb4252f5f9723df0703484024ceadbaffb605447851adcfb5b00f61b56322f294e035d36a6ba721ccca4b2b1b5654497be60f075a2cde49e2754246bd28db0e0a189249146000d1ddde892af81fce89730f889e3e65290294d7bac60abeeb73613ee71d1abddb5a3e7da994a5dc0ce0186a29aa747211a22f7770eaeb9d5028f07fe79033023b5d035a614db7260841f9c4cb4359c6b61a18ec03d9a732b6a770809e117edaef4d994c80c105ef67b2a0e52cd156b11f04bab5324de984bef86170aca5568fad7797239ded0b3fb3c8adc001d4d0eeaefac92ad30f6eaeacfca2dd1e97dbc1c004983c20023e073ea4c62ede8d0559b08bd30646789686864ebc7f325b108c49b29ad1ab8152b858eeb71cb0d4cce0ff4ff433f2a5834234353255e20c6ac217bb10219d48e816ebc5e89bcb8a129bdfe3c51b8d7a55fb5a6bb6e90d42aed5567aa62604943d6d4a711a0c2821c19cc3f8f5343869521d159c26472e7d0f137676f4b7e90bbddfc22b96af8b82a123d74e654d3a64ed647d885b4b28f9da42e3f950b8ea3b42556e0a4ac5169fa9ba6937cb3cad7119a4f1d2f08251169f15386b812b8c7139957a0d9beb19624c37dede9a8207281dff7def66b84d397a00bd223949337017cb3bbf75fa40fc36e5e10f934c48eaeb79aaa9a9d0425309399296954fb0b350932b931218a6127f46151eef6675fc49df70b1cb52c0741aed8b35641745ab66c95949770eb372d4e594a8c1beab48a96a3f510c536bb872afc56ae86979c33ee00a73a5f72a6c3d74f5269dc05616efe0b17ae0c1ff0c59487667351049756745036a0489c3cccab66fff698e3861da91b6e3d12d3063ff529eca550aff563dbb029e152217fb25e845421a07f9ce64603dd9a10f54b88c2f5ad2e8d119ed1ed0de145397c2d6959b18bf502b338308e6803b7541f6fc5672ce2ef79527ed528f73168f9a323086a3acca9bdeb10d1e06f81c6a435fa4bc6c897203df8c86d8d5dfba4d05b02d7e9540dc91ed54cf3100ea7407b2678a13eddc8fd16495ebd2b8cfdc8681e7e25237fc42407e6acaccfdd2ba9820c26bf57ed75999975d725dbf9a5d21ee4335ef8819525f298794ebaa27443ddd7f1ca5de588e525ddf6d1574a75a2cbab062f473670b244e35b947e799e423be67d0063d1552b7903296e30f1b27b6181de34534daa25145b286ad8848098844cfc88b041ef7b1fe1fa0befabb27e93a60cb80e83eec6658e244e63082b45dabe05479a24530b46287756f6e2bcce090a9a14557732fe481c6457cb7c75650147d9bd27ca30c313bb817e408b86a2315ac217532236c96199d6e13f12d64550a8a0722a13b4c2568432c0b816af9254194aa9410a9d5521539a43a5e300b9e5f8043fef0ece9df06d45093dcdff59f4ee58eb32181660993acbdb5b9a65afbacf55063a144ca6041419c92a8485e03285ee1299deecd4b67aa662af04930a015cec95b952404d57de925c66d4b0ab3e8f756f76807de7405a059cbfdb544ad9fbe48f6932714d2813ddbc30d9d35becc1f09f7e5195beb0e44c3a434ac6c4d7b9d731224d883188222e266e2c2bc70d4176fa889f6902a68377d6cab10a5665250234be98be236d8fbc2f1bf330a4577da602c3a33b4b19aeb36de5d48a6dbffbc85ccf557391e8d2a8a75f3ae7532a7d6b12b5974285422eec9bd9e494d5047101cd4a25a9f06eaa2332617500f2386fe8a9e6386c19d6b025b43091744302882055dcb00ece987e52aa62b08f566e146a2728e792d3453bc7b3accc24513c378112456d0d27d13744b3c216c8975e5a10a794dabe7fc465002e2728ed19a04d9d8d3752cac32f58ffc65ec0878ac3a8e344ca0eff4cf07519bdeca9741dbce26f0203e146e02fae7a3cbff193a457970ef0ff073676e6364672b862a3b1b41bc8c1a4a7092524a91a2674634d3d37bd2db4ca7d9cf9adf4621c9e63a245f402b7ace71dd4ec633febec89186cb8b19c640464d1f8025e789d1354280b9845a586dc6ee2c328c6b32132b7793a55b34b1631aeb5200bfa239e9d1eb9cac61244a3fa39c75a63d76ae9a7abbe334410e21c8fbb1c2dc73c61ea0266f2aea3037dd4f6f08bcfd56b5a68aeaaa101787ed6bae288294d13ccc60102383b8dcae1ef6c5895faef773dbc4a6d044b6c6d9013983c5766f10a14f14c988a23e4ee156c9dfc655803e8fb2a73e52f48dd8b21a1828b98b22a5956617153e93ac271dc360b79deb88e34dcc862658276bd8781d9c6301f650fee3ba0da317df5c75028de97788d7bce9c6ddeb6a2723306583dab23d65007731ab79d967ce61b99c4c6935e7761208663894d845efcaaf03f356662e0e8eb5e884480c74698e1187fffa28c7a3ee2d39221b675bd9269d4dc6e56fda2c61fe665ea764e74920eb1d732632fc5a14fe2dd9b3e19230b1b6775de2d18598e9642f65a0c0df578e2a17996d51f3a4519ce27ba5c17b5da5cb543956f8619da240955a4e18991c65595f4d4f165817131608dfac9ad16f7fe869b5ac50fccacb453d888458d249e787b73253d7fe2890412235d5a9c6e968529c21599ff7bf3a39fbe527dc6b16d0b45b82298374c9c539061e9f303d6ce792e56a9cdfbb2325f372c8421a437279c559cf858589042b59f4716c215498a4e3ab9f4cf56e6018656811a9ea088dec5c8b021197b0980052a51fcda73d71f310119ac1182a4fcf6892a02b3a2c42c1d1ad956380c738d108b828cef785c0fe8a39f739f35820f777fcd8ffef68705b838046c32f2eab34e93c92692580a555136b4f490c21ce7e9e6f9328c91dc2e68bd637f95eaa998f5abb6720152bf2528836919cbc6590f7f8e7690c808fce34badc59d48830a0aa7a399efce60269f0f90c8d0f9fde990d6019d30a3ab8932454887570cdef4264a471a22c2411ff47b3bdf8283103369959bf4f64ad3e99234635e63d2acee587c55bd98133e4e0cebea9c9f42c9387940429227ff769ee4ee60c27bd84cda32407355081c7c8fd9da51e73aeb4d0dd6c14b01ac69ddfc0d8b34cb505461a4d2afd0038890e28afbef178727de3f5cdec1ab07e554ad6dba9ea4bee23decaa7527d6f867aa929ff18e3dd7eef6a01934054d2373d87383aa95871ba33666b187486180089d9764b1e6a9825fe090322ac3155b1d4690d8f65fa108d2d78cae0b75211710a378805703678dada6393af4c1091dad1803ef84d5dc815135b7fe4d5880fe28cc811de34c9dacc0f80a529c66bdb15b1d9bb032741b9a246a24b74b2dcf74612826348e61abce4f176f5f37ab331ae70ef2d1c91a623a0741c29b39377e43ce57d0e734732cd40bbcea2854820c50318f5655a82f5311295cc6013b7275bd0aade2b0e322dbefa847c99bbe1b5f364f2c6aec13e601276b916d810e9beaf577fd7cf16e6c9c02483069fe4c6aa015ce49c824b062d120c04b0cc45aff461462091cecafcfef1db33880c8e03193bc7f2f150248ea7fdb4058a91ca8108cc4d7f6d757d25659bf52833ceae385546870ad3587311482f758fb7b6a95e9306263640ffcdbb4934719f17c59cfc3cd2e39db4db26de35afd7de17f2c1858ef2ccbfed7c661f3afc44bdda92e60dee84aaa6d4a68cd910827ee5383f108f82d449bb4c157bd1d869863fcf5558bea5cec1fe513473f8b59959c5cad6134d21be04bca8fb33efb82af91fa4eb833ccec98ebce7d6639c12d411f880086b8d2f317dac18e372f47c9c88e09dc786f86cc0acec29c770fbafc57f9dec78e1378c67f6d98f7568b6bb258c2d726fdcf0a88217fbfb75bca42c94d3033d7dfe8b0164d5f5017dfd6b6d66c5d0af05c9cc5a3fa90e0bf5bfd7359627e1fcd1b58781bab032fcb0deb556b1a632ba77fb31a9070f05dc56ccd6792a631685eb91ffea4ed84c93eaddb49fe3ffeeb17c6c37ba1a2a2492801e6ace59e57b0d2f05ad1a49f0bfaf0945ecf26b392d46f0b2912177b3d41b93eca6edd314fcbf29a6fd6d1eac9e0cf1b27dc946e0b842ddc8963cbb0592aed6e48e88cb2ca928ea6d2eed5275c481a85100b864dbc33856adefa413bc89f2a94f4c2bac79334b0b2f6dd937f64512a22058814749bd551ba45060ea8c8b6ae3a9c4e26a28d27cc66b1be5e2a8791451778ff5855929c541b85ee9822da181829ab0c3a8ae654cdf05518226848c313bbe484f0874e9b12484e289cf959754c94fc2c57ed65547f98337c0ab052f30f94729e22e1ec5ab4d2c0603a98b26b08ad1d4bba119697b7bf4f694bd2b7bddb3233f7b988510dd816e623fdaa1b682a0b74117cba316ddda1105d57fe5b08a6d606bd5a5bae8200eb675be7a86afb80165bbc7ce5b023cd8a3a404fff50e9c2c9ff7fd4dced5420919ac4a08809f9c40fb11bc6583425093e6f2a73f33f11ad4b63977419a16ba79afd9750aef9b561e4443669b33132a9082d5c6541b7d605bd10f04951d96f356239658ef4158ac89a9362ea622a2b7781c8152ebe2f7edc573171284c9ff20f87282d312c3f24d6967500862a4419eebb5efbdcf6b7ae15a75881d22de4800019971719f74a4001a7e404ac20e3a514a4f3c3a47f52a2e97cb5668953fc8ebf83a7ccce24904589f16d987cd988e7e28aeb2c6c7d62bc0b2df236c284a972808b40ed9a48a4abf6b18ba299395ecf27359694cd46c2c57f8d55a940bfa279d7015e6a3b4208b07f7d2b1e7e6d6dae64d19051f4ad464895a655c8cda8e6dfddddfccc0b026901defa343d7a0a101838b05333b796d53fb8d51a87740cf20c2141867b013691e24f66378739d5e0aca8c3ef53b4547c76601a2ad354dc4830a607dc324adb4d21ca3acfa43b423fc47c12fe158cd4c2c2b19a6ed63500a74e5003f1961cb07131ccdb237d0e36bfece24c43976a3c7515a80562a7e2542307c5da25456a6acb244703da757813d830c069e6caaee5ff081012ff2526ab98d89052671ad3f8e42bdc5b181f0106463b7b935f982b4094b709a037953b3dd8c7847db1c95b0b20c602b7b6a402ecbad1843472c83c894a9315ca002c87b8fdadc5d4a3a2a0e0871501415ef0a5ea90b91a47fd30a82d49e089434f3f68a8278fb4dd2aeb4764096da084194b3eced00b2739abdadb613a4e96126d4ae7b0e4caffb20fac09de17d69fee4b7d02673fe11568fbf67616a95734037a2d57ebac644b82d5bcc4acbe3124a69c08c93d7d8ff2470e214db355aa80af308be49f9ee0e9a7d313fa8c76370e48de218e3159cb47a750a106a3ce4313a0b1a463864154be5d16edee7518a4a19dd2790c7f9c5fc253a592fa773dbc3f1dc05a30f92cf23e258997edc26e34bf0c0d9447d7b104648934066697474f22b8f57d960b86be43959d0b7236b1e851e7266c604bfc3eb62c25c548b9bdfce81ec4176c766f8f02b11b0bfa70f0dbbae4a41df32b0d45bf395d54983eb02122b7fb58f4dffa47a73bb0d3d6aa84baf30cd15fc903844657b5ff882788427872ee2eb2933994a4ce675e4a04afc513b5736452c3fb381f3ad0afa82f7a54bbca4b41373c348aa73c906aae4dc00ff5d1c68999e4e38a6f84cc2373e3e0cf9917d77252275613bf0803e4d8682285b137a27f4976b8c875bae2af4a7d4d40476ffdc65360572c14fd0bbb8253da5364f68b517d14888e9c48cd380a1d69d9a3763ef716e0effd03f7284943aa8d58d4a2dc60783de1d5f37e1c97c3e7a53de402ac56cbb0b9c78973e69c8dddf9cd47c7412f1ef0013e4b2ae0b3ef9a04817f57230957477e432faf8722f9adf225a01d99ad02ebec6262ef0a9551fa006efbed1417058d19a178467327e4f8cc4bc8e93f0824af819f836768fce82da4c1df872aac7d17ff5743d1b11b76da7c01e3c63ad53b4e40b95e6e4144a640c1fd5461383d56cbe0dad14f7d6f6a039b41c59c329705a027e1830bc11ae54d4b6fadcdb3a71e5fb51742692130e100167379d49e21a09ac8ae6ab5e9ea259fcad47798fe5b37e5fddad077a03cc93dfcb614a91218e3b1a9617fdb9cade5769c2524b35e6db01e9b6e90023fa17b9099763e06a5d7f855f549f84bc1025502b6614989c389eb7c8c789dc72238ba18b202e9c97f03f60a1ade1a50894f5700ae7b65a18da945c722adffb2c042c59de2fa5736f6d104e3f17b3a164e4eab04a386e7b0b7e90614bd0324083d37c9992ddb681b96e999a66f05af44f484a45bcfc8ebab15ed6b24374f11505eb21b85b69eaaf78b9cc68f74227a598fb87d560c6719b338b2160b27868e009dcbe742744bea06948ab9ff13571644d0f753ed0f2b51e9ff0e3a630bda95e93030f24c0b224a6e855d7a17468b02901e037fdf17fc6201498f687f1a10897ad35f40b33560789544328d4533c4ad5ae4005aeee054e78f3b838db24a344edd91a212593db0570f3929afbbea9448b9ed07bb4f074ad9047a08c74af1ae3f184e11ec631c4a0506c03988f55a7ceaa180b7a9563563c617bfa2298b61e72d0056cb9f7c813519a5601f36f77126e43eeb0e542e83fa8f23753cbb48ea01e14b39da58e907b9b2af43150b387b3313930333522cf33dbe5c1444af70825c2338635d2481f7528fae7cc468bad774f1d97389e804d25274e94370eb0358fb51d15510960ce4ee01dbe32e8bfab745c6a1e2b8997eced818da00c0f627c065530b2503e962a4801a9c41430fe7683a8c746035e004b026e9077f91fc7fc1cd074c101c863eac8d78683bc38e8e2e3eb957f4ed09bbc808d09c878bdca3223bad3ebc8659e5c04a4ad3bc81ba5a6a5709f50f19c283b98f117411efc533596b3883e19493548d261a7825300f4e302763cb8416ed3e98149e8d01d0ecac0ec2c3d6b1f1a9674c0e5c7a36fc278c9f4d444231e2765129b53aca29e45046cc520f3c6e06cd2f31263bf121009cb4c6977060ea33edeee1ae5c4ad89b45ce475120988861b592e64265d5938d2ace20f77b109c2ceacd40d3a88980654cd3df01cd0c0e4e06744fad842effa21c6b4e3a1b9772edca83ae275658c7d676725624b54e5fc6280d058df7d4a6cc73518213d72e73a04040500876c117aa8f5149b6fbc7913cdd0667b9e2e36a30b041029d03accedb74389a5d9a55c4f6d8a53317550fae8408cb380988fd33a48e8463b6f47d8b8612e9e343ed5f7a91001eff8f1db45afdee27afeb9380dda798e159bab1960174bfd92233d0cbdc1b9e0c83ab79a6ceef96b8f77446fce26fd547a5ffabe3a033ea076d30b0c9d972bc128d9fe1c7b7988ac4e9ee14f6f4b3afc348e1927d0b2ef9f23bb621f8bb7edd5a281df2c6b9bed8043188a68cd5a70a9f591a94b1176a0166dca40459de9299b27bee68974d51224a2b595e85f2a22b48e3dfd2d6700a5cf61cd3ecc4296507b1df2e658d2e42516d8d5f36a5e074c10b2ed7c55adfc686bea61e9362b2f42a48673cb9a38cc1cdf5fe0bc7d3ff9b6c394c61136c4bce66f35b5db54648a8885f61163348adac9fa856384f16db01f9d8616d146afac954a0d8c03bc302b546c61f823f9729b012ff82e004c9bcbf9b75995f90a850809f53217a3a79f6b2a65ff0a60bee53ce73bff65a5ddadf0655a8d67b17e4cf2ec76ff5f57e7b351fa350d3a6fe512660854d2cfcf6ee0fcb6118345a9dee7e6a0e2e08651c4da57c2f8f07cdd3a50e2cdcf8cfa4d7e10cc111783ea62f2ecc2cf3ed952a1768aae86cd13b7fe767d28d9365a6a2f9f9c39da72e2206634bd3f882fd20995bf92a009a5c9c5a159ec1fba8b8aa616733cbd028714c451bfa56178e1a4cceeba9a5e2c86b0c2012d0033508c7ea279361cc312444123b4ecb598de3bb6678bdcb7826e1647e1f65cf45c13477136bb4abeaf97d47e5e6d816f448313ae2ca0c7ce1d27e6c17eb8522ddd2a5dff48e72e6222319a518c3ce04a4b81c011a264b1d9c615796544f37dafe0465967a1e2a8eb3a9101cc63d5a6b228149e921fc0c9d1f76d87be5fc453472c2e3d15dc3fe9eb17d996cf8d69ca347826e843377d14109dc6d9fd742ec292dd28238eca5e36dcae73ac1b88b52fff31f8eb46eefc80d4113cda17c456ba7c05b28b6afc8f0ef6560f77c9d28fa6e8ba1e854de5d8468e52ae70862da1b2170c2ca334ac85fbab7b305fcd066cb989756305db378fbd95cd0f0ad4e2a4e59f95fb3af65230fdb428bb27adac8594e3d1b25aed688c36acd4f6e5c7345d2b812ee528a3c53fe691ea8b2b21a81cdc144b65759f0a4cf5f430cf2dd18c5a41fb98953f11f2486b2cfb180d9cfdf84153c5b751c6e42daf111e2d1d329ee88f22afbe219bacd5786a7e028319961739f3ab4241339f94d22adbe40ffd10ab4b71d8575ae274e9d61ee48043885447df6a93cf36c6056d7ee6136d42d6e48d2a1d8ae011668862fc573c44f3b2811d96ff9f9b8dfbf6dc4867b853623c9d9df9956880cc779995741cab2dc4d384ca08fbc777d1f20d65dc4674cd57cb722ed7f0abe02bf0f20088835b0d6437ce8ff24b299c082a01c84da82d3036ef1a1ab241a4c6ea8732f30af0880978cf0e67ae7c2d03b430533868d6e063345e741430276441893a9e1262b6101edbb675dcfe48ff499d41d3ce70998f53442cc4b6c675fdb5d747d33b023d774b3ad43abb33d5137b80762d898b18b02fe5317412755716550589f98af63211c0c177e99a38b463b6e42c2cfecfbc55e4aa966b2f3c45829f74f6c64bcbeefd8e96568cf5ef989eca1aad57ac4c97e6ed0629a6f80faef71d26906cfdf2fd41f1cd626a081bb5e736981c5ee3fa184c393e22a5a4deb38f463ccffb5300c1bb5155aaf53229bf58ea5b00281d95401ae9b2878be614acb64312fb3186dd323488662c91a35d09a61a2b14353e29dc44d7622f5c53697ccdede81f7a70b8556fdf4ffc869e8b05b157a3b3933ffe3975f39773931622d8cd13d66e76d3a999ba555407e9df4ce0240d606acd21e335755febe81c4f0f88b4bdbdaafe97c6c8a3b1a47b4640409745e18e7b51f9b574f3f57490caca2e86d354694ec89cd2cd716612c725198b1a570332df855acb1a301a5d205882879bf6d4f76baa426748aba5cfa67c3662992c806fff4ea70fb8863d7fd2c2b51b944eda1ac64270ae4cbeeb52a31cab6a954afe7483a621cf993299d9fe8c89382d823f4e263d4a0f342ed58ff158c9738a751bca07bce01af1a6652359f9602e750e3d4cd1c448280d9bbe335661b8599c17b642e70e49114f85e4b8b06339fb6cf5ee3f9a4e9d7abcab664df4dd9bc4a7b66989ecf7857097f8678763919204811c309118ed53afc1db2a0aa755ddd8280f9829a0d34ed07e025eaeb73424c1ce1ede979be8bf5d925e560ac24293547a65b545c173215d885fdec154da0d44aed8e2e44df148b99db6474a6911ed75438b6fe98961ebec9f01e190d21f9816d85f7e2b5d3105675a134384d61cc21a3e6a8bc0beac8dcaeb2c6edc83f293799d1f0f28bf3ad5102c2ee4e53a58ad72b758c4129e98abc3ef58bd55992b21b5683b4af574e075ccee41d73b262ee948e31ca8fd775c43f48fcbae8df3cb4f8594c2ba6d996302e82d6fa4e71c98c675cc55d24651b132aaedffba8b3b305965cfcd29f2869ecbf25a9378132a15e64d34acb7e023f073c30701ec7ceed237522003d8edc5cadf80b251d76320575c567989738f73c3e5e0cedc699600eaeeaa917067643d30f697a711facad3622bff73128bae003111896885044a232b9b5b90d92fc0ce7f2066fb6e9ce1b346517997749bc7f0b30759330fb8736519b13be2cc7d8d75847934ea5ae26aadb53f59e9a27c164dd581ccfddddf0353e26135cead02b57a5d6ca1f423729897d5fdee941aba22e349cc8fa262e6d2681e0902f252f435aec6849768618b27f1961326d760812351f12410c3f03cc8f14a5a251b2e8dd7a432d0ceced7dd956f3bcb824839f3586bb810204e35fce8a7bfc97a18641a5f8829f664d3ba4b3615b28e268c2f405df5cb33395ca288c5f9654d3aa39f82a8645001380a105beaffc254cf5c5b7a6f9f600ce3777e5de437af293a8b8eb541d0b3d892cdd500021fdd7c6014aeb11689cd825ad2bb9b68abca47c47ca4cb8068211833ad75f07075e6b3cbd440ec411ef8843beb4949bf68ae2f13a47dbaf05e5e7bb8a0fda0c76dd2605b4364ca2d1586afb2e6013e37213938519f09c00556fcb6166cb7da069daeba13f8d4afb98466ab526e6767b6e4dcfc53fc826ca2825d75448f5edbe99787c6de86faedd1e6b03ac92fd98c59d25b8a299ebd9c1561dd734e7a9ca6eed914c5d2c47fc0c3d1f246beecc70bca31f63dbe3932aff039e08bcad8ca51c13a37a41a3fabd93d792756a898655a2ea9e27632272ed43fa43b8776f7fd7cd756a13b504a18931070b7ad57a1de25abbda25731605465bf3c5a3726955a16794d85c29977da4bd9fe8d1a26d5246c2ddd08b5a10746506424367f724087760d58814220188ddd4a48fa9d97a52000841c2b1b81ac9be952260a04cc9a51dd2b3f5b05ed8a5736f0b32f3f4842c61cbced23ff4c97a277ef59fb46ab0749aab36287d8d80274ccc66a9c16c46ef39e79bb54a5d514fbc506d22b9418eb0d6ade39470cfc0dca1e8d0aeede406256d0ab90c55e7e3a4d98fe351e018e9387dac732e9cee3caccbe8a9fe18a4f3dc424eaf3f06510e5706eb947c4dafb94b27af3a5a513bf9bfb085cbeb6f0b9ae74967769f0104b2bb1c24be67ef45daf33eaef993394d8ca5d533a3dd093055aaa03a6cdf7ccfa127b1710e0c66cdcd4195a4bc549e42a0cf78ff28d5ef88d973ed113161b5af756f4cf325944a87cd77dbb987e7b8945dabd9c25947f60a016353b326fb4d775350fa3aca6373e64741182dce34e1243def4d30bee8a4a6ec930f66a3a7291ba6e628c46d4b9f884b0484d9f0eb8c98dcc10ea7471999491dea23e3f7cc075a0e288ce41cc4e0676cab601674d78fe15c3c47c8d2990fefbdc03e7f1d2d4d8984825cf97009dd1e866d321a606cad07eccda4bb62cebf6762d3eb83300abc2130e6c07dd04fc00f13e90aac1668e9630ea4a90453a15b82c771e045ef883c7064066d7eed22e9dfdb064017b6b9feae8b817f75c7901dea0e9276e697700b2c2271c30555a5412ddae2d951e0dcd5e3e461a490143423e9ee17097e8a7fb30689ef5f8f6f991d52adbc0885e7c40a8077d8012d56aa6c7d916fcd24d444760009c820de30a7a356b1375c62ca271e81758556f828bd66a834051682df22ae46b7eff648970c164da815d28761b539c199928440204f63ef0feadaba7745d09a0d26f0ebc98ba7f7a5ed6c2d70bc5b45528b7e5719f31b3fdbd0201eaf4b0bf72b3664158fd09b9ab4cdf484fa581bfc95023d66f711e0cc8550f0cc786ad57d5eec584f269364122c58adb60fb076a46aff6d07fb993697b87979355e4c047fe5f758958327c7d9dc9b81151754a47d7e9fc26efee5faac3d943b08d53e11c1b933569325414ce67dd9f3e4c78c5cda2556ea9d2a11599c7a69babce32c4f412c742daa01e4bc40e28edf8d057231b4f61b1e6e8606639fa1e86c5535d1808bef936cf067b55408b042dd779e3dffe6c88a7c0b46bee0390b08e3fb61d2a788841c0857e35a0e11cc354dd01e89f85497940de6d4142d320794c17f37b425257ac536d52a7262ee4b2747463aef2db49bb54e4f03089bbf005a72cb6e3322967f72ee0f2e888eaf84d583f991a3c43980206fd7b28485029bbe0b09c607452ccc86f98d44763593e10d52da6be63e7552650978a89bb11dc635b7f17707897c6d5ed32f281b5709c5f98f0d1c30f9ffafb5848db1c452fed80973aa673e81c25eb150ef96cb1510ec57c69144d309154a4592439cd1e9286269b5d9ca183d00d7b7f8209fc574db4aa8a071e960fe041c22fb425be30becd7d4097adaed4d108d4ebd94162bc8d0a012603c60653ddaf57b74e59070b4595e8503534bf11b3775377ee2fbd3f22e6c2693bd9afd984e53a779046d7cab0602ff96f68751452557cba955a1dadc6b0ec5c934925b155eeacd8097695189ab1d931e9b8fcbaebfb9c83c07471dbc3f51ff5446609d6847a16441b5d5f69212c7d1088cad0dde91ab7c96e35fd26a90a450a44ce7c36cfe12d0c1187f1d777f2b594604effa056f7952a9eb101c640c9403a77e7588ac1e3878fb53d147a5a88157a20771a0fd7855f0b7d408211c72b6b11ddb9f24203ec692edf43608d04f8556a02e96a546a6747a61cdfcf8dd6964b44e52602118a6398deda422361e145cd341d27cca54105b7fcd65b61aa86fe1f2bb3bf68c8ac566b8b2ba49ed7af6ef5b39054a9791aeda081ad09e2becf6322410121e8b0f20e615da2854f326fa32affc847f6bacf2b7432fe2df6591426eea37e508e7f19c22a3cced431e01aca9adc2929471c7daa4d6ac1b625a2ccbfdf6e90b8bff5bc3cfead3bf997bf5c5c5e9f263c63607c7a7f18cf97bf8efef2e4796102359748148dd1980466089a8fbeb4b05f06ab90a7d4d2f5967a0020c4c905e91814583e0a9e0b8dbb08ccb89076fbcd8965b3ba7829dc8e1c6370b935d42039c3fef0b94f11e4327ab07e379901f12516ef0e563c9400bf6f7f119df2360951c6d715a7ca6051d8221da85cd16bdc3a64c81667c649a7bcb04f3cc19b2c09fdbc5d8ed2a686ed795c024f6f263354184a514e41b859f60e64900d95b4d3e0dab03b7c34a217182a71381a02cf0d7ec9debcffa10f0467fb03289ed73ed0a413765aea47c49e340d3da6c2a0a9ff1c994340888d00e6c451493feb95d58efc597cbf1fdfa939567fe95e635f283dddec12e000b28691b7e3fefb37b046e29bc7b377eb290b8337b02524b2342c8d24f48cfc25e8fe89e71f55a7e29c01cfabacf45c29e77cd137fa84a7c40dc3b986ae548df64b7391c448ac4ae1d372193dbbae7b071b67a60425bc4af06b2542ba909b1ed9d417014abe05fe1acfbd8c66e6607c2c23f98d92901d498183131b879b598a618a7675aa35e2133218796eb39a13d309cb95119e2622cdf85a99ae734cc2dfd0892636f8bf5fa3ceef74dd5019dcaac637838c6624e17b8329485bae17f8b862eaf2023b5e9d31ec2e36821fe8aa9e7f9e3cedea0bec09f4d759aee9e3ae38a84fdd43e61fd2bd1ff4df48d57672ee7b827049d5fc4b7771b43792be09a2f1dcc391901356697648df27162e50bfde01796be7904fbecca8bbba36895a0948dab5e20a4cb293b88c55cd087ec00d61a2e46cf3781fc698696032249e74c025fe40fb2a91be9b2f3a0c20bd9b087dc1065417081a42cb3f139e7ef59f045fed7803b01231dd6c34d1fbebe1f9930303ee23d452bb98e5ccd89d3c9cd4aff3421cb2456c426db85c2ae1de5e746ea81cea29cd2e4361ff6eb288f58892cf8115bb3e9e519b98798ac0898111677076148c01a7719dfc6b5710344e38f5c307fc3f3167e4c7cea7462ae4255dfbbc20b84baa9be7d7f6d55acab863e79e3f7f5cddf1c221237bea52f43d037b32fb0e02efd0b92c9af47f6c1854cb2f37411cd8e94f4c65d65d0fd65a1ffc350576b8dd971c1898edf302d7403c005f6c0ff56145f75586fd7dbd71cc7261ed1cfb24bcca1ca6222070cec300ec6d3a517a20cd1bd1e8656c58208a154d5414ef294a0f2a3a2329629a0110b5472b37890971f43be9850141cfe388f85d22dad2fc7633e51a8cbb558e7bcedab4f8f3477d3908d294b9d9d1a5517880e339408873c2d659c706a4a3d94525914e72726dded24ac9ec4b4b1d4c6c7fe032bb5e70536301d9d479dec3cda881ec7260b7e67586103743cf98bac2c0ff00520a0c88047c74b1021e2aff3be71e986ad3ff94908b846b574e888afc985f2ab47bc5e0fea4535118e63bb4e5974c2f72b9cde2e6aa469e6409e971586033f323a741470bb1fc5a3ccb8849189dfdb125e2c255e693cf878ac0b579d447c683c0d05dbf7ecee202aea01904ba54a4c5994bb6c5f00678f91ccd4d0d54c55720ba924be2812f7d6f7c4622c53c5bb9327b2618c352e31a529381b62c0329e0c8bdd403ad24d753941072956eb9338b7e04dc4b6cc445b49b8ad09a58cb8095f56b74a5bd9a910d3a8aaa57da13591db6f9a7c059f18052b5f28df0dca56ead04b13aac9d680fc8d2a2848545bfd6301f97ba64f851104e226f5a5eed18b8b38b49e6b905012002386c1ec6d4d3e5c2519c5c4a53e92ddd484769dac04cb2a45eefa6fa2979637dd00f71ce6b14ee21e742b8cd12061aec55d684606e4845cdef588282b89fcbb0f0c1cb74eed27d0d5f88b8ef6ec37a86ade1cfda431d9b4f598d719d1dc9274eda25a09dd8b5d7dbb390a182a621e8e794beb933acee25bf2bbbd5d7ca360772d82e43e74f15750489e70c1a5c71fc5b782d0f2e801c8f40171e9f66f4f33dfa16939c183006d3f9a3eff9012f8b97d60e07204971321bb348eeff3f474bdbabb740512a5c0ff9edcf2ef2423e6c926584ac4a10971df6a697833f6a9b23394c99187e4c67301009e6ade32e7d8f31d4147ce80ceffb56277448313c7c58bcf14e5dadf3898a80e1e74804244dc240da57f610ca0c25efe40a2aeac87245c798eafc99d9996b15676b5a08bf887196b502d7808c9f6ee673285d98e9080bbee8eb6f7493a64aa99ef7afeb05c0a21559dde691b7961dabe4ce0d9398a6fac9b9c0aec3fe4aab01b204fb8b36395e1f3c349c77dbc74b08dc1be55f78bc7541cc8cc7fd697934afe493c46a5f9e2d387574757b6e8b1e5ca64ac17a3011541e113a7d4736b3c62fdd8e1ae366ada0b4406c114638b529df2e901574fec1838972734a5e0bf0ed953181b9df4a3e739c97b2b5b97ddef65e84b9cb0c85b5eed38ebe700e9a0aa1fdcc61e24f219decdfb7dac33b490ca408c0a868508c4df4c59ccaac204a5390f9aa3a88b959eed1d49b67b836601e8da3593592585cceaeda3b7145f9935b2f1834329ce7aaa9dd40496ffbebcda88a13dbd1cc873065175b65aeeaa0be79f6162b43a6215476fb60610e24fbf88f147376a29ee34c78ab927e9dd8d0483f2e94a5fa0355536a5c3c1e671b9fde19442de50c01a3c864e04bb2b2da1043d31bbb4419044f49a87e6625cfab4ed24130e2e7f5fed5200fddff256769da5648d3f2d9396bbe749e3bb96b2e24ddc041e007f9947eeea0f1a77951a34857a5f6fc38a9badbb3796ffb6278d311290a186960563ac9edb9de428605948076708af5b015831016f6f331d3b9ac3cdf875ad4c42472748441b12fba48fccc19e5d22d72760410da7ef7b3f689a4f80e559ef6c25b8f048ecf2d7c45bde955e29d55592c377ca7e0c35497d98edd4fde39a4db7aefc1dc5f4f06c28f34bf4a9507ff4dd542b34d565ddb20046a260c302490ca6a64df8c7a4ffb89ccaade9c2ef4fc76ab43e20aa6b3cb74fc5a1ca2ec79d0728044764efa576f48a1d2acc53b2fb7b836193eda64b0dfcf7b397b1cf50a5be440a382d398e56ecf536b551ac319913a84adfdfca726792f6277ebc0ba58148205450e3919a1dc63ccc66813e983feb79918695c32bbdfbcb1810ccba3f19d62f4418f9f1fa280303261e9f5170676843d6e93b2ff8b53405333cb47f9a38ed0a952acffc3589543688966f375680b47942d36b183cce57b6fd9ab84122b17b8f01029bde7ba887c1005b7c6f659ccdf0936bcf6e4f4638a27f480d5759fbed64f38996cee76c844b19cc4c0f62368a5da7d37a794147072515c37257eed3a7d9db36461af8d7af7a4b4f0f53f0716d80e9778c34b9f178c47300644c543586f27300ca2bc47ecb62fffc1bf9f5039f2d51cffc1de231dea56a006bca9e77ab0f179ee85063e93363a08b986fc01fa6b3214de844601fb51033ad319d7670271c8a05a79f3c977ae53270233d032c2d9c245bafea940b42a42f2f3e62f5aad97267da76fce81b6d983e56754411ca17c670d00038cc8077db7e0f02c21ff4c94f9d789ff1ed7908afdbc6fb37484b234963710a2cb7f8de3d4638d4f888f4605e2e567b22d889cf63f75cbdb4d9d1c601b9c3977ee62157e47ee218c56be4618828f08310976968d86756d79a30e60e1fdeb8ea33e10617f4b5cca1b6145ca6a8e965b2fdc9c09d7777e0c451fd4b84a39e3ae99798f07e4a3228ac1ea3ee4b9e346b96069e467dd9d48ccb992c9a9af9326c3413b8db2fe42cbdae36c49368fce00b1b5ecc29f8268fd81d1aa991c4e17e8a3f05d4141d4590589ab2c530b87841dc9dedc8b83cbb6a7de75367ac8eeaa82649b8bd6f87859efb4a88cbac929c075c8e852ee8f5379017f56419a25687b42977421b419659844a26ea40c3e35f2a29e4516edd4a9d275c2404375d225bd38ede8a4004bec429c8318450fb99c3a5a34fbc3b2be908e8e3e0ff4767faed9473b882f0d23f0570907572f196131800ef9d7bc70e081ed188bc3cc3e444e4c4d41bcdc979df7a8f316f8d37d3e67db33ccfe11712a34a2458ed4115a95a9b92d254abb5ddabadfad8bcf21f86f4e9290646d264e2c8e9a0c5be5e03a185e44653bc3fee776b0cf2da0a218319735c3508a0006a5399416b320e2de7f8029ac146699c2ed70b4fcdd976387d1f948704411dbc5a302b842f4d11db07103b22c46ae9a7b8d433a9a38d138ad780ab8263766ff76b376ec61f6d02ed2619b92b36cf08dad0365827c234fc507f5639d0909a6a936106fc4661407f0940d84749d399dfcb36dde1218f112f9e712ddb7ff98a87762c7a9f0ac68977f9d89374a6bdd6e4efc594946c4ba15d980ed0e5478b580f05cd323e4e9fb1b9a20379452140a6cd56dd6503d9d8aa9a2800ef32f8acc8909d70c920ff9f8edf50f19f86cc95dded15252085190cdf1acadd197a75cd5d37c813f5a563432e4f8ae8427852196766b4465d69d84e1c706052a12963a990215e1f2da38a40fd97102a9c7f9265f765ce4ffec2f8abfc25ba46d5ac4a76fca899a5b0fc59eb6ada9f8a6975b365280853728d1810ba593a3714800b2c7521648dcd36cbdfbda45c89f475d8e67a7535734cf621bd35d41e88d84b3e07f3f99674d731bf155bfcfc8675b70bbe2f4798f1537e57a9d0b73dd63803bd8e23d585760c608f806b0ef531188ecaae89cdde79dce2a0029f0a247d1759de505a77877d981b1f825e062c9d70ad24ff9fc7a7b6e7ead08d4b00eba1be60135819819348a1a98c8eacdecbab142d37eea80230463ed0f5afe3414e5a948c86431acb2c06dfdba3e39f8b392d9579e604ea3d527b7e35bb13a5587bcd1400b0692018162c1d430aa2a58f8990f3124629e95e5a99d627e3e53adc30e0f0206a67fdf75f253c6a34ba914ddc476b907b428f8c0c3b0e2265549130750c11f07af0220b00b6631f9928d14e9c4ebdde535bb63634f14798f64ae9d0e6532fe42a104edf14514c85c77c2469155bceecbdd5c010d8dc977e90a6c36d09a3ba6e2c080d4da5c58ba3c62ab2a7bb5711d369d13a3ffdf3b1244da8b35cfa5bab2c2f920eee6733ecc63c3849c0bf9a0b08c3585aa3c4593e2830ee03f46e5ede581dafa2b7f9ba3e4f20e081af1d736ed596df2df7188545103b414ed73eb7f63529eb1bcb4a48e7bad799b0aa95b8e4cf64ccf0d2753508798c6e0b3fd127ff38b620d4d91627941da358f0df89ce8761a4ef32d34ca4e36a544fc4d68d987af43d6861b9783557f61b42c4a168d0728fc9a3d8d8d15c785c9c611649f9ab4f1dd924bf6c057e7d9604a2cb9780f99a8fc9e4a20323035c90f51c355ec1dc8f998276e1e9460c4e7b11f709509bcdc3b12342404f01473b45971b5893f37f6e6990f4555fc23751bac3a6dae3da23418819129851d7c95cc52310c00abd74ec98b5d5d369d6ffb4d8c44852e5d6b34112e1be655ddb9524e43cdf9572e94dd7272b2bcc5d1e39fc34d000b5013cc02711a603ac26f147f0d58f5f8437e5cbacb558a715780b64c007768d1afca94ded65a9050c305bd57b0dcbca43007b9d3195fc0b5d0ac1d2c4aaa864db703c7568a171621f27febb1960a01b04e46cec4a353e9cd0e4f3e8c82ed411bcf105544b4cd7072d6bde21acab656ca79d76706f6e36831a78a6543fdf953ae80f62fae15607f2df1f774d585abf6eb8a6713c4d43995992063aad745bd9eeb383fd98e83144414f145e9bc906f0ad98d5a93c5fac4ddfe10c89da2f95f33bc4b0e9807011675c69e42e5e622832426fc0c2bd1ed444210068f6fdd1ee650de0f636c08a592cea068f30dca45d1fad87003c7f2d07fc4ea1f805af1fadb239bbbbe06886ca586f91a52f34a7d368fd02e29434b3923d2602441f0864973b0671406ffac059c4370dd923aad87461c8ffa57f53cf7916b7b505ff54b0ab782cdecb8c24b7aeb03fbd42edfcab90b5cb55f42e761954aa4a5b8015bbdedf0b50c3fb1df6590a01d9d14e01a0f37c2c3718fb344e0fc58a1c0a2a8cfedde79e3449a442b8b79c60ec9351cd4c40e43a80de95d24c75d720031ecfb50ac82d544af4a247040c9233d4097537b4345ca6a0c693f7d2f1aa6aadb27c003217039598d4b1f82d312e87124df792bf5278da558eb44f4526cb932f8ecae5d65e8a2a93e97fa9e16af7314a183f75ff1fb55944c90859338d1c0abc8c3b4fcdc65e1ec3ab32d2067e6bcfabe1b746085fe36979b9c9c38f0235ca343461547f942a57c3c271991db628997c75ccae313a55a8d3a29541dd47b3abe10a792bb794352b537884e40e20030984112c6383a1d573f54bbe8c6fbf874086e40aac9c496431a1251254c1a7508865aa90dba4c02a6ea2dd3cf117d4e3073cb64bafc24676e841c5617b2275d630a407c280d3b3c3f92d9076835db2a6916f7ecd8aa13c4f2bf0e5f3f0bd50f87c8e8bfe407a8875863a29964a034e5308bb9bfb2588390bdb9e4b64d408259e46f4d8ea1ce48633c185d7d514d1982b036dfaf5a9bf0773d76bb20f5a28f4b1b3141d649f6022288c80392f01d3850ed12ba05ee0a12e5ef926ed926865e880da0a9f39e8630c0fb49792cc42a841c60350d978dfa142f003832984cbf6be73a5de183c562f1b6cb98b99b74a2167bcb3e9edb865efad07386b2a6a640fe56381927680473b0ddcbaa7efd4fcc1a3d4dfd73a99affdd51966de792a2b8b75a95ec89ed95d941d22139888027932e16f966789e2da45c5902d4b8e01b5b8a3af0e67adffbfa3fda832f3d741cdc34229147fd9e636a00c4d8b0b0ba5cdf5e644e570ab984841863b8415faa4066a8399097ac55fce142a30aacbfdfbba729df12b2e07b5e1df966f9cb9412c2b49d679443ee19052a4c90a78c8055b53ae9e2525d6a46cecfd91c2f5328d0ac8c3ee052bdb7ba1579b70e04270a0fb3c5d1579a821c989f8a20bee23c44d5f61f0116a27d61ed37c26720c5dda71d9cc243e34ed7cd94acec63f8251b268a674a5480edc8085064a087c5f250bb332181f8ac608c9b23cda60305004cbe66f0c4d1942b90b3c7d24a9c6148fcd0af27d04b29e2f3cf96c91a355c835c1a240438e2ddd6264148ff4c13973937e4dc4be179d3332a7180a5ae4198277d7c451df5a6795f6b4e87a8950e219639484a67f7827a442eb4ebea650a824808a29ebfbc7aa9c8d19db30eb0b1c57538444752ce9bad076d8b95fd96df3ebc2e35276cf90ed76d5951c6e5598fd5448cce78decbb7364f4b92ab6b04b0e37928931eb9119cbaeedf66378e9e6b8669a6c2fc39b78b19a5fe5ee39a3d8cd139ca296f9a5b1acf33ce6d632cdda054b8715f95bc8aa2fb993a7f4cd9cd1e7b22b310752b86f5b1cbe2f877010272ae2ef21af92a43a7a872b6ac656a0c482258d7f241ce18fcfd0150dbc3b96515339b726cc8bf15e78b140a2ba220a062d69b705b746cf060a0e307eba09abbc0b4b3068aa9eb5dee97e86341860a7c119af447f942d1fbf940774ccdc2c1b2a3475eea059f144d9d99861c718b7089a3086ee51cec63f1aa9298eff8809d90112a937e4f5aa51891ca11731d32f168783da33dd31abd0e4a5dd42eb19e4d2c027ce198d090ce730aed76e1398a037d4e8a7fe0a32fc93a160ffa9d3239be15c829fb75b2092a7faaf7a72688174db07ca8b277fc2b5e0dc5e53eb3b2df5a78772d604701b59449d1a6a9207d334efce5876d696c33ddf3847351ecea271be4229cdfec2938e66374932b1bb904b5de7e64e463f2e9caad9392db75f418d86676cf37af46e334f1c4cf4d82da856d78ea453cfb90d3d78e8eac46a42287e5fb38a154c94f94df5b3e4395b720ddb0a77797cf05334d2ba62d258a1f928575f754b73aeb6f89f7ee0240f23959a18d8bba9e549ea1425a8c0989e43bc437e3f23bf4cc7b68d7dfeeb8c86ed47add22417b868c6b74c645d4990773faa3560c16100dd3eba40c33fc7b094756fa36ba1c132d155c508e57008431bcb7834d2ebdfaf7d9a49a75a0bbde62318c0aeff255f5fc4630d821da5965b69e304db3ddce8f14298f7019fd9653889bd631d9d8c89f3cdb9d76c307d0a9e128df47086c9a1ed6ba5b17452b6ba94d067820500e55d0ffb4267548b3a9adfe645a41eda7c8cb28c739004ae10d2f91ee5bef116d3c322f65b8945d62e9f8a822699b8f88fb085cc5849a6c6ddac4521b3548df36faaee8ce891ed64c878612b341b817d0815aeaf442153456576573c4e38b8938d27a228e6f4a6fa4454a7f307c292afc92ca3a608bbb8ca3cfba7f27fc52355917a2b0a0bb911b6a613220714a06d8f55c223777de0aed3a1fb4e4515309885dbea7fdc2da54dd1387ebf41ccc38f038d4d60f2b1a0b7ef6b30de5cb2ee0ea668c04949a65fbe7d461b7d0a87c806210eb1fda8e830bb1b05a64e5e202290d57548b3e3d08f0239c642d35f823f5fa16cb096036ed548c0d019776fd62aa289204098ae6c02081a2febe7aac6e2b7d9594250a9a2f8c4825bf365d9a306bfd48a1cb311662091d2604283a41dde42d9ad47f7687c9a7b9bea53dbb7611ebafdc78bd4c3bafb1a689aa27c5d3c3c67bae3aa0a06b6ccde91c8e9b1f67393bf7dbbc3262941091ac8ee47ae5d125c2b968999960ff5147f5f546ee4694b005bba8f28c02ec8c977980dd0be811b86172d418768f5c50cdd519737a90c45ed0316edf598f6dad628aaec433793fb304dd9fea8c9ea5bef77408def6a5821d711b2e89b1ec03a91ffb934fc93d1a6c61c9c2e368b6f945d2f89380ffdcf3cdf8ec61381b7a132a8c74d8539f1f62151801c12ed1bbe9153dd03f4b41ec05cb4d05f137dc097d4a2ef65499b5053f82955f1278e2fa8432b4b5cf92dcc9fe2e3f20d61a8ccdd56e86ac4963740f7bafdd8f71ae061e7eef7a560801999dd143845082f2d96388cc9e7bf889f30cdec559551da65575d1052043f4d577b3db48ce670f5826cd824712dc2a0f59566cfc8b9f1617d4edcce1b7e1902c20c5ad2b244d6f8b4e8fb965316f35bf625f74927c76f8839e27b548e7bc25601c9c72077455f0814f01209ebde234b2299e0ef75170a680291b58967bf1be1d3a74b40cfe6cfea45d3daf5299251ec533623b79a4367da00a909e37cd71d7dd3d7212595c6ffce7753b500811896d74118126de59925581c7bffc08f0b497a0aa0bcf56d573e95979d5a7b7d1b276770c38d478636eaebdfa0d9e60a712ef8cc9f15f468786a8fccd7217e82757ec9582622fe15d6d03fddadff43ea028b7bbe027fe7fd7c9ede818e94a6233e9a91b83982a6281bdc21fe31d8b5b9db45d785e231265dfce4091e29b9e59635a2315a0db022d865c178d04869f6699cea3ca27fdb504a7df2349a629ae74f2f1a7657fd16a8684602801bd7956564c153539d18cd2362c48c8049f24823186f428cea79190a04caae7a1b94fec3384dcd9e5331529149b7d8466e7579db10c1915d78ba2e6844236abded5de8d5bb81db1ea125ec9616f45d5c89a0da082e59746035abcb6d1bae19cf55f3f3f5e6eaeae7a2bd25f5a5108a4fedd39c7e89627fb907cf4ab8a024e907d7f624eb757feb8754067fbb2bdf718b45877139ee64a48252a8954637df47bdffadb9fc41cbcbaa9f61370e39c794420c13dc6c6b92bd6fe2be668f9056f1d525016014d2fc1ed06e21c704eb929ffa3c734e640499c4444af366d7fe3e763e9dd7ef92c439329272a07593d591d6590219056f928dec005961fc1e8cd06a801db48231f2dede7f53a08511dc89fad96ec1e766f506056686a7ebae3522955583412a6d1b95ea15b76158bd58a4f1a1fae57ed1fa98c6a7670dbc1c7c9bb4ad6e3821e6046734e9e2071a9e9a64bdbf904219a0b4e7ababa4618d5361a606b4c0e855c77a5a730ffaa49451188705a92f75de61b6c37d078a6b37aee848d127443bd93c3959c40a8a5cfeaa4d7b9ef238600f126fa13ac02b8cd078f7bfaa40c694c495de0874535cdd56b9f8de106556a6c13d4783480ac89b0ac314d5cfa658f637f74debe0fa679be997bbd1fa9ef15ed49e10f78d408026f3dae9da687ec3b82c7fd985a30774ba2a86ec8682912ee5cbbd633b2ac505ed709338583b060c44e7f68bba40b8108ab5f3a095076c3bc77632bce7d18fbc0c02837b702e8b50ce138b6ecabf666bd52b1b09129fc2a010d3d7a7b58959fcea3827c540ca487c6c67964ab4f28007c411535d1cda8dc226705b8b966cdb8344a7bf0418323b9a8eca38ef9ab923e9d3771fe59a0bb4ce49f2f242c915dd151a8784e03c2eb70dc8e1633139acfaa08a2050fe1d399c4aa1bd082caf0fafb4dcdd9a2a7bf9c4ec63080f390e662b7df60526eef567fc991b7f1737294e1bb8c672ae2538a2937ef830eedf1f0d612c75a2e741121db0cf3895154da44cfee2ff36e24311a50cc0d7294a80fe5308e40de51209c4ef889302f086151cf8ee8a214a4f5aaa73ae9e5e1cfd7933dc3ecdefe04fff3ff701c4b82ca2d79d05fbb03cc3be796650647cdb4d963a05f07ef782d1938252bec681185e456453bdf320c352be3e1e174f39121f5394396936ade6d90400363836d6a7f9123206ed63faec8a2e8fdf2a2618d2ccd4a2003329d37688cc768ae7ceba2a7a188ad1fed2c4e31af8628a72d29986d7136347b3e29d817a1139126c566af1dbdefd021236dce729912aa5ad8fc4d43f0c939d657392ddf66e1052156c4d24ea4360cfd427590430c1d3995ad9e5ab629bcafa742e1fa521aab80f5dd9823f09082466a707c0626a72989f05805b36a45c54f8f42e4ea13156b99ebb4a262577848efdae9bf033b7585f13cc970cb75a8b2a43372454d4d74c867c3e2b1977bc64afc7241ceab51694659dc78dfdb4c6247a5bc1d5994264a1c17425645a98a77e23536fd93728989ad10a416ab9b0999b49893ab80b9c15a637566bb4307e8564367b0acdc09d42cf7881b6bde3714eadc350165e3335c2b3a759a545b744f2d30e4ed7a4394642f764636857e91b7ca34324f4e58a42076b2d211d67b5f67add57dffd803fc09492f847c8af3c5c10b375657ead7d2e22af45cfd632f489de7af86ed2bc9816922ba5e5bef47c5d2d3d4bb872f6179a2b2165d3cc08a171958029089e5c8bc579922bd71916f9bce03d47dc9f1d30ceebc1cddf727be4e3f7d6486a6f0126ba2cce1e4d3e3e9f50368a6df80e1cda5007c02c5e2a609806b6c2ec2c159904d1fc7bb9dc4c1f9d66f7f85214be7d6c3c6c794817c4f8426750f29decfd9cc2a3a017cff4d4612740d99c84d3826f25356dcd89e0974987099d6da94002df3140a07dd9282513a1f830c3d6aa092a951abf77040d74a278b90076f4e646d96b71a7718e370fbb9d84f9f80fc6d778244e564ce9a311ae0b260fae116b96630c88f6a7908678837c843fe5ce3989ceb7ba1e718515560bcb24c4803dccb65f427cebf841ff3118800df7aa08d71234d47dcc0fe41eb0cc450b0e95f91f14847625e50bc7033a4ab8eec52c4af0cd2a9b8b9699f4258551663bc3690ef5c09045e5e553f54c420bc520a6e064f03d7cc3f47f973dad0cbbcd44bcbe3e44e5a6057f288ea7452a23028b41a8129241a46d68a20d5f3d03b0db8897cde5d63ba035ac07830678118d5a0f48d26fc08d56575a3c7a557db097ea81a213f3193e26c457e4f60ee1a9422c0fd50cb4524cf3d69f8c37338465e967900cac058b147c646be805b8b074581c62b2dd4e5a072a9497f09d4e86f2eb155bf9809df24b5f0f39e914769ee35f5bb18a1da7c05db197cd98e4dda865c9d73de28a22268f3af85f31acfdc3c44c1221973d4921b54f50707ac9c0da94347f5a287b6b6ef3cef2408cc038a9b222eb2b276de86ea1b2202c9c9692872e841d754e54d7c264541369dbf58cebab841298b420392f389b9f51801f3a800991bef9a764a1c7a4cdfd056d88e799111d607ee6ec24a7a5aadfbced7eb8eb2874f1fe952ec7b521a048612aae810e7465540133d22399429110bb598632087a6e9bdf52f2719b38b634b6e3d50546b85f67f74028108ac442158493cf0d01a2751f9b1b24ab9b25e570f5f2df4edac818fd54f58bc43f344cce979b01293b5a0fbf567cf3429e343884a70dc2346919d76b87d3a4a049a586cba7566a06365ddfddbd4d36d14cd7c5fc8776a3ad9c763e5a0dba92d5f5944a02fa4c9c8be38686170ed8fc3fbb1ea064831c6d0475d3d428323a22f48bf14360e4da0046921c8d5e1814ac60261f11c0ee21f482c52ece3fcae2b840091aed8ea8d82e1ee0541efbfbb11e6dd62a491adcb5c9ba0bdb93d0ac2eb66b4fe8781783d187196eb027e0f4fcd76b296565cdcf7f69a78d01cd2a3aa25dd0539980d2f61b2463e713dd916f9e117451d25a705b6549cb7ea7b14563717c0bf9ef7d68772750a092a57944dd360c9671d2a28e9d908cbbe323213300c9689c505c893ba683ea59b69ce0db3488c8eddc54d529d558ad05ca916b5079e7d2934f4b7d2a16d0271ccd31cf9bb04587f56777424a349da1ec5ccaeda37a8a4c7df8c4e9fc225b64d1ab5c68023e1631c668ecd603da13d3e64b5234e95f83b211541f95b9aee802bfdb35e97f40532296ade49a8470d677af616f4311c3a78b1e2c5a6932ce083527934f9fd26ef53e607e2e1699f546efdf367d3bc8fb524da81fb38d78730fcea4c43e76ece45f18e8956be2c1f38a8c7ce7bb499c737a771f10fb8f73f3d06971edd04277eb855741257b05fe5c6ce05911a75c40b0c57fca544397817e02b843d2a3b7024dce1f94b9d2713f45497dc34ef54091734349bf2d7b450c71d2f279cc34cd29e99944e2a7df4f400e3f81d3157452e92bdfee46520f3be1d79f9315b5aa7c2190cc6a0f32ac680038f31d5f221342ba313440ee456d3f951ea41db561dfc8c454cbec4269d44d862079b0e852e2c191b504cf57532dfd3b051c63f801ff8e1a37e3840709fe82ec75577e89ec5ea501c3474406aa7c1801c9fb166013fc7ea5a02e8b1cfcfb2cb9de0661a1a064384b0ac74eca3f71297b56a0dd60559a78495ff9ce2a54793f21651c1b4603c2c4e8592a0f78cb7aa7fdaeeb2800c4f2ad77160c5a7482bd26bfe99d8c053ee1f6decbe3679099c3b41dc35786cab073bae1262a949a4fc1a21fd6c1a4f2e645c79c8941acd12e5e0548464a2841f76dbc816f76414686c98df5083560bfbc99e5fc5d5eeaeedbf0a8fb83a55f0b6c3f4b59926d70ec088ff98461a7b8bbbf5ef8784a08b90468588b4d6346108c2ce33af9b7d047adaddb17ca394e55a411510f4dce131afe78170b74214e0ee2a9dc35c3f95a184e917dd9358ad292615ed4ba0eec068204e6329ca10dfe7625807d88f56650d89b949481b8fccef6a6f6c4e586c6953f1e758e1c9a8c58bad53eff19fcd397824d1c6e1860db9e9653d4e61af552ef80f8c8fb52323d03d6fce58029933893c75db0cfe6e1b3862aa69fdda6257f72f81059892231837980842dd77980c7f3d2d89c854d74e821c3bff211f7ea15bc3b8d54aa31e7652ab0b188d033912fbaae8a76e52b19c669b191427e663509b4a87972949362198855aa0d242bcc93fc926a98829f81d077402fe65480ef24f76effe55cdae7fbd6fdae194782fe202668a69f8d853a389f9a254d79dfda384e107c89924ad5999458ac504de12a487fadf3ee9c5b294fdc11ead7ae09be835670f4697c1e5890be4da2f4d66b81deed90dd6d3818a802be8745344c5875ce7d06ff0f5bb2f8b3fff2d46f297b26d98c5e982b5a45d8369289ebce611c686f7c4e4de19a9e3d62425af05904915baf568fc3511dcf2aecf3d5427a46c305072ed73d84e47505d8d3bc62e88530a8c9c6d163580a365971e08ba30c8214527d241ba7e08f5b123985abe4fa5f2107f6570328cf05bd2f7120b3d18ef543f2f6cc39acb7de9115a193fe217d99b51c493e97d4c8bbffc922e18552af8edbee9ac1a56239d45d24f84e46e1a21848fb706b376fabc94200b99b8e569e56d383ba43c7d9ebd2cdaf0c27551679e60fc5d46cd73fb71f182c09a16738cd9d8fee89da030a18d87466c1f69a7e3abd3ac9e8f43eca8112131c850733654148dd95d8ecaa9c3c880e9a61ac25b0386ae3f6f072e9ddc8529ac6490f96268efa32d31cba33d449316b662badc8af89011fe1edb92ccd4ec3146e12da8901525ab53be48ad6360ef8cac756b6fda72593bc09df73d2137d50aa490542bfd905503cb8326576b5cfef24ff6f94b786a334289c42d76a2c4a29fca3f5f36902cf192036f60cf325e78989246d6ecde44351794de6b6b9fc2269b32c882572a415a8771929f1b5b76ea11e16abdcd15a8ef6b676b1353c2f15271adee055ce75bf334cd9f3b842b31daf3b1bad24fa4fcac446e8f60ee1423384aa229dee24f48caab9bacf79dc839395a99929ceb50852cf4327929f26052d5e174d7a51ae60bf13002a836917789c56d7e284e93e29467ddd9f58ccc5b4e06df71e9a4aafe50f3692179f3eacfaa276ac839e71b9526e7da604a92f9a19801f0aca12c0f9b1b5eac9cacf6bfa434e1e467dd7858fe0de9f4c3c6cace4fc9f846fa013033b5084887b8d6546f5ecff252fd22d4383fed95fb7410c2bb712c4cb92f345c92fc444d359d71dd549add6671d57af781c3ff09a035c42106f6bb9bba824587daf99c27041226fef4d3c23a632821e4b61b2204e923b2f158ca1e65fcb1a4c40b2f6b13be76fbb2d5d14aa536db3147a09056ec95e6b63cda4250d19a22554fefa5f60280905b215d8eab59393dbbde70d261d8149ee8fddaf70225ddc86784fa4bd03a2b0373242b581f5828d37986b531d066184e400ceab85a7706333b43ee818b6142fbf1d4c907279ea7dacea6090fc4e18816c084402296e0a911560c243bc47e70687dd716924fd3a96484a2ad0e1fd038f67abc55ca85adcc328b2331c899d9ce04492d7fe48ed86dbc4a1bf782c0e457069109181e854f235e770db2326f4cd4046189258c9ff8fea17428d6b0320a7455a4d5ebfe884324c8e3bdef10f58b1ed2371d01396e56db5d1e8797d3521fef2740f22653c9cb9d3d46e1fcd8460575a089e6bc68f0a474d3e36010b803644b735552f26223360f7c783240ba10e94c06c3849462bd332e003515a3b1d54b0a385b039f4e64f27e0056d7e8b0d63e46ccb4e7f08284cc6329c90d79a34141914dab2c024f45f2da729d445d3e6939986e906805951c354338e0ad9bd6827a84153990c75af38635728bc98a83446c69c02fbb89b32182fc51c908ac8e883b6bbee4ff5a5731b18cadbddf20c5119b6396c3c4ad0b7c970978101e674e2a51bda8f6c100f022fc724469007234c399c5b93d08f09f49d0a1895bb3c7bb9430d302a480105eb1acec7dfcccec7e8a0dc4c0d33a573a45ff69b1a1e9da40848090ce946d410201844ac638d0f5aa716630f19e7926bf5313752a87ca443f14db4c5b4ca26609f3d2c1061cf0a4d7eb77eb798c9bc234eed68c9f8ed2700705464a612316e2c17cfcb1297367c7f5f155281bdb5bb593ba67ff3ed03cf3f8a68ada315e87628783f531d5bc11c8625234c6fc44cc9c4d950e4a66a981848417483b09c8e593068f4df2c990c4dcd5ad48955c0cfb9d21613d212c91ae918a87bcd529bf0bb10d6ee0590c7f8ffee9056a6a1bc426da3a1d8082680d9b8e86f6a18d4ac3ba13bc057b93c570bed87b51ef4550f57228949d9e1b081075dba932930e5096d013b3bdeb2b82d62d109ee74929ca42370bf2661fa15683a8537dd48ad8f89b2ed9fece60ecbdf31b8e21c255633cf2bad2dfd8b9ed285efbe87944ecbc5aa325a9c898304c1c06b769f2e675a96ff9c1938cd3621b2789580ee1673e5dca676ec66907712cc2de6293169e76d644595a5254200db7e73541dd0760f177c3e4e8af35893a1f393b1666c84c2adacc5e5b5fd5299cef2b1ed06adf60212be7600d6369856c49881241a4ccf24800cfe128fdd9e759dba7ec00411c56f015291a50869f14bfba9fb9ca936643f4b872020999e4d5f9e9ee1b33a8d36ee226647d9a186f6296f5a589ff2fec4ddd21b7c38a06fd50f1f7488a7481a0cfde403d473948878704e677d478bd550bbf5dc6eb87098297e359ecf3d9a2855ef468eb620ea72113a09228e74048883c722deeccd41b7db9039d407925923688726e1703d0dac90a612090ae5ed792f983e1c2d2527b2aa947440b8c4b9d66c496366d3c32dd1f117a3179baa89aa92de92d00ff0949de7d7bb699e8803c789a502a54b6b1f0011977913c3fec38579a2431ceaaddcceedeca7dcdcaea82de9c81c5acb2da72df08d1ae4734025ab4322ca3dc77b2afe061e7203b970a282a7463f64c1140131e3ba8e00348bd1e91d811420a94e87e29fc77301e962545f0a36d5c1ffef3fc99adc10285949967f33680c3120a7b2ba7d793b305192fb5171c9cad45e7d62cf231eacdcf433812a0cff85187e546aae6e54d28a270976dbae2fc778476ba36795adce1dbb7e69693d951bcdcb3728e7f724a978b2cb0993988caab80ccf5566cb020647a5e343e78b6b706ae8d48143d354e68de19b8824e3fae24cac11f2c73959a7f90c7a2e181566eeb62407c36dbad76d57a536daaaef92405e9df316705c1e3d6e30fd2bbcd61b60c412258e48268ee554ac6e0ecb854afdf169e9ecaaa028dfc14ee404447968d61276d1059212048212176f337a2db729ebde81950a2e2f65fcf8a4a3223491a8abe014d66f523ae1bb080f4eb30cffca5df49eab7ed87b1ea2457fdeced5f0ca29f7ec4c05ee3a3700be746c3c68d9916729c92cd6f272e7fbf05c3bf7e2c95a413f7b4f12e3f892d5d40edd19eef9b936b938279a7979ad97148c4b1f262fbf63ad1272e80a121efceb4aa9ede41648ee05b0811de5b13067684de10c88b2c97ff8b8ae45d1f83c5146fbd21d9463e8a78cfbb9e88ebf347566b885cb7c818432f45d331406b0fba6f1f62318a603ea1258e98cd4c55f8929c6e51ebf965af8a8e09d9f255442ac170aaf49f101ffa0321452f48e4d6c00fd2237e2c95a9eb3cc4498aa18f197858db5c95207fdea8c4abbc6b7a0d5142d0e9b7b55fcb4752042527b7ba5df1cbc4431d1ceadc2354b6d7d3be7e24021b3a0e23c959d658e7ea5de209e3d845970fa0632f0cc32a1d6d74456e3f45924a9d1d0dc38f8f22fd07fe87ffe8b9c7011453f31960299a56988c51209a035622b0165c88cb17247f3010a0e8f696bd90fe3e2b388c6c2ff8dd90a6ee913f8788a94afe58a138c5934665c81643a87b4490a644658bd45cb3e83d983ae38c6255ff407cc0d7081da2d9b56b9ba5edaf6be7f3caabc916de104a2841cfe37e292adc83d91f355d7af6dc0b74d289d6b24f2ab5af0653b8303a842fc2afaa71b2b2e7e38bdbbc093aba707cc7447ce81d4aeebaeb3201be1602c2787bb0f38ca8b6264ba10f7ab5d330a271855d16ce6d5df4d2780e4deca51bf272510c594760c74d03f1e144c594228e7304523ecc03bc34eaa3a1243c9687f34375b3a4850f887c905683bb5c4ee3abe52b18609492ed9f396985d51eae7896624ff68fbafabfe75b0f702b0b824e3fa11b6238750424b33dd3449c865d8dc3ef5e928db2140a69ba64023ecde86d4c36c8895da3bcbd99c31f4ca268176329ccc884d14d84786dcb6504612db1afe20fe3be823add3ba155db449112fa944ac854a562177da1c47c933fe219ca9fe8d93576c8a34dad89bff8a7073eb08806f0300e8566ea7f140c12a0784264b932d80d37facbf10453616b695a71f564c119176aa61f24aa28ca0b5c004541fabdd78e4dac32debc8fb40ed52dcaa19eebf34f484c3a6183a94a4b7d1b7ce932bc9deeebf6b6ca6e085cc8a93da52ad1612bc73314a61ba3b5df8cc8d4814878c3635f64e77b71254da8e6055ed7dc526187dfea0d27ff89e4f65b13293eb3bf509f9e30533d2a5f0a893b70de96857d88b549467dda3dd687fdf8247b4f1de861c4ec3d453b827d7849b66801039c20b0c4ae3f424fbadca30695b307382719173d28817e31900dedbf575e3f18d1a8d0671a0919f50852a2b8b9c670be2b920a11e0176e06632ecad2478cbf0363d2a5b93f2932cf91290d61928e439b368a5c175856087f3941b2d87b53b203bfbf527d6263544ae195b1aeb30b93ca84132aad6e0fc220276790bd2e3d3a85413ebcd2d10d6dbb87b56599cdd306bb5e8266821ea605e13b6d487ceafbc396ba4f90b51f03c11e9077e778687d2efa1b81b2980a9bae5fb4f85f4ed32469320b4edaf38cfb0e7951fbb7d6243bb6f26c4d244a8cf7f4fbe3ce00ecaee408ac478eb8652e6fcc329699d49676e9fedd03884c871aec755ac1689678ac0ef927d533ee07b56c8c87366da1678e1e3a611897658f858df405f5e6280e3fd573f42c6b0c6d5f7277f3fb100edb3739bfb34bcbd442476e0fe9e51e1eb6d38008d11af8bfcb2da102e18a1241c886cfcd2113986b0901e804854f7934ac674fa420899e69b70bf0970c76f7a2de28ccb8bf80fa8e90648cbf7ac799153f9d7b8f0089d872edccca9ab860080444fc83ba34c6288ee5749d1d3555ceaa15f3eb06375994bb94f54b4405d980fc85de96b5b33dad17e904c61f061c459ddba8e11ac1f9d2a7b34cc3f5106a72f095775d2146a10e9381b522ce962613fa69c2b3ad8a4b63910d31093db56c7dc84d2f674e2565bb527f759d72ba4d88dda04024b43f0c3086d9b8b7ba35b3e9b3eaa2f5e2c4d895d980fe16cb63a863e3468670967be944ca1fafc05c1ef28eb4cc4036f105bbcbb6217043567000e903fc4c021254dc50ca3c116812d6a8c45067b2f2a0fa454045fb96d35cacd4320712065cd05820a0064e6c727e4a1f05898ba60be4a36277e03a5eb0a08c9a19745d7a93b0875fa913d6c3bd184d58b58cdd03fbf6263a988f778be69a4ce238cafe43b34453b1fd92e1829e36ae5cb5c537dfc2f88563431c13094268749af3c21dc406ace94b33ecc74eccfe6ea03f6e8aa4b9842494bf46b03e0fac2c66abd3483b9b64aefdbd1dd5d20c4ef229adb7db4d35f46fddf82712ead1cc2844a888c47192b45d2e978635732fb2102f01a04a5addd6aa70fb436f360f0f5a50160ebe8e657f7cad45a08065c0adce53d3f021db2436a7a98ac1feb1783cbfbd380b9c4797ad0ce6248f16344dff88e05fb6f47a6203ce9571e1035b5d8c1d85aaec1399b2bd64f094f3a6aa5b5ede410d4e6b9bc95fae1f5c631a78b86ef091f58d100d29f1719a6aa3d0dd59f70bd0ccdca2cce0666a46d9812deeb4f01245843ec6958dfd4b29bc2a78579ade3c33db748da82e3bf2690c816da064be3a181373ca13ac15c394fea6abe1f25f4ba3fd0f6ea522edddbb22e2739dd64a7a2e679564fb781f76feb26d94be0549f19ed0ad2c59564646157a0ee70ec0742ee36e32f05a73730c5de612d864665360cf261081481669f4f55d2f246fe7dbbc848eb1a1071e68fae6e48b9dc0abfb0e9e7679d78a17ababf4088971e951c0152e84e2b493d92fa65dffe0f55907818824065c55bfe665034ef01fbaaaf42fe991768a22d032b6a7f3a891d0d9be786b8635833dc3fc0e52be4b668e6c1d2348b9af92a6187636f2e86868c93b29b078510e77fe00ae4322bec1e448fe18898c2f34cadee66a5ab2918cfe66264ab84d3956523f8cd473850d1bc964788df6e6c13b5e1e3cf581ba0825ef5b6e9dc776520ee07ea517fd6429d685ea8e4f4be0acaf9017637ee45bbee08530a04d086dd81853d02abf68e761bd8cc4fc766b7e430475fd10d11c9e6e2b19c6e16ef8f6c1063e55f7ca614bd23a307a525180672503d1e031a292c53276306455f252609d9f4f51002da21efe79129db0758e594f81ed2a549ef4fd5f6e56deefcb7f49ba02ff8cdbb60d4f1c04eb2ca75ee743db821d3494040702af3c5e3ef7d2d13bbbcbc1dce8ccfb4218ffebf552d881adefa114006dd32316599486d65b2d796915dc78ccf487d88cb29deb6adac627e2a33133e0f28e735cea75d2d15a19a192abb45d11b5ddf36c5c107585252fd8ad89354137e3634e1bce21273c4d1d09352c83fb17cf121254c65b95788208536dbe1d6caaec4aae9a9b2f475d1db4a42da230533bf73cd58a6211af88d3a60174c12e43f85cb66f4a359e6be3516e62ae6799ef56d284a1e185b496692f31e6060da85f7848d5f6fdcc32d4bc2373ffe5e8b8575e7d75095e1ba74db30c1d6b58b896f71cc275ddf2c318e735ebd8839c56911e988cf28ab1cfed4d20f7403b5f6d14cccc8bdcf31619a8082c3d5ff839ebc9996cd265cdaae58274661caba0582713aa8dca67a9e0d9cb4912223c32bf649ddbaa7cdf5fd3c8a971e8b1d8f6c62e3684ab6655cac47184c2f0a4d48f88d71cf684d7dd757726a534bb185f1a6f085d9bbae2d8e0bcf0ebbbfe57cb63fda700616fe28a102f37b059341888e244b29407503b4098d68cdef1ed4017594567f9a5adf3ff894a709f5839ad23c78c5fc91b3399a9fcae170a0c73136dfcefe25f2e376b118e7b92ee2e23decd9dc3b5fa71f13f2291b3f72ec9ad5292c571b5f9ea354b30ddef48b10c10a01ae2bece67347c72e977d2f53aeb9d26a18f7b209bb7afd19bb49526c14a6d345a30d14e721f0ec127331758ec4c60b76f3b82c6332d242c83c265be554e9f7aa4aac365af0d8894b2d7654046eaad7cfbba5b08c915781ca72f957c57c3cff09f4910aaa4f742405b55e09a352cdd3f2c86fe3a4be6050416f4a21c4463f9d7cda48d82849a03ff8d59113214f6b5df8bf8857b74b0f690b6d280f8b3371df2cd612a815da382b86d6e5a6d208178448ffa6ee9d131ef50b4a51dac953bc0e4fa1ac4a1d8f74035dab462adc6b820588ffb372a541708a573b2c4ded1b2a501ba81e4d205e21c5b5ba448e69c734303b42814141f78746c2d839db9358394aabe0ac10fda10c117a3fd649443bf2dea9605a5f2fcf4f32581f1c0c888535d0dedd046a3ddae1745cbae8199f240ecc4c848e288211ff8eb861468cdb3ec8951291b4bfaf7af5c31b5fa53b1e94534c9d09d9f502b2286b611adc57481f3a52530a5c6d1bded3993d1a2c8b25338664395850a02031df401490123e8d4ade06605fb4c1d552627ec94e006ef6e9713b502e3c05950702de08b705c07553f3a348df388a20b3ee7a0033ca7de40f6a8c228b8faa7dc654eb8dfc54cbfad5a5276ec1e9488050dfe639a98ee7ce617bc19f0cbf5590648064234ff902f9a1d77284a1ab63e77c1190b3d866cb976d62129c20a2423914444896eeea4cb511c02a7a07f23e89c04b0508766c85ca0f0c4ef046995af81627ee55c9880bdb93e75110ec2f237efb4f4f569e109c9ce37a808d4cda011ad526a2b10c95ae3ccbc35d96aa2bafe1106cff04c09458a96bef632c59078b64019fc63571ef74e29fc86a1f9a59bc197e4ac73643cd55073874792720af058fa4260c67083b8f1615ed414fe378b7d93b4fd6272f0ad2d9512a23ae97eeae3b1e375fa8e47a926275346080d1eee994d4aa9633faee04ea698768b5114ab685af63566152299a125f8197c3b18655914f17ffdc7e69cab9298e03eff1067987e8722239eebe2a03b2e42a63d2a13bdea6a5d8f9ac4e5828ea37e5c44edb51610a43e782fe87d605e7d41175e1959db1e1aa9471ab00dba44ddbe6e907c361adadb4e124daf06f7b2d51439072fc77d146f40e2ee02d4ac9a7d57b15eabf53362a4be532f704d63a6a69ea70b74a92ba638bd63505a99ff4b03ab8492ba800f016a8871ac683f4bbe63600ec1c1b35f0b5351c9b2ed3520d0797f047b2129d98c3c573911a35dd013e086a260679eadb7ae5d24c4356e85c31401c2cffcd8aaa82ac8b1c7296961fe3a14db258534441643a36d42fea978a6ec9e1c8816ec06bba6e829d80b3a36481dfdbb57761a62212fd3bd948ba3d25938acd5e37d263842c073ca4743c06f7ec65701b44c761e0006195f8c03f38db94fd9c1ebaae39a5c4f839b7508dbf4b78abaa162a20d1768adf69c6303d98fc9e4733a5103f6fe04f7a8b29d5e184a0be933c519730bdc7270448fe838560aa9e22f9456b511f88c856e2929244576cd70ada5f204771e58def6c29d6042ea21dfffd9ef358045acddaba1238e1a2c5b66efb0c61f0380c6f00becca557e6a7bb28436444f5220a0c26300604d3bd750c13e6a9f5c10d16bb786c829fe17a2de673d62b1e63ed633b314017694aeef6a3b8f57f1106aa381e6c5da32d68c0701c08e0d2556d2bbaed90e131db898fcc9e1c5d6b1835b64465c1a6ae875e99e47409f7d8c4a55de39bec0d8980eb8ed8ac48ff12e9e74dc33303e86e250bb56ce92a7b44c137c790090c929259b8629654d8c2c81cca1517cd4920bbbfc8f2954f46afaebc9c6c046becd2d2385e836b4d08b604c0b0ec13b5745262b8e1eb390dbb17c347950bc76f412c30b69d4bf416ea46afd3f8af93d89505bc41a913671883cb2eb88cbbeca54f5fd8aaf5994aa21b5990520ada1aa7a086bc98c04e4e3da605d40cab8e2ef88f458522c107c0a4d554f57e80dc0c4e9f9f8337b1e698e2e9fe39b09d9c67de5c499d63b079b969b34ad973880c6712d9e175124c59370733a084981d345ecb7910c47daf6165fa8b9112191bcafd69d70f0b21a0bcf64abc36b13283cf0d9044c57851ee64e062687b0e20c1a3bd03663600e64cf7c67e2ea8dc7fc842c798e59d65e27450dfaea490f74daa227b3706f0a636b44c5f083a0ef1ae20f9b2bdc6583d511b20b06fd858095f290d108abaeb3a24a56de24ee3ba70c4437f80fb60f09ba4b6f8bcdaf8af9b9bc1e1ca36494d10e138af60ebf8d42eb6585db0f3d6c9abbae62e434610f63e04d57ac5f133369c21d20d913b67984b27de5ae19c8481ec21819f3a63d340885af4aa8b563cf0fe6ea60c1cf3b9dc24e10e720e792249a0ed4af0a3773999c9ef44e715804c6c49dcf4808c222f481d2587d58b8d631fcb57da8c93512b091711a1b90acc84d8053d4fb5df36cb8ba4453a24c9505bbd25bec741184a104b55aaae49cf4d6ec127fbad7cf0f2e9279512118f6eea2a6ca3e80cb361ef6da941c90fe3df8b7eca943fee161d0d6f411ab4207db7ab23e8cbae556170a1046390754ff90496ca80a90fe6ef2aa15a083bf1446fa5a03c50297caa3d52d80e13223451a08dd867e24680e9a06fa72db15baa22e187efb65e7d600b1d5faebdae6270cf70f64c27a457d3d7884a100a9a4f0ef00dc97becb8d55bfe6e522118ef6ed790396cdcaca848545c8f1edeaa07b984317bc65b26514f8dee558908ab10e6aef2890885aa3b3222b7198ed5ce30293e75dbf93a7cc4c6354c4a4a7f5677b02dabe65c22f02fce0f764dce868b8ad2a672d7a687d6c2d704bedca606b26463202366e0199e49c490dac862410a05293512d2f8deb2b344e114444da3acafc1d0eca4a3e7da34b37493c8c6afb63fa00ffe6614a0ca9e5012ba2d68f43efe8df02f3ef0cf16f70c8048187e4cef8c97547d8d95369f939c68cdb85117f6d3fb4ebefa623dcd9ae7858b0ba6b39137205f387335930ca7c92f497ae200614df05080362c7c04d1bd6d3e29ae4eb37f9362e8b298f317862a1ac7f38c247c01f082a12b1227aece712a68fa8076c711a81a0192bcbf0ac82f18abcec7bd3e7c9eb008b510b3c8d6835112b6dc4a3469f7bf2baf57c684be1a636926b6cf61095e8e7768df3f28d4eb7e809f664524daaf8496cf32dabc44c618933881e57cf25746906fe3bf05a82e16332b5fdff541d9e819acc6d0935dced272120552f974be8a6a269bd85920c1e86f79c94f4a823e49150545d593c700cd42793d2432046d3858fc9b74681570c7aef6e739d8b8ba97e34738c2df78cc1d321970941fdc27836d4929e7cdcb58dee1338834ef506bf24221dc3d6159aa8e2fedfa792771e5f5acc7c57a31f214ed027284f6af5294b7604f5a8d31a043ffc9c48d8cfa55f6da3df3d78a0d72643a311ac25f2e0a0548615a534ad6a7d3b654df2545cd45350aca3a37cceec5a7bd78d24a8733b78ec4d1640dc066b6d375fd229acb841f39c174a032b41f4f0b2990988ec8c90f9fa2104ce910994bfd6d406542997c10d0fca38657bb07fd220ce370d3530744a8042ae82987f6ccbb1532876ac464c549c277b5a6c7f3702ad9d1875ad171f8bbb221e7dc45b906920f5150c1fa25cb06026b167d4443c0565dad5deceb761d7a8948b0e6f38c09800be941477c975283e2ebefb0c95945a1ba8339b02008dda7fd4b9ee7dbd82ac1d3c58f8764cb7539d737cbc6e3189250b28938a8a1fe6d3d65831e958572529a1dc42dce25da23bc741e6db338e8eabd01871b2106a848d415db3efbe9190e35b5d35f2675d83a9a7b0b837d414fdea889bb7cfa24afcff4869ab81308786e46e8854e4ef2c103119f0aba73dfc2bb34425ba79b80192c2380f67178dc61efad7c31c330a59af6eb4f5fc634038a51ee23ab7850cb969ce1e4c1746d0af4b029fc60018520d2117b74a9b46fc8f3236e2067f2313bd6281b4ee5cfa13fd596241725aeb28b6ecc8ec3645babc3b91a1db7532a17ccc679bee35b121996e2de36f2e0b2da864c2b377762a35b38fcdb34db52ebe1f3961b49dda6909b73a9fb9739e57812817b300bade78d882426c5891967f45580e16bb932249d4beda877ca12d8d280e2a6d98f5d6dab16c700846c4d372e41622fa888f4ce9e59ecd71053cea62b7a34ac846074e9216cbaf76100df10db769c2b2815e219b6d5fbea5928cfa411d2cfbef26dfb66ee0af121654ac9c02e0ee64e007c3bbe1f0fbd94e0455d443608fbb4a0677e0304904695358f07fe9e426b23bf6f826fed63e07efc979bcc996bb337fb562862dfd21df23c36571a84a656d753a4625971bd7e9063a9021703795252cf3930415a6245805eab2030d6cf266da506a2714a9bea32c5b30ae8cb93db951699347014b572d6e24f7fb90511063a5a6ea7c57f38a5710d75559e0436d771f44128f9ecf7c69bec145e6a1488790bf39d97ff47e4df917142217fff9c9f8bbc8ddbe6625bd64686fc13b80a92b4be47ed08f21eceb0c5efc3c11d97ed9835071f7ad4e2136e1e3bd54887f53b9a0fcc04a0a122f49d5731aea8caf636289379c087439faf661424efb14c7820e4cf6b261c2b15529dfc3e3880fdc1c6b3f3d23a1b06f42ff5f4da25234527f5a0b63dac5690789f7fd156b746c1b3731a03bbafc263e0e3cd65bb338db837fe84837eb688991f7d2ab9d2a248bbe607351ff1fc82e972c68f4ba90664df8cd65c88e1567495d13febd6204b92cf298715cc1f8ec9c3086ca9c55eac31692ff76543a333371db4c5b2164d1880d08da0c4927ed7b7aaded2ef952287ba591219be30d9d8fbd38106bdeb06ab219e23f29ca1a25fe174ed59a17f9e6e6387947c066ec62315d344f1e9f5ec2625d29f748d9a0892ad8db16d78ef009a7d8a8ecec169cd32f9ecb088403ce7e5c94306b28674c4e5b91e0d1a79a5eb8b856f9451fbfd81c6ac807230fde6310530f43d58cb2ff1d750735d7c3c546881d4a98b8aef1db78b61cd7e842396f69b9842bea6772993333904a99b24337020a2e379a312810f7fde67313b664192e2bf8663f865a8f6c321c7bd60bd540decaf3cba0835c01324746b1677755b0517c6028926139750adc8c54d8b6607835deb71ac59cce38a933fdd101fe1f8fab0dd5307cc23f23aa25f273bbdfbc04cb01177a823001563940a7cf00cfca2c78024b8e054acb8e594a72853bb0ebfbb0b4a26b770cd5b71db7d6bc974fc686fd42d2f4afe8a240166067d9b5a668c8def734702d2f692965dcb580ae6eefa217248d9f667028fad7c6f51184d704bf8f5e9eaeb46ac8247d37ddbd2febe8452695c96e83a009f6ee176b9f448b5e49616b5659d5840d5692d81d678b4f5ef904635b6100fa87be3383f01e2def69f58cde998f197b47848441f20ef66279cc45c403020d7f5cf1d2d46ae75dee7c8c33dde96f565d98c0491aca05b432ef14b444dc6ab8c7bd951ed3dd906da834e5ddc44bd1ee9d7ca705e99438c59564974628559eb218fd00f2f3ce9808adb9d327c68db82f9198fc6ebc34dc909747d23274bcdbac28a93be069b583a5f271a42a0f98e5a4bec4047d619fe2da2387f3beae56382d2f195de0e37117e141d0d719ab8b50856e20b813f7adb7cadaff79605fa24ea1fd223e5c45f0d55df7c25c1ee0be6433d4a5e09ef78ec8145957eb451bbebafe074a99230e3d44cbc1cc6568c5234429bddb14c38c5e2f05fe3d09ad5533ed5bc6a5daf59d420785721b23819d2e0cefe4b9d44089e1376bb530aaf752a5305034f664bba16092ec6102d1e49a0f59520b3d59ef540965aa4122bd9aa6c6b4fc4896f51c37ef00fcc057b47550fbe37d90201a73294b3c9685ed1d42d0f4a694ec9e976f72ccd18fb34b59e181add14e90d0fe471ddce17332b7f6a0cc6fe6de1de44a0849c4899bef37ac953ec13c41ce7f6d97d8b963463755b4a6fc9644df51c931e831fcd0047d26fc4aee44767d4d239a4ecd09bad4250265c005278a0c2035de01e3eae170436e382251de83adb555ccd0aad80d6c3b671bc275d485d138eaf1b796930d04cd27b15e30a88470e058a00e452d74641953b2873bdc73f87f181d2a1b88f95b06df0209468e41f96bbed8d1d4e782f6f996a51f98c6ca1030ad05d112b26f5458f5541f13ac966febe6e6251809863bc9de819178c6543c899157aa45534aa4e4781559af7f48731a76035ca9bb81c50d2684e912d73e3380b54d6682270e729e17672719ad00fddc9e7de209e990cd779cc4a375210a5b6735382fe9288728e47e33b3e3d82072afc29f6178216bdfa2c93b52bfe26211ee32a35bb654916405a3f6aed38558f745f19740f9c9b1b1c664ff234a0fce57d4224e011e2bdb456d2ba229a29c7c01e189fb2e91de4ead9502d8bee8c5a53302e93b4719d36c497561547c9963c381fd2d70d04471a3a4fe683f40687c29b167d8a33a7a282363ad3deed5d86b76e9cb6afc1827ba792d808237f2327316030ab3b43345eff900ee7793c11be04f3af8debfd5ebe43ec6f6fa0bab77d6b3c4f8fa567d3d94d7db2b9a71245aa2462680bc16485278bfc7de20c82884354811c2ce2d7d3753ee41960dd6952435c87bb211f464d3fdb919e89d6af07ac7600bfddc0cd4de2f88a0e24229e9c39768ed98751b447e71c19bb23fa1d7f336fc67ed263dc6251064f288818e6f34e4d7cbeac09f58818f8a720e5997dbe0fd0ac63538bd17aa6a936dbffbcd5e9107cacf9643730d1539eb18b89abcdab1770e34ca59f679991d8872ee4465a654d11d4269ceaac269ba767f9209112db09910c5ec80fcad9128b8116b4d039437f45302eeac5cae21f05dd42d0f315c5300ab9000682aa6be83aedba4b7c36f348c79d632b50d411d34df80b338669b81c4b77c4764a3e64f1ead94b12880d0afb2212573417427968c11e9a74cbc9b0e7965b7a31a743993bf0935f8c8c1a6c462a36a869e43c67de538be2aff898d45e639eb6b1d20009e29ef69f95035abd70ddd11c410bc7cfd104a3e0607c1d82e57081b4021631c2e239a801329bb46781bafa8187c02bde49e390e6bdc87811f8dc9713a8b475dc13b191813a294c44b5c8bfb58792a4ff361def1329948e7cd171ea5bcbbea18abceb54c7633d26bbc93e95b711574a3387b2614b21518eef9640242761eca95c941e9611028febd9acd1f41800b379eafce4741981c16c5bcd69538a37c261d530325b806f2c3add9a4ba05758a3a54c2773ba933f8b62d9d8f95c1a2e999456ea27687d8916781fb80f25defcd1bfd17df0ebb3318c5b9a1814b825b7223769151c45b0fe4da6f91bebf6d44cc51f1b2c6ee5e4c633b44a077e30fdb31d33c00f4af2bff245055c7b59073ab33e6a24c3d00c65e0660102b61eec3cd737eb52eef3ed0e4344673efecd32740c4b3434167ca11137c72f05bf380f1fd4e5b88100593fd4e5ad6ffd06b4cb60e03b03fd35b170ac799b9b19bbdbb099243d9f290bb0c0e6c270f9d3a4ef10c7ef40ef97c4d6430862c65296006597db30ad133ba23a534ffcbfb8cf99d9632e876c05570cb13bbc3165d73ccf0260ebf7233c7cfd222a8ad7f7cf3b238500b585dd1cd3a494ff358f14a5cea766c0b4010a6107dd0f818b1b84d0e7b19b4c7c7ebc20bd1765aa506902519a7054c59072c28084af9052c984d92df9a5574a8754bcb2080e5a3cb8aaaac8e6e4ba0fd23878d06cb4f0479b5d1fa20061a7537f418c70dee981a82b38a112924d0749761317cddbd714a2811e9b31a862680d4f26aaa8ee0efab903a1c2ad757d18492fa71a2bcaf522d435f297c86c7a2fba123eaa910d51e6d18bfca5f268d0eb8a72316c2c4e39cc5e4db879b94b8ffd165f0df3d93de543a6b3853ea430f382e05b601bcc30e397dea68f72f52541a73208467e10ccdc8239bb5e3de2a5838652ea7e64c4a425e069b978e08b01f22f632b9c0364026c457e1bc78774a4d91d65bc4d7bf7e8d8e746c08a3df909c27bb0b51dae64a0f3041babbbfdcce560603ff34ba498de6ef8ec7f89025f89a7a334b2f02f8b9fef6fc09053c898697828eda77029f7fbac08deb640d29dce3368e9290136b22499f2da35d2dba85c3d0624908bb24139e28f008ec5b084878f93706211da10bb4326430508db2c5e5c8e475e9ffbd3a119fcb7cb43f12eefc128653f1d2d1c1a6d047daae56cb5408e9417295d39a3635274b318218eb40d85bbc2e836e5a3aaf4d25683f89d3dacdf5672ad70c5e22346fb9e2b5c572c592b3c878d51b8acaf61094e730c33242c14859ae90a19639d0efcd95640a2fdfce7ecd9d2dedec298080a40453d400dfba9ba9969fdadcd367ff1322fb0c9a9182be701c34d624ba6d3039e962b054a7538db2e9ec6bcef7a9ec73e4153bd1c186d2f5938c376067696299612b66aa9797378cd21f0484907511500699a5c26c2347533c85d23e3ac3256d8420a769dd7dbe25a9685523c707e993e2bb9c127ed29cbd304e7a4c6e2db37fa183bff24a2ae52e08cfb470aecca526a4a5edbee94c7082869350ba50141e712bc58ccfa44003055c9a088fb9cfb05897e03af48c7e7923d590fe6865c115d786a70528bd24f6f5de9c1ab3ae7abfc2bb3927c55eff256e5e5a22254ed3801107ce2dd1d667d2aca69ef60ea7b48499e2d46aab2e6f9635e878b05826d777232761ee77e7bc0b05c1e030ec22968e59d6cd516c3e5dfbc33800afd7fa2fac6de1476a51590168c643de7e3c432a6fde8769ab49665db37d4d0fb072a0c3c7e620e72bc0cf590e5008f2b4b32921daaa861bfb030fce4211db77c90443f548bedd6f933f18f2bc432e0e5c30b2c69fd0922f406b22722c4c7b2f3cc4a2bd24a79f0e48b341f0a90d2a0fcf99ff38436c6ace345b75ddd6d27cc8ee61e2281a47cd70b042596168972567048ed2d269fa1b138f52e0bada4c3f39b2bf33d49f7433d3580c52a19b157892faa4074a501a4941d75c40f889dffb2eb8757bd876010226b9d3c6432cbf90a324607022a7d8ca9da3330ab2dcdcb64dd43d845d2a40a25c73080a3bf4e709c025d0a1aaf31176402bf7a5cdc99e8a86839d3f162c1089a7d09c4c9543bfc2758a4610e5328c7a5ecdb0b2ce6fe2fd04bd136f577abe1a528eb845b0444a26d3c00daae9b947efbea0a4adc3292ad67c8732cba83a4a0c02073bfa4203e9cf41d0ecc0fe7cde0abd4434bcdfdf46a5da62808e177170f259402bf762178f8bb101cd4e14ae6dc66396cd613ecbd5992981cd2ea2edc8aee817b7ea33409a3abd9038995db9a4617a537ace163b87d6428d1ab94ce3aaf37647ca5a8eef0c9e8fb71759b5a2c1ab7927d2c313f0cb64aa908e0b54f38c7ee767800f22a5fe1398afb7ef18d7694c32d116bae86605786c7c5b9a41f2421dd8e5a0e582cfb0930714af45e1da9fa240bf129f63a70ac0cdb13ed1622576f3e455f246fe4e17a2ddcfa1021255548462101373ac8c7ffcd11a04a7719c2b1a26ddc920e2b7afb896c845f0a439b16101d069415c49aaf561ee665eacaeba70ff7f4aa3463c13fb1a3eca17a430eabf620e1ec316a24b1e25a6d8a77b9361ee81887de32fe1adbae9ff43705b0a6b919a60797e0df1518436b90428e2b7ee8048b5f3f15b7ef4ca70fd0c195a2c782b334fe86cafe80cab2cd2c7a69a3ab463b2becaf32e5888f4121ed920f58805e9dcdefaf53e07c1eab8faa4e76fa8cc9b6f1cb3f0cd223afabcc17109ad0fa37bafc3af8e28d89cedb67c63e0888e1d643da35585e71c42d54f570b36694835e43141bd72e75b94da937e6db14c2345bcb7bb44962e06dda2dae6448877c46d2494c2023f5255e28bfd03eac94482239e970c8a159bfd26f8ae4a41211c558503faf34f0adfd5837a796b62411b1630ede6a760234a8e5aeb5b9f6c6c4b62eb722913e1e07e4be39f35271a12b65ea039b02f8e6aa4819115b469b6130732a8149694d92c973688c7f6b069dd3b6ed8dd679fa13c28186cc848ea8e9e4852509c7c34331c487c0cb658dd6ec0c84990b7fb66321d15bc16d71d856ec4eacc752475be78c43700884e0c6d7a806e89378cfabab40bcd2793d91b1c998d3e4eaa31246d66ff2d6602ef69626173e13965f4cb08c260e6ca365714b14d78b33261136edcabec03b681ba19258c9a86dddbf3f74f7c52c95aac018431a3eb20a8bcf1b65f90ce21921d1b2aee903e946972de502b5bcfc836995b09076550c262316400d2dbc3e369075f457b4cac1f2f9ae411995bad5554788781d185fedb0eeb162bf2126e57de375c85b02fc932cb5765916a7dc6af6d3638eefc4df31c5eecde6cd6841cf9a2a2ea9fcc68f2784f99318b9ad887359fb5ed74399dc38ae7b6e36c591755046f7e60cda45edf2b4687f618ad331f10ffddf6c2f1277854add055de02180f88aec9875e98f59f07dd1de984b570ea7a1efdbe9ef372b72a8975957fe497ad3199de50ea90924de662749c82fabcc75cc26276c0de6c54f9b52606fb81fcfdc1d8c36ea27b6ffdcb618dd548049e5fe2517856e46b15227e2cf20bc34276fe9648dbde75857a3e598e6a2788439c1742647dc719ad75372763c78bc185c1f4db9c55109a12cd812afc50e6fb6710131b4d10babad99037291de2aa6e90c031969d7751518642e99f70cc975120ac49c4c21f05b7ce2e62ab098bdd9c03e5cbe561c2f4d49a08988b1ef2fb61e9a2fc2c57452e269013e585ad4a258d78b880e60d21e8147e7f69758008f7d0ab75c98d9ace7eff9c3545634dd3cd437c9c55f87910fd33dd241b04d50ca0e1b7b93d4bd7e1a23812987e8de545470ba301e84e684e256f8733e6d2d47416d16ec24c978a60509cea584d5d512fa50647a60ef7e80e3e32c74b9e7193049eb15ab1e56db9b7b2ac254a496f4fc0c03dd61a4f5fe3965abbbc4e6a648c4487e836bc42397c02bcdeb44a328cfd33285bfe807b1a9b45315800cff4536770a78154e6fe9cb14b6a3643266a4053795850fcbf220b495e287b2e23b0fbebd4d27293bd68031a2eb9f58a14c74bb575c73e28e10d96f09de2efeca4c20e11d3398ce4c9a95b338c11a7f9f8c6fd32ea88a552efdef4ecfaf9795135474a91f2e423558142714fe57ed5562c37c8d6fc9b18498ace2ed0918311f2632838d36dfe4a4036bd6649098ddf8451c732ef195a30d01477dbf19c9c1a169b35ad6347c32d3f2564e6397394faa2118117ffdceb5c2f69bbb5074274daa147ee32a85055794f6c5862c8f87bf15de51cd8bd2ff7edf4db304d41748da3de7c27e2359bbd17c6888020c56e41196c3375cd5c0328a534a40ab87e3249f7f8da153efa1f20113b68e4a519455772ff4f4f90efd8b9daa4c3a4f5605fb97a22fa484ea831afdfdff0a34cef294cf4467978eb8b755a5063c6dcb5caaa5c573f29b6e44155d0d81eeee534d9472c3e1340f964dded81f2d91465ca96846e75913248206f76294d32cc3bbcb506d918b975d7edb511ec5368c1a4cadacc1b9a48790972e68260b790f78429dd9e147fc85ac1fda069bdde08ff8b4f0604f78df2215727dbe7aa939099a166a6403f543ad803b9a53175f90c55241f2f8717936759a080fce8ed76618dbcfe65d6946b379abfbb62053af1a810c91baef63bb37acbeb753770ff14bb7ed018a4f47c1f486f29c79efa57264778536db61055bf35c55b68cea1214bbd5c95466aa391b305b726e60ab1a7bb166a4547e3a375ecf94ba46ed46a817b60beb18315235044620e7902eb921f39ac6b3ac191d1e68e7616699aa1274f753f4f54755d312e54976b4456acf06e1e1c519da049c5f56c911fb11b27b8040f3e053f8aa4a379f9b62b6852264aa6b36b70088d9addc889fb407e5f3263f1810c0b92770febc0962d7937c6105660876950af4ea55fe9296a7a80eba477adcf519f5563e7433d0082b7d9f7d6b939cc37ce028d656b6e7b4128878284a39adf9d3285b3c4450fdc7b49e2e3a8a96c29d0413e8185a387eaf69fc6ea94b62dafc136973bb26600def45939eabd5296524d4c8dd00414eafbf83c161e5f41b99de84fa06bcb0e9211742bfd9f33f6991840eb45c40843b0d460fce53968ec7fd730136434fd0871ed1e11fa7c295975c92517ec9c1af78cf78e2f20dd13f0ff53eb45a39fd998564a7cb53d27b57868b01271d274e49ffcee650006e8e6852488d389f2307ffd1f7b8f3264e7cea90854069fe65c99f4b50058ea305630f26d515cc2b92c70b7796fadf6b531611d76f7cefde68743006ae9df87762da9415108387255646af092750115c12617e2bd3c17dcf48ed9723570beb7765d6ed2b6c7e6a9371e003a156a7f73a16622640b4084f867ea707a1e2ef5d49e46ed173cc12bd96d08d29e3496427f30a6f22e50a08c277391a2fb3ba86fd04e6b6d921e45b72296faef9e4c121376a8510e78bfe6e25d4ac187958427c50d6b2de47dabe0afce41345920b9555342653010a57d1b868229177442164d02ea66dc05a91a2d433f986addb04297e37e8a03b4978409e5c5121c11c5b93317a5b449eefc3052103dbd81e2383bd51197278f03b89787337f9484c018cda805606eb5a073aa3bc655981b1cbbceb75c46e5b69941ab4b80bd73675046497b8a47945cde8f754cb04434b47b26756e16033d2e44c54d5aa09c1eb7e82a86d790281652fa2646ba75a81cd34de95a011b2da1437c285d33878db791cbc279b5d9b7098e0a49e4fddad11d2f72bc087c47bf51f60f7c2d51cb384f6f919cf64cfccceeba6aba889e9fa6f8ca056da3c64f64a040db604809a6f3db595c6c52882cd51137a8b78a6da755f2bfb7217f5d2af9a5b9e9f09f26acc75089d5a917c915f611781a348cc13ef05467790ca75d3ee7cb3722d178fd6abd76d8d4631a6c166ea442d8161e9bf95f03b6b159b194b8d417c522d99e30708cabbfb3aeb16458ce69d5088b10eaad3f18c5f044f07f3217b175f3e3b10d730a3090fd90b6840850a3fed243fbc75ccc6ea5daaf3274098b9036a6975b85225da07d882a09b95a17532b3ac92072d5806db525665cc4a39dba2f8902cf1f4a806dbcff50aff965798f4d9b89cb3a6a695d359aa0f32d3d3c90a4ce921bbe02541e937dbdec35a5365897d2ea26a4e540c6d2cf612796ba3c87fdedb64f918e882776cda7dfb4c8ed061001e9c6c5b4c2928ea2494e14b0e505bdbdb7e429c45127103eda21581688cfff0da3332f10761ac0da0b79fe3e2d665ae8a149038e1a1168194e71882149a96684e2d9f310d41439c0270ef95c29d38c4eee195fde79ac1f8555b538dbed226dc597eba68d53b94071109f87a237f4e3a8bda40ea79248339240950a5d6f363aece8b302d3e496d7a6f3f280cf2728c5f45a55c9c2017614649c9c84d9658853de4806e000327aefa46b00222c0442a9fea56f73ae44db1651273b7e04375305825b147dbf2615a2a77c42939c25666adbd594f3a825724317a2674979484ac0ef6867ca9ed828f6cb1eb41afb1966b31ac7e8409cee5001ae0aabbcfa60fa39db5692bd18d4c1714ebe40800a636baf9c61099b91771dfba3b95b35f7f9bff6d15e7d2340b99dacf92e5aaa4e2f9798027ffba34cb90df070fef09282e87c2cb6a6681e2a52a42118108511010109094e454b77cdc5aa8818954292158aeac1cd73c69a269a238f26b83769524041cb659c3a6525f2ddae89c015e5c4e8b859634ac359b882258ad2d8960e06f294c06f4a210395645927c7d95ecba2a80bc54e456774512cd8713ebc1a0a88de2b576e8f4591d9051bba0c3c5aa82ee95cb87c140c9d95823ace770e234608131adabf9534702d9bcbae0b8e2e95596d18207aac89cd1776f691731f9a242dfe5d98ffcf902fcf0ec9515ec5c9f21591f2f0493d010f1aa951cfb10209ecd0d2d930759230f23bcdadbedcf32d7a5534b4f23c5f12f43376fa20fa83898fe74090b19e851d4a1909145f8df6b8e5da2d5f0dd3fbc7bab52d5dbbaa6a19448f1473a40f5604e3cb543a0c3d7dc8cc0af09091ca6ab26608b877258f4f20163fbd07942a17680a748ed11e529970cf0912c746318bdbf9417fbed5cbb2d6c3070a311642613f68f86b5d3083013bf632e00f2d15b3b628a28fc7fc8d326ebd7920fbacdb3f8bebfcaa12be8dc2384cf2f990c164959aa7f4b0d2e11f6b019b52fcefc685c7902deef50cbcd811cb084b253e35520a2e5ed9e6e173d1f5b3b28cecefd30f9ecdf434815ceb5a289a9d295b9cd77d150f8af11c5d44a21d76e78c6ec246c1ffead9125ed7c98c07578d867655f6fa92701e142130c10782a6fe9fd1f5e22baa038368ae03afe95672233bb80075b072ff56abf328e1c7e0fedf7cfe6b5a7189e99613d2cae52e427ea6e0a0573caeb224b28ee315bfbd6757a0d86068839d7559c763dacf0ae4f39a03f31464c6d505171206fb75499c9acdb8b6668d6c8d1663cac428c6ce49f476b03016b96862de93029b6d10ffe1b50dce3b8c2c742b920bb7f57772dc9958ed4e6f7259ba37dccc11f670304e3aec0bdfaaec414bafa8b31f01d18aa23711b29c873cad47be95`
    const data = encryption.aesDecrypt(obj,StaticStr.CFG_KEY);
    console.log(data);
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
        if (isUndefined(results[valIndex])) {
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
              val[listing] = this.parseString(type, data, key, listing);
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
              obj[listing] = this.parseString(type, data, key, listing);
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
              objJson[key] = this.parseString(type, data, key, listing);
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
    if (isUndefined(data)) {
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
    const data = await getCfgList();
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
   * 创建角色
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
    let gameName = "";
    this.newStr = undefined;
    this.oldStr = undefined;
    this.encryptionValue = false;
    this.mergeValue = false;
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
    this.activities = new Array();
    this.$nextTick(() => {
      (this.$refs.dataForm as Form).clearValidate();
    });
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
    if (isUndefined(this.newStr)) {
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
   * 保存
   */
  private createData() {
    (this.$refs.dataForm as Form).validate(async (valid) => {
      if (valid) {
        if (this.encryptionValue) {
          this.tempCfgData.encryption = 1;
        }
        if (this.mergeValue) {
          this.tempCfgData.merge = 1;
        }
        const { data } = await createCfg(this.tempCfgData);
        if (!isUndefined(data)) {
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
   * 保存
   */
  private async updateData() {
    (this.$refs.dataForm as Form).validate(async (valid) => {
      if (valid) {
        if (this.encryptionValue) {
          this.tempCfgData.encryption = 1;
        }
        if (this.mergeValue) {
          this.tempCfgData.merge = 1;
        }
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
    link.download = "config.json";
    // 验证是否选择文件
    if (isUndefined(this.newStr)) {
      link.href = "data:text/plain," + JSON.stringify(this.tempCfgData.body);
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
    this.tempCfgData.encryption === 1
      ? (this.encryptionValue = true)
      : (this.encryptionValue = false);
    this.tempCfgData.merge === 1
      ? (this.mergeValue = true)
      : (this.mergeValue = false);
    // 获取历史版本
    const data = await cfgByCfgId({ cfgId: row.cfgId });
    this.activities = new Array();
    this.activities = data.data;
    this.loading = false;
  }

  /**
   * 删除角色信息
   */
  private async handleDelete(row: any, index: number) {
    await delectCfg({ id: row.id });
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