import { CommonModule } from '@angular/common'
import { booleanAttribute, Component, input, output } from '@angular/core'
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { injectHelpWebsite, IToolProvider, IXpertToolset } from '../../../@core'
import { EmojiAvatarComponent } from '../../avatar'

@Component({
  standalone: true,
  imports: [CommonModule, EmojiAvatarComponent, NgmI18nPipe],
  selector: 'xpert-toolset-card',
  templateUrl: 'toolset.component.html',
  styleUrls: ['toolset.component.scss']
})
export class ToolsetCardComponent {
  readonly helpWebsite = injectHelpWebsite()

  readonly inline = input<boolean, boolean | string>(false, {
    transform: booleanAttribute
  })

  readonly toolset = input<IXpertToolset>()

  readonly title = input<string>(null)
  readonly description = input<string>(null)
  readonly helpUrl = input<string>(null)
  readonly helpTitle = input<string>(null)

  readonly create = output()

  onCreate() {
    this.create.emit()
  }
}
