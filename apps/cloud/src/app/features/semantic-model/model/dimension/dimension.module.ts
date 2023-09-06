import { NgModule } from '@angular/core'
import { ModelDimensionComponent } from './dimension.component'
import { ModelHierarchyComponent } from './hierarchy/hierarchy.component'
import { ModelDimensionRoutingModule } from './dimension-routing.module'

@NgModule({
  imports: [ModelHierarchyComponent, ModelDimensionComponent, ModelDimensionRoutingModule],
  exports: [],
  declarations: [],
  providers: []
})
export class ModelDimensionModule {}
