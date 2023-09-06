import { NgModule } from '@angular/core'
import { FeatureToggleModule } from '../../@shared/feature-toggle/feature-toggle.module'
import { OnboardingCompleteRoutingModule } from './onboarding-complete-routing.module'
import { OnboardingCompleteComponent } from './onboarding-complete.component'

@NgModule({
  imports: [OnboardingCompleteRoutingModule, FeatureToggleModule],
  providers: [],
  declarations: [OnboardingCompleteComponent]
})
export class OnboardingCompleteModule {}
