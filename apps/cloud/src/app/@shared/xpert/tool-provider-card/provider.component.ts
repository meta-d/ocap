import { CommonModule } from '@angular/common'
import { booleanAttribute, Component, computed, input, output } from '@angular/core'
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { upperFirst } from 'lodash-es'
import { injectHelpWebsite, IToolProvider, ToolTagEnum } from '../../../@core'
import { EmojiAvatarComponent } from '../../avatar'

@Component({
  standalone: true,
  imports: [CommonModule, EmojiAvatarComponent, NgmI18nPipe],
  selector: 'xpert-tool-provider-card',
  templateUrl: 'provider.component.html',
  styleUrls: ['provider.component.scss']
})
export class ToolProviderCardComponent {
  readonly helpWebsite = injectHelpWebsite()

  readonly provider = input<IToolProvider>()

  readonly tags = computed(() => {
    return this.provider()?.tags?.map((tag) => upperFirst(tag))
  })

  readonly title = input<string>(null)
  readonly description = input<string>(null)
  readonly helpUrl = input<string>(null)
  readonly helpTitle = input<string>(null)

  readonly create = output()

  onCreate() {
    this.create.emit()
  }
}
