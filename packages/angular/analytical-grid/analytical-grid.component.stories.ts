import { OcapCoreModule, OCAP_AGENT_TOKEN, OCAP_DATASOURCE_TOKEN, OCAP_MODEL_TOKEN } from '@metad/ocap-angular/core'
import { AgentType, C_MEASURES, DataSource, Type } from '@metad/ocap-core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { CUBE_SALES_ORDER, MockAgent } from '../mock/agent-mock.service'
import { AnalyticalGridComponent } from './analytical-grid.component'
import { AnalyticalGridModule } from './analytical-grid.module'

export default {
  title: 'AnalyticalGridComponent',
  component: AnalyticalGridComponent,
  decorators: [
    moduleMetadata({
      imports: [AnalyticalGridModule, OcapCoreModule.forRoot()],
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
                CUBE_SALES_ORDER,
                {
                  ...CUBE_SALES_ORDER,
                  name: 'SalesOrder10s'
                }
              ]
            }
          },
          multi: true
        }
      ]
    })
  ]
} as Meta<AnalyticalGridComponent>

const Template: Story<AnalyticalGridComponent> = (args: AnalyticalGridComponent) => ({
  props: args
})

export const Primary = Template.bind({})
Primary.args = {
  title: 'Primary Analytical Grid',
  appearance: {
  },
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder',
    analytics: {
      rows: [
        {
          dimension: '[Product]'
        }
      ],
      columns: [
        {
          dimension: C_MEASURES,
          measure: 'Sales'
        }
      ]
    }
  },
  options: {},
}

export const Loading = Template.bind({})
Loading.args = {
  title: 'Loading Analytical Grid',
  appearance: {
  },
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder10s',
    analytics: {
      rows: [
        {
          dimension: '[Product]'
        }
      ],
      columns: [
        {
          dimension: C_MEASURES,
          measure: 'Sales'
        }
      ]
    }
  },
  options: {}
}
