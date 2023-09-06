import { CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop'
import { Component, inject } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSlideToggleChange } from '@angular/material/slide-toggle'
import { ActivatedRoute } from '@angular/router'
import { MDX } from '@metad/contracts'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { AggregationRole, C_MEASURES, Syntax } from '@metad/ocap-core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { nonBlank } from '@metad/core'
import { ModelFormulaComponent } from 'apps/cloud/src/app/@shared/model'
import { firstValueFrom } from 'rxjs'
import { distinctUntilChanged, filter, map, startWith, switchMap, tap } from 'rxjs/operators'
import { SemanticModelService } from '../model.service'
import { SemanticModelEntityType } from '../types'
import { VirtualCubeStateService } from './virtual-cube.service'
import { EntityCapacity } from '@metad/ocap-angular/entity'

@UntilDestroy({ checkProperties: true })
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

  public readonly cubeKey$ = this.route.paramMap.pipe(
    startWith(this.route.snapshot.paramMap),
    map((paramMap) => paramMap.get('id')),
    filter(nonBlank),
    distinctUntilChanged()
  )

  public readonly virtualCube$ = this.virtualCubeState.state$

  public readonly cubes$ = this.virtualCubeState.cubes$
  public readonly dimensions$ = this.virtualCubeState.dimensions$
  public readonly measures$ = this.virtualCubeState.measures$
  public readonly calculatedMembers$ = this.virtualCubeState.calculatedMembers$

  get dataSourceName() {
    return this.modelState.dataSource?.options.name
  }
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

  public readonly dataSettings$ = this.virtualCube$.pipe(
    map((virtualCube) => ({
      dataSource: this.dataSourceName,
      entitySet: virtualCube?.name
    }))
  )

  public readonly entityType$ = this.dataSettings$.pipe(
    tap((dataSettings) => console.log(dataSettings)),
    switchMap(({ dataSource, entitySet }) => this.dsCoreService.selectEntitySet(dataSource, entitySet)),
    tap((entitySet) => console.log(entitySet)),
    map((entitySet) => entitySet?.entityType),
  )

  private cubeKeySub = this.cubeKey$.subscribe((key) => {
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

  async openFormula() {
    const dataSettings = await firstValueFrom(this.dataSettings$)
    const entityType = await firstValueFrom(this.entityType$)
    const _formula = await firstValueFrom(
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
    )

    if (_formula) {
      this.formula.setValue(_formula)
    }
  }

  onApplyFormula() {
    this.formula.setValue(this._formula)
  }
}
