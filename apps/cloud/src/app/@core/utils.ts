import { inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { TranslateService } from '@ngx-translate/core'
import { firstValueFrom, map, Observable, startWith } from 'rxjs'
import { ToastrService } from './services'
import { getErrorMessage, LanguagesEnum } from './types'

export function requestFullscreen(document) {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen()
  } else if (document.documentElement.mozRequestFullScreen) {
    /* Firefox */
    document.documentElement.mozRequestFullScreen()
  } else if (document.documentElement.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    document.documentElement.webkitRequestFullscreen()
  } else if (document.documentElement.msRequestFullscreen) {
    /* IE/Edge */
    document.documentElement.msRequestFullscreen()
  }
}

/* Close fullscreen */
export function exitFullscreen(document) {
  if (document.fullscreenElement) {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
      /* Firefox */
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      /* IE/Edge */
      document.msExitFullscreen()
    }
  }
}

export async function tryHttp<T>(request: Observable<T>, toastrService?: ToastrService) {
  try {
    return await firstValueFrom(request)
  } catch (err) {
    toastrService?.error(getErrorMessage(err))
  }
}

export function omitSystemProperty<T>(obj: T) {
  return Object.keys(obj)
    .filter((key) => !(key.startsWith('__') && key.endsWith('__')))
    .reduce((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {} as T)
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUUID(id: string) {
  return uuidRegex.test(id)
}

export function getWebSocketUrl(url: string) {
  return (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + url.replace('http:', '').replace('https:', '')
}

/**
 * Inject help website url for language
 * 
 * @returns url of website
 */
export function injectHelpWebsite() {
  const translate = inject(TranslateService)

  const website = 'https://mtda.cloud'

  return toSignal(
    translate.onLangChange.pipe(
      map((event) => event.lang),
      startWith(translate.currentLang),
      map((lang) => {
        const language = lang as LanguagesEnum
        if ([LanguagesEnum.Chinese, LanguagesEnum.SimplifiedChinese, LanguagesEnum.TraditionalChinese].includes(language)) {
          return website
        } else {
          return `${website}/en`
        }
      })
    )
  )
}
