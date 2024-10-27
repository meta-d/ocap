import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NgxFloatUiModule, NgxFloatUiPlacements, NgxFloatUiTriggers } from 'ngx-float-ui'
import { derivedAsync } from 'ngxtension/derived-async'
import { TagService } from '../../../@core'

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, NgxFloatUiModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tag-select',
  templateUrl: './tag-select.component.html',
  styleUrls: ['./tag-select.component.scss']
})
export class TagSelectComponent {
  eNgxFloatUiTriggers = NgxFloatUiTriggers
  eNgxFloatUiPlacements = NgxFloatUiPlacements

  readonly tagService = inject(TagService)

  readonly category = input<string>()

  readonly tags = derivedAsync(() => {
    return this.tagService.getAllByCategory(this.category())
  })
}
