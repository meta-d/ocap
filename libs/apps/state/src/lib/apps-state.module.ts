import { CommonModule } from '@angular/common'
import { ModuleWithProviders, NgModule } from '@angular/core'

@NgModule({
	imports: [CommonModule]
})
export class PACStateModule {
	static forRoot(): ModuleWithProviders<PACStateModule> {
		return {
			ngModule: PACStateModule,
			providers: [

			]
		}
	}
}
