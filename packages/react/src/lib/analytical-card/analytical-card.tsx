import styles from './analytical-card.module.scss'
import { DataSettings } from '@metad/ocap-core'
import { SmartEChartEngine } from '@metad/ocap-echarts'
import { useObservable } from '@ngneat/use-observable'
import ReactECharts from 'echarts-for-react'
import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AppContext } from '../app-context'

/* eslint-disable-next-line */
export interface AnalyticalCardOptions {}

/* eslint-disable-next-line */
export interface AnalyticalCardProps {
  dataSettings: DataSettings
  options?: AnalyticalCardOptions
}

// export class AnalyticalCard extends React.Component<AnalyticalCardProps, { data: any, options: any }> {
//   subscription: Subscription | null = null
//   engine: SmartEChartEngine
//   constructor(props: AnalyticalCardProps) {
//     super(props)

//     this.engine = new SmartEChartEngine()
//     this.state = {
//       data: {
//         results: [
//           {
//             A: 'A1',
//             B: 'B1',
//             C: 100
//           }
//         ]
//       },
//       options: {}
//     }
//   }

//   // override shouldComponentUpdate(nextProps, nextState) {

//   //   if (this.state.data !== nextState.data && nextState.data) {

//   //     console.warn(`~~~~~~~~~~~***************~~~~~~~~~~~~~~~~~~~~` )

//   //     this.engine.data = nextState.data
//   //   }

//   //   return true;
//   // }

//   override componentDidMount() {

//     console.warn(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~` )

//     this.subscription?.unsubscribe()

//     // subscribe to home component messages
//     this.subscription = this.engine.selectChartOptions().subscribe((options) => {
//       if (options) {
//         // add message to local state if not empty
//         this.setState({ options })
//       } else {
//         // clear messages when empty message received
//         this.setState({ options: {} })
//       }
//     })

//     this.engine.chartAnnotation = {
//       chartType: {
//         type: 'Bar'
//       },
//       dimensions: [
//         {
//           dimension: 'A'
//         }
//       ],
//       measures: [
//         {
//           dimension: 'Measures',
//           measure: 'C'
//         }
//       ]
//     }

//     this.engine.data = this.state.data
//   }

//   override componentWillUnmount() {
//     // unsubscribe to ensure no memory leaks
//     this.subscription?.unsubscribe()
//   }

//   updateDimension(dimension: string) {
//     this.engine.updater((state) => {
//       state.chartAnnotation.dimensions[0].dimension = dimension
//     })()
//   }

//   refresh() {
//     console.log(`refresh....................`)
//     this.engine.data = {...this.state.data}
//   }

//   override render() {
//     const { options } = this.state
//     return <div>
//       <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
//         onClick={() => this.updateDimension('A')}>
//           A
//       </button>

//       <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
//         onClick={() => this.updateDimension('B')}>
//           B
//       </button>


//       <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
//         onClick={() => this.refresh()}>
//           Refresh
//       </button>
//       <ReactECharts option={options} />
//     </div>
//   }
// }

export function AnalyticalCard(props: AnalyticalCardProps) {

  console.log(`***********************`)
  const { coreService } = useContext(AppContext)
  
  const engine = useMemo(() => {
    return new SmartEChartEngine()
  }, [])

  // const [engine] = useState(new SmartEChartEngine())
  const [echartsOptions] = useObservable(engine.selectChartOptions())
  // useLayoutEffect(() => {
  //   engine.data = {
  //     results: [
  //       {
  //         B: 'B1',
  //         A: 'A1',
  //         C: 100
  //       }
  //     ]
  //   }
  // }, [engine])

  useEffect(() => {
    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)

    const subscription = coreService.selectEntity(props.dataSettings.entitySet).subscribe(value => {
      engine.data = value
    })

    return () => subscription.unsubscribe()
  }, [props.dataSettings.entitySet])

  useEffect(() => {
    engine.chartAnnotation = props.dataSettings.chartAnnotation
  }, [engine, props.dataSettings])

  const updateDimension = (dimension: string) => {
    engine.updater((state) => {
      state.chartAnnotation.dimensions[0].dimension = dimension
    })()
  }

  const refresh = () => {
    engine.data = {...engine.data}
  }

  return (
    <div className={styles['container']}>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={() => updateDimension('A')}>
          A
      </button>

      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={() => updateDimension('B')}>
          B
      </button>

      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={() => refresh()}>
          Refresh
      </button>
      <ReactECharts option={echartsOptions} />
    </div>
  );
}

export default AnalyticalCard

