<template>
  <div class="app-container">
    <el-input v-model="filterText" placeholder="输入关键字搜索模块" style="margin-bottom:30px;" />
    <div class="custom-tree-container">
      <div class="block">
        <p>后台全局模块管理</p>
        <el-tree
          ref="tree"
          :filter-node-method="filterNode"
          :data="data"
          show-checkbox
          node-key="id"
          default-expand-all
          :expand-on-click-node="false"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{ node.label }}</span>
            <span>
              <el-button type="text" size="mini" @click="() => append(data)">添加子模块</el-button>
              <el-button type="text" size="mini" @click="() => remove(node, data)">删除当前模块</el-button>
            </span>
          </span>
        </el-tree>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Tree as ElTree } from "element-ui";
import { TreeData } from "element-ui/types/tree";

@Component({
  name: "Tree",
})
export default class extends Vue {
  private filterText = "";
  private id = 1000;
  private data = [
    {
      id: 1,
      label: "系统",
      children: [
        {
          id: 2,
          label: "模块管理",
        },
        {
          id: 3,
          label: "角色权限",
        },
        {
          id: 4,
          label: "用户管理",
        },
      ],
    },
  ];

/**
 * 监听过滤方法
 */
  @Watch("filterText")
  private onFilterTextChange(value: string) {
    (this.$refs.tree as ElTree).filter(value);
  }

  /**
   * 过滤节点
   */
  private filterNode(value: string, data: TreeData) {
    if (!value) {
      return true;
    }
    return data.label && data.label.indexOf(value) !== -1;
  }
  /**
   * 追加节点
   */
  private append(data: any) {
    console.log(data);
    const newChild = { id: this.id++, label: "testtest", children: [] };
    if (!data.children) {
      this.$set(data, "children", []);
    }
    data.children.push(newChild);
  }

  /**
   * 删除节点
   */
  private remove(node: { parent: any }, data: { id: any }) {
    const parent = node.parent;
    const children = parent.data.children || parent.data;
    const index = children.findIndex((d: any) => d.id === data.id);
    children.splice(index, 1);
  }
}
</script>
