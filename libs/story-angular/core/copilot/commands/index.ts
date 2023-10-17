import { switchMap } from 'rxjs/operators'
import { CopilotChartConversation } from '../types'
import { chatStoryWidget, createStoryWidget } from './add-widget'
import { CopilotCommand } from './types'
import { smartDiscover } from './story'
import { BehaviorSubject } from 'rxjs'

export const CopilotCommands$ = new BehaviorSubject<Record<string, CopilotCommand>>({})

export function registerCommand(command: CopilotCommand) {
  CopilotCommands$.next({
    ...CopilotCommands$.value,
    [command.name]: command
  })
}

export function getCommand(name: string) {
  return CopilotCommands$.value[name]
}

registerCommand({
  name: 'add-widget',
  description: 'Add widget into story',
  processor: (copilot: CopilotChartConversation) => {
    return chatStoryWidget(copilot).pipe(switchMap(createStoryWidget))
  }
})

registerCommand({
    name: 'story',
    description: 'New story',
    processor: (copilot: CopilotChartConversation) => {
      return smartDiscover(copilot)
    }
})

export * from './add-widget'
export * from './story'
export * from './types'
