<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">
        <el-col :span="6" :xs="24">
          <user-card :user="user" />
        </el-col>
        <el-col :span="18" :xs="24">
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="最近操作记录" name="timeline">
                <timeline :data="user" />
              </el-tab-pane>
              <el-tab-pane label="个人信息" name="account">
                <account :user="user" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { UserModule } from "@/store/modules/user";
import Account from "./components/Account.vue";
import Timeline from "./components/Timeline.vue";
import UserCard from "./components/UserCard.vue";
import { Paging } from "@/utils/Type";
import { systemLog } from "@/api/auth/user";

export interface IProfile {
  name: string;
  email: string;
  avatar: string;
  roles: string;
  id: string;
}

const defaultProfile: IProfile = {
  name: "Loading...",
  email: "Loading...",
  avatar: "",
  roles: "Loading...",
  id: "Loading...",
};

@Component({
  name: "Profile",
  components: {
    Account,
    Timeline,
    UserCard,
  },
})
export default class extends Vue {
  private user = defaultProfile;
  private activeTab = "timeline";
  get name() {
    return UserModule.name;
  }
  get email() {
    return UserModule.email;
  }

  get avatar() {
    return UserModule.avatar;
  }
  get id() {
    return UserModule.id;
  }

  get roles() {
    return UserModule.roles;
  }

  created() {
    this.getUser();
  }
  private async getUser() {
    this.user = {
      name: this.name,
      avatar: this.avatar,
      email: this.email,
      roles: this.roles,
      id: this.id,
    };
    console.log(this.user);
  }
}
</script>
