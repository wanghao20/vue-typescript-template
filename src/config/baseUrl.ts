let BaseUrl = '' // 这里是一个默认的url，可以没有
switch (process.env.NODE_ENV) {
    case 'development':
        BaseUrl = 'http://192.168.12.245:7002/' // 这里是本地的请求url
        // BaseUrl = 'http://192.168.12.245:9090/' // 这里是本地的请求url
        break
    case 'alpha': // 注意这里的名字要和设置的模式名字对应起来
        BaseUrl = 'https://vue-typescript-admin-mock-server.armour.now.sh/mock-api/v1/' // 这里是测试环境中的url
        break
    case 'production':
        BaseUrl = 'https://www.edik.cn/' // 生产环境url
        break
}
export default BaseUrl
