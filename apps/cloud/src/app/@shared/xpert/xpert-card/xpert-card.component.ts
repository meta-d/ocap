import { CommonModule } from '@angular/common'
import { booleanAttribute, Component, computed, input, output } from '@angular/core'
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { injectHelpWebsite, IXpert, XpertTypeEnum } from '../../../@core'
import { EmojiAvatarComponent } from '../../avatar'
import { UserPipe } from '../../pipes'
import { TagComponent } from '../../tag'
import { TranslateModule } from '@ngx-translate/core'
import { CdkMenuModule } from '@angular/cdk/menu'

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, CdkMenuModule, EmojiAvatarComponent, NgmI18nPipe, TagComponent, UserPipe],
  selector: 'xpert-card',
  templateUrl: 'xpert-card.component.html',
  styleUrls: ['xpert-card.component.scss'],
})
export class XpertCardComponent {
  eXpertTypeEnum = XpertTypeEnum

  readonly helpWebsite = injectHelpWebsite()

  // Inputs
  readonly xpert = input<IXpert>()
  readonly inline = input<boolean, boolean | string>(false, {
    transform: booleanAttribute
  })

  // Outputs
  readonly delete = output<string>()

  readonly tags = computed(() => this.xpert()?.tags)
  readonly tagsTitle = computed(() =>
    this.tags()
      ?.map((t) => t.name)
      .join(',')
  )
}
