export type TAvatar = {
  emoji?: {
    id: string
    set?: '' | 'apple' | 'google' | 'twitter' | 'facebook'
    colons?: string
    unified?: string
  }
  /**
   * Use Noto Color Emoji:
   * https://fonts.google.com/noto/specimen/Noto+Color+Emoji/
   */
  useNotoColor?: boolean
  background?: string
  url?: string
}
