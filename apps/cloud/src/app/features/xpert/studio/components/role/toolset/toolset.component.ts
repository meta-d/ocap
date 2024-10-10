import { ChangeDetectionStrategy, Component, ElementRef, inject, input } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { FFlowModule } from '@foblex/flow'
import { IXpertToolset } from '@metad/contracts'

@Component({
  selector: 'xpert-studio-role-toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FFlowModule, MatIcon],
  host: {
    tabindex: '-1',
    '[class.selected]': 'isSelected',
    '(contextmenu)': 'emitSelectionChangeEvent($event)'
  }
})
export class XpertStudioRoleToolsetComponent {
  readonly elementRef = inject(ElementRef)

  readonly toolset = input<IXpertToolset>()

  private get hostElement(): HTMLElement {
    return this.elementRef.nativeElement
  }

  protected emitSelectionChangeEvent(event: MouseEvent): void {
    this.hostElement.focus()
    event.preventDefault()
    // this.selectionService.setColumn(this.tableId, this.column.id);
  }
}
