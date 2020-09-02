/**
 * 通用工具class
 * wanghao
 * 2319512282@qq.com
 * @Date 2020.8.29
 * @Doc 基础常用工具类
 */
/**
 * 开始加载动画
 * @param listLoading 控制开关
 */
export const startLoading = (listLoading: boolean) => {
    listLoading = true
}
/**
 * 结束加载动画
 * @param listLoading 控制开关
 */
export const endLoading = (listLoading: boolean) => {
    setTimeout(() => {
        listLoading = false;
    }, 0.5 * 1000);
}
// 使用filterKeys数组格式化和过滤json数据
export const formatJson = (filterKeys: any, jsonData: any) =>
  jsonData.map((data: any) => filterKeys.map((key: string) => {
    if (key === 'timestamp') {
      return parseTime(data[key])
    } else {
      return data[key]
    }
  }))
  // 解析时间到字符串
export const parseTime = (

    time?: object | string | number | null,
    cFormat?: string
  ): string | null => {
    if (time === undefined || !time) {
      return null
    }
    const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
    let date: Date
    if (typeof time === 'object') {
      date = time as Date
    } else {
      if (typeof time === 'string') {
        if (/^[0-9]+$/.test(time)) {
          // support "1548221490638"
          time = parseInt(time)
        } else {
          // support safari
          // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
          time = time.replace(new RegExp(/-/gm), '/')
        }
      }
      if (typeof time === 'number' && time.toString().length === 10) {
        time = time * 1000
      }
      date = new Date(time)
    }
    const formatObj: { [key: string]: number } = {
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      i: date.getMinutes(),
      s: date.getSeconds(),
      a: date.getDay()
    }
    const timeStr = format.replace(/{([ymdhisa])+}/g, (result, key) => {
      const value = formatObj[key]
      // Note: getDay() returns 0 on Sunday
      if (key === 'a') {
        return ['日', '一', '二', '三', '四', '五', '六'][value]
      }
      return value.toString().padStart(2, '0')
    })
    return timeStr

  }
