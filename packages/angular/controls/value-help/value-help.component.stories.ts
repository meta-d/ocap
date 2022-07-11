import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  NgmMissingTranslationHandler,
  OcapCoreModule,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN,
  OCAP_MODEL_TOKEN
} from '@metad/ocap-angular/core'
import { AgentType, DataSource, MemberSource, Type } from '@metad/ocap-core'
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { CUBE_SALES_ORDER, MockAgent } from '../../mock/agent-mock.service'
import { ControlsModule } from '../controls.module'
import { ValueHelpDialog } from './value-help.component'

export default {
  title: 'ValueHelpDialog',
  component: ValueHelpDialog,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        ControlsModule,
        OcapCoreModule.forRoot(),
        TranslateModule.forRoot({
          missingTranslationHandler: {
            provide: MissingTranslationHandler,
            useClass: NgmMissingTranslationHandler
          }
        })
      ],
      providers: [
        {
          provide: OCAP_AGENT_TOKEN,
          useClass: MockAgent,
          multi: true
        },
        {
          provide: OCAP_DATASOURCE_TOKEN,
          useValue: {
            type: 'SQL',
            factory: async (): Promise<Type<DataSource>> => {
              const { SQLDataSource } = await import('@metad/ocap-sql')
              return SQLDataSource
            }
          },
          multi: true
        },
        {
          provide: OCAP_MODEL_TOKEN,
          useValue: {
            name: 'Sales',
            type: 'SQL',
            agentType: AgentType.Browser,
            settings: {
              ignoreUnknownProperty: true
            },
            schema: {
              cubes: [
                CUBE_SALES_ORDER
              ]
            }
          },
          multi: true
        }
      ]
    })
  ]
} as Meta<ValueHelpDialog>

const Template: Story<ValueHelpDialog> = (args: ValueHelpDialog) => ({
  props: args
})

export const Primary = Template.bind({})
Primary.args = {
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder'
  },
  dimension: {
    dimension: '[Product]'
  }
}

export const MemberSourceFromDimension = Template.bind({})
MemberSourceFromDimension.args = {
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder'
  },
  dimension: {
    dimension: '[Product]'
  },
  options: {
    memberSource: MemberSource.DIMENSION,
    searchable: true
  }
}
