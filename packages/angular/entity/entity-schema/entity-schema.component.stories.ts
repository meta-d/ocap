import { DragDropModule } from '@angular/cdk/drag-drop'
import { Component, Input } from '@angular/core'
import { MatSidenavModule } from '@angular/material/sidenav'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  NgmMissingTranslationHandler,
  OcapCoreModule,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN,
  OCAP_MODEL_TOKEN
} from '@metad/ocap-angular/core'
import { CUBE_SALES_ORDER, MockAgent } from '../../mock/agent-mock.service'
import { AgentType, DataSettings, DataSource, Type } from '@metad/ocap-core'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { Observable, of } from 'rxjs'
import { ZhHans } from '@metad/ocap-angular/i18n'
import { NgmEntitySchemaComponent } from './entity-schema.component'

class CustomLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of(ZhHans)
  }
}

@Component({
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
    moduleMetadata({
      declarations: [DragComponent],
      imports: [
        BrowserAnimationsModule,
        MatSidenavModule,
        DragDropModule,
        NgmEntitySchemaComponent,
        OcapCoreModule.forRoot(),
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: CustomLoader },
          missingTranslationHandler: {
            provide: MissingTranslationHandler,
            useClass: NgmMissingTranslationHandler
          },
          defaultLanguage: 'zh-Hans'
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
} as Meta<NgmEntitySchemaComponent>

const Template: Story<NgmEntitySchemaComponent> = (args: NgmEntitySchemaComponent) => ({
  props: args
})

export const Primary = Template.bind({})
Primary.args = {
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder'
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

const DragTemplate: Story<DragComponent> = (args: DragComponent) => ({
  props: args,
  template: `<ngm-story-component-drag [dataSettings]="dataSettings"></ngm-story-component-drag>`,
})

export const DragPrimary = DragTemplate.bind({})
DragPrimary.args = {
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder'
  }
}
