import request from '@/utils/request'
import BaseUrl from '@/config/baseUrl';

export const getGames = (params: any) =>
    request({
        url: '/game/game',
        method: 'get',
        params
    });

export const createBaseGame = (params: any) =>
    request({
        url: '/game/game',
        method: 'post',
        params
    });
export const delectBaseGame = (params: any) =>
    request({
        url: '/game/game',
        method: 'delete',
        params
    });
export const updateBaseGame = (params: any) =>
    request({
        url: '/game/game',
        method: 'put',
        params
    });
