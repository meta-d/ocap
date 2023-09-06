import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { CommonModule } from '@angular/common'
import { Component, ElementRef, Input, OnInit, ViewChild, forwardRef, inject, signal } from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { MatChipInputEvent } from '@angular/material/chips'
import { CanDisable, ThemePalette, mixinDisabled } from '@angular/material/core'
import { TranslateModule } from '@ngx-translate/core'
import { HighlightDirective } from '@metad/components/core'
import { Observable, map, startWith, switchMap } from 'rxjs'
import { ITag, Store, TagService } from '../../../@core'
import { MaterialModule } from '../../material.module'
import { isString } from '@metad/ocap-core'

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, TranslateModule, HighlightDirective],
  selector: 'pac-tag-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  inputs: ['disabled', 'color'],
  host: {
    '[attr.disabled]': 'disabled || null'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => TagEditorComponent)
    }
  ]
})
export class TagEditorComponent extends 
  mixinDisabled(
    class {
      constructor(public _elementRef: ElementRef) {}
    }
  )
  implements ControlValueAccessor, OnInit, CanDisable
{
  private tagService = inject(TagService)
  private store = inject(Store)

  @Input() color: ThemePalette
  // @Input() formControl: FormControl
  @Input() category: string

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>

  tagCtrl = new FormControl('')

  private onChange: (value: any) => void
  private onTouched: () => void

  addOnBlur = false
  readonly separatorKeysCodes = [ENTER, COMMA] as const
  tags = signal<ITag[]>(null)

  get highlight() {
    return this.tagCtrl.value
  }

  public tags$: Observable<ITag[]>
  ngOnInit(): void {
    this.tags$ = this.tagService.getAll(this.category).pipe(
      switchMap((tags) =>
        this.tagCtrl.valueChanges.pipe(
          startWith(null),
          map((tag: ITag | string | null) => {
            if (isString(tag)) {
              const _tag = tag?.trim().toLowerCase()
              return tag
                ? tags.filter(
                    (item) => item.name.toLowerCase().includes(_tag) || item.description?.toLowerCase().includes(_tag)
                  )
                : tags.slice()
            }
            return tags
          })
        )
      )
    )
  }
  writeValue(obj: any): void {
    this.tags.set(obj)
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.tagCtrl.disable({ emitEvent: false }) : this.tagCtrl.enable({ emitEvent: false })
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim()

    // Add our tag
    if (value) {
      this.tags.set([
        ...(this.tags() ?? []),
        {
          name: value,
          color: 'blue',
          category: this.category,
          organizationId: this.store.selectedOrganization.id
        }
      ])
      this.onChange(this.tags())
    }

    // Clear the input value
    event.chipInput!.clear()
  }

  remove(tag: ITag): void {
    const index = this.tags()?.indexOf(tag)

    if (index >= 0) {
      this.tags().splice(index, 1)
      this.onChange(this.tags())
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.tags.set([
      ...(this.tags() ?? []),
      event.option.value
    ])
    this.tagInput.nativeElement.value = ''
    this.tagCtrl.setValue(null)
    this.onChange(this.tags())
  }
}
