import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ngm-prism-highlight',
  template: `<pre class="m-0"><code [innerHTML]="highlightedCode" class="m-0"></code></pre>`,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  host: {
    class: 'ngm-prism-highlight',
  }
})
export class NgmPrismHighlightComponent implements OnInit {
  @Input() code: string
  @Input() language: string

  highlightedCode: string

  async ngOnInit() {
    const Prism = await import('prismjs')
    switch (this.language) {
      case 'sql':
        await import('prismjs/components/prism-sql')
        break
      case 'json':
        await import('prismjs/components/prism-json')
        break
    }
    // await import('prismjs/plugins/toolbar/prism-toolbar')
    // await import('prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard')
    // await import('clipboard')
    this.highlightedCode = Prism.highlight(this.code, Prism.languages[this.language], this.language)
  }

  copy() {

  }
}
