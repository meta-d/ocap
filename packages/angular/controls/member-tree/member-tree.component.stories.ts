import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  DisplayDensity,
  NgmMissingTranslationHandler,
  OcapCoreModule,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN,
  OCAP_MODEL_TOKEN,
  NgmDSCoreService
} from '@metad/ocap-angular/core'
import { AgentType, DataSource, MemberSource, Type } from '@metad/ocap-core'
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core'
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular'
import { CUBE_SALES_ORDER, MockAgent } from '../../mock/agent-mock.service'
import { NgmControlsModule } from '../controls.module'
import { NgmMemberTreeComponent } from './member-tree.component'

export default {
  title: 'NgmMemberTreeComponent',
  component: NgmMemberTreeComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        NgmControlsModule,
        OcapCoreModule,
        TranslateModule.forRoot({
          missingTranslationHandler: {
            provide: MissingTranslationHandler,
            useClass: NgmMissingTranslationHandler
          }
        })
      ],
      providers: [
        NgmDSCoreService,
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
} as Meta<NgmMemberTreeComponent>

type Story = StoryObj<NgmMemberTreeComponent>

// styles: [`.ngm-member-tree {height: 400px;}`]

export const Primary: Story = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder3s'
    },
    dimension: {
      dimension: 'product'
    },
    appearance: {
      displayDensity: DisplayDensity.compact
    }
  },
};

export const SourceFrom: Story = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder3s'
    },
    dimension: {
      dimension: 'product'
    },
    options: {
      memberSource: MemberSource.DIMENSION
    }
  },
};

export const Appearance: Story = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder3s'
    },
    dimension: {
      dimension: 'product'
    },
    options: {
      searchable: true
    },
    appearance: {
      appearance: 'outline',
      displayDensity: DisplayDensity.compact
    }
  },
};
