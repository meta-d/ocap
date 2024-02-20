import { CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop'
import { Component, computed, inject } from '@angular/core'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSlideToggleChange } from '@angular/material/slide-toggle'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { MDX } from '@metad/contracts'
import { nonBlank } from '@metad/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { EntityCapacity } from '@metad/ocap-angular/entity'
import { AggregationRole, C_MEASURES, Syntax } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { ModelFormulaComponent } from 'apps/cloud/src/app/@shared/model'
import { NgmNotificationComponent } from 'apps/cloud/src/app/@theme'
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators'
import { SemanticModelService } from '../model.service'
import { SemanticModelEntityType } from '../types'
import { VirtualCubeStateService } from './virtual-cube.service'

@Component({
  selector: 'pac-model-virtual-cube',
  templateUrl: 'virtual-cube.component.html',
  styleUrls: ['virtual-cube.component.scss'],
  providers: [VirtualCubeStateService]
})
export class VirtualCubeComponent {
  Syntax = Syntax
  EntityCapacity = EntityCapacity

  private _dialog = inject(MatDialog)
  private dsCoreService = inject(NgmDSCoreService)
  private modelState = inject(SemanticModelService)
  private virtualCubeState = inject(VirtualCubeStateService)
  private route = inject(ActivatedRoute)
  readonly #snackBar = inject(MatSnackBar)
  readonly #translate = inject(TranslateService)

  public readonly cubeKey$ = this.route.paramMap.pipe(
    startWith(this.route.snapshot.paramMap),
    map((paramMap) => paramMap.get('id')),
    filter(nonBlank),
    distinctUntilChanged()
  )

  public readonly cubes$ = this.virtualCubeState.cubes$
  public readonly measures$ = this.virtualCubeState.measures$
  public readonly calculatedMembers$ = this.virtualCubeState.calculatedMembers$

