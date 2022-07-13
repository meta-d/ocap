import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  DisplayDensity,
  NgmMissingTranslationHandler,
  OcapCoreModule,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN,
  OCAP_MODEL_TOKEN
} from '@metad/ocap-angular/core'
import { CUBE_SALES_ORDER } from '@metad/ocap-angular/mock/agent-mock.service'
import { AgentType, DataSource, FilterSelectionType, MockAgent, ParameterControlEnum, Type } from '@metad/ocap-core'
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { ParameterModule } from '../paramter.module'
import { ParameterComponent } from './parameter.component'

export default {
  title: 'ParameterComponent',
  component: ParameterComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        ParameterModule,
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
              cubes: [CUBE_SALES_ORDER]
            }
          },
          multi: true
        }
      ]
    })
  ]
} as Meta<ParameterComponent>

const Template: Story<ParameterComponent> = (args: ParameterComponent) => ({
  props: args
})

export const AVAILABLE_MEMBERS = [
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

export const Primary = Template.bind({})
Primary.args = {
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder'
  },
  parameter: {
    name: 'DepartmentSelector',
    paramType: ParameterControlEnum.Dimensions,
    dimension: '[Department]'
  }
}

export const PrimaryCompact = Template.bind({})
PrimaryCompact.args = {
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

export const PrimaryMultiple = Template.bind({})
PrimaryMultiple.args = {
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

export const ParameterInput = Template.bind({})
ParameterInput.args = {
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder'
  },
  parameter: {
    name: 'DepartmentInput',
    paramType: ParameterControlEnum.Input
  }
}

export const ParameterSelect = Template.bind({})
ParameterSelect.args = {
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

export const ParameterSelectDensity = Template.bind({})
ParameterSelectDensity.args = {
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

export const ParameterSelectMultiple = Template.bind({})
ParameterSelectMultiple.args = {
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
