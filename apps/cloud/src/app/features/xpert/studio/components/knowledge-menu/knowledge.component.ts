import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { FFlowModule } from '@foblex/flow'
import { XpertStudioApiService } from '../../domain'
import { toSignal } from '@angular/core/rxjs-interop'
import { CdkMenu, CdkMenuModule } from '@angular/cdk/menu'
import { XpertStudioComponent } from '../../studio.component'
import { IKnowledgebase } from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  selector: 'xpert-studio-knowledge-menu',
  templateUrl: './knowledge.component.html',
  styleUrls: ['./knowledge.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FFlowModule, TranslateModule, CdkMenuModule, EmojiAvatarComponent],
  host: {
    tabindex: '-1',
    '[class.selected]': 'isSelected',
    '(contextmenu)': 'emitSelectionChangeEvent($event)'
  }
})
export class XpertStudioKnowledgeMenuComponent {
  readonly elementRef = inject(ElementRef)
  readonly cdkMenu = inject(CdkMenu)
  private root = inject(XpertStudioComponent)
  readonly apiService = inject(XpertStudioApiService)

  readonly knowledges = toSignal(this.apiService.knowledgebases$)

  private get hostElement(): HTMLElement {
    return this.elementRef.nativeElement
  }

  protected emitSelectionChangeEvent(event: MouseEvent): void {
    this.hostElement.focus()
    event.preventDefault()
    // this.selectionService.setColumn(this.tableId, this.column.id);
  }

  public createKnowledge(knowledge: IKnowledgebase): void {
    this.cdkMenu.menuStack.closeAll()
    this.apiService.createKnowledge(this.root.contextMenuPosition, knowledge)
  }
}
