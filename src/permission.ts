import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Message } from 'element-ui'
import { Route } from 'vue-router'
import { UserModule } from '@/store/modules/user'

/**
 * 进度条配置
 */
NProgress.configure({ showSpinner: false })
/**
 * 路径白名单
 * 不验证令牌
 */
const whiteList = ['/login']
/**
 * 路由改变时触发
 */
router.beforeEach(async (to: Route, _: Route, next: any) => {
    // 开始进度条
    NProgress.start()
    // 确定用户是否已登录
    if (UserModule.token) {
        if (to.path === '/login') {
            // 如果已登录，重定向到主页
            next({ path: '/' })
            NProgress.done()
        } else {
            // 检查用户是否已获得其权限角色
            if (UserModule.roles.length === 0) {
                try {
                    // 获取用户信息，包括角色
                    await UserModule.GetUserInfo();
                    // 设置replace：true，因此导航不会留下历史记录
                    next({ ...to, replace: true })
                } catch (err) {
                    // 删除令牌并重定向到登录页面
                    UserModule.ResetToken()
                    Message.error(err || 'Has Error')
                    next(`/login?redirect=${to.path}`)
                    NProgress.done()
                }
            } else {
                next()
            }
        }
    } else {
        // 没有令牌
        if (whiteList.indexOf(to.path) !== -1) {
            // 在登录白名单中，直接进入
            next()
        } else {
            // 其他无权访问的页面将重定向到登录页面。
            next(`/login?redirect=${to.path}`)
            NProgress.done()
        }
    }
})
/**
 * 路由结束方法
 */
router.afterEach((to: Route) => {
    // 完成进度条
    NProgress.done()

    // 设置页面标题
    document.title = to.meta.title
})
