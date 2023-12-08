import { DragDropModule } from '@angular/cdk/drag-drop'
import { Component, Input, importProvidersFrom } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatSidenavModule } from '@angular/material/sidenav'
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations'
import {
  NgmMissingTranslationHandler,
  OcapCoreModule,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN,
  OCAP_MODEL_TOKEN,
  NgmDSCoreService
} from '@metad/ocap-angular/core'
import { CUBE_SALES_ORDER, MockAgent } from '../../mock/agent-mock.service'
import { AgentType, DataSettings, DataSource, Type } from '@metad/ocap-core'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { applicationConfig, Meta, moduleMetadata, Story } from '@storybook/angular'
import { Observable, of } from 'rxjs'
import { ZhHans } from '@metad/ocap-angular/i18n'
import { NgmEntitySchemaComponent } from './entity-schema.component'

class CustomLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of(ZhHans)
  }
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    DragDropModule,
    NgmEntitySchemaComponent,
  ],
  selector: 'ngm-story-component-drag',
  template: `<mat-drawer-container class="example-container" autosize cdkDropListGroup>
  <mat-drawer mode="side" opened cdkDropList >
    <ngm-entity-schema [dataSettings]="dataSettings"></ngm-entity-schema>
    <ngm-entity-schema [dataSettings]="{
      dataSource: dataSettings.dataSource,
      entitySet: 'sales_fact'
    }"></ngm-entity-schema>
  </mat-drawer>
  <mat-drawer-content cdkDropList [cdkDropListData]="drops" (cdkDropListDropped)="drop($event)">
    <ul>
      <li *ngFor="let item of drops">
        {{item.entity}}/{{item.name || item.raw.memberKey}}/{{item.type}}/{{item.dataType}}/{{item.dbType}}
      </li>
    </ul>
  </mat-drawer-content>
</mat-drawer-container>`,
  styles: [`.mat-drawer-container {height: 500px;}`]
})
class DragComponent {
  @Input() dataSettings: DataSettings

  drops = []
  
  drop (event) {
    this.drops.push(event.item.data)
  }
}

export default {
  title: 'NgmEntitySchemaComponent',
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        importProvidersFrom(
          TranslateModule.forRoot({
            missingTranslationHandler: {
              provide: MissingTranslationHandler,
              useClass: NgmMissingTranslationHandler
            },
            loader: { provide: TranslateLoader, useClass: CustomLoader },
            defaultLanguage: 'zh-Hans'
          })
        ),
        importProvidersFrom(OcapCoreModule),
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
    }),
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        MatSidenavModule,
        DragDropModule,
        NgmEntitySchemaComponent,
        DragComponent
      ],
      providers: [
        NgmDSCoreService
      ]
    })
  ]
} as Meta<NgmEntitySchemaComponent>

const Template: Story<NgmEntitySchemaComponent> = (args: NgmEntitySchemaComponent) => ({
  props: args
})

export const Primary = {
  args: {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder'
    }
  }
}

export const SelectedHierarchy = Template.bind({})
SelectedHierarchy.args = {
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder'
  },
  selectedHierarchy: '[Product]'
}

// const DragTemplate = (args: DragComponent) => ({
//   props: args,
//   template: `<ngm-story-component-drag [dataSettings]="dataSettings"></ngm-story-component-drag>`,
// })

// export const DragPrimary = DragTemplate.bind({})
// DragPrimary.args = {
//   dataSettings: {
//     dataSource: 'Sales',
//     entitySet: 'SalesOrder'
//   }
// }
