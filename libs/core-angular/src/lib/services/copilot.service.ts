import { Injectable } from '@angular/core'
import { CopilotService } from '@metad/copilot'

/**
 * @deprecated use `NgmCopilotService` from `@metad/ocap-angular`
 */
@Injectable()
export class NgmCopilotService extends CopilotService {
  constructor() {
    super()
  }
}
