// eslint-disable-next-line @typescript-eslint/no-unused-vars
import './app.scss'
import {
  AgentType,
  DSCoreService,
  MockAgent,
} from '@metad/ocap-core'
import { AnalyticalCard, AppContext } from '@metad/ocap-react'
import * as SQL from '@metad/ocap-sql'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import React, { useState } from 'react'
import { registerTheme } from 'echarts/core'
import { DEFAULT_THEME } from '@metad/ocap-echarts'
import { MAP_CARDS, CARTESIAN_CARDS } from './types'
import { DuckdbWasmAgent } from '@metad/ocap-duckdb'

registerTheme(DEFAULT_THEME.name, DEFAULT_THEME.echartsTheme)

export function App() {
  const sss = SQL

  const [dataSettings, setDataSettings] = useState([
    ...MAP_CARDS,
    ...CARTESIAN_CARDS
  ])

  const handleChange = (event: SelectChangeEvent) => {
    //
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" component="div">
            Analytical Cards
          </Typography>
        </Toolbar>
      </AppBar>

      <Container >
        <AppContext.Provider
          value={{
            coreService: new DSCoreService([
              new DuckdbWasmAgent([{
                name: 'WASM',
                type: '',
                schemaName: 'main',
                entities: [
                  {
                    name: 'CsseCovid19Daily',
                    sourceUrl: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/04-28-2022.csv',
                  },
                  {
                    name: 'CountryGDP',
                    sourceUrl: `https://raw.githubusercontent.com/curran/data/gh-pages/worldFactbook/GDPPerCapita.csv`
                  }
                ]
              }]),
              new MockAgent()], {
                Sales: {
                  name: 'Sales',
                  type: 'SQL',
                  agentType: AgentType.Browser,
                  schema: {
                    cubes: [
                      {
                        name: 'SalesOrder',
                        Table: {
                          name: 'sales'
                        },
                        Dimension: [{
                          name: 'Time',
                          Hierarchy: [
                            {
                              name: '',
                              hasAll: true,
                              primaryKey: 'timeid',
                              Level: [
                                {
                                  name: 'Year',
                                  column: 'year',
                                  uniqueMembers: true
                                }
                              ]
                            }
                          ]
                        }],
                        Measure: [
                          {
                            name: 'amount',
                            column: 'amount',
                            aggregator: 'sum'
                          }
                        ]
                      }
                    ]
                  }
                },
                WASM: {
                  name: 'WASM',
                  type: 'SQL',
                  agentType: AgentType.Wasm
                }
            })
          }}
        >
          <Grid container spacing={2}>
            {dataSettings.map(({ title, dataSettings, chartSettings, chartOptions }) => (
              <Grid item xs={8} sm={4}>
                <AnalyticalCard title={title}
                  dataSettings={dataSettings}
                  chartSettings={chartSettings}
                  chartOptions={chartOptions}/>
              </Grid>
            ))}
          </Grid>
        </AppContext.Provider>
      </Container>
    </Box>
  )
}

export default App
