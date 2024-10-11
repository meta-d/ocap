export function convertToUrlPath(title: string) {
    return title?.toLowerCase() // 转换为小写
      .replace(/\s+/g, '-') // 替换空格为 -
      .replace(/[^a-z0-9-]/g, ''); // 移除非字母数字字符
}