import { booleanAttribute, Component, effect, inject, input, signal } from '@angular/core'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { XpertStudioComponent } from '../studio.component'
import { SelectionService } from '../domain'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { MaterialModule } from '../../../../@shared/index'
import { DensityDirective } from '@metad/ocap-angular/core'
import { XpertStudioPanelRoleComponent } from './xpert-role/role.component'

@Component({
  selector: 'xpert-studio-panel',
  standalone: true,
  imports: [
    CommonModule,
    CdkMenuModule,
    MaterialModule,
    DensityDirective,

    XpertStudioPanelRoleComponent
  ],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss'
})
export class XpertStudioPanelComponent {
  readonly xpertStudioComponent = inject(XpertStudioComponent)
  readonly selectionService = inject(SelectionService)

  readonly selectedNode = toSignal(this.selectionService.singleNode$)
  readonly visiable = signal(false)
  private singleNodeSub = this.selectionService.singleNode$.pipe(takeUntilDestroyed()).subscribe((node) => {
    this.visiable.set(!!node)
  })

  constructor() {
    effect(() => {
        console.log(this.selectedNode())
    })
  }

  close() {
    this.visiable.set(false)
  }
}
