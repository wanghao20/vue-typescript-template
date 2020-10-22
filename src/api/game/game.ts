import request from '@/utils/request'
export const getGames = (params: any) =>
    request({
        url: '/game/game',
        method: 'get',
        params
    });
export const getGameList = () =>
    request({
        url: '/game/games',
        method: 'get',
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
