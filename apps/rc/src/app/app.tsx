// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DSCoreService } from '@metad/ocap-core'
import { AppContext, AnalyticalCard } from '@metad/ocap-react'
import React, { useState } from 'react'

import * as SQL from '@metad/ocap-sql'


export function App() {
  const sss = SQL

  const [dataSettings, setDataSettings] = useState({
    dataSource: 'Sales',
    entitySet: 'SalesOrder',
    chartAnnotation: {
      chartType: {
        type: 'Bar'
      },
      dimensions: [
        {
          dimension: 'product'
        },
        {
          dimension: 'productCategory'
        }
      ],
      measures: [
        {
          dimension: 'Measures',
          measure: 'sales'
        }
      ]
    }
  })

  const setEntitySet = (entitySet: string) => {
    setDataSettings({
      ...dataSettings,
      entitySet
    })
  }

  return (
    <>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={() => setEntitySet('SalesOrder')}
      >
        Sales Order
      </button>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={() => setEntitySet('PurchaseOrder')}
      >
        Purchase Order
      </button>
      <AppContext.Provider
        value={{coreService: new DSCoreService({
          Sales: {
            name: 'Sales',
            type: 'SQL'
          }
        })}}
      >
        <AnalyticalCard dataSettings={dataSettings} />

        {/* <AnalyticalCard dataSettings={dataSettings} /> */}
      </AppContext.Provider>
    </>
  )
}

export default App
