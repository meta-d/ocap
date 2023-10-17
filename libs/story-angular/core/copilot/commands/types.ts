import { Observable } from 'rxjs'
import { CopilotChartConversation } from '../types'

export interface CopilotCommand {
  name: string
  description: string
  examples?: string[]
  processor: (copilot: CopilotChartConversation) => Observable<CopilotChartConversation>
}
