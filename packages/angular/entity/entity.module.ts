import { NgModule } from '@angular/core'
import { NgmCalculatedMeasureComponent } from './calculated-measure/calculated-measure.component'
import { NgmCalculationEditorComponent } from './calculation-editor/calculation-editor.component'
import { NgmCalculationVarianceComponent } from './calculation-variance/variance.component'
import { NgmConditionalAggregationComponent } from './conditional-aggregation/conditional-aggregation.component'
import { NgmEntitySchemaComponent } from './entity-schema/entity-schema.component'
import { NgmFormattingComponent } from './formatting/formatting.component'
import { NgmMeasureControlComponent } from './measure-control/measure-control.component'
import { NgmMeasureSelectComponent } from './measure-select/measure-select.component'
import { NgmPropertyArrayComponent } from './property-array/property-array.component'
import { NgmPropertySelectComponent } from './property-select/property-select.component'
import { NgmEntityPropertyComponent } from './property/property.component'
import { NgmRestrictedMeasureComponent } from './restricted-measure/restricted-measure.component'
import { NgmFormulaEditorComponent } from './formula/editor.component'

@NgModule({
  imports: [
    NgmMeasureSelectComponent,
    NgmEntityPropertyComponent,
    NgmEntitySchemaComponent,
    NgmCalculatedMeasureComponent,
    NgmRestrictedMeasureComponent,
    NgmConditionalAggregationComponent,
    NgmCalculationVarianceComponent,
    NgmMeasureControlComponent,
    NgmPropertyArrayComponent,
    NgmCalculationEditorComponent,
    NgmFormattingComponent,
    NgmPropertySelectComponent,
    NgmFormulaEditorComponent
  ],
  exports: [
    NgmMeasureSelectComponent,
    NgmEntityPropertyComponent,
    NgmEntitySchemaComponent,
    NgmCalculatedMeasureComponent,
    NgmRestrictedMeasureComponent,
    NgmConditionalAggregationComponent,
    NgmCalculationVarianceComponent,
    NgmMeasureControlComponent,
    NgmPropertyArrayComponent,
    NgmCalculationEditorComponent,
    NgmFormattingComponent,
    NgmPropertySelectComponent,
    NgmFormulaEditorComponent
  ],
  declarations: [],
  providers: []
})
export class NgmEntityModule {}
