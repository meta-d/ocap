import { Observable, of } from 'rxjs'
import { SmartIndicatorDataService } from './indicator-data.service'

@Injectable()
class TestInterceptor implements NxSmartEntityInterceptor {
  intercept(req: QueryOptions): Observable<QueryOptions> {
    console.warn(req)
    return of(req)
  }
}

describe('SmartIndicatorDataService', () => {
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NxDSCoreModule.forRoot(), NxDSMockModule.forRoot()],
      providers: [
        {
          provide: NX_DATASOURCE,
          useValue: {
            '': {
              type: 'OData',
              uri: ODATA_URI
            }
          },
          multi: true
        },
        SmartIndicatorDataService,
        NxSmartFilterBarService,
        {
          provide: SMART_ENTITY_INTERCEPTORS,
          useClass: TestInterceptor,
          multi: true
        }
      ]
    })
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('#should be created', (done) => {
    const service = TestBed.inject(SmartIndicatorDataService)
    expect(service).toBeTruthy()

    service.dataSettings = {
      entitySet: ODATA_ENTITY
    }

    const req = httpMock.expectOne(`${ODATA_URI_METADATA}`)
    req.flush(ODATA_META_DATA)

    service.onAfterServiceInit().subscribe(() => {
      const entityType = service.getEntityType()
      expect(entityType.name).toEqual(`${ODATA_ENTITY}Type`)
      done()
    })
  })

  it('#should be created and refresh data', (done) => {
    const service = TestBed.inject(SmartIndicatorDataService)
    const filterBar = TestBed.inject(NxSmartFilterBarService)
    expect(service).toBeTruthy()

    service.dataSettings = {
      entitySet: ODATA_ENTITY
    }

    const req = httpMock.expectOne(`${ODATA_URI_METADATA}`)
    req.flush(ODATA_META_DATA)

    service.onAfterServiceInit().subscribe(() => {
      const entityType = service.getEntityType()
      expect(entityType.name).toEqual(`${ODATA_ENTITY}Type`)

      filterBar.change([
        new NxFilterGroup([new NxFilter('Factory', '2'), new NxFilter('Factory', '1', NxFilterOperator.GT)])
      ])
      filterBar.go()

      setTimeout(() => {
        const dataReq = httpMock.expectOne(
          `${ODATA_URI}${ODATA_ENTITY}?$filter=(Factory%20eq%20'2'%20and%20Factory%20gt%20'1')`
        )
        dataReq.flush({
          d: {
            results: ODATA_ENTITY_DATA
          }
        })
      }, 100)
    })

    service.onChange().subscribe((data) => {
      expect(data).toEqual(ODATA_ENTITY_DATA)
      done()
    })
  })
})
