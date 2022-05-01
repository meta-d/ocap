import { ChartBusinessService, DataSettings, ChartSettings, ChartOptions } from '@metad/ocap-core'
import { SmartEChartEngine } from '@metad/ocap-echarts'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import RefreshIcon from '@mui/icons-material/Refresh'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Popover from '@mui/material/Popover';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useObservable } from '@ngneat/use-observable'
import ReactECharts from 'echarts-for-react'
import { isEmpty } from 'lodash'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { switchMap, tap } from 'rxjs'
import { AppContext } from '../app-context'
import { CommonProps } from '@mui/material/OverridableComponent'

/* eslint-disable-next-line */
export interface AnalyticalCardOptions {}

/* eslint-disable-next-line */
export interface AnalyticalCardProps extends CommonProps {
  title: string
  dataSettings: DataSettings
  chartSettings?: ChartSettings
  chartOptions?: ChartOptions
  options?: AnalyticalCardOptions
  // callbacks
  onFullscreen?: () => void
}

export function useChartBusinessService(context) {
  const { coreService } = useContext(context)
  return useMemo(() => {
    return new ChartBusinessService(coreService)
  }, [])
}

const CHART_TYPES = [
  {
    value: 'Bar',
    label: '柱形图'
  },
  {
    value: 'Line',
    label: '线图'
  },
  {
    value: 'Scatter',
    label: '散点图'
  },
  {
    value: 'Heatmap',
    label: '热力图'
  },
  {
    value: 'Treemap',
    label: '矩阵树图'
  },
  {
    value: 'Sunburst',
    label: '旭日图'
  },
  {
    value: 'Sankey',
    label: '桑基图'
  }
]

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

  const [chartType, setChartType] = useState(props.dataSettings?.chartAnnotation?.chartType?.type)
  const [noData, setNoData] = useState(null)

  useEffect(() => {
    chartService.refresh()
    const subscription = chartService
      .onAfterServiceInit()
      .pipe(
        tap(() => {
          engine.entityType = chartService.getEntityType()
          chartService.refresh()
        }),
        switchMap(() => {
          return chartService.selectResult()
        })
      )
      .subscribe((value) => {
        if (isEmpty(value.results)) {
          setNoData(true)
        } else {
          setNoData(false)
          engine.data = value
        }
      })
    return () => subscription.unsubscribe()
  }, [chartService])

  useEffect(() => {
    engine.chartAnnotation = props.dataSettings.chartAnnotation
    engine.settings = props.chartSettings
    engine.options = props.chartOptions
  }, [engine, props.dataSettings, props.chartSettings, props.chartOptions])

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

  const [anchorElPopover, setAnchorElPopover] = React.useState<HTMLButtonElement | null>(null);
  const handlePopoverClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElPopover(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorElPopover(null);
  };
  const openPopover = Boolean(anchorElPopover);
  const id = open ? 'simple-popover' : undefined;

  const handleChartTypeChange = (event: SelectChangeEvent) => {
    setChartType(event.target.value)
    engine.chartAnnotation = {
      ...props.dataSettings.chartAnnotation,
      chartType: {
        ...props.dataSettings.chartAnnotation.chartType,
        type: event.target.value
      }
    }
  };
  return (
    <>
    <Card className={'AnalyticalCard'}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {props.title}
        </Typography>

        <div>
          <IconButton onClick={handlePopoverClick}>
            <DisplaySettingsIcon></DisplaySettingsIcon>
          </IconButton>
          <IconButton aria-label="settings" onClick={handleClick}>
            {loading ? <RefreshIcon /> : <MoreVertIcon />}
          </IconButton>
        </div>

      </Box>

      <CardContent style={{ padding: 0 }}>
        {noData || !echartsOptions?.options ? <>No Data</> : <ReactECharts notMerge={true} option={echartsOptions.options} theme={"default"}/>}

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

    <Popover
      id={id}
      open={openPopover}
      anchorEl={anchorElPopover}
      onClose={handlePopoverClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>

      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
        <InputLabel id="demo-select-small">Chart Type</InputLabel>
        <Select
          labelId="demo-select-small"
          id="demo-select-small"
          value={chartType}
          label="Entity Set"
          onChange={handleChartTypeChange}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {CHART_TYPES.map(({value, label}) => (
            <MenuItem value={value}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Popover>
    </>
  )
}

export default AnalyticalCard