  selectedCube: string
  virtualCube: MDX.VirtualCube
  calcMemberFormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    caption: new FormControl(),
    dimension: new FormControl(C_MEASURES, [Validators.required]),
    formula: new FormControl('', [Validators.required])
  })
  calculatedMember = false
  get name() {
    return this.calcMemberFormGroup.get('name').value
  }
  get formula() {
    return this.calcMemberFormGroup.get('formula') as FormControl
  }
  public _formula = ''

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly dataSource$ = toSignal(this.modelState.dataSource$.pipe(map((dataSource) => dataSource?.options.key)))
  readonly virtualCube$ = toSignal(this.virtualCubeState.state$)
  readonly dimensions$ = toSignal(this.virtualCubeState.dimensions$)
  readonly virtualCubeName$ = computed(() => this.virtualCube$().name)
  readonly dataSettings$ = computed(() => ({
    dataSource: this.dataSource$(),
    entitySet: this.virtualCubeName$()
  }))
  readonly entityType$ = toSignal(
    toObservable(this.dataSettings$).pipe(
      switchMap(({ dataSource, entitySet }) => this.dsCoreService.selectEntitySet(dataSource, entitySet)),
      map((entitySet) => entitySet?.entityType)
    ),
    { initialValue: null }
  )

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private cubeKeySub = this.cubeKey$.pipe(takeUntilDestroyed()).subscribe((key) => {
    this.virtualCubeState.init(key)
  })

  trackByName(index: number, item: MDX.CubeUsage) {
    return item.cubeName
  }

  editVirtualCube(cube) {
    this.virtualCube = { ...cube }
  }

  applyVirtualCube() {
    this.virtualCubeState.patchState({
      ...this.virtualCube
    })
    this.virtualCube = null
  }

  cancelVirtualCube() {
    this.virtualCube = null
  }

  cubePredicate(item: CdkDrag<any>) {
    return item.data?.type === SemanticModelEntityType.CUBE
  }

  dropCube(event: CdkDragDrop<{ name: string }[]>) {
    if (event.container === event.previousContainer) {
      this.virtualCubeState.moveItemInCubes(event)
    } else if (event.previousContainer.id === 'pac-model-entities') {
      if (event.item.data.type === SemanticModelEntityType.CUBE) {
        this.virtualCubeState.addCube({ index: event.currentIndex, cubeName: event.item.data.name })
      }
    }
  }

  cubeRemovePredicate(item: CdkDrag<any>) {
    return item.data?.type === 'Entity'
  }

  selectCube(cube) {}

  changeIgnoreUnrelatedDimensions(event: MatSlideToggleChange, cube: MDX.CubeUsage) {
    this.virtualCubeState.updateCube({
      cubeName: cube.cubeName,
      ignoreUnrelatedDimensions: event.checked
    })
  }

  removeCube(name: string) {
    this.virtualCubeState.removeCube(name)
  }

  dropDimensionPredicate(item: CdkDrag<any>) {
    return item.data?.role === AggregationRole.dimension
  }

  dropDimension(event: CdkDragDrop<MDX.VirtualCubeDimension[]>) {
    if (event.container === event.previousContainer) {
      this.virtualCubeState.moveItemInDimensions(event)
    } else if (event.item.data.role === AggregationRole.dimension) {
      this.virtualCubeState.addDimension({ index: event.currentIndex, dimension: event.item.data })
    }
  }

  changeDimensionShared(event: MatSlideToggleChange, name: string) {
    this.virtualCubeState.updateDimension({
      name,
      __shared__: event.checked
    })
  }

  removeDimension(name: string) {
    this.virtualCubeState.removeDimension(name)
  }

  dropMeasurePredicate(item: CdkDrag<any>) {
    return item.data?.role === AggregationRole.measure
  }

  dropMeasure(event: CdkDragDrop<{ name: string }[]>) {
    if (event.container === event.previousContainer) {
      this.virtualCubeState.moveItemInMeasures(event)
    } else if (event.item.data.role === AggregationRole.measure) {
      this.virtualCubeState.addMeasure({ index: event.currentIndex, measure: event.item.data })
    }
  }

  removeMeasure(name: string) {
    this.virtualCubeState.removeMeasure(name)
  }

  createCalculatedMember() {
    this.calculatedMember = true
    this.calcMemberFormGroup.reset({ dimension: C_MEASURES })
  }

  editCalculatedMember(member: MDX.CalculatedMember) {
    this.calculatedMember = true
    this.calcMemberFormGroup.setValue(member as any)
  }

  applyCalculatedMember() {
    this.virtualCubeState.applyCalculatedMember(this.calcMemberFormGroup.value as MDX.CalculatedMember)
    this.calculatedMember = null
  }

  removeCalculatedMember(name: string) {
    this.virtualCubeState.removeCalculatedMember(name)
  }

  cancelCalculatedMember() {
    this.calculatedMember = null
  }

  openFormula() {
    const dataSettings = this.dataSettings$()
    const entityType = this.entityType$()

    if (entityType?.name !== this.virtualCube$().name) {
      return this.openNeedSaveMessage()
    }

    this._dialog
      .open(ModelFormulaComponent, {
        panelClass: 'large',
        data: {
          dataSettings,
          entityType,
          formula: this.formula.value
        }
      })
      .afterClosed()
      .subscribe((_formula) => {
        if (_formula) {
          this.formula.setValue(_formula)
        }
      })
  }

  onApplyFormula() {
    this.formula.setValue(this._formula)
  }

  openNeedSaveMessage() {
    this.#snackBar.openFromComponent(NgmNotificationComponent, {
      data: {
        color: 'primary',
        message: this.#translate.instant('PAC.MODEL.VirtualCube.PleaseSave', { Default: 'Please Save' }),
        description: this.#translate.instant('PAC.MODEL.VirtualCube.PleaseSaveTheCorrectVirtualCube', {
          Default: 'Please save the correct virtual cube configuration before editing the formula.'
        })
      },
      duration: 5 * 1000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    })
  }
}
