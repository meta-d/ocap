import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout'
import { computed, Injectable } from '@angular/core'
import { ComponentStore } from '@metad/store'
import { includes, some } from 'lodash-es'
import { combineLatest } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { MenuCatalog, Store } from './@core'
import { toSignal } from '@angular/core/rxjs-interop'
import { prefersColorScheme, ThemesEnum } from '@metad/core'
import { screenfull } from './@core/theme/'

export interface PACAppState {
  insight: boolean
  navigation: {
    catalog?: MenuCatalog
    id?: string | boolean
    label?: string
    icon?: string
  }
  dark: boolean
  zIndexs: number[]
}

@Injectable({
  providedIn: 'root'
})
export class AppService extends ComponentStore<PACAppState> {
  public isAuthenticated$ = this.store.user$.pipe(map((user) => !!user))
  public readonly fullscreenIndex$ = this.select((state) => state.zIndexs[state.zIndexs.length - 1])
  public insight$ = this.select((state) => state.insight)
  public catalog$ = this.select((state) => state.navigation?.catalog)
  public navigation$ = this.select((state) => state.navigation)

  readonly mediaMatcher$ = combineLatest(
    Object.keys(Breakpoints).map((name) => {
      return this.breakpointObserver
        .observe([Breakpoints[name]])
        .pipe(map((state: BreakpointState) => [name, state.matches]))
    })
  ).pipe(map((breakpoints) => breakpoints.filter((item) => item[1]).map((item) => item[0])))

  public readonly isMobile$ = this.mediaMatcher$.pipe(
    map((values) => some(['XSmall', 'Small', 'HandsetPortrait'], (el) => includes(values, el))),
    shareReplay(1)
  )

  public readonly isDark$ = this.select((state) => state.dark)

  public readonly copilotEnabled$ = this.store.featureOrganizations$.pipe(
    map(() => this.store.hasFeatureEnabled('FEATURE_COPILOT' as any)),
  )

  
  readonly preferredTheme$ = toSignal(this.store.preferredTheme$)
  readonly systemColorScheme$ = toSignal(prefersColorScheme())

  readonly theme$ = computed(() => {
    let preferredTheme = this.preferredTheme$()
    const systemColorScheme = this.systemColorScheme$()
    if (preferredTheme === ThemesEnum.system || !preferredTheme) {
      preferredTheme = systemColorScheme
    }

    const [primary, color] = preferredTheme.split('-')

    return {
      preferredTheme,
      primary,
      color,
    }
  })
  
  constructor(
    private store: Store,
    private breakpointObserver: BreakpointObserver) {
    super({ navigation: {}, zIndexs: [] } as PACAppState)
  }

  public toggleInsight = this.updater((state) => {
    state.insight = !state.insight
  })

  public setCatalog = this.updater((state, { catalog, id, label, icon }: PACAppState['navigation']) => {
    state.navigation.catalog = catalog
    state.navigation.id = id
    state.navigation.label = label
    state.navigation.icon = icon

    if (!id) {
      state.navigation.id = null
      state.navigation.label = null
    }
  })

  public setNavigation = this.updater((state, navigation: PACAppState['navigation']) => {
    state.navigation = navigation
  })

  public setDark = this.updater((state, dark: boolean) => {
    state.dark = dark
  })

  public toggleDark = this.updater((state) => {
    state.dark = !state.dark
  })

  public requestFullscreen = this.updater((state, zIndex: number) => {
    if (state.zIndexs[state.zIndexs.length - 1] >= zIndex) {
      state.zIndexs.pop()
    }
    state.zIndexs.push(zIndex)

    if (screenfull.isEnabled) {
      screenfull.request();
    }
  })

  public exitFullscreen = this.updater((state, zIndex: number) => {
    const index = state.zIndexs.findIndex((item) => item >= zIndex)
    if (index > -1) {
      state.zIndexs.splice(index)
    }

    if (screenfull.isEnabled) {
      screenfull.exit()
    }
  })
}
