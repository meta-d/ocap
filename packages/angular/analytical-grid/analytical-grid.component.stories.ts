import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  NgmMissingTranslationHandler,
  OcapCoreModule,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN,
  OCAP_MODEL_TOKEN,
  NgmDSCoreService,
  DisplayDensity
} from '@metad/ocap-angular/core'
import { AgentType, C_MEASURES, DataSource, Type } from '@metad/ocap-core'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { CUBE_SALES_ORDER, MockAgent } from '../mock/agent-mock.service'
import { AnalyticalGridComponent } from './analytical-grid.component'
import { AnalyticalGridModule } from './analytical-grid.module'
import { CustomTranslateLoader } from '../core/i18n/loader.spec'
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    AnalyticalGridModule
  ],
  selector: 'ngm-story-component-switch-grid',
  template: `<button mat-button (click)="switch()">Switch</button>
  <ngm-analytical-grid style="width: 400px; height: 400px;"
    [dataSettings]="grid.dataSettings"
    [options]="grid.options"
  ></ngm-analytical-grid>
  `,
})
class GridsComponent {
  a = {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      analytics: {
        rows: [
          {
            dimension: '[Product]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      }
    }
  }
  b = {
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      analytics: {
        rows: [
          {
            dimension: '[Department]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      }
    }
  }
  grid = this.a
  switch() {
    if (this.grid === this.a) {
      this.grid = this.b
    } else {
      this.grid = this.a
    }
  }
}

export default {
  title: 'AnalyticalGridComponent',
  component: AnalyticalGridComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        TranslateModule.forRoot({
          missingTranslationHandler: {
            provide: MissingTranslationHandler,
            useClass: NgmMissingTranslationHandler
          },
          loader: { provide: TranslateLoader, useClass: CustomTranslateLoader },
          defaultLanguage: 'zh-Hans'
        }),
        AnalyticalGridModule,
        OcapCoreModule,

        GridsComponent
      ],
      providers: [
        NgmDSCoreService,
        {
          provide: OCAP_AGENT_TOKEN,
          useClass: MockAgent,
          multi: true
        },
        {
          provide: OCAP_DATASOURCE_TOKEN,
          useValue: {
            type: 'SQL',
            factory: async (): Promise<Type<DataSource>> => {
              const { SQLDataSource } = await import('@metad/ocap-sql')
              return SQLDataSource
            }
          },
          multi: true
        },
        {
          provide: OCAP_MODEL_TOKEN,
          useValue: {
            name: 'Sales',
            type: 'SQL',
            agentType: AgentType.Browser,
            settings: {
              ignoreUnknownProperty: true
            },
            schema: {
              cubes: [
                CUBE_SALES_ORDER,
                {
                  ...CUBE_SALES_ORDER,
                  name: 'SalesOrder10s'
                }
              ]
            }
          },
          multi: true
        }
      ]
    })
  ]
} as Meta<AnalyticalGridComponent<any>>

type Story = StoryObj<AnalyticalGridComponent<unknown>>
const render = (args) => ({
  props: args,
  styles: [`.ngm-analytical-grid {height: 400px;}`]
})

export const A1Primary: Story = {
  render,
  args: {
    title: 'Primary Analytical Grid',
    appearance: {},
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      analytics: {
        rows: [
          {
            dimension: '[Product]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      }
    },
    options: {}
  }
}

export const A2Sticky = {
  render,
  args: {
    title: 'Primary Analytical Grid',
    appearance: {},
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      analytics: {
        rows: [
          {
            dimension: '[Product]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      }
    },
    options: {
      sticky: true
    }
  }
}

export const A3StickyGrid = {
  render,
  args: {
    title: 'Primary Analytical Grid',
    appearance: {},
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      analytics: {
        rows: [
          {
            dimension: '[Product]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      }
    },
    options: {
      sticky: true,
      grid: true
    }
  }
}

export const Loading = {
  render,
  args: {
    title: 'Loading Analytical Grid',
    appearance: {},
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder10s',
      analytics: {
        rows: [
          {
            dimension: '[Product]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      }
    },
    options: {}
  }
}

export const DensityCompact = {
  render,
  args: {
    title: 'Analytical Grid compact',
    appearance: {
      displayDensity: DisplayDensity.compact
    },
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      analytics: {
        rows: [
          {
            dimension: '[Product]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      }
    },
    options: {}
  }
}

export const DisplayHierarchy = {
  render,
  args: {
    title: 'Analytical Grid Hierarchy',
    appearance: {
      displayDensity: DisplayDensity.compact
    },
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      analytics: {
        rows: [
          {
            dimension: '[Product]',
            displayHierarchy: true
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      }
    },
    options: {}
  }
}

export const ShowToolbar = {
  render,
  args: {
    title: 'Analytical Grid Show Toolbar',
    appearance: {},
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      analytics: {
        rows: [
          {
            dimension: '[Product]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      }
    },
    options: {
      showToolbar: true
    }
  }
}

export const Error = {
  render,
  args: {
    title: 'Analytical Grid Error',
    appearance: {},
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      analytics: {
        rows: [
          {
            dimension: '[Product]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales1'
          }
        ]
      }
    },
    options: {
      showToolbar: true
    }
  }
}

export const Paging = {
  render,
  args: {
    title: 'Primary Analytical Grid',
    appearance: {},
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      analytics: {
        rows: [
          {
            dimension: '[Product]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      }
    },
    options: {
      paging: true,
      pageSize: 3
    }
  }
}

export const PagingCompact = {
  render,
  args: {
    title: 'Primary Analytical Grid',
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      analytics: {
        rows: [
          {
            dimension: '[Product]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      }
    },
    options: {
      paging: true,
      pageSize: 3
    },
    appearance: {
      displayDensity: DisplayDensity.compact
    }
  }
}

export const PagingError = {
  render,
  args: {
    title: 'Primary Analytical Grid',
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      analytics: {
        rows: [
          {
            dimension: '[Product]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales1'
          }
        ]
      }
    },
    options: {
      paging: true,
      pageSize: 3,
      showToolbar: true
    },
    appearance: {
      displayDensity: DisplayDensity.compact
    }
  }
}

export const Sortable = {
  render,
  args: {
    title: 'Sortable',
    appearance: {},
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      analytics: {
        rows: [
          {
            dimension: '[Product]'
          },
          {
            dimension: '[Department]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      }
    },
    options: {
      sortable: true
    }
  }
}

export const MultipleMeasures = {
  render,
  args: {
  title: 'Multiple Measures Grid',
  appearance: {},
  dataSettings: {
    dataSource: 'Sales',
    entitySet: 'SalesOrder',
    analytics: {
      rows: [
        {
          dimension: '[Product]'
        }
      ],
      columns: [
        {
          dimension: '[Department]'
        },
        {
          dimension: C_MEASURES,
          measure: 'Sales'
        },
        {
          dimension: C_MEASURES,
          measure: 'Cost'
        }
      ]
    }
  },
  options: {}
}}

export const SwitchTemplate = {
  render: (args) => ({
    props: args,
    template: `<ngm-story-component-switch-grid></ngm-story-component-switch-grid>`,
  }),
  args: {

  }
}
