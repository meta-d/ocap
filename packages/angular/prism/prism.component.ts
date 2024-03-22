import { ClipboardModule } from '@angular/cdk/clipboard'
import { CommonModule } from '@angular/common'
import { Component, effect, input, numberAttribute, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

@Component({
  standalone: true,
  imports: [CommonModule, ClipboardModule, MatIconModule, MatButtonModule],
  selector: 'ngm-prism-highlight',
  template: `<pre class="m-0"><code [innerHTML]="highlightedCode()" class="m-0"></code></pre>
<button mat-icon-button (click)="copy()" [cdkCopyToClipboard]="code()">
  <mat-icon>content_copy</mat-icon>
</button>
`,
  styles: [
    `
      :host {
        display: block;
        position: relative;
      }
      .mdc-icon-button.mat-mdc-icon-button {
        position: absolute;
        top: 0;
        right: 0;
      }
    `
  ],
  host: {
    class: 'ngm-prism-highlight'
  }
})
export class NgmPrismHighlightComponent {
  readonly code = input.required<string>()
  readonly language = input.required<'sql' | 'json' | string>()
  readonly maximum = input<number, string | number>(0, {
    transform: numberAttribute
  })

  readonly highlightedCode = signal('')

  #effRef = effect(
    async () => {
      const Prism = await import('prismjs')
      switch (this.language()) {
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
      this.highlightedCode.set(
        Prism.highlight(
          this.maximum() ? this.code().slice(0, this.maximum()) : this.code(),
          Prism.languages[this.language()],
          this.language()
        )
      )
    },
    { allowSignalWrites: true }
  )

  copy() {
    
  }
}
