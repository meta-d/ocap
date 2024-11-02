import { JsonPipe } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { FFlowModule } from '@foblex/flow'
import { NgmSpinComponent } from '@metad/ocap-angular/common'
import { TXpertTeamNode, XpertToolsetService } from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { derivedAsync } from 'ngxtension/derived-async'
import { of } from 'rxjs'

@Component({
  selector: 'xpert-studio-node-toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JsonPipe, FFlowModule, MatIcon, EmojiAvatarComponent, NgmSpinComponent],
  host: {
    tabindex: '-1',
    '[class.selected]': 'isSelected',
    '(contextmenu)': 'emitSelectionChangeEvent($event)'
  }
})
export class XpertStudioNodeToolsetComponent {
  readonly elementRef = inject(ElementRef)
  readonly toolsetService = inject(XpertToolsetService)

  readonly node = input<TXpertTeamNode>()
  readonly toolset = computed(() => this.node().entity)

  readonly toolsetDetail = derivedAsync(() => {
    return this.toolset() ? this.toolsetService.getOneById(this.toolset().id, { relations: ['tools']}) : of(null)
  })

  private get hostElement(): HTMLElement {
    return this.elementRef.nativeElement
  }

  protected emitSelectionChangeEvent(event: MouseEvent): void {
    this.hostElement.focus()
    event.preventDefault()
  }
}
