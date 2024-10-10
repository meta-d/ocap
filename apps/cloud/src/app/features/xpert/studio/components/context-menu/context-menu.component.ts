import { CdkMenu, CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { Component, inject, TemplateRef, ViewChild } from '@angular/core'
import { Subscription } from 'rxjs'
import { XpertStudioApiService } from '../../domain'
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
  private root = inject(XpertStudioComponent)

  private subscriptions = new Subscription()

  @ViewChild(TemplateRef, { static: true })
  public template!: TemplateRef<CdkMenu>

  public ngOnInit(): void {
    // this.subscriptions.add(this.subscribeToSelectionChanges());
  }

  public createRole(menu: CdkMenu): void {
    menu.menuStack.closeAll()
    this.apiService.createRole(this.root.contextMenuPosition);
  }

  public dispose(): void {
    // this.selectionService.reset();
  }
}
