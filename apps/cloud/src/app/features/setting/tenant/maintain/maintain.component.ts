import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { TagService } from 'apps/cloud/src/app/@core'
import { TagMaintainComponent } from 'apps/cloud/src/app/@shared'
import { NgxFloatUiModule, NgxFloatUiPlacements, NgxFloatUiTriggers } from 'ngx-float-ui'
import { derivedAsync } from 'ngxtension/derived-async'

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, TagMaintainComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tenant-tag-maintain',
  templateUrl: './maintain.component.html',
  styleUrls: ['./maintain.component.scss']
})
export class TenantTagMaintainComponent {
  eNgxFloatUiTriggers = NgxFloatUiTriggers
  eNgxFloatUiPlacements = NgxFloatUiPlacements

  readonly tagService = inject(TagService)

  readonly category = input<string>()

  readonly tags = derivedAsync(() => {
    return this.tagService.getAllByCategory(this.category())
  })
}
