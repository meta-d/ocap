import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  DisplayDensity,
  NgmDSCoreService,
  NgmMissingTranslationHandler,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN,
  OCAP_MODEL_TOKEN,
  OcapCoreModule
} from '@metad/ocap-angular/core'
import { AgentType, DataSource, FilterSelectionType, ParameterControlEnum, Type } from '@metad/ocap-core'
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core'
import { Meta, moduleMetadata } from '@storybook/angular'
import { CUBE_SALES_ORDER, MockAgent } from '../../mock/agent-mock.service'
import { NgmParameterComponent } from './parameter.component'

export default {
  title: 'ParameterComponent',
  component: NgmParameterComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        NgmParameterComponent,
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
              cubes: [CUBE_SALES_ORDER]
            }
          },
          multi: true
        }
      ]
    })
  ]
} as Meta<NgmParameterComponent>

// const Template = (args: Partial<NgmParameterComponent>) => ({
//   props: args,
//   template: `<ngm-parameter [dataSettings]="dataSettings" [parameter]="parameter" [options]="options" [appearance]="appearance"></ngm-parameter>`
// })

const AVAILABLE_MEMBERS = [
  {
    value: 1,
    label: 'Department A'
  },
  {
    value: 2,
    label: 'Department B'
  },
  {
    value: 3,
    label: 'Department C'
  }
]

export const Primary = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder'
    },
    parameter: {
      name: 'DepartmentSelector',
      paramType: ParameterControlEnum.Dimensions,
      dimension: '[Department]',
      availableMembers: AVAILABLE_MEMBERS
    }
  }
}

export const PrimaryCompact = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder'
    },
    parameter: {
      name: 'DepartmentSelector',
      paramType: ParameterControlEnum.Dimensions,
      dimension: '[Department]'
    },
    appearance: {
      displayDensity: DisplayDensity.compact
    }
  }
}

export const PrimaryMultiple = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder'
    },
    parameter: {
      name: 'DepartmentSelector',
      paramType: ParameterControlEnum.Dimensions,
      dimension: '[Department]'
    },
    appearance: {
      displayDensity: DisplayDensity.compact
    },
    options: {
      selectionType: FilterSelectionType.Multiple
    }
  }
}

export const ParameterInput = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder'
    },
    parameter: {
      name: 'DepartmentInput',
      paramType: ParameterControlEnum.Input
    }
  }
}

export const ParameterInputNumber = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder'
    },
    parameter: {
      name: 'DepartmentInput',
      paramType: ParameterControlEnum.Input,
      dataType: 'number'
    }
  }
}

export const ParameterInputString = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder'
    },
    parameter: {
      name: 'DepartmentInput',
      paramType: ParameterControlEnum.Input,
      dataType: 'string'
    }
  }
}

export const ParameterSelect = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder'
    },
    parameter: {
      name: 'DepartmentSelect',
      paramType: ParameterControlEnum.Select,
      availableMembers: AVAILABLE_MEMBERS
    }
  }
}

export const ParameterSelectDensity = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder'
    },
    parameter: {
      name: 'DepartmentSelect',
      paramType: ParameterControlEnum.Select,
      availableMembers: AVAILABLE_MEMBERS
    },
    appearance: {
      displayDensity: DisplayDensity.compact
    }
  }
}

export const ParameterSelectMultiple = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder'
    },
    parameter: {
      name: 'DepartmentSelect',
      paramType: ParameterControlEnum.Select,
      availableMembers: AVAILABLE_MEMBERS
    },
    appearance: {
      displayDensity: DisplayDensity.compact
    },
    options: {
      selectionType: FilterSelectionType.Multiple
    }
  }
}

export const Slider = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder'
    },
    parameter: {
      name: 'SliderParam',
      paramType: ParameterControlEnum.Input,
      dataType: 'number',
      value: 6
    },
    options: {
      slider: true,
      sliderMax: 10,
      sliderStep: 2,
      sliderInvert: true
    }
  }
}

export const SliderVertical = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder'
    },
    parameter: {
      name: 'SliderParam',
      paramType: ParameterControlEnum.Input,
      dataType: 'number',
      value: 6
    },
    options: {
      slider: true,
      sliderMax: 10,
      sliderStep: 2,
      sliderVertical: true
    }
  }
}
