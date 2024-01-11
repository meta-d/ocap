import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
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
import { BehaviorSubject, combineLatestWith, distinctUntilChanged, filter, map, startWith, switchMap, tap } from 'rxjs'

export type EntitySelectResult = {
  dataSource: string
  entities: string[]
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
  public readonly data = inject<{
    dataSources: ISelectOption<string>[]
    dsCoreService: DSCoreService
  }>(MAT_DIALOG_DATA)
  public readonly dialogRef = inject<MatDialogRef<NgmEntityDialogComponent, EntitySelectResult>>(MatDialogRef)

  private dataSource$ = new BehaviorSubject<string>(null)
  get dataSource() {
    return this.dataSource$.value
  }
  set dataSource(value) {
    this.dataSource$.next(value)
  }

  search = new FormControl('')
  readonly loading = signal(false)

  public readonly entities$ = this.dataSource$.pipe(
    distinctUntilChanged(),
    filter(nonNullable),
    tap(() => this.loading.set(true)),
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
      if (!this.entities.length && entities.length) {
        this.entities = [entities[0].key]
      }
    }),
    combineLatestWith(this.search.valueChanges.pipe(startWith(''))),
    map(([entities, text]) =>
      text ? entities.filter((item) => item.caption.toLowerCase().includes(text.toLowerCase())) : entities
    )
  )

  // Selected entity keys
  entities = []

  constructor() {
    if (this.data.dataSources.length === 1) {
      this.dataSource = this.data.dataSources[0].key
    }
  }

  onApply() {
    this.dialogRef.close({
      dataSource: this.dataSource,
      entities: this.entities
    })
  }
}
