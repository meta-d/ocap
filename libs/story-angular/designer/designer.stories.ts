import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { AfterViewInit, Component, NgModule, OnInit } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormlyModule } from '@ngx-formly/core'
import { FormlyMaterialModule } from '@ngx-formly/material'
import { uuid } from '@metad/ds-core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { NxComponentSettingsComponent } from './component-form/component-form.component'
import { NxDesignerModule } from './designer.module'
import { NxSettingsPanelComponent } from './settings-panel/settings-panel.component'
import { NxSettingsPanelService } from './settings-panel/settings-panel.service'
import { DesignerSchema, STORY_DESIGNER_COMPONENT } from './types'

class SchemaService implements DesignerSchema {
  model: any

  getSchema(): Observable<any> {
    return of([
      {
        key: 'settings',
        type: 'input',
        templateOptions: {
          label: 'Settings',
        },
      },
    ])
  }
}

@Component({
  selector: 'ngm-designer-wrapper',
  template: `<ngm-settings-panel fxFlex="100"></ngm-settings-panel>
<div>
<button mat-raised-button (click)="openBasic()">Basic</button>
<button mat-raised-button (click)="openTabs()">Tabs</button>
<button mat-raised-button (click)="changeModel()">Change Model</button>
</div>
  `,
  styles: [`
:host {
  height: 400px;
  width: 300px;
  flex-direction: column;
}
`],
  providers: [ NxSettingsPanelService ]
})
class NxDesignerWrapperComponent implements OnInit, AfterViewInit {

  model = new BehaviorSubject({settings: 'ABC'})
  constructor(private settingsPanelService: NxSettingsPanelService) {}

  ngAfterViewInit(): void {
    this.settingsPanelService.setEditable(true)
  }

  ngOnInit(): void {
    //
  }

  openBasic() {
    this.settingsPanelService.openDesigner('StoryPoint', {}, uuid())
    .subscribe(result => {
      console.log(result)
    })
  }

  openTabs() {

    this.settingsPanelService.openTabsDesigner(uuid(), [
      {
        label: 'Builder',
        componentType: 'StoryPoint',
        model: {
        },
      },
      {
        label: 'Styling',
        componentType: 'StoryPoint',
        model: this.model
      }
    ])
      .subscribe((result) => {
        console.log(result)
      })
  }

  changeModel() {
    this.model.value.settings = '123'
    this.model.next(this.model.value)
  }
}

@NgModule({
  declarations: [NxDesignerWrapperComponent],
  imports: [CommonModule, NxDesignerModule, MatButtonModule],
  exports: [NxDesignerWrapperComponent],
})
class NxDesignerWrapperModule {
  //
}

export default {
  title: 'Story/Designer',
  component: NxSettingsPanelComponent,
  argTypes: {},
  decorators: [
    moduleMetadata({
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        LoggerModule.forRoot({
          level: NgxLoggerLevel.DEBUG
        }),
        NxDesignerWrapperModule,
        FormlyModule.forRoot(),
        FormlyMaterialModule,
      ],
      providers: [
        {
          provide: STORY_DESIGNER_COMPONENT,
          useValue: {
            type: 'StoryPoint',
            component: NxComponentSettingsComponent,
            schema: SchemaService,
          },
          multi: true,
        },
      ],
    }),
  ],
} as Meta

const Template: Story<NxSettingsPanelComponent> = (args) => ({
  template: `<ngm-designer-wrapper></ngm-designer-wrapper>`,
  props: {
    ...args,
  },
})

export const Primary = Template.bind({})
Primary.args = {}
