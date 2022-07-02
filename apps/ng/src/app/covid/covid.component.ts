import { Component, OnInit } from '@angular/core'
import { MatFormFieldAppearance } from '@angular/material/form-field'
import { DisplayDensity, NgmAppearance } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { C_MEASURES, DataSettings } from '@metad/ocap-core'
import { ANALYTICAL_CARDS, DUCKDB_WASM_MODEL } from '@metad/ocap-duckdb'

@Component({
  selector: 'app-covid',
  templateUrl: 'covid.component.html',
  styleUrls: ['covid.component.scss']
})
export class CovidComponent implements OnInit {
  dataSettings: DataSettings = {
    dataSource: 'WASM',
    entitySet: 'Covid19Daily',
    analytics: {
      rows: [
        {
          dimension: '[Country]',
          hierarchy: '[Country.Region]',
          level: '[Country.Region].[Region]'
        },
        {
          dimension: '[Admin]',
          level: '[Admin].[Name]'
        }
      ],
      columns: [
        {
          dimension: C_MEASURES,
          measure: 'Confirmed'
        }
      ]
    }
  }
  smartFilterOptions = {
    dimension: {
      dimension: '[Country]'
    },
  }
  appearance = {
    appearance: 'outline' as MatFormFieldAppearance,
    displayDensity: DisplayDensity.compact
  } as NgmAppearance

  slicer = {}

  card1: any = ANALYTICAL_CARDS[0]

  cards = [
    ...ANALYTICAL_CARDS
  ]

  constructor(wasmAgent: WasmAgentService,) {
    wasmAgent.registerModel(DUCKDB_WASM_MODEL)
  }

  ngOnInit() {}

  onSlicerChange(event) {
    console.log(event)
    this.card1 = {
      ...this.card1,
      dataSettings: {
        ...this.card1.dataSettings,
        selectionVariant: {
          selectOptions: [
            event
          ]
        }
      }
    }
  }
}
