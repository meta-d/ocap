// import { CommonModule } from '@angular/common'
// import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostBinding, inject, Output } from '@angular/core'
// import { FormsModule, ReactiveFormsModule } from '@angular/forms'
// import { RouterModule } from '@angular/router'
// import { DensityDirective } from '@metad/ocap-angular/core'
// import { UntilDestroy } from '@ngneat/until-destroy'
// import { TranslateModule } from '@ngx-translate/core'
// import { delay } from 'rxjs'
// import { CopilotAPIService } from '../../../@core'
// import { MaterialModule } from '../../material.module'

// @UntilDestroy({ checkProperties: true })
// @Component({
//   standalone: true,
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   selector: 'pac-copilot-enable',
//   templateUrl: 'enable.component.html',
//   styleUrls: ['enable.component.scss'],
//   imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MaterialModule, TranslateModule, DensityDirective],
//   host: {
//     class: 'pac-copilot-enable'
//   }
// })
// export class CopilotEnableComponent {
//   private copilotService = inject(CopilotAPIService)
//   private _cdr = inject(ChangeDetectorRef)
  
//   @Output() navigated = new EventEmitter()

//   enabled = false
//   hasKey = false

//   private copilotSub = this.copilotService.copilot$.pipe(delay(100)).subscribe((copilot) => {
//     this.enabled = copilot?.enabled
//     this.hasKey = !!copilot?.apiKey
//     this._cdr.detectChanges()
//   })

//   navigate() {
//     this.navigated.emit()
//   }
// }
