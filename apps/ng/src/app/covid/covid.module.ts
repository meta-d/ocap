import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { AnalyticalGridModule } from '@metad/ocap-angular/analytical-grid'
import { ControlsModule } from '@metad/ocap-angular/controls'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { CovidRoutingModule } from './covid-routing.module'
import { CovidComponent } from './covid.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    
    AnalyticalCardModule,
    AnalyticalGridModule,
    OcapCoreModule,
    ControlsModule,
    CovidRoutingModule
  ],
  exports: [],
  declarations: [CovidComponent],
  providers: []
})
export class CovidModule {}
