import { Component, inject } from '@angular/core'
import { XpertStudioComponent } from '../studio.component'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'xpert-studio-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    CdkMenuModule
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class XpertStudioToolbarComponent {
  readonly xpertStudioComponent = inject(XpertStudioComponent)

  public zoomScales = [200, 100, 75, 50, 25]
  get fZoomScale() {
    return Number((this.xpertStudioComponent.fZoom().getScale() * 100).toFixed(0))
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
}
