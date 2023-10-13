import { Component, inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NgmPrismHighlightComponent } from '@metad/components/prism'
import { NxTableModule } from '@metad/components/table'
import { convertQueryResultColumns, nonNullable } from '@metad/core'
import { isDataSettings } from '@metad/ocap-core'
import { uuid } from '@metad/story/core'
import { NxStorySharedModule } from '../shared.module'

@Component({
  standalone: true,
  imports: [NxStorySharedModule, TranslateModule, NxTableModule, NgmPrismHighlightComponent, OcapCoreModule],
  selector: 'pac-story-explain',
  templateUrl: 'explain.component.html',
  styleUrls: ['explain.component.scss']
})
export class ExplainComponent implements OnInit {
  private data = inject(MAT_DIALOG_DATA)
  public explains = []
  public explain = null

  ngOnInit() {
    this.data?.filter(nonNullable).forEach((item) => {
      if (item.error) {
        this.explains.push({
          key: uuid(),
          type: 'error',
          error: item.error
        })
      }

      if (isDataSettings(item)) {
        this.explains.push({
          key: uuid(),
          type: 'dataSettings',
          data: item
        })
      }

      if (item.stats) {
        this.explains.push({
          key: uuid(),
          type: 'statements',
          statements: item.stats.statements
        })
      }
      if (item.data?.length) {
        this.explains.push({
          key: uuid(),
          type: 'data',
          data: item.data,
          columns: item.columns ?? convertQueryResultColumns(item.schema)
        })
      }

      if (item.options) {
        this.explains.push({
          key: uuid(),
          type: 'chart',
          options: item.options
        })
      }

      if (item.slicers) {
        this.explains.push({
          key: uuid(),
          type: 'slicers',
          options: item.slicers
        })
      }
    })

    if (this.explains.length) {
      this.activeLink(this.explains[0])
    }
  }

  activeLink(explain) {
    this.explain = explain
  }
}
