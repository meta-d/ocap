import { FlatTreeControl } from '@angular/cdk/tree'
import { ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { FormControl } from '@angular/forms'
import { NgmAppearance, NgmDSCoreService } from '@metad/ocap-angular/core'
import { DataSettings } from '@metad/ocap-core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { EntitySchemaDataSource, EntitySchemaFlatNode, EntitySchemaType } from './data-source'

@UntilDestroy()
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-entity-schema',
  templateUrl: 'entity-schema.component.html',
  styleUrls: ['entity-schema.component.scss'],
})
export class EntitySchemaComponent implements OnInit, OnChanges {
  @HostBinding('class.ngm-entity-schema') _isEntitySchemaComponent = true

  @Input() dataSettings: DataSettings

  @Input() appearance: NgmAppearance

  searchControl = new FormControl()

  constructor(private dsCoreService: NgmDSCoreService) {
    this.treeControl = new FlatTreeControl<EntitySchemaFlatNode>(this.getLevel, this.isExpandable)
    this.dataSource = new EntitySchemaDataSource(this.treeControl, this.dsCoreService)

    this.dataSource.data = []
  }

  ngOnInit() {
    //
  }

  ngOnChanges({ dataSettings }: SimpleChanges): void {
    if (dataSettings?.currentValue?.entitySet) {
      this.dataSource.dataSourceName = dataSettings.currentValue.dataSource
      this.dataSource.data = [
        new EntitySchemaFlatNode(
          {
            type: EntitySchemaType.Entity,
            name: dataSettings.currentValue.entitySet,
            label: dataSettings.currentValue.entitySet
          },
          0,
          true
        )
      ]
    }
  }

  treeControl: FlatTreeControl<EntitySchemaFlatNode>

  dataSource: EntitySchemaDataSource

  getLevel = (node: EntitySchemaFlatNode) => node.level

  isExpandable = (node: EntitySchemaFlatNode) => node.expandable

  hasChild = (_: number, _nodeData: EntitySchemaFlatNode) => _nodeData.expandable
}
