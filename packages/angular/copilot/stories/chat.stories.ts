/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommonModule } from '@angular/common'
import { provideHttpClient } from '@angular/common/http'
import { ChangeDetectionStrategy, Component, Injectable, importProvidersFrom, inject } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { AIOptions, CopilotChatMessage, CopilotChatResponseChoice, CopilotEngine, CopilotService } from '@metad/copilot'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { Meta, StoryObj, applicationConfig, argsToTemplate, moduleMetadata } from '@storybook/angular'
import { provideMarkdown } from 'ngx-markdown'
import { Observable, of } from 'rxjs'
import { provideLogger, provideTranslate, zhHansLanguage } from '../../mock/'
import { NgmCopilotChatComponent } from '../chat/chat.component'
import { NgmClientCopilotService, NgmCopilotEngineService } from '../services'
import { injectCopilotCommand } from '../hooks/'
import { NgmSBCopilotService } from './copilot.service'

@Injectable()
class StorybookCopilotEngine2 extends NgmCopilotEngineService {

}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-sb-copilot-user',
  template: `<h1>Create a user</h1>`,
  styles: [''],
  imports: [
    CommonModule,
  ],
})
export class NgmSBCopilotUserComponent {
  #myCommand = injectCopilotCommand({
    name: 'c',
    description: 'Create a user',
    examples: [`Create a user name Tiven, age 18`],
    systemPrompt: () => {
      return `Create a user by prompt`
    },
    implementation: async (args) => {
      console.log(`Created user`)
    }
  })

  #saveCommand = injectCopilotCommand({
    name: 's',
    description: 'Save the user',
    examples: [`Save a user name Tiven, age 18`],
    systemPrompt: () => {
      return `Save a user by prompt`
    },
    implementation: async (args) => {
      console.log(`Saved user`)
    }
  })
}

export default {
  title: 'Copilot/Chat',
  component: NgmCopilotChatComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideHttpClient(),
        provideTranslate(zhHansLanguage),
        importProvidersFrom(OcapCoreModule),
        provideLogger(),
        provideMarkdown()
      ]
    }),
    moduleMetadata({
      imports: [CommonModule, NgmCopilotChatComponent, NgmSBCopilotUserComponent],
      providers: [
        {
          provide: CopilotService,
          useClass: NgmSBCopilotService
        },
        {
          provide: NgmCopilotEngineService,
          useClass: StorybookCopilotEngine2
        },
        {
          provide: NgmClientCopilotService.CopilotConfigFactoryToken,
          useFactory: () => () => {
            return Promise.resolve({
              enabled: true,
              apiKey: 'st-xxxxxx'
            })
          }
        }
      ]
    })
  ]
} as Meta<NgmCopilotChatComponent>

type Story = StoryObj<NgmCopilotChatComponent>

export const Primary: Story = {
  args: {
    welcomeTitle: 'Welcome to My AI Copilot'
  }
}

export const Size: Story = {
  render: (args) => ({
    props: args,
    template: `<ngm-copilot-chat ${argsToTemplate(
      args
    )} class="h-[500px] w-[300px] shadow-lg rounded-lg m-4" style="height: 500px;"></ngm-copilot-chat>`
  }),
  args: {
    welcomeTitle: 'Welcome to My AI Copilot'
  },
  parameters: {
    background: { default: 'dark' },
    actions: { argTypesRegex: '^conversations.*' }
  }
}

class StorybookCopilotEngine implements CopilotEngine {
  name?: string = 'Storybook custom engine'
  aiOptions: AIOptions = {
    model: '',
    messages: []
  }
  systemPrompt?: string
  prompts: string[] = ['/d {name} {age}']
  conversations: CopilotChatMessage[] = []
  placeholder?: string

  process(
    data: { prompt: string; messages?: CopilotChatMessage[] },
    options?: { action?: string }
  ): Observable<string | CopilotChatMessage> {
    if (data.prompt === '/d {name} {age}') {
      const name = options?.action || 'John'
      const age = options?.action || '18'
      return of(`My name is ${name}, I am ${age} years old.`)
    }

    return of('Non')
  }
  preprocess?(prompt: string, options?: any) {
    //
  }
  postprocess?(prompt: string, choices: CopilotChatResponseChoice[]): Observable<string | CopilotChatMessage[]> {
    throw new Error('Method not implemented.')
  }

  clear() {}
}

export const CustomEngine: Story = {
  args: {
    copilotEngine: new StorybookCopilotEngine()
  }
}

export const CustomNgmCopilotEngine: Story = {
  render: (args) => ({
    props: args,
    template: `
<div>
  <ngm-sb-copilot-user></ngm-sb-copilot-user>
  <ngm-copilot-chat ${argsToTemplate(
    args
)} class="h-[500px] w-[300px] shadow-lg rounded-lg m-4" style="height: 500px;"></ngm-copilot-chat>
</div>`
  }),
  args: {
    welcomeTitle: 'Welcome to My AI Copilot'
  }
}