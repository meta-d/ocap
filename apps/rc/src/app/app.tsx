// eslint-disable-next-line @typescript-eslint/no-unused-vars
import './app.scss'
import {
  AgentType,
  DataSource,
  Type,
} from '@metad/ocap-core'
import { AnalyticalCard, OCAPCoreProvider } from '@metad/ocap-react'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import React, { useEffect, useMemo, useState } from 'react'
import { registerTheme } from 'echarts/core'
import { DEFAULT_THEME } from '@metad/ocap-echarts'
import { DuckdbWasmAgent } from '@metad/ocap-duckdb'
import { DUCKDB_WASM_MODEL, CARTESIAN_CARDS, ANALYTICAL_CARDS } from '@metad/ocap-duckdb/src/lib/examples'
import { MockAgent } from './mock'

registerTheme(DEFAULT_THEME.name, DEFAULT_THEME.echartsTheme)

async function importSQL(): Promise<Type<DataSource>> {
  const { SQLDataSource } = await import('@metad/ocap-sql')
  return SQLDataSource
}

export function App() {

  const [cards, setCards] = useState([
    CARTESIAN_CARDS[0]
    // ...CARTESIAN_CARDS,
    // ...ANALYTICAL_CARDS
  ])

  const handleChange = (event: SelectChangeEvent) => {
    //
  }

  const wasmDBAgent = useMemo(() => {
    return new DuckdbWasmAgent([])
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~ duckdb register model ~~~~~~~~~~~~~~~~~~~~~~~~~~`)
      wasmDBAgent.registerModel(DUCKDB_WASM_MODEL)
    }, 5000);
    return () => clearTimeout(timer)
  }, [])

  return (
    <OCAPCoreProvider wasmDBAgent={wasmDBAgent} agents={[
      wasmDBAgent,
      new MockAgent()
    ]} dataSources={[
      {
        name: 'Sales',
        type: 'SQL',
        agentType: AgentType.Browser,
        schema: {
          name: 'Sales',
          cubes: [
            {
              name: 'SalesOrder1',
              tables: [
                {
                  name: 'sales'
                }
              ],
              dimensions: [{
                name: 'Time',
                hierarchies: [
                  {
                    name: '',
                    hasAll: true,
                    primaryKey: 'timeid',
                    levels: [
                      {
                        name: 'Year',
                        column: 'year',
                        uniqueMembers: true
                      }
                    ]
                  }
                ]
              }],
              measures: [
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
      {
        name: DUCKDB_WASM_MODEL.name,
        type: 'SQL',
        agentType: AgentType.Wasm
      }
    ]}
    factories={[
      {
        type: 'SQL',
        factory: importSQL
      }
    ]}
    >
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
          <Grid container spacing={2}>
            {cards.map(({ title, dataSettings, chartSettings, chartOptions }) => (
              <Grid item xs={8} sm={4}>
                <AnalyticalCard title={title}
                  dataSettings={dataSettings}
                  chartSettings={chartSettings}
                  chartOptions={chartOptions}/>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </OCAPCoreProvider>
  )
}

export default App
