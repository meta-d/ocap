import { Injectable, signal } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { ThemesEnum } from '../models'

@Injectable({
  providedIn: 'root'
})
export class NgmThemeService {
  readonly #themeClass$ = signal<string>('')

  readonly themeClass$ = toObservable(this.#themeClass$)
  readonly themeClass = this.#themeClass$.asReadonly()

  constructor() {
    const initialClass = document.body.classList.contains(ThemesEnum.dark) ? ThemesEnum.dark : ThemesEnum.light
    this.#themeClass$.set(initialClass)

    // Efficiently listen for class changes using MutationObserver:
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const newClass = document.body.classList.contains(ThemesEnum.dark) ? ThemesEnum.dark : ThemesEnum.light
          if (newClass !== this.#themeClass$()) {
            this.#themeClass$.set(newClass)
          }
        }
      }
    })

    observer.observe(document.body, { attributes: true })
  }
}
