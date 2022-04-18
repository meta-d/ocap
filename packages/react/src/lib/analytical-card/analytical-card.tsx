import { ChartBusinessService, DataSettings } from '@metad/ocap-core'
import { SmartEChartEngine } from '@metad/ocap-echarts'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import RefreshIcon from '@mui/icons-material/Refresh'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useObservable } from '@ngneat/use-observable'
import ReactECharts from 'echarts-for-react'
import React, { useContext, useEffect, useMemo } from 'react'
import { switchMap, tap } from 'rxjs'
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

export function useChartBusinessService(context) {
  const { coreService } = useContext(context)
  return useMemo(() => {
    return new ChartBusinessService(coreService)
  }, [])
}

export function AnalyticalCard(props: AnalyticalCardProps) {
  console.log(`***********************`)

  const chartService = useChartBusinessService(AppContext)
  useEffect(() => {
    chartService.dataSettings = props.dataSettings
  }, [props.dataSettings])

  const [loading] = useObservable(chartService.loading$)

  const engine = useMemo(() => {
    return new SmartEChartEngine()
  }, [])

  const [echartsOptions] = useObservable(engine.selectChartOptions())

  useEffect(() => {
    chartService.refresh()
    const subscription = chartService
      .onAfterServiceInit()
      .pipe(
        tap(() => chartService.refresh()),
        switchMap(() => {
          return chartService.selectResult()
        })
      )
      .subscribe((value) => {
        engine.data = value
      })
    return () => subscription.unsubscribe()
  }, [chartService])

  useEffect(() => {
    engine.chartAnnotation = props.dataSettings.chartAnnotation
  }, [engine, props.dataSettings])

  const refresh = () => {
    chartService.refresh()
    handleClose()
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardHeader
        action={
          <IconButton aria-label="settings" onClick={handleClick}>
            {loading ? <RefreshIcon /> : <MoreVertIcon />}
          </IconButton>
        }
        title="Shrimp and Chorizo Paella"
        subheader="September 14, 2016"
      />
      <CardContent>
        <ReactECharts option={echartsOptions} />
      </CardContent>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        <MenuItem onClick={refresh}>
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Refresh</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </Card>
  )
}

export default AnalyticalCard
