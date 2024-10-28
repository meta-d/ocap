import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { routeAnimations } from '../../../@core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { MaterialModule } from '../../../@shared'
import { RouterModule } from '@angular/router'
import { XpertBasicComponent } from './basic/basic.component'
import { AppService } from '../../../app.service'
import { XpertStudioApiService } from '../studio/domain'
import { toSignal } from '@angular/core/rxjs-interop'
import { map } from 'rxjs/operators'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    RouterModule,

    XpertBasicComponent
  ],
  selector: 'xpert-xpert',
  templateUrl: './xpert.component.html',
  styleUrl: 'xpert.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [XpertStudioApiService]
})
export class XpertStudioXpertComponent {

  readonly appService = inject(AppService)
  readonly apiService = inject(XpertStudioApiService)

  readonly isMobile = this.appService.isMobile

  readonly viewModel = toSignal(this.apiService.store.pipe(map((state) => state.draft)))
  readonly xpert = computed(() => this.viewModel()?.team)
  readonly avatar = computed(() => this.xpert()?.avatar)
  
}
