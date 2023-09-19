import { Component } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { Observable, of, Subject } from 'rxjs'
import { DATA } from '../test/metadata'
import { NxChartComplexityOptions, NX_SMART_CHART_TYPE } from './chart'
import { NxSmartChartEngine } from './smart-chart-engine'
import { NxSmartChartComponent } from './smart-chart.component'
import { NxChartLibrary } from './types'

@Component({
  selector: 'ngm-test-smart-chart',
})
class TestSmartChartComponent extends NxSmartChartComponent {
  public chartLibrary: NxChartLibrary = NxChartLibrary.echarts
  options = new Subject()

  resize() {}

  onOptionsChange(options) {
    console.warn(options)
    this.options.next(options)
  }
}

class TestSmartChartEngine extends NxSmartChartEngine {
  get complexityOptions(): NxChartComplexityOptions {
    return {
      minimalist: {},
      normal: {},
      comprehensive: {}
    }
  }
  getChartOptions(items: any): Observable<any> {
    return of({
        grid: {
            left: 0
        },
        dataset: {
            source: items
        }
    })
  }
}

describe('TestSmartChartComponent', () => {
  let component: TestSmartChartComponent
  let fixture: ComponentFixture<TestSmartChartComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestSmartChartComponent],
      providers: [
        {
          provide: NX_SMART_CHART_TYPE,
          useValue: {
            chartLib: NxChartLibrary.echarts,
            chartType: 'Test',
            smartChartType: TestSmartChartEngine,
          },
        },
      ],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSmartChartComponent)
    component = fixture.componentInstance

    component.chartType = 'Test'
    component.entityType = {properties:{}}
    component.chartAnnotation = {
        chartType: 'Test',
        dimensions: ['Field'],
        measures: ['Value']
    }

    fixture.detectChanges()
  })

  it('should create', (done) => {
    expect(component).toBeTruthy()
    component.options.subscribe(options => {
        expect(options).toEqual({
            grid: {
                left: 0
            },
            dataset: {
                source: DATA
            }
        })
        done()
    })

    component.data = DATA
  })
})
