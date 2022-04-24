// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss'
import {
  AgentType,
  ChartDimensionRoleType,
  DSCoreService,
  MockAgent,
  ReferenceLineAggregation,
  ReferenceLineType,
  ReferenceLineValueType
} from '@metad/ocap-core'
import { AnalyticalCard, AppContext } from '@metad/ocap-react'
import * as SQL from '@metad/ocap-sql'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import React, { useState } from 'react'
import { registerTheme } from 'echarts/core'
import { DEFAULT_THEME } from '@metad/ocap-echarts'

registerTheme(DEFAULT_THEME.name, DEFAULT_THEME.echartsTheme)

export function App() {
  const sss = SQL

  const [dataSettings, setDataSettings] = useState([
    {
      title: 'Sales Order Bar',
      dataSettings: {
        dataSource: 'Sales',
        entitySet: 'SalesOrder',
        chartAnnotation: {
          chartType: {
            type: 'Scatter3D'
          },
          dimensions: [
            {
              dimension: 'product',
              role: ChartDimensionRoleType.Stacked
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
      }
    },
    {
      title: 'Sales Order Bar',
      dataSettings: {
        dataSource: 'Sales',
        entitySet: 'SalesOrder',
        chartAnnotation: {
          chartType: {
            type: 'Bar'
          },
          dimensions: [
            {
              dimension: 'product',
              role: ChartDimensionRoleType.Stacked
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
      }
    },
    {
      title: 'Purchase Order Bar',
      dataSettings: {
        dataSource: 'Sales',
        entitySet: 'PurchaseOrder',
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
              measure: 'sales',
              palette: {
                name: 'PuOr',
                pattern: 1
              },
              referenceLines: [
                {
                  label: 'Sales Average',
                  type: ReferenceLineType.markLine,
                  valueType: ReferenceLineValueType.dynamic,
                  aggregation: ReferenceLineAggregation.average
                }
              ]
            }
          ]
        }
      }
    },
    {
      title: 'Sales Order Line',
      dataSettings: {
        dataSource: 'Sales',
        entitySet: 'SalesOrder',
        chartAnnotation: {
          chartType: {
            type: 'Line'
          },
          dimensions: [
            {
              dimension: 'product'
            },
            {
              dimension: 'productCategory',
              role: ChartDimensionRoleType.Trellis
            }
          ],
          measures: [
            {
              dimension: 'Measures',
              measure: 'sales'
            }
          ]
        }
      }
    },
    {
      title: 'Sales Order Two Measures',
      dataSettings: {
        dataSource: 'Sales',
        entitySet: 'SalesOrder',
        chartAnnotation: {
          chartType: {
            type: 'Bar'
          },
          dimensions: [
            {
              dimension: 'product',
            },
            {
              dimension: 'productCategory',
              role: ChartDimensionRoleType.Stacked
            },
          ],
          measures: [
            {
              dimension: 'Measures',
              measure: 'sales'
            },
            {
              dimension: 'Measures',
              measure: 'quantity'
            }
          ]
        }
      }
    },
    {
      title: 'Sales Order Treemap',
      dataSettings: {
        dataSource: 'Sales',
        entitySet: 'SalesOrder',
        chartAnnotation: {
          chartType: {
            type: 'Treemap'
          },
          dimensions: [
            {
              dimension: 'productCategory',
            },
            {
              dimension: 'product',
            },
          ],
          measures: [
            {
              dimension: 'Measures',
              measure: 'sales'
            }
          ]
        }
      }
    },
    {
      title: 'Sales Order Heatmap',
      dataSettings: {
        dataSource: 'Sales',
        entitySet: 'SalesOrder',
        chartAnnotation: {
          chartType: {
            type: 'Heatmap'
          },
          dimensions: [
            {
              dimension: 'productCategory',
            },
            {
              dimension: 'product',
              role: ChartDimensionRoleType.Category2
            },
          ],
          measures: [
            {
              dimension: 'Measures',
              measure: 'sales',
              palette: {
                name: 'PuOr'
              }
            }
          ]
        }
      }
    },
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

      <Container className={styles.appContainer}>
        <AppContext.Provider
          value={{
            coreService: new DSCoreService([new MockAgent()], {
              Sales: {
                name: 'Sales',
                type: 'SQL',
                agentType: AgentType.Browser
              }
            })
          }}
        >
          <Grid container spacing={2}>
            {dataSettings.map(({ title, dataSettings }) => (
              <Grid item xs={8} sm={3}>
                <Paper>
                  <AnalyticalCard title={title} dataSettings={dataSettings}  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </AppContext.Provider>
      </Container>
    </Box>
  )
}

export default App
