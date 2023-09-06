import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { NgmCommonModule, ResizerModule } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { NgmEntitySchemaComponent } from '@metad/ocap-angular/entity'
import { MaterialModule, SharedModule } from 'apps/cloud/src/app/@shared'
import { VirtualCubeRoutingModule } from './virtual-cube-routing.module'

import { CalculatedMeasureComponent } from '@metad/components/property'
import { NgmDialogComponent } from '@metad/components/dialog'
import { VirtualCubeComponent } from './virtual-cube.component'

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    VirtualCubeRoutingModule,

    OcapCoreModule,
    NgmEntitySchemaComponent,
    ResizerModule,
    NgmCommonModule,

    NgmDialogComponent,
    CalculatedMeasureComponent
  ],
  exports: [],
  declarations: [VirtualCubeComponent],
  providers: []
})
export class VirtualCubeModule {}
