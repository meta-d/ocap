import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { TranslateModule } from '@ngx-translate/core'
import { NxObjectNumberComponent } from '@metad/components/object-number'
import { NxWidgetKpiComponent as NxWidgetComponent } from './kpi.component'
import { KPIPlaceholderComponent } from './placeholder/placeholder.component'

@NgModule({
  declarations: [NxWidgetComponent],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatIconModule,
    MatProgressSpinnerModule,

    NxObjectNumberComponent,
    KPIPlaceholderComponent
  ],
  exports: [NxWidgetComponent]
})
export class NxWidgetModule {
  // static forRoot(): ModuleWithProviders<NxWidgetModule> {
  //   return {
  //     ngModule: NxWidgetModule,
  //     providers: [
  //       {
  //         provide: STORY_WIDGET_COMPONENT,
  //         useValue: {
  //           type: WidgetComponentType.KpiCard,
  //           component: NxWidgetKpiComponent,
  //           mapping: ['title', 'dataSettings', 'options', 'styling'],
  //           label: 'KPI',
  //           disableFab: true
  //         },
  //         multi: true
  //       },
  //       {
  //         provide: STORY_DESIGNER_COMPONENT,
  //         useValue: {
  //           type: WidgetComponentType.KpiCard,
  //           component: NxComponentSettingsComponent,
  //           schema: KpiSchemaService
  //         },
  //         multi: true
  //       }
  //     ]
  //   }
  // }
}
