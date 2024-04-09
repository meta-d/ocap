import { firstValueFrom, Observable } from 'rxjs'
import { ToastrService } from './services'
import { getErrorMessage } from './types'

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
