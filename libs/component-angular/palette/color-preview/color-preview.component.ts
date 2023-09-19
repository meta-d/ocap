import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core'
import { listEnterAnimation } from '@metad/core'
import { NgmChromaticInterpolate, previewChromaticInterpolate } from '../types'

@Component({
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-chromatic-preview',
  templateUrl: 'color-preview.component.html',
  animations: [listEnterAnimation],
  styleUrls: ['./color-preview.component.scss']
})
export class NxChromaticPreviewComponent implements OnInit {
  private readonly _cdr = inject(ChangeDetectorRef)

  @Input() interpolate: NgmChromaticInterpolate

  colors = []

  async ngOnInit() {
    this.colors = await previewChromaticInterpolate(this.interpolate)
    this.interpolate.colors = this.colors
    this._cdr.detectChanges()
  }
}
