const path = require('path')
const name = 'Vue Typescript Admin'

module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '/vue-typescript-admin-template/' : '/', // TODO: 请记住更改此设置以适合您的需求
    lintOnSave: process.env.NODE_ENV === 'development',
    pwa: {
        name: name
    },
    configureWebpack: {
        devtool: 'source-map'
    },
    pluginOptions: {
      'style-resources-loader': {
        preProcessor: 'scss',
        patterns: [
          'C:\\Users\\Administrator\\Desktop\\MyProject\\vue\\dfs-ums-client\\src\\styles\\_variables.scss',
          'C:\\Users\\Administrator\\Desktop\\MyProject\\vue\\dfs-ums-client\\src\\styles\\_mixins.scss'
        ]
      },
      i18n: {
        locale: 'en',
        fallbackLocale: 'en',
        localeDir: 'locales',
        enableInSFC: true
      }
    },
    chainWebpack(config) {
        // 在webpack的名称字段中提供应用程序的标题，以便
        // 可以在index.html中对其进行访问以注入正确的标题。
        config.set('name', name)
    }
}
