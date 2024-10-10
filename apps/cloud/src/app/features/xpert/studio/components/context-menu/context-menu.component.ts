import { CdkMenu, CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, inject, TemplateRef, ViewChild } from '@angular/core'
import { Subscription } from 'rxjs'
import { XpertStudioApiService } from '../../domain'
import { XpertStudioComponent } from '../../studio.component'
import { SelectionService } from '../../domain/selection.service'

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
  public column: string | null = null;
  public table: string | null = null;

  public ngOnInit(): void {
    this.subscriptions.add(this.subscribeToSelectionChanges());
  }

  private subscribeToSelectionChanges(): Subscription {
    return this.selectionService.selection$.subscribe((selection) => {
      this.column = selection.column;
      if (this.root.fFlowComponent().getSelection().nodes.length === 1) {
        this.table = this.root.fFlowComponent().getSelection().nodes[ 0 ];
      } else {
        this.table = null;
        this.column = null;
      }
      this.#cdr.detectChanges();
    });
  }

  public createRole(menu: CdkMenu): void {
    menu.menuStack.closeAll()
    this.apiService.createRole(this.root.contextMenuPosition);
  }

  public deleteRole(menu: CdkMenu, role: string): void {
    menu.menuStack.closeAll()
    if (role) {
      this.apiService.removeRole(role);
    }
  }

  public dispose(): void {
    this.selectionService.reset();
  }
}
