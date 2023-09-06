import { Component, ElementRef, Input, OnInit, Renderer2, ViewEncapsulation } from '@angular/core'
import { NxWatermarkOptions } from './types'
import { WatermarkHandler } from './watermark.handler'


@Component({
  encapsulation: ViewEncapsulation.ShadowDom,
  selector: 'nx-trial-watermark',
  templateUrl: './trial-watermark.component.html',
  styleUrls: ['./trial-watermark.component.scss']
})
export class TrialWatermarkComponent implements OnInit {
  @Input() options: NxWatermarkOptions

  private watermarkHandler: WatermarkHandler = new WatermarkHandler(this._el, this._renderer)
  constructor(private _el: ElementRef, private _renderer: Renderer2) {}

  ngOnInit(): void {}
  ngOnChanges() {
    this.watermarkHandler.generateWatermark(this.options)
  }
}
