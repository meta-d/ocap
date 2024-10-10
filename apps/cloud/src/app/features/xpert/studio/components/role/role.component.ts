import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { FFlowModule } from '@foblex/flow'
import { IXpertRole } from '@metad/contracts'
import { XpertStudioRoleToolsetComponent } from './toolset/toolset.component'
import { AvatarComponent } from 'apps/cloud/src/app/@shared'

@Component({
  selector: 'xpert-studio-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FFlowModule, MatIcon, AvatarComponent, XpertStudioRoleToolsetComponent],
  host: {
    tabindex: '-1',
    '[class.selected]': 'isSelected',
    '(contextmenu)': 'emitSelectionChangeEvent($event)'
  }
})
export class XpertStudioRoleComponent {
  readonly elementRef = inject(ElementRef)

  readonly xpertRole = input<IXpertRole>()

  readonly toolsets = computed(() => this.xpertRole()?.toolsets)

  private get hostElement(): HTMLElement {
    return this.elementRef.nativeElement
  }

  protected emitSelectionChangeEvent(event: MouseEvent): void {
    this.hostElement.focus()
    event.preventDefault()
    // this.selectionService.setColumn(this.tableId, this.column.id);
  }
}
