// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DSCoreService } from '@metad/ocap-core'
import { AppContext, AnalyticalCard } from '@metad/ocap-react'
import React, { useState } from 'react'


export function App() {
  console.warn(`((((((((((((((((((()))))))))))))))))))`)

  const [dataSettings, setDataSettings] = useState({
    dataSource: '',
    entitySet: '',
    chartAnnotation: {
      chartType: {
        type: 'Bar'
      },
      dimensions: [
        {
          dimension: 'A'
        }
      ],
      measures: [
        {
          dimension: 'Measures',
          measure: 'C'
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
        onClick={() => setEntitySet('Sales')}
      >
        Sales Order
      </button>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={() => setEntitySet('Purchase')}
      >
        Purchase Order
      </button>
      <AppContext.Provider
        value={{coreService: new DSCoreService()}}
      >
        <AnalyticalCard dataSettings={dataSettings} />

        <AnalyticalCard dataSettings={dataSettings} />
      </AppContext.Provider>
    </>
  )
}

export default App
