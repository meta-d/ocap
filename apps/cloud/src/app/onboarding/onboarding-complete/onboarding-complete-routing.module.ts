import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OnboardingCompleteComponent } from './onboarding-complete.component';

const routes: Routes = [
	{
		path: '',
		component: OnboardingCompleteComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class OnboardingCompleteRoutingModule {}
