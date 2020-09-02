
/**
 * 验证用户名
 * @param str 输入字符
 */
export const isValidUsername = (str: string) => ['admin', 'editor'].indexOf(str.trim()) >= 0
/**
 * 验证URL地址是否有效
 * @param path 
 */
export const isExternal = (path: string) => /^(https?:|mailto:|tel:)/.test(path)
