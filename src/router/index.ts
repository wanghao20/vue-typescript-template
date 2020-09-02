import Vue from 'vue'
import Router, { RouteConfig } from 'vue-router'

/* Layout */
import Layout from '@/layout/index.vue'

/* Router modules */
// import componentsRouter from './modules/components'
// import chartsRouter from './modules/charts'
// import tableRouter from './modules/table'
// import nestedRouter from './modules/nested'

Vue.use(Router)

/*
  Note: sub-menu only appear when children.length>=1
  Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
*/

/*
  name:'router-name'             the name field is required when using <keep-alive>, it should also match its component's name property
                                 detail see : https://vuejs.org/v2/guide/components-dynamic-async.html#keep-alive-with-Dynamic-Components
  redirect:                      if set to 'noredirect', no redirect action will be trigger when clicking the breadcrumb
  meta: {
    roles: ['admin', 'editor']   will control the page roles (allow setting multiple roles)
    title: 'title'               the name showed in subMenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon showed in the sidebar
    hidden: true                 if true, this route will not show in the sidebar (default is false)
    alwaysShow: true             if true, will always show the root menu (default is false)
                                 if false, hide the root menu when has less or equal than one children route
    breadcrumb: false            if false, the item will be hidden in breadcrumb (default is true)
    noCache: true                if true, the page will not be cached (default is false)
    affix: true                  if true, the tag will affix in the tags-view
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
*/

/**
   恒定路线
   没有权限要求的基本页面
   可以访问所有角色
*/
export const constantRoutes: RouteConfig[] = [
    {
        path: '/login',
        component: () => import(/* webpackChunkName: "login" */ '@/views/login/index.vue'),
        meta: { hidden: true,title: '用户登录', }
    },
    {
        path: '/404',
        component: () => import(/* webpackChunkName: "404" */ '@/views/404.vue'),
        meta: { hidden: true }
    },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/index.vue'),
                name: '主页',
                meta: {
                    title: 'Dashboard',
                    icon: 'dashboard',
                    alwaysShow: true,
                    noCache: true
                }
            }
        ]
    },
    {
        path: '/system',
        component: Layout,
        redirect: '/system/auth',
        meta: {
            title: '系统',
            icon: 'password',
            alwaysShow: true
        },
        children: [
            {
                path: 'modMgmt',
                component: () => import('@/views/auth/modMgmt.vue'),
                name: 'modMgmt',
                meta: {
                    title: '模块管理',
                    icon: 'component',
                    noCache: true,
                    alwaysShow: true
                }
            },
            {
                path: 'role',
                component: () => import('@/views/auth/role.vue'),
                name: 'role',
                meta: {
                    title: '角色权限',
                    icon: 'tree',
                    noCache: true,
                    alwaysShow: true
                }
            },
            {
                path: 'users',
                component: () => import('@/views/auth/users.vue'),
                name: 'user',
                meta: {
                    title: '用户管理',
                    icon: 'user',
                    noCache: true,
                    alwaysShow: true
                }
            }
        ]
    }
]

/**
 * 需要根据用户角色动态加载的路由
*/
export const asyncRoutes: RouteConfig[] = [
    /** 当您的路由映射表太长时，您可以将其拆分为小模块 **/
    // componentsRouter,
    // chartsRouter,
    // nestedRouter,
    // tableRouter,
    {
        path: '*',
        redirect: '/404',
        meta: { hidden: true }
    }
]

const createRouter = () => new Router({
    // mode: 'history',  // Disabled due to Github Pages doesn't support this, enable this if you need.
    scrollBehavior: (to, from, savedPosition) => {
        if (savedPosition) {
            return savedPosition
        } else {
            return { x: 0, y: 0 }
        }
    },
    base: process.env.BASE_URL,
    routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
    const newRouter = createRouter();
    (router as any).matcher = (newRouter as any).matcher // reset router
}

export default router
