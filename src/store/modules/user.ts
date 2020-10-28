import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators'
import { getToken, setToken, removeToken } from '@/utils/cookies'
import store from '@/store'
import { login, getUserInfo, logout, insert } from '@/api/auth/user'
import { resetRouter } from '@/router'
import { StaticStr } from '@/config/StaticStr'

export interface IUserState {
    token: string
    name: string
    email: string
    avatar: string
    id: string
    roles: string
}

@Module({ dynamic: true, store, name: 'user' })
class User extends VuexModule implements IUserState {
    public token = getToken() || ''
    public name = ''
    public email = ''
    public avatar = ''
    public id = ''
    public roles: string = ''

    @Mutation
    private SET_TOKEN(token: string) {
        this.token = token
    }

    @Mutation
    private SET_NAME(name: string) {
        this.name = name
    }

    @Mutation
    private SET_AVATAR(avatar: string) {
        this.avatar = avatar
    }

    @Mutation
    private SET_ID(id: string) {
        this.id = id
    }

    @Mutation
    private SET_ROLES(roles: string) {
        this.roles = roles
    }
    @Mutation
    private SET_EMAIL(email: string) {
        this.email = email
    }

    /**
     * 登录
     * @param userInfo
     */
    @Action({ rawError: true })
    public async Login(userInfo: { username: string, time: string, password: string, captchaCode: string }) {
        let { username, password, captchaCode, time } = userInfo
        username = username.trim()
        const { data } = await login({ username, password, captchaCode, time })
        if(data===undefined){
            return true;
        }
        setToken(data.accessToken)
        this.SET_TOKEN(data.accessToken)
    }

    /**
     * 注册
     * @param userInfo
     */
    @Action({ rawError: true })
    public async insert(userInfo: { name: string, email: string, password: string }) {
        let { name, password, email } = userInfo
        name = name.trim()
        const { data } = await insert({ name, password, email })
        setToken(data.accessToken)
        this.SET_TOKEN(data.accessToken)
    }

    /**
     * 重置token
     */
    @Action
    public ResetToken() {
        removeToken()
        this.SET_TOKEN('')
        this.SET_ROLES('')
    }

    /**
     * 获取用户信息
     */
    @Action
    public async GetUserInfo() {
        if (this.token === '') {
            throw Error('GetUserInfo: token is undefined!')
        }
        const { data } = await getUserInfo({})
        if (!data) {
            throw Error('Verification failed, please Login again.')
        }
        let { id, name, avatar, email, rolesName } = data.user;

        // 角色
        this.SET_ROLES(rolesName)
        this.SET_EMAIL(email)
        this.SET_ID(id)
        // 用户名称
        this.SET_NAME(name)
        if(avatar===null){
            // 设置默认头像
            avatar=StaticStr.AVATAR
        }
        
        // 头像
        this.SET_AVATAR(avatar)
        // mods
        return data.mods
    }

    /**
     * 退出登录
     */
    @Action
    public async LogOut() {
        if (this.token === '') {
            throw Error('LogOut: token is undefined!')
        }
        await logout()
        removeToken()
        this.SET_TOKEN('')
        this.SET_ROLES('')
        resetRouter()
    }
}

export const UserModule = getModule(User)
