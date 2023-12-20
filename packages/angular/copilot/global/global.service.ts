import { Injectable } from '@angular/core'
import { CopilotEngine } from '@metad/copilot'

@Injectable({ providedIn: 'root' })
export class CopilotGlobalService {
  copilotEngine: CopilotEngine
}
