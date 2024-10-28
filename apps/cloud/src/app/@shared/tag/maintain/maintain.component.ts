import { CommonModule } from '@angular/common'
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NgxFloatUiModule, NgxFloatUiPlacements, NgxFloatUiTriggers } from 'ngx-float-ui'
import { derivedAsync } from 'ngxtension/derived-async'
import { toSignal } from '@angular/core/rxjs-interop'
import { CdkListboxModule, ListboxValueChangeEvent } from '@angular/cdk/listbox'
import { getErrorMessage, ITag, TagService, ToastrService } from '../../../@core'
import { MatDialog } from '@angular/material/dialog'
import { TagCreatorComponent } from '../creator/creator.component'
import { TagComponent } from '../tag/tag.component'


@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, CdkListboxModule, NgxFloatUiModule, TagComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tag-maintain',
  templateUrl: './maintain.component.html',
  styleUrls: ['./maintain.component.scss']
})
export class TagMaintainComponent {
  eNgxFloatUiTriggers = NgxFloatUiTriggers
  eNgxFloatUiPlacements = NgxFloatUiPlacements

  readonly tagService = inject(TagService)
  readonly #dialog = inject(MatDialog)
  readonly #toastr = inject(ToastrService)

  readonly tenant = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })

  readonly allCategories = toSignal(this.tagService.getAllCategories())

  readonly categories = model<string[]>([])
  readonly category = computed(() => this.categories()[0])

  readonly tags = derivedAsync(() => {
    return this.tagService.getAllByCategory(this.category())
  })

  setCategories(event: ListboxValueChangeEvent<string>) {
    this.categories.set([...event.value])
  }

  createTag() {
    const dialogRef = this.#dialog.open(TagCreatorComponent, {
      data: { category: this.category() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tagService.refresh()
      }
    })
  }

  deleteTag(tag: ITag) {
    this.tagService.delete(tag.id).subscribe({
      next: () => {
        this.tagService.refresh()
      },
      error: (err) => {
        this.#toastr.error(getErrorMessage(err))
      }
    })
  }
}
