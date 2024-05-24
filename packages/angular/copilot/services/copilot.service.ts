import { Injectable, model, signal } from '@angular/core'
import { BusinessRoleType, CopilotService } from '@metad/copilot'

@Injectable()
export class NgmCopilotService extends CopilotService {

    readonly roles = signal<BusinessRoleType[]>([])
    readonly role = model<string>(null)

    constructor() {
        super()
    }

    setRole(role: string): void {
        this.role.set(role)
    }

}
