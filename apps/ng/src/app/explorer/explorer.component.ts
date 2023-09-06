import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { ResizerModule } from '@metad/ocap-angular/common'
import { NgmEntitySchemaComponent } from '@metad/ocap-angular/entity'
import { FormulaModule } from '@metad/ocap-angular/formula'
import { NgmSlicerPipe } from '@metad/ocap-angular/slicers'
import { cloneDeep, C_MEASURES } from '@metad/ocap-core'
import { UntilDestroy } from '@ngneat/until-destroy'

@UntilDestroy({ checkProperties: true })
@Component({
  standalone: true,
  selector: 'ngm-ocap-explorer',
  templateUrl: 'explorer.component.html',
  styles: [
    `
      :host {
        height: 100vh;
      }
    `
  ],
  providers: [],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    FormulaModule,
    ResizerModule,
    NgmEntitySchemaComponent,
    AnalyticalCardModule,
    NgmSlicerPipe
  ]
})
export class ExplorerComponent implements OnInit {
  rows = []
  columns = []
  slicers = []

  dataSettings = {
    dataSource: 'TopSubscribed',
    entitySet: '',
    chartAnnotation: {
      chartType: {
        type: 'Bar'
      },
      dimensions: [],
      measures: []
    }
  }

  entities = []
  ngOnInit(): void {
    console.log(`======`)
  }

  drop(event) {
    console.log(event)
    this.dataSettings = cloneDeep(this.dataSettings)
    if (event.item.data.type === 'Entity') {
      this.dataSettings.entitySet = event.item.data.name
    }
    if (event.item.data.type === 'Dimension') {
      this.dataSettings.chartAnnotation.dimensions = [
        {
          dimension: event.item.data.name
        }
      ]
    }
    if (event.item.data.type === 'IMeasure') {
      this.dataSettings.chartAnnotation.measures = [
        {
          dimension: C_MEASURES,
          measure: event.item.data.name
        }
      ]
    }
  }

  dropRows(event) {
    this.rows = [
      {
        dimension: event.item.data.name
      }
    ]
    this.dataSettings = cloneDeep(this.dataSettings)
    this.dataSettings.chartAnnotation.dimensions = cloneDeep(this.rows)
  }

  dropColumns(event) {
    this.columns = [
      {
        dimension: C_MEASURES,
        measure: event.item.data.name
      }
    ]
    this.dataSettings = cloneDeep(this.dataSettings)
    this.dataSettings.chartAnnotation.measures = cloneDeep(this.columns)
  }

  dropSlicers(event) {
    if (event.item.data.type === 'Member') {
      this.slicers = [
        ...this.slicers,
        {
          dimension: event.item.data.raw,
          members: [
            {
              value: event.item.data.raw.memberKey,
              caption: event.item.data.raw.memberCaption
            }
          ]
        }
      ]
    }
  }
}
