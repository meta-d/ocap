import { ChangeDetectorRef, Component } from '@angular/core'
import { MatFormFieldAppearance } from '@angular/material/form-field'
import { DisplayDensity, NgmAppearance, NgmDSCoreService } from '@metad/ocap-angular/core'
import { C_MEASURES, DataSettings, ISlicer } from '@metad/ocap-core'
import { ANALYTICAL_CARDS, DUCKDB_FOODMART_MODEL } from '@metad/ocap-duckdb'
import { retryWhen, catchError, retry, Subject, switchMap, throwError, timer } from 'rxjs'

@Component({
  selector: 'metad-ocap-covid',
  templateUrl: 'covid.component.html',
  styleUrls: ['covid.component.scss']
})
export class CovidComponent {
  DisplayDensity = DisplayDensity

  dataSettings: DataSettings = {
    dataSource: 'FOODMART',
    entitySet: 'Sales',
    analytics: {
      rows: [
        {
          dimension: '[Store]',
          level: '[Store].[Store City]',
          displayHierarchy: true
        }
      ],
      columns: [
        {
          dimension: '[Time]',
          hierarchy: '[Time]',
          level: '[Time].[Quarter]',
          displayHierarchy: true
        },
        {
          dimension: C_MEASURES,
          measure: 'Sales'
        }
      ]
    }
  }
  productDimension = {
    dimension: '[Product]'
  }
  productSlicer: ISlicer = {
    dimension: {
      dimension: '[Product]'
    },
    members: [
      {
        value: '[Washington].[Washington Berry Juice]',
        label: 'Washington Berry Juice'
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

  public refresh$ = new Subject<void>()

  private foodmartDataSource$ = this.dsCoreService.getDataSource(DUCKDB_FOODMART_MODEL.name)
  public dbCatalogs$ = this.foodmartDataSource$.pipe(
    switchMap((dataSource) => {
      return dataSource.discoverDBCatalogs()
    })
  )
  public dbTables$ = this.foodmartDataSource$.pipe(
    switchMap((dataSource) => {
      return dataSource.discoverDBTables()
    })
  )

  public readonly entitySet$ = this.foodmartDataSource$.pipe(
    switchMap((dataSource) => dataSource.selectEntitySet('Sales')),
    catchError((error) => {
      console.error(error)
      return throwError(() => error)
    }),
    retryWhen((errors) => this.refresh$)
  )

  constructor(private dsCoreService: NgmDSCoreService, private cdr: ChangeDetectorRef) {
  }

  onSlicerChange(event) {
    const selectOptions = []

    if (this.productSlicer.members?.length) {
      selectOptions.push(this.productSlicer)
    }

    timer(100).subscribe(() => {
      this.dataSettings = {
        ...this.dataSettings,
        selectionVariant: {
          selectOptions
        }
      }

      this.cdr.detectChanges()
    })
  }
}
