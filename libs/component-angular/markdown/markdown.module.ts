import { OverlayModule } from '@angular/cdk/overlay'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { MarkdownTooltipComponent, MarkdownTooltipDirective } from './markdown-tooltip.directive'
import { MarkdownPipe } from './markdown.pipe'

/**
 * @deprecated
 */
@NgModule({
  declarations: [MarkdownPipe, MarkdownTooltipDirective, MarkdownTooltipComponent],
  imports: [CommonModule, OverlayModule, MatCardModule],
  exports: [MarkdownPipe, MarkdownTooltipDirective, MarkdownTooltipComponent],
})
export class MarkdownModule {}
