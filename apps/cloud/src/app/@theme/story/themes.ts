import { ElementRef, Renderer2, effect, inject } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { NxCoreService, ThemesEnum } from '@metad/core'
import { isEqual } from '@metad/ocap-core'
import { NxStoryService } from '@metad/story/core'
import { registerTheme } from 'echarts/core'
import { firstValueFrom } from 'rxjs'
import { distinctUntilChanged, filter, map } from 'rxjs/operators'
import { AppService } from '../../app.service'

export function registerStoryThemes(storyService: NxStoryService) {
  return storyService.echartsTheme$
    .pipe(filter(Boolean), distinctUntilChanged(isEqual), takeUntilDestroyed())
    .subscribe(async (echartsTheme) => {
      const story = await firstValueFrom(storyService.story$)
      const key = story.key || story.id
      Object.values(ThemesEnum).forEach((theme) => {
        if (echartsTheme?.[theme]) {
          registerTheme(`${theme}-${key}`, echartsTheme[theme])
        }
      })
    })
}

export function effectStoryTheme(elementRef: ElementRef) {
  const storyService = inject(NxStoryService)
  const coreService = inject(NxCoreService)
  const appService = inject(AppService)
  const renderer = inject(Renderer2)

  const storyKey$ = toSignal(storyService.story$.pipe(map((story) => story.key || story.id)))
  const echartsTheme$ = toSignal(storyService.story$.pipe(map((story) => story.options?.echartsTheme)))

  return effect(() => {
    const key = storyKey$()
    const echartsTheme = echartsTheme$()

    Object.values(ThemesEnum).forEach((theme) => {
      renderer.removeClass(elementRef.nativeElement, 'ngm-theme-' + theme)
      renderer.removeClass(elementRef.nativeElement, theme)
    })

    let current = storyService.themeName()

    if (current && current !== ThemesEnum.default && current !== ThemesEnum.system) {
      renderer.addClass(elementRef.nativeElement, 'ngm-theme-' + current)
      renderer.addClass(elementRef.nativeElement, current)
    }

    if (current === ThemesEnum.system || current === ThemesEnum.default || !current) {
      const { primary } = appService.theme$()
      current = primary
    }
    if (echartsTheme?.[current]) {
      coreService.changeTheme(`${current}-${key}`)
    } else {
      coreService.changeTheme(current)
    }
  })
}
