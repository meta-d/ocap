import { Injectable, computed, inject, model, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { BusinessRoleType, CopilotService, DefaultBusinessRole } from '@metad/copilot'
import { NgmLanguageEnum } from '@metad/ocap-angular/core'
import { TranslateService } from '@ngx-translate/core'
import { map, startWith } from 'rxjs'

@Injectable()
export class NgmCopilotService extends CopilotService {
    readonly translate = inject(TranslateService)

    readonly lang = toSignal(this.translate.onLangChange.pipe(map((event) => event.lang), startWith(this.translate.currentLang)))
    readonly defaultRoleI18n = toSignal(this.translate.stream('Ngm.Copilot.DefaultBusinessRole', { Default: { title: 'Common', description: 'Common business role' } }))

    readonly roles = signal<BusinessRoleType[]>([])
    readonly allRoles = computed(() => {
        const lang = this.lang()
        const roles = [NgmLanguageEnum.SimplifiedChinese, NgmLanguageEnum.Chinese].includes(lang as NgmLanguageEnum) ? this.roles()?.map((role) => ({ ...role, title: role.titleCN }))
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
    readonly role = model<string>(DefaultBusinessRole)

    constructor() {
        super()
    }

    setRole(role: string): void {
        this.role.set(role)
    }

}
