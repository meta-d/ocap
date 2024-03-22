import { Provider } from '@angular/core'
import { CopilotService, ICopilot } from '@metad/copilot'
import { NgmClientCopilotService } from './client-copilot.service'
import { NgmCopilotEngineService } from './engine.service'

export function provideClientCopilot(factory: () => Promise<ICopilot>) {
  return [
    {
      provide: CopilotService,
      useClass: NgmClientCopilotService
    },
    {
      provide: NgmClientCopilotService.CopilotConfigFactoryToken,
      useFactory: () => factory
    },
    NgmCopilotEngineService
  ] as Provider[]
}
