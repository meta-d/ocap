import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  NgmMissingTranslationHandler,
  OcapCoreModule,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN,
  OCAP_MODEL_TOKEN
} from '@metad/ocap-angular/core'
import { AgentType, DataSource, Type } from '@metad/ocap-core'
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { MockAgent } from '../../mock/agent-mock.service'
import { ControlsModule } from '../controls.module'
import { SmartFilterComponent } from './smart-filter.component'

export default {
  title: 'SmartFilterComponent',
  component: SmartFilterComponent,
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
                {
                  name: 'SalesOrder',
                  tables: [{ name: 'SalesOrder' }],
                  dimensions: [
                    {
                      name: 'product',
                      caption: 'productName'
                    },
                    {
                      name: 'Department',
                      caption: 'DepartmentName'
                    }
                  ]
                }
              ]
            }
          },
          multi: true
        }
      ]
    })
  ]
} as Meta<SmartFilterComponent>

const Template: Story<SmartFilterComponent> = (args: SmartFilterComponent) => ({
  props: args
})

export const Primary = Template.bind({})
Primary.args = {
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder3s'
  },
  options: {
    dimension: {
      dimension: 'Department'
    }
  }
}

export const Searchable = Template.bind({})
Searchable.args = {
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder3s'
  },
  options: {
    dimension: {
      dimension: 'Department'
    },
    searchable: true
  }
}
