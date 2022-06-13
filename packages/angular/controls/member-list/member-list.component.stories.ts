import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  DisplayDensity,
  NgmMissingTranslationHandler,
  OcapCoreModule,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN,
  OCAP_MODEL_TOKEN
} from '@metad/ocap-angular/core'
import { AgentType, DataSource, MemberSource, Type } from '@metad/ocap-core'
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { MockAgent } from '../../mock/agent-mock.service'
import { ControlsModule } from '../controls.module'
import { MemberListComponent } from './member-list.component'

export default {
  title: 'MemberListComponent',
  component: MemberListComponent,
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
} as Meta<MemberListComponent>

const Template: Story<MemberListComponent> = (args: MemberListComponent) => ({
  props: args
})

export const Primary = Template.bind({})
Primary.args = {
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder3s'
  },
  dimension: {
    dimension: 'Department'
  }
}

export const SourceFrom = Template.bind({})
SourceFrom.args = {
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder3s'
  },
  dimension: {
    dimension: 'Department'
  },
  options: {
    memberSource: MemberSource.DIMENSION
  }
}

export const Appearance = Template.bind({})
Appearance.args = {
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder3s'
  },
  dimension: {
    dimension: 'Department'
  },
  options: {
    searchable: true
  },
  appearance: {
    appearance: 'outline',
    displayDensity: DisplayDensity.compact
  }
}
