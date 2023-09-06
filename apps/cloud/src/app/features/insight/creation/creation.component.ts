import { Component, HostBinding, OnInit } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'
import { IMember } from '@metad/ocap-core'
import { ComponentStore } from '@metad/store'
import { ModelsService } from '@metad/cloud/state'
import { nonNullable } from '@metad/core'
import { convertStoryModel2DataSource, StoryModel } from '@metad/story/core'

interface InsightCreationState {
  dataSourceName: string
  entitySet: string
}

@Component({
  selector: 'pac-insight-creation',
  templateUrl: 'creation.component.html',
  styleUrls: ['creation.component.scss']
})
export class InsightCreationComponent extends ComponentStore<InsightCreationState> implements OnInit {

  @HostBinding('class.nx-dialog-container') isDialogContainer = true

  // public readonly dataSource$ = this.select((state) => state.dataSourceName).pipe(
  //   filter((value) => !!value),
  //   switchMap((name) => this.dsCoreService.getDataSource(name)),
  //   shareReplay()
  // )

  // public readonly models$ = this.modelStore.all$
  // public readonly entitySets$ = this.dataSource$.pipe(
  //   switchMap((dataSource) => dataSource.getEntitySets()),
  //   map((entitySets) => entitySets.map((item) => ({value: item.name, label: item.entityType?.label} as IMember)))
  // )
  // public readonly dimensions$ = this.select((state) => state.entitySet).pipe(
  //   filter((value) => !!value),
  //   withLatestFrom(this.dataSource$),
  //   switchMap(([entitySet, dataSource]) => dataSource.getEntityType(entitySet)),
  //   map((entityType) => getEntityDimensions(entityType)),
  // )

  model: StoryModel
  entitySet: IMember
  dimensions
  step = 0

  columns = [
    {
      value: 'name',
      label: '名称'
    },
    {
      value: 'type',
      label: '类型'
    },
    {
      value: 'connection.type.type',
      label: '源类型'
    },
    {
      value: 'catalog',
      label: '目录'
    },
    {
      value: 'cube',
      label: '默认实体'
    },
    {
      value: 'createdUser',
      label: '创建用户'
    },
    {
      value: 'createdTime',
      label: '创建时间'
    },
    {
      value: 'lastChangedUser',
      label: '最后修改用户'
    },
    {
      value: 'lastChangedTime',
      label: '最后修改时间'
    }
  ]

  entityCols = [
    {
      value: 'label',
      label: '名称'
    },
    {
      value: 'value',
      label: 'ID'
    },
  ]

  dimensionCols = [
    {
      value: 'label',
      label: '名称'
    },
    {
      value: 'name',
      label: 'ID'
    },
  ]

  constructor(
    private modelStore: ModelsService,
    private dialogRef: MatDialogRef<InsightCreationComponent>
  ) {
    super({} as InsightCreationState)
  }

  ngOnInit() {}

  onCreate() {
    this.dialogRef.close({
      name: `${this.model.name}-${this.entitySet.label || this.entitySet.value}`,
      model: this.model,
      entity: this.entitySet.value
    })
  }

  onStepChange(event) {
    this.step = event
  }

  onModelChange(model: StoryModel) {
    if (nonNullable(model)) {
      const dataSource = convertStoryModel2DataSource(model)
      // this.dsConfiguration.registerDataSource(dataSource.name, dataSource)
      this.patchState({ dataSourceName: dataSource.name })
    }
  }

  onEntityChange(option: IMember) {
    if (nonNullable(option)) {
      this.patchState({ entitySet: option.value as string })
    }
  }
}
