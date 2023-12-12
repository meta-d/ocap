import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatIconModule } from '@angular/material/icon'
import {
  DisplayDensity,
  NgmDSCoreService,
  NgmMissingTranslationHandler,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN,
  OCAP_MODEL_TOKEN,
  OcapCoreModule
} from '@metad/ocap-angular/core'
import { AgentType, DataSource, DisplayBehaviour, FilterSelectionType, Type } from '@metad/ocap-core'
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core'
import { Meta, moduleMetadata } from '@storybook/angular'
import { MockAgent } from '../../mock/agent-mock.service'
import { ControlsModule } from '../controls.module'
import { NgmSmartFilterComponent } from './smart-filter.component'


export default {
  title: 'SmartFilter',
  component: NgmSmartFilterComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        MatIconModule,
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
} as Meta<NgmSmartFilterComponent>

export const Primary = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder3s'
    },
    dimension: {
      dimension: 'Department',
      displayBehaviour: DisplayBehaviour.auto
    },
    options: {}
  }
}

export const DensityCompact = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder3s'
    },
    dimension: {
      dimension: 'Department'
    },
    options: {},
    displayDensity: DisplayDensity.compact
  }
}

export const SelectionTypeMultiple = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder3s'
    },
    dimension: {
      dimension: 'Department'
    },
    options: {
      multiple: true
      // selectionType: FilterSelectionType.Multiple
    },
    appearance: {
      displayDensity: DisplayDensity.compact
    }
  }
}

export const AppearanceOutline = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder3s'
    },
    dimension: {
      dimension: 'Department'
    },
    options: {
      selectionType: FilterSelectionType.Multiple
    },
    appearance: {
      appearance: 'outline'
    }
  }
}

const render = (args) => ({
  props: args,
  styles: [
    `.ngm-smart-filter {
      width: 100px;
    }`
  ]
})
export const Width = {
  render,
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder3s'
    },
    dimension: {
      dimension: 'Department'
    },
    options: {
      selectionType: FilterSelectionType.Multiple
    }
  }
}

export const WidthCompact = {
  render,
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder3s'
    },
    dimension: {
      dimension: 'Department'
    },
    options: {
      selectionType: FilterSelectionType.Multiple
    },
    appearance: {
      displayDensity: DisplayDensity.compact
    }
  }
}

export const Disabled = {
  render,
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder3s'
    },
    dimension: {
      dimension: 'Department'
    },
    options: {},
    disabled: true
  }
}

export const Prefix = {
  render: (args) => ({
    props: args,
    template: `
<ngm-smart-filter [dataSettings]="dataSettings" [dimension]="dimension" [options]="options">
    <div ngmPrefix>
      <mat-icon>search</mat-icon>
    </div>
</ngm-smart-filter>
    `
  }),
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder3s'
    },
    dimension: {
      dimension: 'Department'
    },
    options: {},
  }
}

export const Suffix = {
  render: (args) => ({
    props: args,
    template: `
<ngm-smart-filter [dataSettings]="dataSettings" [dimension]="dimension" [options]="options">
    <div ngmSuffix>
      <mat-icon>search</mat-icon>
    </div>
</ngm-smart-filter>
    `
  }),
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder3s'
    },
    dimension: {
      dimension: 'Department'
    },
    options: {},
  }
}
