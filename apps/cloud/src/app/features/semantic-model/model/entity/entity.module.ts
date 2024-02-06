import { NgModule } from '@angular/core'
import { AnalyticalGridModule } from '@metad/ocap-angular/analytical-grid'
import { NgmCommonModule, ResizerModule, SplitterModule } from '@metad/ocap-angular/common'
import { ControlsModule } from '@metad/ocap-angular/controls'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { NgmEntityPropertyComponent } from '@metad/ocap-angular/entity'
import { FormulaModule } from '@metad/ocap-angular/formula'
import { SlicersModule } from '@metad/ocap-angular/slicers'
import { ContentLoaderModule } from '@ngneat/content-loader'
import { NxActionStripModule } from '@metad/components/action-strip'
import { NxEditorModule } from '@metad/components/editor'
import { NxEntityModule } from '@metad/components/entity'
import { CalculatedMeasureComponent, PropertyModule } from '@metad/components/property'
import { IsNilPipe } from '@metad/core'
import { NxDesignerModule } from '@metad/story/designer'
import { MaterialModule, SharedModule } from '../../../../@shared'
import { ModelEntityCalculationComponent } from './calculation/calculation.component'
import { ModelCubeStructureComponent } from './cube-structure/cube-structure.component'
import { PropertyDimensionComponent } from './dimension/dimension.component'
import { ModelEntityRoutingModule } from './entity-routing.module'
import { ModelEntityComponent } from './entity.component'
import { EntityQueryComponent } from './query/query.component'
import { ModelEntityStructureComponent } from './structure/structure.component'

@NgModule({
  exports: [ModelEntityComponent],
  declarations: [
    ModelEntityComponent,
    ModelCubeStructureComponent,
    ModelEntityStructureComponent,
    PropertyDimensionComponent,
    ModelEntityCalculationComponent,
    EntityQueryComponent
  ],
  providers: [],
  imports: [
    SharedModule,
    MaterialModule,
    ContentLoaderModule,
    ModelEntityRoutingModule,
    NxDesignerModule,
    SplitterModule,
    NxActionStripModule,
    NxEntityModule,
    NxEditorModule,
    PropertyModule,
    SlicersModule,
    CalculatedMeasureComponent,
    AnalyticalGridModule,
    OcapCoreModule,
    NgmCommonModule,
    ControlsModule,
    ResizerModule,
    NgmEntityPropertyComponent,
    FormulaModule,
    IsNilPipe
  ]
})
export class ModelEntityModule {}
