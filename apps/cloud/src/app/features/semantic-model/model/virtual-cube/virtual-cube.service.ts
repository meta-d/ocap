import { Injectable } from '@angular/core'
import { MDX } from '@metad/contracts'
import { ComponentSubStore } from '@metad/store'
import { Property, PropertyMeasure } from '@metad/ocap-core'
import { ToastrService } from 'apps/cloud/src/app/@core'
import { SemanticModelService } from '../model.service'
import { PACModelState } from '../types'
import { remove } from 'lodash-es'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'

@Injectable()
export class VirtualCubeStateService extends ComponentSubStore<MDX.VirtualCube, PACModelState> {
  public readonly virtualCube$ = this.state$
  public readonly cubes$ = this.select((state) => state.cubeUsages)
  public readonly dimensions$ = this.select((state) => state.virtualCubeDimensions)
  public readonly measures$ = this.select((state) => state.virtualCubeMeasures)
  public readonly calculatedMembers$ = this.select((state) => state.calculatedMembers)

  constructor(public modelService: SemanticModelService, private _toastrService: ToastrService) {
    super({} as MDX.VirtualCube)
  }

  init(key: string) {
    this.connect(this.modelService, { parent: ['model', 'schema', 'virtualCubes', key], arrayKey: '__id__' })
  }

  readonly addCube = this.updater((state, {index, cubeName}: {index: number, cubeName: string}) => {
    state.cubeUsages = state.cubeUsages ?? []
    if (state.cubeUsages.find((item) => item.cubeName === cubeName)) {
      this._toastrService.warning('PAC.MODEL.VirtualCube.CubeAlreadyExists', {Default: 'Cube already exists!'})
    } else {
      state.cubeUsages.splice(index, 0, {
        cubeName,
        ignoreUnrelatedDimensions: null
      })
    }
  })

  readonly updateCube = this.updater((state, entity: Partial<MDX.CubeUsage>) => {
    const index = state.cubeUsages.findIndex((item) => item.cubeName === entity.cubeName)
    if (index > -1) {
      state.cubeUsages[index] = {
        ...state.cubeUsages[index],
        ...entity
      }
    }
  })

  readonly removeCube = this.updater((state, name: string) => {
    remove(state.cubeUsages, (item) => item.cubeName === name)
  })

  readonly moveItemInCubes = this.updater((state, event: CdkDragDrop<any[]>) => {
    moveItemInArray(state.cubeUsages, event.previousIndex, event.currentIndex)
  })

  readonly addDimension = this.updater((state, {index, dimension}: {index: number, dimension: Property}) => {
    state.virtualCubeDimensions = state.virtualCubeDimensions ?? []
    const dimensionName = (dimension as any).dimensionName
    if (state.virtualCubeDimensions.find((item) => item.name === dimensionName)) {
      this._toastrService.warning('PAC.MODEL.VirtualCube.DimensionAlreadyExists', {Default: 'Dimension already exists!'})
    } else {
      state.virtualCubeDimensions.splice(index, 0, {
        name: dimensionName,
        label: dimension.caption,
        caption: dimension.caption,
        cubeName: dimension.entity
      })
    }
  })

  readonly updateDimension = this.updater((state, entity: Partial<MDX.VirtualCubeDimension>) => {
    const index = state.virtualCubeDimensions.findIndex((item) => item.name === entity.name)
    if (index > -1) {
      state.virtualCubeDimensions[index] = {
        ...state.virtualCubeDimensions[index],
        ...entity
      }
    }
  })

  readonly removeDimension = this.updater((state, name: string) => {
    remove(state.virtualCubeDimensions, (item) => item.name === name)
  })

  readonly moveItemInDimensions = this.updater((state, event: CdkDragDrop<any[]>) => {
    moveItemInArray(state.virtualCubeDimensions, event.previousIndex, event.currentIndex)
  })

  readonly addMeasure = this.updater((state, {index, measure}: {index: number, measure: PropertyMeasure}) => {
    state.virtualCubeMeasures = state.virtualCubeMeasures ?? []
    if (state.virtualCubeMeasures.find((item) => item.name === measure.uniqueName)) {
      this._toastrService.warning('PAC.MODEL.VirtualCube.MeasureAlreadyExists', {Default: 'Measure already exists!'})
    } else {
      state.virtualCubeMeasures.splice(index, 0, {
        name: measure.uniqueName,
        label: measure.caption,
        caption: measure.caption,
        cubeName: measure.entity,
        visible: true
      })
    }
  })

  readonly removeMeasure = this.updater((state, name: string) => {
    remove(state.virtualCubeMeasures, (item) => item.name === name)
  })

  readonly moveItemInMeasures = this.updater((state, event: CdkDragDrop<any[]>) => {
    moveItemInArray(state.virtualCubeMeasures, event.previousIndex, event.currentIndex)
  })

  readonly applyCalculatedMember = this.updater((state, member: MDX.CalculatedMember) => {
    state.calculatedMembers = state.calculatedMembers ?? []
    let index = state.calculatedMembers.findIndex((item) => item.name === member.name)
    if (index === -1) {
      index = state.calculatedMembers.length
    }
    state.calculatedMembers[index] = {
      ...member
    }
  })

  readonly removeCalculatedMember = this.updater((state, name: string) => {
    remove(state.calculatedMembers, (item) => item.name === name)
  })
}
