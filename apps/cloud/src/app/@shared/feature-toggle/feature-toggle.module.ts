import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { FeatureService, FeatureStoreService } from '../../@core'
import { MaterialModule } from '../material.module'
import { FeatureToggleComponent } from './feature-toggle.component'

@NgModule({
  imports: [CommonModule, TranslateModule, MaterialModule],
  declarations: [FeatureToggleComponent],
  exports: [FeatureToggleComponent],
  providers: [FeatureService, FeatureStoreService]
})
export class FeatureToggleModule {}
