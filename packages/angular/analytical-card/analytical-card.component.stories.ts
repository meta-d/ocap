import {
  DisplayDensity,
  OcapCoreModule,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN,
  OCAP_MODEL_TOKEN
} from '@metad/ocap-angular/core'
import { AgentType, C_MEASURES, DataSource, Schema, Type } from '@metad/ocap-core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { NgxEchartsModule } from 'ngx-echarts'
import { CUBE_SALES_ORDER, MockAgent } from '../mock/agent-mock.service'
import { AnalyticalCardComponent } from './analytical-card.component'
import { AnalyticalCardModule } from './analytical-card.module'

export default {
  title: 'AnalyticalCardComponent',
  component: AnalyticalCardComponent,
  decorators: [
    moduleMetadata({
      imports: [
        AnalyticalCardModule,
        OcapCoreModule.forRoot(),
        NgxEchartsModule.forRoot({
          echarts: () => import('echarts')
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
                CUBE_SALES_ORDER,
                {
                  ...CUBE_SALES_ORDER,
                  name: 'SalesOrder10s'
                }
              ]
            } as Schema
          },
          multi: true
        }
      ]
    })
  ]
} as Meta<AnalyticalCardComponent>

const Template: Story<AnalyticalCardComponent> = (args: AnalyticalCardComponent) => ({
  props: args
})

export const Primary = Template.bind({})
Primary.args = {
  title: 'Primary Analytical Card',
  appearance: {
    // displayBehaviour: DisplayBehaviour.auto,
  },
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder',
    chartAnnotation: {
      chartType: {
        type: 'Bar'
      },
      dimensions: [
        {
          dimension: '[Product]'
        }
      ],
      measures: [
        {
          dimension: C_MEASURES,
          measure: 'Sales'
        }
      ]
    }
  },
  options: {}
}

export const Appearance = Template.bind({})
Appearance.args = {
  title: 'Display Density Compact',
  appearance: {
    displayDensity: DisplayDensity.compact
  },
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder',
    chartAnnotation: {
      chartType: {
        type: 'Bar'
      },
      dimensions: [
        {
          dimension: '[Product]'
        }
      ],
      measures: [
        {
          dimension: C_MEASURES,
          measure: 'Sales'
        }
      ]
    }
  },
  options: {}
}

export const Loading = Template.bind({})
Loading.args = {
  title: 'Loading',
  appearance: {
    displayDensity: DisplayDensity.compact
  },
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder10s',
    chartAnnotation: {
      chartType: {
        type: 'Bar'
      },
      dimensions: [
        {
          dimension: '[Product]'
        }
      ],
      measures: [
        {
          dimension: C_MEASURES,
          measure: 'Sales'
        }
      ]
    }
  },
  options: {}
}
