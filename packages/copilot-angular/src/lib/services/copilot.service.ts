import { Injectable, computed, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { BusinessRoleType, CopilotService, DefaultBusinessRole } from '@metad/copilot'
import { TranslateService } from '@ngx-translate/core'
import { combineLatest, map, shareReplay, startWith } from 'rxjs'
import { NgmLanguageEnum } from '../types'
import { createLLM } from '../core'

@Injectable()
export abstract class NgmCopilotService extends CopilotService {
  readonly translate = inject(TranslateService)

  readonly lang = toSignal(
    this.translate.onLangChange.pipe(
      map((event) => event.lang),
      startWith(this.translate.currentLang)
    )
  )
  readonly defaultRoleI18n = toSignal(
    this.translate.stream('Copilot.DefaultBusinessRole', {
      Default: { title: 'Common', description: 'Common business role' }
    })
  )

  readonly roles = signal<BusinessRoleType[]>([])
  readonly allRoles = computed(() => {
    const lang = this.lang()
    const roles = [NgmLanguageEnum.SimplifiedChinese, NgmLanguageEnum.Chinese].includes(lang as NgmLanguageEnum)
      ? this.roles()?.map((role) => ({ ...role, title: role.titleCN }))
      : this.roles()

    return [
      {
        name: DefaultBusinessRole,
        title: this.defaultRoleI18n().title,
        description: this.defaultRoleI18n().description
      },
      ...(roles ?? [])
    ]
  })
  readonly role = signal<string>(DefaultBusinessRole)
  readonly roleDetail = computed(() => this.allRoles()?.find((role) => role.name === this.role()))
  readonly rolePrompt = computed(() => {
    const role = this.roleDetail()
    return role ? `Your role is '${role.title}', and your responsibility is ${role.description}.` : ''
  })

  readonly languagePrompt = computed(() => `Please answer in language ${Object.entries(NgmLanguageEnum).find((item) => item[1] === this.lang())?.[0] ?? 'English'}`)

  readonly llm$ = combineLatest([this.copilot$, this.clientOptions$]).pipe(
    map(([copilot, clientOptions]) =>
      copilot?.enabled ? createLLM(copilot, clientOptions, (input) => {
        this.recordTokenUsage(input)
      }) : null
    ),
    shareReplay(1)
  )

  constructor() {
    super()
  }

  setRole(role: string): void {
    this.role.set(role)
  }
 
  abstract enableCopilot(): void;
}
