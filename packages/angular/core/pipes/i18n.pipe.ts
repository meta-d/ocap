import { inject, Pipe, PipeTransform } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

@Pipe({
  standalone: true,
  name: 'i18n'
})
export class NgmI18nPipe implements PipeTransform {
  readonly translate = inject(TranslateService)

  transform(value: unknown): string {
    return typeof value === 'string'
      ? value
      : typeof value === 'object'
        ? value[mapLanguage(this.translate.currentLang)]
        : value
  }
}

function mapLanguage(l: string) {
  switch (l) {
    case 'zhHans':
      return 'zh_Hans'
    default:
      return 'en_US'
  }
}
