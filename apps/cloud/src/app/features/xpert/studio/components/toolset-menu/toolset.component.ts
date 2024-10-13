import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { FFlowModule } from '@foblex/flow'
import { AvatarComponent } from 'apps/cloud/src/app/@shared'
import { XpertStudioApiService } from '../../domain'
import { toSignal } from '@angular/core/rxjs-interop'
import { CdkMenu, CdkMenuModule } from '@angular/cdk/menu'
import { XpertStudioComponent } from '../../studio.component'
import { IKnowledgebase, IXpertToolset } from 'apps/cloud/src/app/@core'

@Component({
  selector: 'xpert-studio-toolset-menu',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FFlowModule, MatIcon, CdkMenuModule, AvatarComponent],
  host: {
    tabindex: '-1',
    '[class.selected]': 'isSelected',
    '(contextmenu)': 'emitSelectionChangeEvent($event)'
  }
})
export class XpertStudioToolsetMenuComponent {
  readonly elementRef = inject(ElementRef)
  readonly cdkMenu = inject(CdkMenu)
  private root = inject(XpertStudioComponent)
  readonly apiService = inject(XpertStudioApiService)

  readonly toolsets = toSignal(this.apiService.toolsets$)

  private get hostElement(): HTMLElement {
    return this.elementRef.nativeElement
  }

  constructor() {
    console.log(`Create knowledge-menu...`)
  }

  protected emitSelectionChangeEvent(event: MouseEvent): void {
    this.hostElement.focus()
    event.preventDefault()
    // this.selectionService.setColumn(this.tableId, this.column.id);
  }

  public createToolset(toolset: IXpertToolset): void {
    this.cdkMenu.menuStack.closeAll()
    this.apiService.createToolset(this.root.contextMenuPosition, toolset)
  }
}
