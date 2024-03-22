export function makeid(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const characters = chars + '0123456789'
    const charactersLength = characters.length
    // 首字母为英文字符
    let result = chars.charAt(Math.floor(Math.random() * chars.length))
    for (let i = 0; i < length - 1; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}