import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AppearanceDirective, DensityDirective } from '@metad/ocap-angular/core'
import { assign, cloneDeep } from '@metad/ocap-core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { PreferencesSchema } from '@metad/story'
import { NxStoryService } from '@metad/story/core'
import { debounceTime, firstValueFrom } from 'rxjs'
import { InlineSearchComponent, MaterialModule } from '../../../../@shared'
import { DesignerWidgetComponent } from '../widget/widget.component'

@UntilDestroy({ checkProperties: true })
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    FormlyModule,
    InlineSearchComponent,

    AppearanceDirective,
    DensityDirective,

    DesignerWidgetComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-story-designer',
  templateUrl: './story-designer.component.html',
  styleUrls: ['./story-designer.component.scss'],
  host: {
    class: 'pac-story-designer'
  }
})
export class StoryDesignerComponent {
  private readonly translateService = inject(TranslateService)
  public readonly storyService = inject(NxStoryService)

  formGroup = new FormGroup({})

  fields: FormlyFieldConfig[]
  options: FormlyFormOptions
  model = {}

  private formGroupSub = this.formGroup.valueChanges.pipe(debounceTime(300)).subscribe((value) => {
    this.storyService.updateStoryPreferences(value)
  })

  private preferencesSub = this.translateService.get('Story').subscribe((CSS) => {
    this.fields = PreferencesSchema(CSS)
  })

  async ngOnInit() {
    const preferences = this.storyService.preferences() ?? {}
    this.formGroup.patchValue(preferences)
    this.model = assign(this.model, cloneDeep(preferences))
  }

  onModelChange(event) {
    // console.log(event)
  }
}
