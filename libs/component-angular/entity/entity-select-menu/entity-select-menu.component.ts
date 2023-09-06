import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { includeIgnoreCase } from '@metad/core'
import { DisplayBehaviour, EntitySet } from '@metad/ocap-core'
import { BehaviorSubject, interval } from 'rxjs'
import { debounce, map, startWith, switchMap } from 'rxjs/operators'

@Component({
  selector: 'nx-entity-select-menu',
  templateUrl: './entity-select-menu.component.html',
  styleUrls: ['./entity-select-menu.component.scss'],
})
export class EntitySelectMenuComponent implements OnInit {
  @Input() get entitySets(): Array<EntitySet> {
    return this._entitySets$.value
  }
  set entitySets(value) {
    this._entitySets$.next(value)
  }
  private _entitySets$ = new BehaviorSubject<Array<EntitySet>>([])

  @Input() get searchable() {
    return this._searchable
  }
  set searchable(value) {
    this._searchable = coerceBooleanProperty(value)
  }
  private _searchable

  @Input() displayBehaviour: DisplayBehaviour

  @Input() loading: boolean

  @Output() selectionChange = new EventEmitter()

  searchControl = new UntypedFormControl()
  get highlight() {
    return this.searchControl.value
  }

  selectOptions$ = this._entitySets$.pipe(
    map((entitySets) =>
      entitySets?.map((item) => ({ value: item.entityType.name, label: item.entityType.caption }))
    ),
    switchMap((options) =>
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounce(() => interval(500)),
        map((text: string) => {
          if (text?.trim()) {
            return options?.filter((option) =>
              includeIgnoreCase(`${option.label || ''}${option.value}`, text.trim())
            )
          }
          return options
        })
      )
    )
  )

  constructor() {}

  ngOnInit(): void {}

  clickEntity(event) {
    this.selectionChange.emit(event.value)
  }
}
