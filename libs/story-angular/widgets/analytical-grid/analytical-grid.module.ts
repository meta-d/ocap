import { CommonModule } from '@angular/common'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { AnalyticalGridModule } from '@metad/ocap-angular/analytical-grid'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NxSelectionModule } from '@metad/components/selection'
import { PlaceholderAddComponent } from '@metad/story/story'

import { WidgetAnalyticalGridComponent } from './analytical-grid.component'

@NgModule({
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    NxSelectionModule,

    OcapCoreModule,
    AnalyticalGridModule,
    PlaceholderAddComponent
  ],
  exports: [WidgetAnalyticalGridComponent],
  declarations: [WidgetAnalyticalGridComponent],
  providers: []
})
export class WidgetAnalyticalGridModule {
  static forRoot(): ModuleWithProviders<WidgetAnalyticalGridModule> {
    return {
      ngModule: WidgetAnalyticalGridModule,
      providers: [
      ]
    }
  }
}
