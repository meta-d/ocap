import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  DisplayDensity,
  NgmMissingTranslationHandler,
  OcapCoreModule,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN,
  OCAP_MODEL_TOKEN
} from '@metad/ocap-angular/core'
import { AgentType, DataSource, Type } from '@metad/ocap-core'
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { CUBE_SALES_ORDER, MockAgent } from '../../mock/agent-mock.service'
import { ControlsModule } from '../controls.module'
import { MemberTreeSelectComponent } from './tree-select.component'

export default {
  title: 'MemberTreeSelectComponent',
  component: MemberTreeSelectComponent,
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
} as Meta<MemberTreeSelectComponent>


const TREE_NODE_DATA = [
  {
    name: 'Fruit',
    children: [
      { name: 'Apple', value: 10, raw: { type: 'Hive' } },
      { name: 'Banana', value: 20 },
      { name: 'Fruit loops', value: 30 }
    ]
  },
  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [
          { name: 'Broccoli', value: 10 },
          { name: 'Brussel sprouts', value: 20 }
        ]
      },
      {
        name: 'Orange',
        children: [
          { name: 'Pumpkins', value: 30, raw: { type: 'PG' } },
          { name: 'Carrots', value: 40 }
        ]
      }
    ]
  }
] as any

const Template: Story<MemberTreeSelectComponent> = (args: MemberTreeSelectComponent) => ({
  props: args,
  styles: [`.ngm-member-tree-select {height: 400px;}`]
})

export const Primary = Template.bind({})
Primary.args = {
  dimension: {
    dimension: 'product'
  },
  appearance: {
    displayDensity: DisplayDensity.compact
  },
  data: TREE_NODE_DATA
}

export const FromDataSource = Template.bind({})
FromDataSource.args = {
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder3s'
  },
  dimension: {
    dimension: 'product'
  },
  appearance: {
    displayDensity: DisplayDensity.compact
  },
}
