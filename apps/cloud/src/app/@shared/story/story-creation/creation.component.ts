import { CommonModule } from '@angular/common'
import { Component, Inject, OnInit, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NgmTreeSelectComponent } from '@metad/ocap-angular/common'
import { ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { DisplayBehaviour, SemanticModel, TreeNodeInterface } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { BusinessAreasService, ModelsService, StoriesService } from '@metad/cloud/state'
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators'
import { ICollection, ISemanticModel } from '../../../@core'
import { InlineSearchComponent } from '../../form-fields'
import { MaterialModule } from '../../material.module'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,

    ButtonGroupDirective,
    NgmTreeSelectComponent,
    DensityDirective,
    InlineSearchComponent
  ],
  selector: 'pac-story-creation',
  templateUrl: './creation.component.html',
  styles: [
    `
      :host {
        display: flex;
        flex-direction: row;
        flex: 1;
        overflow: hidden;
      }
    `
  ]
})
export class StoryCreationComponent {
  DisplayBehaviour = DisplayBehaviour

  private readonly storiesService = inject(StoriesService)

  form = new FormGroup({
    models: new FormControl(null, [Validators.required]),
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    collectionId: new FormControl(null)
  })
  get modelsControl() {
    return this.form.get('models') as FormControl
  }
  collections: TreeNodeInterface<ICollection>[]
  private _models: ISemanticModel[]
  models: ISemanticModel[]

  searchControl = new FormControl(null)

  public readonly businessArea$ = this.businessAreaService.getMyAreasTree(true).pipe(startWith([]))

  private searchSub = this.searchControl.valueChanges
    .pipe(startWith(''), distinctUntilChanged(), debounceTime(300))
    .subscribe((search) => {
      this.models = this._models.filter((model) => model.name.toLowerCase().includes(search.toLowerCase()))
    })

  constructor(
    private businessAreaService: BusinessAreasService,
    private modelsService: ModelsService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      story: {
        id?: string;
        collectionId: string
        name?: string
        description?: string
        models: ISemanticModel[]
      }
      models: ISemanticModel[]
      collections: TreeNodeInterface<ICollection>[]
    },
    public dialogRef: MatDialogRef<StoryCreationComponent>
  ) {
    this._models = this.data.models
    this.collections = this.data.collections

    if (!this._models) {
      this.modelsService
        .getMy()
        .pipe(takeUntilDestroyed())
        .subscribe((models) => {
          this._models = models
          this.searchControl.setValue('')
        })
    }
    if (this.data.story?.id) {
      this.storiesService.getOne(this.data.story.id, ['models']).pipe(takeUntilDestroyed()).subscribe((story) => {
        this.form.patchValue({...story})
      })
    } else if (this.data.story) {
      this.form.patchValue({...this.data.story})
    }
  }

  compareWithModel(a: SemanticModel, b: SemanticModel) {
    return a?.id === b?.id
  }

  onApply() {
    this.dialogRef.close({
      ...this.form.value,
      models: this.form.value.models.map((model) => ({id: model.id}))
    })
  }
}
