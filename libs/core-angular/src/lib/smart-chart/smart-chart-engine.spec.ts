import { ChartDimensionRoleType, NxChartType } from '@metad/ds-core'
import { merge } from 'lodash-es'
import { Observable, of } from 'rxjs'
import { skip } from 'rxjs/operators'
import { NxChartComplexityOptions } from './chart'
import { NxSmartChartEngine, NxSmartChartEngineOptions } from './smart-chart-engine'

interface TestChartOptions {
  series: Array<any>
  legend: any
}

export const SMART_CHART_TEST_ENTITY_TYPE = {
  properties: {
    CompanyCode: {
      Name: 'CompanyCode',
    },
    CalendarYear: {
      Name: 'CalendarYear',
    },
    Amount: {
      Name: 'Amount',
    },
    Amount2: {
      Name: 'Amount2',
    },
    Amount3: {
      Name: 'Amount3',
      SAPUnit: {
        Name: 'CurrencyCode',
      },
    },
    CurrencyCode: {
      Name: 'CurrencyCode',
    },
  },
}
export const DATA_CATEGORY_2 = [
  {
    CalendarYear: '2018',
    CompanyCode: 'CompanyCode1',
    Amount: 90,
    Amount2: 100,
    Amount3: 50,
    CurrencyCode: 'CNY',
  },
  {
    CalendarYear: '2018',
    CompanyCode: 'CompanyCode2',
    Amount: 100,
    Amount2: 100,
    Amount3: 50,
    CurrencyCode: 'CNY',
  },
  {
    CalendarYear: '2018',
    CompanyCode: 'CompanyCode3',
    Amount: 10,
    Amount2: 100,
    Amount3: 50,
    CurrencyCode: 'CNY',
  },
  {
    CalendarYear: '2019',
    CompanyCode: 'CompanyCode1',
    Amount: 70,
    Amount2: 100,
    Amount3: 50,
    CurrencyCode: 'CNY',
  },
  {
    CalendarYear: '2019',
    CompanyCode: 'CompanyCode2',
    Amount: 100,
    Amount2: 100,
    Amount3: 50,
    CurrencyCode: 'CNY',
  },
  {
    CalendarYear: '2019',
    CompanyCode: 'CompanyCode3',
    Amount: 50,
    Amount2: 100,
    Amount3: 50,
    CurrencyCode: 'CNY',
  },
]

class TestSmartChartEngine extends NxSmartChartEngine {
  get complexityOptions(): NxChartComplexityOptions {
    return {
      minimalist: {},
      normal: {},
      comprehensive: {},
    }
  }
  getChartOptions(items: any): Observable<TestChartOptions> {
    const dimension = this.getChartCategory()?.dimension
    return of({
      series: this.getMeasures().map(({ name }) => {
        const property = this.getProperty(name)
        return {
          name: property.label || name,
          data: items.map((item) => item[name]),
        }
      }),
      legend: {
        show: true,
        data: items.map((item) => item[dimension]),
      },
    })
  }

  setSeriesColor(options, chromatics) {
    if (chromatics) {
      options.series.forEach(series => {
        series.color = chromatics[series.name]?.color
      })
    }
    return options
  }
}

describe('NxSmartChartEngine', () => {
  let service: NxSmartChartEngine
  const DATA = [
    {
      Field: 'Name 1',
      Value: 10,
    },
    {
      Field: 'Name 2',
      Value: 50,
    },
    {
      Field: 'Name 3',
      Value: 20,
    },
  ]
  beforeEach(() => {
    service = new TestSmartChartEngine(
      {
        label: '',
        properties: {
          Field: {
            name: 'Field',
          },
          Value: {
            name: 'Value',
          },
        },
      },
      {
        chartType: NxChartType.Bar,
        dimensions: ['SeriesField', 'Field'],
        dimensionAttributes: [
          {
            dimension: 'SeriesField',
            role: ChartDimensionRoleType.Series,
          },
        ],
        measures: ['Value'],
      },
      null,
      'en'
    )
  })

  afterEach(() => {
    service = null
  })

  it('should create', () => {
    expect(service).toBeDefined()
  })

  it('should got chart options', (done) => {
    service.onChartOptions().subscribe((options) => {
      expect(options).toEqual({
        series: [{ name: 'Value', data: [10, 50, 20] }],
        legend: { show: true, data: ['Name 1', 'Name 2', 'Name 3'] },
      })
      done()
    })
    service.data = DATA
    // service.getChartOptions(data).subscribe((options) => {
    // })
  })

  it('should got chart category field', (done) => {
    expect(service.getChartCategory()).toEqual({
      dimension: 'Field',
    })

    service.onChartOptions().pipe(skip(1)).subscribe((options) => {
      expect(options).toEqual({
        series: [{ name: 'Value', data: [10, 50, 20], color: [ 'red' ] }],
        legend: { show: true, data: ['Name 1', 'Name 2', 'Name 3'] },
      })
      done()
    })
    service.data = DATA

    service.chartOptions = merge(new NxSmartChartEngineOptions(), {
      chromatics: {
        Value: {
          color: ['red']
        }
      }
    })
  })
})
