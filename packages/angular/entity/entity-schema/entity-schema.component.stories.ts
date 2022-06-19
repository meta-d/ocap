import { MatSidenavModule } from '@angular/material/sidenav'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  NgmMissingTranslationHandler,
  OcapCoreModule,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN,
  OCAP_MODEL_TOKEN
} from '@metad/ocap-angular/core'
import { AgentType, DataSource, MockAgent, Type } from '@metad/ocap-core'
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { EntityModule } from '../entity.module'
import { EntitySchemaComponent } from './entity-schema.component'

export default {
  title: 'EntitySchemaComponent',
  component: EntitySchemaComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        MatSidenavModule,
        EntityModule,
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
} as Meta<EntitySchemaComponent>

const Template: Story<EntitySchemaComponent> = (args: EntitySchemaComponent) => ({
  props: args
})

export const Primary = Template.bind({})
Primary.args = {
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder'
  }
}
