import { LanguagesMap } from '../config'

export function navigatorLanguage() {
  return LanguagesMap[navigator.language] || navigator.language
}
