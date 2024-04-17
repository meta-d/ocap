import { merge } from 'lodash-es'
import { Observable, Subscription } from 'rxjs'
import { MDOptions } from './types'
import { Xmla } from './xmla/Xmla'

export class NxXmlaService {
  xmla = null

  constructor(
    private dataSourceInfo = '',
    private options: null | any,
  ) {
    this.xmla = new Xmla(this.options)
  }

  discoverDataSources() {
    return this.discover('discoverDataSources')
  }

  /**
   * 获取数据目录
   * [`[MS-SSAS]`: SQL Server Analysis Services Protocol](https://docs.microsoft.com/en-us/openspecs/sql_server_protocols/ms-ssas/0e6740df-4c03-447d-bfc0-7f31bfc7aed4)
   * [Refer codes](https://github.com/OpenlinkFinancial/MXMLABridge/blob/master/src/custom/mondrian/xmla/handler/RowsetDefinition.java#L87)
   * @returns 
   */
  discoverDBCatalogs(options: MDOptions) {
    return this.discover('discoverDBCatalogs', options)
  }

  discoverMDCubes(options: MDOptions) {
    return this.discover('discoverMDCubes', options)
  }

  discoverMDDimensions(options: MDOptions) {
    return this.discover('discoverMDDimensions', options)
  }

  discoverMDMeasures(options: MDOptions) {
    return this.discover('discoverMDMeasures', options)
  }

  discoverMDHierarchies(options: MDOptions) {
    return this.discover('discoverMDHierarchies', options)
  }

  discoverMDLevels(options: MDOptions) {
    return this.discover('discoverMDLevels', options)
  }

  discoverMDMembers(options: MDOptions) {
    return this.discover('discoverMDMembers', options)
  }

  discoverMDProperties(options: MDOptions) {
    return this.discover('discoverMDProperties', options)
  }

  discoverSAPVariables(options: MDOptions): Observable<any> {
    return new Observable((subscriber) => {
      const sub: Subscription = this.xmla.discover(merge(
        options,
        {
          properties: {
            DataSourceInfo: this.dataSourceInfo
          }
        },
        {
          requestType: 'SAP_VARIABLES'
        },
        {
          success: (xmla, request, response) => {
            subscriber.next(response)
            // response.eachRow((row) => {
            //   console.warn(row)
            // })
            subscriber.complete()
          },
          error: (err) => {
            subscriber.error(err)
          }
        }
      )).subscribe()

      return function unsubscribe() {
        sub.unsubscribe()
      };
    })
  }

  discover(name: string, options?: MDOptions): Observable<any> {
    return new Observable((subscriber) => {
      const _options = merge({
        properties: {
          DataSourceInfo: this.dataSourceInfo
        }},
        options
      )
      const sub: Subscription = this.xmla[name]({
        ..._options,
        success: (xmla, request, response) => {
          subscriber.next(response)
          // response.eachRow((row) => {
          //   console.warn(row)
          // })
          subscriber.complete()
        },
        error: (err, exception) => {
          subscriber.error(exception)
        }
      }).subscribe()

      return function unsubscribe() {
        sub.unsubscribe()
      };
    })
  }

  execute(statement: string, options?: MDOptions): Observable<any> {
    return new Observable((subscriber) => {
      const _options = merge({
        properties: {
          DataSourceInfo: this.dataSourceInfo
        }
      }, options)

      const sub: Subscription = this.xmla.execute({
        statement,
        ..._options,
        semanticModel: this.options.semanticModel,
        success: (xmla, ops, response) => {
          subscriber.next(response)
          subscriber.complete()
        },
        error: (err, error) => {
          subscriber.error(error)
        }
      }).subscribe()

      return function unsubscribe() {
        sub.unsubscribe()
      };
    })
  }

  // renderDatasetAsTree(dataset) {
  //   const cellset = dataset.getCellset()

  //   function renderAxes(parent, axisIndex?) {
  //     if (isNil(axisIndex)) {
  //       axisIndex = dataset.axisCount() - 1
  //     }

  //     console.log(axisIndex)

  //     const axis = dataset.getAxis(axisIndex)
  //     let member
  //     let tupleHTML
  //     axis.eachTuple((tuple) => {
  //       // console.warn(tuple)
  //       let tupleHTML = ''
  //       axis.eachHierarchy((hierarchy) => {
  //         member = axis.member()
  //         // console.warn(member)
  //         tupleHTML += '/' + member.Caption
  //       })

  //       const node = {
  //         name: tupleHTML,
  //         value: null,
  //         fmtvalue: null,
  //         body: [],
  //       }
  //       parent.push(node)

  //       if (axisIndex) {
  //         renderAxes(node.body, axisIndex - 1)
  //       } else {
  //         node.value = cellset.cellValue()
  //         node.fmtvalue = cellset.cellFmtValue()
  //         cellset.nextCell()
  //       }
  //     })
  //     axis.reset()
  //   }

  //   const tree = []
  //   renderAxes(tree)

  //   console.warn(tree)
  // }

  // populateMeasures(rowset) {
  //   const measures = rowset.fetchAllAsObject()
  //   rowset.close()

  //   console.warn(measures)

  //   const properties = {}
  //   properties[Xmla.PROP_DATASOURCEINFO] = this.dataSourceInfo
  //   properties[Xmla.PROP_CATALOG] = this.catalog

  //   const restrictions = {}
  //   restrictions['CUBE_NAME'] = this.cube
  //   // this.xmla.discoverMDHierarchies({
  //   //   properties,
  //   //   restrictions,
  //   // })
  // }

  // populateHierarchies(rowset) {
  //   let hierarchy = rowset.fetchAsObject()
  //   const hierarchies = []
  //   while (hierarchy) {
  //     if (hierarchy.DIMENSION_TYPE === Xmla.Rowset.MD_DIMTYPE_MEASURE) {
  //       continue
  //     }
  //     hierarchies.push(hierarchy)

  //     hierarchy = rowset.fetchAsObject()
  //   }
  //   rowset.close()

  //   console.warn(hierarchies)
  // }
}
