import { ChartBusinessService, DataSettings } from '@metad/ocap-core'
import { SmartEChartEngine } from '@metad/ocap-echarts'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import RefreshIcon from '@mui/icons-material/Refresh'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { useObservable } from '@ngneat/use-observable'
import ReactECharts from 'echarts-for-react'
import React, { useContext, useEffect, useMemo } from 'react'
import { catchError, EMPTY, map, switchMap, tap } from 'rxjs'
import { AppContext } from '../app-context'

/* eslint-disable-next-line */
export interface AnalyticalCardOptions {}

/* eslint-disable-next-line */
export interface AnalyticalCardProps {
  title: string
  dataSettings: DataSettings
  options?: AnalyticalCardOptions
  // callbacks
  onFullscreen?: () => void
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

  const [engineError] = useObservable(engine.error$)
  const [echartsOptions] = useObservable<any, any>(engine.selectChartOptions()
  // .pipe(
    // map(({options}) => options),
    // catchError((err) => {
    //   console.error(err)
    //   return EMPTY
    // })
  // )
  , {initialValue: {}})

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

  const handleChangeChartType = (type: string) => {
    engine.chartAnnotation = {
      ...props.dataSettings.chartAnnotation,
      chartType: {
        ...props.dataSettings.chartAnnotation.chartType,
        type
      }
    }
    setAnchorEl(null)
  }

  return (
    <Card>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {props.title}
        </Typography>

        <IconButton aria-label="settings" onClick={handleClick}>
          {loading ? <RefreshIcon /> : <MoreVertIcon />}
        </IconButton>
      </Box>

      <CardContent style={{ padding: 0 }}>
        {echartsOptions?.options ? <ReactECharts notMerge={true} option={echartsOptions.options} /> : <>No Data</>}

        {engineError ? <Box>{JSON.stringify(engineError, null, 2)}</Box> : <></>}
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
        <MenuItem onClick={() => handleChangeChartType('Bar')}>Bar</MenuItem>
        <MenuItem onClick={() => handleChangeChartType('Line')}>Line</MenuItem>
        <MenuItem onClick={() => handleChangeChartType('Scatter')}>Scatter</MenuItem>
        <MenuItem onClick={() => handleChangeChartType('EffectScatter')}>EffectScatter</MenuItem>
        <MenuItem onClick={() => handleChangeChartType('Bar3D')}>Bar3D</MenuItem>
        <MenuItem onClick={() => handleChangeChartType('Scatter3D')}>Scatter3D</MenuItem>
        <MenuItem onClick={() => handleChangeChartType('Line3D')}>Line3D</MenuItem>
        <MenuItem onClick={props.onFullscreen}>FullScreen</MenuItem>
        <MenuItem onClick={handleClose}>Exit FullScreen</MenuItem>
      </Menu>
    </Card>
  )
}

export default AnalyticalCard
