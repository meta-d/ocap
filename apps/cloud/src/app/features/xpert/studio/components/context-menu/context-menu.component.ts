import { CdkMenu, CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, inject, TemplateRef, ViewChild } from '@angular/core'
import { Subscription } from 'rxjs'
import { XpertStudioApiService } from '../../domain'
import { SelectionService } from '../../domain/selection.service'
import { XpertStudioComponent } from '../../studio.component'

@Component({
  selector: 'xpert-studio-context-menu',
  exportAs: 'menuComponent',
  standalone: true,
  imports: [CommonModule, CdkMenuModule],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.scss'
})
export class XpertStudioContextMenuComponent {
  readonly apiService = inject(XpertStudioApiService)
  readonly selectionService = inject(SelectionService)
  private root = inject(XpertStudioComponent)
  readonly #cdr = inject(ChangeDetectorRef)

  @ViewChild(TemplateRef, { static: true })
  public template!: TemplateRef<CdkMenu>

  private subscriptions = new Subscription()

  /**
   * @deprecated
   */
  public column: string | null = null
  /**
   * @deprecated
   */
  public table: string | null = null

  public node: string | null = null

  public ngOnInit(): void {
    this.subscriptions.add(this.subscribeToSelectionChanges())
  }

  private subscribeToSelectionChanges(): Subscription {
    return this.selectionService.selection$.subscribe((selection) => {
      this.column = selection.column
      if (this.root.fFlowComponent().getSelection().nodes.length === 1) {
        this.table = this.root.fFlowComponent().getSelection().nodes[0]
        this.node = this.root.fFlowComponent().getSelection().nodes[0]
      } else {
        this.table = null
        this.column = null
      }

      this.#cdr.detectChanges()
    })
  }

  public createRole(menu: CdkMenu): void {
    menu.menuStack.closeAll()
    this.apiService.createRole(this.root.contextMenuPosition)
  }

  public createKnowledge(menu: CdkMenu): void {
    menu.menuStack.closeAll()
    this.apiService.createKnowledge(this.root.contextMenuPosition)
  }

  public deleteNode(menu: CdkMenu, node: string): void {
    menu.menuStack.closeAll()
    if (node) {
      this.apiService.removeNode(node)
    }
  }

  public dispose(): void {
    this.selectionService.reset()
  }
}
