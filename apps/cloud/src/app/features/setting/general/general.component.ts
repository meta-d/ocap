import { Component, OnInit } from '@angular/core'
import { ThemesEnum } from '@metad/cloud/state'
import { LANGUAGES, ROUTE_ANIMATIONS_ELEMENTS, Store } from '../../../@core/index'

@Component({
  selector: 'pac-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class PACGeneralComponent implements OnInit {
  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS
  preferredLanguage$ = this.store.preferredLanguage$
  preferredTheme$ = this.store.preferredTheme$
  themes = [
    { value: ThemesEnum.default, label: 'Default' },
    { value: ThemesEnum.dark, label: 'Dark' },
    // { value: 'cosmic', label: 'Cosmic' },
    // { value: ThemesEnum.thin, label: 'Thin' }
  ]
  languages = LANGUAGES

  constructor(private store: Store) {}

  ngOnInit(): void {}

  onLanguageSelect({ value: language }): void {
    this.store.preferredLanguage = language
  }

  onThemeSelect({ value: theme }): void {
    this.store.preferredTheme = theme
  }
}
