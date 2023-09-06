import { NgModule } from '@angular/core'
import { NgmEntitySchemaComponent } from './entity-schema/entity-schema.component'
import { NgmHierarchySelectComponent } from './hierarchy-select/hierarchy-select.component'
import { NgmMeasureSelectComponent } from './measure-select/measure-select.component'
import { NgmEntityPropertyComponent } from './property/property.component'

@NgModule({
  imports: [
    NgmMeasureSelectComponent,
    NgmHierarchySelectComponent,
    NgmEntityPropertyComponent,
    NgmEntitySchemaComponent
  ],
  exports: [
    NgmMeasureSelectComponent,
    NgmHierarchySelectComponent,
    NgmEntityPropertyComponent,
    NgmEntitySchemaComponent
  ],
  declarations: [],
  providers: []
})
export class NgmEntityModule {}
