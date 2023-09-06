import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { ResizeObserverModule } from '@ng-web-apis/resize-observer'
import { FormlyModule } from '@ngx-formly/core'
import { TranslateModule } from '@ngx-translate/core'
import { NxComponentSettingsComponent } from './component-form/formly-form.component'
import { DesignerPanelComponent } from './panel/panel.component'
import { NxSettingsPanelComponent } from './settings-panel/settings-panel.component'

@NgModule({
  declarations: [NxSettingsPanelComponent, NxComponentSettingsComponent, DesignerPanelComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PortalModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    ResizeObserverModule,
    FormlyModule,
    TranslateModule,

    // OCAP Modules
    OcapCoreModule,
  ],
  exports: [NxSettingsPanelComponent, NxComponentSettingsComponent, DesignerPanelComponent]
})
export class NxDesignerModule {}
