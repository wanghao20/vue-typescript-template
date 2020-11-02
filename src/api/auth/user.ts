import request from '@/utils/request'

export const getUsers = (params: any) =>
    request({
        url: '/auth/user',
        method: 'get',
        params
    });

export const createUser = (params: any) =>
    request({
        url: '/auth/user',
        method: 'post',
        params
    });
export const delectUser = (params: any) =>
    request({
        url: '/auth/user',
        method: 'delete',
        params
    });
export const updateUser = (params: any) =>
    request({
        url: '/auth/user',
        method: 'put',
        params
    });
export const getUserInfo = (data: any) =>
    request({
        url: '/auth/info',
        method: 'post',
        data
    })

export const login = (data: any) =>
    request({
        url: '/auth/login',
        method: 'post',
        data
    })
export const captchaCode = (data: any) =>
    request({
        url: '/auth/captchaCode',
        method: 'get',
        data
    })
export const validEmailCode = (data: any) =>
    request({
        url: '/auth/validEmailCode',
        method: 'post',
        data
    })
export const getEmailCode = (params: any) =>
    request({
        url: '/auth/getEmailCode',
        method: 'get',
        params
    })

export const logout = () =>
    request({
        url: '/auth/logout',
        method: 'post'
    })
export const insert = (data: any) =>
    request({
        url: '/auth/insert',
        method: 'post',
        data
    })
export const systemLog = (params: any) =>
    request({
        url: '/auth/systemLog',
        method: 'get',
        params
    });
