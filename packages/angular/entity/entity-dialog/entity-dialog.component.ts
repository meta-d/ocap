import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { Component, inject, model, signal } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatRadioModule } from '@angular/material/radio'
import { NgmDisplayBehaviourComponent, NgmSearchComponent } from '@metad/ocap-angular/common'
import { ButtonGroupDirective, ISelectOption } from '@metad/ocap-angular/core'
import { DSCoreService, nonNullable } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { combineLatestWith, distinctUntilChanged, filter, map, startWith, switchMap, tap } from 'rxjs'

export type EntitySelectResultType = {
  dataSource: string
  entities: string[]
}
export type EntitySelectDataType = {
  dataSources: ISelectOption<string>[]
  dsCoreService: DSCoreService
  registerModel?: (key: string) => Promise<void>
}

@Component({
  standalone: true,
  selector: 'ngm-entity-dialog',
  templateUrl: './entity-dialog.component.html',
  styleUrls: ['./entity-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatRadioModule,
    MatListModule,
    MatProgressSpinnerModule,
    DragDropModule,
    TranslateModule,

    NgmSearchComponent,
    ButtonGroupDirective,
    NgmDisplayBehaviourComponent
  ]
})
export class NgmEntityDialogComponent {
  public readonly data = inject<EntitySelectDataType>(MAT_DIALOG_DATA)

  readonly dialogRef = inject<MatDialogRef<NgmEntityDialogComponent, EntitySelectResultType>>(MatDialogRef)
  readonly #logger = inject(NGXLogger)

  readonly modelKey = model<string>(null)

  search = new FormControl('')
  readonly loading = signal(false)

  public readonly entities$ = toObservable(this.modelKey).pipe(
    distinctUntilChanged(),
    filter(nonNullable),
    tap((modelKey) => {
      this.loading.set(true)
      this.data.registerModel?.(modelKey)
      this.entities.set([])
    }),
    switchMap((dataSource) => this.data.dsCoreService.getDataSource(dataSource)),
    switchMap((dataSource) => dataSource.selectEntitySets()),
    map((entitySets) =>
      entitySets.map((item) => ({
        key: item.name,
        caption: item.caption
      }))
    ),
    tap((entities) => {
      this.loading.set(false)
      if (!this.entities().length && entities.length) {
        this.entities.set([entities[0].key])
      }
      if (this.data.dataSources.length === 1 && entities.length === 1) {
        this.onApply()
      }
    }),
    combineLatestWith(this.search.valueChanges.pipe(startWith(''))),
    map(([entities, text]) =>
      text ? entities.filter((item) => item.caption.toLowerCase().includes(text.toLowerCase())) : entities
    )
  )

  // Selected entity keys
  readonly entities = model<string[]>([])

  constructor() {
    if (this.data.dataSources.length === 1) {
      this.modelKey.set(this.data.dataSources[0].key)
    }
  }

  onApply() {
    this.dialogRef.close({
      dataSource: this.modelKey(),
      entities: this.entities()
    })
  }
}
