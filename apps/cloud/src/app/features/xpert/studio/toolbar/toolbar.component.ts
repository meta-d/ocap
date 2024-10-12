import { Component, computed, inject } from '@angular/core'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { XpertStudioComponent } from '../studio.component'
import { MaterialModule } from 'apps/cloud/src/app/@shared'
import { XpertStudioApiService } from '../domain'
import { TStateHistory } from '../domain/types'
import { AppearanceDirective } from '@metad/ocap-angular/core'

@Component({
  selector: 'xpert-studio-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    CdkMenuModule,
    MaterialModule,
    AppearanceDirective
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class XpertStudioToolbarComponent {
  readonly xpertStudioComponent = inject(XpertStudioComponent)
  readonly apiService = inject(XpertStudioApiService)

  public zoomScales = [200, 100, 75, 50, 25]
  get fZoomScale() {
    return Number((this.xpertStudioComponent.fZoom().getScale() * 100).toFixed(0))
  }

  readonly histories = computed(() => this.apiService.stateHistories().reverse())
  get historyCursor() {
    return this.apiService.getHistoryCursor()
  }

  public onZoomIn(): void {
    this.xpertStudioComponent.fZoom().zoomIn()
  }
  public onZoomOut(): void {
    this.xpertStudioComponent.fZoom().zoomOut()
  }
  public onZoomTo(level: number) {
    if (this.fZoomScale < level) {
      while (this.fZoomScale < level) {
        this.xpertStudioComponent.fZoom().zoomIn()
      }
    } else if (this.fZoomScale > level) {
      while (this.fZoomScale > level) {
        this.xpertStudioComponent.fZoom().zoomOut()
      }
    }
  }
  public onFitToScreen(): void {
    this.xpertStudioComponent.fCanvasComponent().fitToScreen()
  }

  public onOneToOne(): void {
    this.xpertStudioComponent.fCanvasComponent().resetScaleAndCenter()
  }

  onGoToHistory(event: TStateHistory) {
    this.apiService.gotoHistoryCursor(event.cursor)
  }

  clearHistory() {
    this.apiService.clearHistory()
  }

  autoLayout() {
    this.apiService.autoLayout()
  }
}
