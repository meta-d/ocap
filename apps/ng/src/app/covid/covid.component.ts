import { Component } from '@angular/core'
import { MatFormFieldAppearance } from '@angular/material/form-field'
import { DisplayDensity, NgmAppearance } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { C_MEASURES, DataSettings, ISlicer } from '@metad/ocap-core'
import { ANALYTICAL_CARDS } from '@metad/ocap-duckdb'

@Component({
  selector: 'metad-ocap-covid',
  templateUrl: 'covid.component.html',
  styleUrls: ['covid.component.scss']
})
export class CovidComponent {
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
  countryDimension = {
    dimension: '[Country]'
  }
  countrySlicer: ISlicer = {
    members: [
      {
        label: 'China',
        value: '[Asia].[Eastern Asia].[China]'
      }
    ]
  }
  smartFilterOptions = {
    dimension: {
      dimension: '[Country]'
    }
  }
  appearance = {
    appearance: 'outline' as MatFormFieldAppearance,
    displayDensity: DisplayDensity.compact
  } as NgmAppearance

  slicer: ISlicer = {}

  card1: any = ANALYTICAL_CARDS[0]

  cards = [...ANALYTICAL_CARDS]

  constructor(wasmAgent: WasmAgentService) {
    // wasmAgent.registerModel(DUCKDB_WASM_MODEL)
  }

  onSlicerChange(event) {
    const selectOptions = []
    if (this.countrySlicer?.members) {
      selectOptions.push(this.countrySlicer)
    }
    if (this.slicer?.members) {
      selectOptions.push(this.slicer)
    }

    this.card1 = {
      ...this.card1,
      dataSettings: {
        ...this.card1.dataSettings,
        selectionVariant: {
          selectOptions
        }
      }
    }
  }
}
