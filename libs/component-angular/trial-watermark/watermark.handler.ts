import { ElementRef, Renderer2 } from '@angular/core'
import { merge } from 'lodash-es'
import { NxWatermarkOptions } from './types'

export class WatermarkHandler {
  private _el: ElementRef
  private _renderer: Renderer2

  readonly DEFAULT_FONT_FAMILY = 'Arial'
  readonly DEFAULT_OPTIONS: NxWatermarkOptions = {
    text: 'Metad Analytics Cloud',
    width: 300,
    height: 100,
    fontFamily: this.DEFAULT_FONT_FAMILY,
    fontSize: '18px',
    fontWeight: 'normal',
    color: '#999999',
    alpha: 0.5,
    degree: -45,
    lineHeight: 24,
    textAlign: 'center',
    textBaseline: 'middle',
    backgroundRepeat: 'repeat',
    backgroundPosition: '0% 0%'
  }

  readonly WEB_SAFE_FONT: string[] = [
    'Georgia',
    'Palatino Linotype',
    'Book Antiqua',
    'Palatino',
    'Times New Roman',
    'Times',
    'serif', // Serif Fonts
    'Arial',
    'Helvetica',
    'Arial Black',
    'Gadget',
    'Comic Sans MS',
    'cursive',
    'Impact',
    'Charcoal',
    'Lucida Sans Unicode',
    'Lucida Grande',
    'Tahoma',
    'Geneva',
    'Trebuchet MS',
    'Verdana',
    'sans-serif', // Sans-Serif Fonts
    'Courier New',
    'Courier',
    'Lucida Console',
    'Monaco',
    'monospace' // Monospace Fonts
  ]

  constructor(_el: ElementRef, _renderer: Renderer2) {
    this._el = _el
    this._renderer = _renderer
  }

  generateWatermark(_ops: NxWatermarkOptions) {
    let options: NxWatermarkOptions = merge({}, this.DEFAULT_OPTIONS, _ops)
    if (this.isWebSafeFont(options.fontFamily)) {
      this.processStyleFromOptions(options)
    } else {
      // let font = new FontFaceObserver(options.fontFamily);
      // font.load().then(() => {
      //     this.processStyleFromOptions(options);
      // }).catch(() => {
      //     options = Object.assign({}, options, { fontFamily: this.DEFAULT_FONT_FAMILY });
      //     this.processStyleFromOptions(options);
      // });
    }
  }

  private processStyleFromOptions(_ops: NxWatermarkOptions) {
    this.setHTMLElementStyle(['background-image', `url(${this.createDataUrl(_ops)})`])
    this.setHTMLElementStyle(['background-repeat', _ops.backgroundRepeat])
    this.setHTMLElementStyle(['background-position', _ops.backgroundPosition])
  }

  private isWebSafeFont(_font: string): boolean {
    return this.WEB_SAFE_FONT.indexOf(_font) != -1
  }

  private createDataUrl(options: NxWatermarkOptions): string {
    const width = options.width
    const height = options.height

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 0

    ctx.fillRect(-0.5 * width, -0.5 * height, width, height)

    ctx.font = `${options.fontWeight} ${options.fontSize} ${options.fontFamily}`
    ctx.fillStyle = options.color
    ctx.globalAlpha = options.alpha
    ctx.textAlign = options.textAlign
    ctx.textBaseline = options.textBaseline

    ctx.translate(0 + 0.5 * width, 0 + 0.5 * height)
    ctx.rotate((options.degree * Math.PI) / 180)
    this.generateMultiLineText(ctx, options.text, width, options.lineHeight, 0, 0)

    return canvas.toDataURL()
  }

  private generateMultiLineText(
    _ctx: CanvasRenderingContext2D,
    _text: string,
    _width: number,
    _lineHeight: number,
    x: number,
    y: number
  ) {
    let words = _text.split('\n')
    let line = ''

    for (var n = 0; n < words.length; n++) {
      line = words[n]
      _ctx.fillText(line, x, y)
      y += _lineHeight
    }
  }

  private setHTMLElementStyle([name, value]: [string, string | number]) {
    this._renderer.setStyle(this._el.nativeElement, name, value)
  }
}
