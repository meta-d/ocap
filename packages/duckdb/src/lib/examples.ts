import {
  AgentType,
  ChartDataZoomType,
  ChartDimensionRoleType,
  ChartMeasureRoleType,
  ChartOptions,
  OrderDirection,
  ReferenceLineAggregation,
  ReferenceLineType,
  ReferenceLineValueType,
  SemanticModel,
  Semantics,
  Syntax
} from '@metad/ocap-core'


export const DUCKDB_WASM_MODEL: SemanticModel = {
  name: 'WASM',
  type: 'SQL',
  agentType: AgentType.Wasm,
  syntax: Syntax.SQL,
  dialect: 'duckdb',
  catalog: 'main',
  tables: [
    {
      name: 'Countries',
      type: 'csv',
      sourceUrl: window.location.origin + '/assets/data/ISO-3166-Countries.csv',
      delimiter: ','
    },
    {
      name: 'CsseCovid19Daily',
      type: 'csv',
      sourceUrl: window.location.origin + '/assets/data/CsseCovid19Daily_05-18-2022.csv',
      // 'https://cdn.jsdelivr.net/gh/CSSEGISandData/COVID-19@master/csse_covid_19_data/csse_covid_19_daily_reports/04-28-2022.csv',
      delimiter: ','
    },
    {
      name: 'CountryGDP',
      type: 'csv',
      sourceUrl: window.location.origin + '/assets/data/GDPPerCapita.csv'
      //`https://cdn.jsdelivr.net/gh/curran/data@gh-pages/worldFactbook/GDPPerCapita.csv`
    },
    {
      name: 'UserData',
      type: 'parquet',
      sourceUrl: window.location.origin + '/assets/data/userdata1.parquet'
      //'https://cdn.jsdelivr.net/gh/Teradata/kylo@master/samples/sample-data/parquet/userdata1.parquet'
    },
    {
      name: 'HREmployeeAttrition',
      type: 'csv',
      sourceUrl: window.location.origin + '/assets/data/HR-Employee-Attrition.csv'
      // 'https://cdn.jsdelivr.net/gh/ashutoshtyagixyz/HR-Employee-Attrition@main/HR-Employee-Attrition.csv'
    }
  ],
  schema: {
    name: 'duckdb',
    dimensions: [
      {
        name: 'Country',
        label: '国家',
        hierarchies: [
          {
            name: '',
            label: '国家',
            tables: [
              {
                name: 'Countries'
              }
            ],
            primaryKey: 'name',
            hasAll: true,
            levels: [
              {
                name: 'Region',
                column: 'region',
                label: '地区'
              },
              {
                name: 'Sub Region',
                column: 'sub-region',
                label: '子区域'
              },
              {
                name: 'Name',
                column: 'name',
                label: '国家'
              }
            ]
          },
          {
            name: 'Region',
            label: '地区',
            tables: [
              {
                name: 'Countries'
              }
            ],
            primaryKey: 'name',
            hasAll: true,
            levels: [
              {
                name: 'Region',
                column: 'region',
                label: '地区'
              },
              {
                name: 'Name',
                column: 'name',
                label: '国家'
              }
            ]
          }
        ]
      }
    ],
    cubes: [
      {
        name: 'Covid19Daily',
        defaultMeasure: 'Confirmed',
        tables: [
          {
            name: 'CsseCovid19Daily'
          }
        ],
        dimensionUsages: [
          {
            name: 'Country',
            source: 'Country',
            foreignKey: 'Country_Region'
          }
        ],
        dimensions: [
          {
            name: 'Country Region',
            label: '国家',
            hierarchies: [
              {
                name: '',
                levels: [
                  {
                    name: 'Name',
                    label: '名称',
                    column: 'Country_Region',
                  },
                ]
              }
            ]
          },
          {
            name: 'Admin',
            label: '管理员',
            hierarchies: [
              {
                name: '',
                levels: [
                  {
                    name: 'Name',
                    column: 'Admin2'
                  }
                ]
              }
            ]
          }
        ],
        measures: [
          {
            name: 'Confirmed',
            column: 'Confirmed',
            label: '确诊'
          },
          {
            name: 'Deaths',
            column: 'Deaths',
            label: '死亡'
          },
          {
            name: 'CaseFatalityRatio',
            column: 'Case_Fatality_Ratio',
            label: '病死率'
          }
        ]
      },
      {
        name: 'UserData',
        defaultMeasure: 'salary',
        tables: [
          {
            name: 'UserData'
          }
        ],
        dimensions: [
          {
            name: 'Country',
            label: '国家',
            hierarchies: [
              {
                name: '',
                levels: [
                  {
                    name: 'Name',
                    column: 'country'
                  }
                ]
              }
            ]
          },
          {
            name: 'Gender',
            label: '性别',
            hierarchies: [
              {
                name: '',
                levels: [
                  {
                    name: 'Name',
                    column: 'gender'
                  }
                ]
              }
            ]
          }
        ],
        measures: [
          {
            name: 'salary',
            column: 'salary',
            label: '薪金'
          }
        ]
      },
      {
        name: 'HREmployeeAttrition',
        defaultMeasure: 'EnvironmentSatisfaction',
        tables: [
          {name: 'HREmployeeAttrition'}
        ],
        dimensions: [
          {
            name: 'Department',
            label: '部门',
            hierarchies: [
              {
                name: '',
                levels: [
                  {
                    name: 'Name',
                    column: 'Department'
                  }
                ]
              }
            ]
          },
          {
            name: 'Job Role',
            label: '职位',
            hierarchies: [
              {
                name: '',
                levels: [
                  {
                    name: 'Name',
                    column: 'JobRole'
                  }
                ]
              }
            ]
          }
        ],
        measures: [
          {
            name: 'EnvironmentSatisfaction',
            label: '环境满意度',
            column: 'EnvironmentSatisfaction',
          }
        ]
      },
      {
        name: 'CountryGDP',
        defaultMeasure: 'GDP',
        tables: [
          {name: 'CountryGDP'}
        ],
        dimensions: [
          {
            name: 'Country',
            label: '国家',
            foreignKey: 'Country',
            hierarchies: [
              {
                name: '',
                tables: [
                  {
                    name: 'Countries',
                  }
                ],
                primaryKey: 'name',
                levels: [
                  {
                    name: 'Region',
                    label: '区域',
                    column: 'region',
                  },
                  {
                    name: 'Name',
                    label: '国家',
                    column: 'name',
                  }
                ]
              }
            ]
          }
        ],
        measures: [
          {
            name: 'GDP',
            label: '国民生产总值',
            column: 'GDP Per Capita'
          }
        ]
      }
    ]
  }
}

export const DUCKDB_FOODMART_MODEL: SemanticModel = {
  name: 'FOODMART',
  type: 'SQL',
  agentType: AgentType.Wasm,
  syntax: Syntax.SQL,
  dialect: 'duckdb',
  catalog: 'foodmart',
  tables: [
    {
      name: 'sales_fact',
      type: 'csv',
      sourceUrl: window.location.origin + '/assets/data/foodmart/sales_fact.csv',
      delimiter: ','
    },
    {
      name: 'product',
      type: 'csv',
      sourceUrl: window.location.origin + '/assets/data/foodmart/product.csv',
      delimiter: ','
    },
    {
      name: 'product_class',
      type: 'csv',
      sourceUrl: window.location.origin + '/assets/data/foodmart/product_class.csv',
      delimiter: ','
    },
    {
      name: 'time_by_day',
      type: 'csv',
      sourceUrl: window.location.origin + '/assets/data/foodmart/time_by_day.csv',
      delimiter: ','
    },
    {
      name: 'store',
      type: 'csv',
      sourceUrl: window.location.origin + '/assets/data/foodmart/store.csv',
      delimiter: ','
    }
  ],
  schema: {
    name: 'Foodmart',
    dimensions: [
      {
				__id__: '590d2e4a-ef71-49e4-b53f-36100cc5b004',
				name: 'Time',
				label: '日历',
				semantics: {
					semantic: Semantics['Calendar']
				},
				hierarchies: [
					{
						__id__: 'cfdc9bab-46e4-4220-8cdf-44f1b5c7145c',
						name: '',
						label: '日历',
						hasAll: true,
						primaryKey: 'time_id',
						tables: [{ name: 'time_by_day' }],
						levels: [
							{
								__id__: 'c3dc9239-8729-40bb-8e28-1c0a05d29834',
								column: 'the_year',
								name: 'Year',
								label: '年',
								uniqueMembers: true,
								nameColumn: null,
								parentColumn: null,
								nullParentValue: null,
								levelType: 'TimeYears',
								semantics: {
									semantic: Semantics['Calendar.Year'],
									formatter: '[yyyy]'
								}
							},
							{
								__id__: 'b5a0d2b8-c853-4480-bbaa-59a073b53047',
								column: 'quarter',
								name: 'Quarter',
								label: '季度',
								uniqueMembers: null,
								nameColumn: null,
								parentColumn: null,
								nullParentValue: null,
								levelType: 'TimeQuarters',
								semantics: {
									semantic: Semantics['Calendar.Quarter'],
									formatter: "[yyyy].['Q'Q]"
								},
								captionColumn: null,
								ordinalColumn: null,
							},
							{
								__id__: 'cc0f564e-73ef-4761-bac7-2daa83cb7487',
								column: 'month_of_year',
								name: 'Month',
								label: '月',
								nameColumn: null,
								uniqueMembers: null,
								parentColumn: null,
								nullParentValue: null,
								levelType: 'TimeMonths',
								semantics: {
									semantic: Semantics['Calendar.Month'],
									formatter: "[yyyy].['Q'Q].[M]"
								},
								captionColumn: 'the_month',
								ordinalColumn: 'month_of_year'
							},
							{
								__id__: 'a8f5b556-e278-42ba-8b8d-fcfdab8538c2',
								column: 'the_date',
								name: 'Day',
								label: '日期',
								uniqueMembers: true,
								nameColumn: null,
								parentColumn: null,
								nullParentValue: null,
								levelType: 'TimeDays',
								semantics: {
									semantic: Semantics['Calendar.Day'],
									formatter: "[yyyy].['Q'Q].[M].[yyyy-MM-dd]"
								}
							}
						]
					},
					{
						__id__: '121096fb-bf4e-42c4-a776-c52c87fcf73c',
						label: '周日历',
						hasAll: true,
						name: 'Weekly',
						allMemberName: null,
						tables: [{ name: 'time_by_day' }],
						primaryKey: 'time_id',
						levels: [
							{
								__id__: '651b5863-ade3-4e97-a384-f9d778550927',
								column: 'the_year',
								name: 'Year',
								label: '年',
								uniqueMembers: true,
								nameColumn: null,
								captionColumn: null,
								parentColumn: null,
								nullParentValue: null,
								levelType: 'TimeYears',
								semantics: { semantic: Semantics['Calendar.Year'] }
							},
							{
								__id__: '3a35e9a2-b908-404a-bb11-8ba8404b1cfd',
								column: 'week_of_year',
								name: 'Week',
								label: '周',
								uniqueMembers: null,
								nameColumn: null,
								captionColumn: null,
								parentColumn: null,
								nullParentValue: null,
								levelType: 'TimeWeeks',
								semantics: {
									semantic: Semantics['Calendar.Week'],
									formatter: '[yyyy].[W]'
								}
							},
							{
								__id__: '381b0a26-dbc1-41bb-bc5d-d9c61c17d9f0',
								column: 'day_of_month',
								name: 'Day',
								label: '日',
								uniqueMembers: null,
								nameColumn: null,
								captionColumn: null,
								parentColumn: null,
								nullParentValue: null,
								levelType: 'TimeDays',
								semantics: {
									semantic: Semantics['Calendar.Day'],
									formatter: '[yyyy].[W].[Do]'
								}
							}
						]
					}
				]
			},
      {
				__id__: '3571a32a-1365-4e7f-875e-6520537f5b48',
				name: 'Product',
				label: '产品',
				hierarchies: [
					{
						__id__: '8531da03-2485-4281-ba4f-678c0fb25e15',
            name: '',
						label: '产品',
						hasAll: true,
						primaryKey: 'product_id',
						tables: [{ name: 'product' }],
						levels: [
							{
								__id__: '1e8f6622-6ce2-4187-8ae6-0be581614804',
								column: 'brand_name',
								properties: [],
								name: 'Brand Name',
								label: '品牌',
								uniqueMembers: true,
								nameColumn: null,
								captionColumn: null,
								ordinalColumn: null,
								parentColumn: null,
								nullParentValue: null,
								table: 'product'
							},
							{
								__id__: 'c13911a4-d8b2-486e-afc7-894c21079b95',
								column: 'product_id',
								properties: [
									{
										propertyExpression: {
											sql: { dialect: null, content: null }
										},
										column: 'SKU',
										name: 'SKU'
									},
									{
										propertyExpression: {
											sql: { dialect: null, content: null }
										},
										column: 'gross_weight',
										name: 'Gross Weight'
									},
									{
										propertyExpression: {
											sql: { dialect: null, content: null }
										},
										column: 'shelf_width',
										name: 'Shelf Width'
									}
								],
								name: 'Product',
								label: '产品',
								nameColumn: 'product_name',
								uniqueMembers: null,
								captionColumn: null,
								ordinalColumn: null,
								parentColumn: null,
								nullParentValue: null,
								table: 'product'
							}
						]
					}
				]
			},
      {
				__id__: 'eb021021-67d9-47de-8064-00aa3c48406d',
				name: 'Store',
				label: '门店',
				hierarchies: [
					{
						__id__: 'dfeac13b-25c7-4965-897a-e3360daca284',
            name: '',
						label: '门店',
						hasAll: true,
						primaryKey: 'store_id',
						tables: [{ name: 'store' }],
						levels: [
							{
								__id__: '8d722b98-890d-4da6-a02c-ff4dd06c765a',
								column: 'store_country',
								name: 'Store Country',
								label: '国家',
								uniqueMembers: true
							},
							{
								__id__: 'f938b36a-52d1-4ec4-b366-7783ebd219b7',
								column: 'store_state',
								name: 'Store State',
								label: '州',
								uniqueMembers: true
							},
							{
								__id__: '26d29c49-1ce4-497e-b875-6c5cb59f8563',
								column: 'store_city',
								name: 'Store City',
								label: '城市'
							},
							{
								__id__: 'f55d7ed2-9b7d-446c-a310-031aac140d9d',
								column: 'store_name',
								name: 'Store Name',
								label: '门店',
								uniqueMembers: true,
								nameColumn: null,
								captionColumn: null,
								ordinalColumn: null,
								parentColumn: null,
								nullParentValue: null,
								properties: [
									{
										name: 'Store Type',
										column: 'store_type'
									},
									{
										name: 'Store Manager',
										column: 'store_manager'
									},
									{
										name: 'Store Sqft',
										column: 'store_sqft'
									}
								]
							}
						]
					}
				]
			},
			{
				__id__: 'GdMqSsXRlg',
				name: 'Customers',
				label: '客户',
				hierarchies: [
					{
						__id__: 'CPUm6y9CDL',
						label: '客户',
						hasAll: true,
						primaryKey: 'customer_id',
						tables: [
							{ join: null, name: 'customer' },
							{
								join: { type: 'Inner', fields: [{ leftKey: 'country_id', rightKey: 'location_id' }] },
								name: 'locations'
							}
						],
						name: '',
						allMemberName: null,
						primaryKeyTable: 'customer',
						defaultMember: null,
						levels: [
							{
								name: 'Country',
								label: '国家',
								column: 'location_id',
								uniqueMembers: null,
								nameColumn: 'location_name',
								captionColumn: null,
								ordinalColumn: null,
								parentColumn: null,
								nullParentValue: null,
								table: 'locations',
								levelType: null,
								parentChild: null,
								properties: [
									{
										name: 'Long',
										column: 'longitude',
										propertyExpression: { sql: { dialect: null, content: null } }
									},
									{
										name: 'Lat',
										column: 'latitude',
										propertyExpression: { sql: { dialect: null, content: null } }
									}
								],
								semantics: null,
								captionExpression: null,
								__id__: 'rdPa4d4P4T'
							},
							{
								name: 'State Province',
								label: '省市',
								column: 'state_province',
								uniqueMembers: null,
								nameColumn: null,
								captionColumn: null,
								ordinalColumn: null,
								parentColumn: null,
								nullParentValue: null,
								table: 'customer',
								levelType: null,
								parentChild: null,
								properties: [],
								semantics: null,
								captionExpression: null,
								__id__: 'hwEWWvzK60'
							},
							{
								name: 'City',
								label: '城市',
								column: 'city',
								uniqueMembers: null,
								nameColumn: null,
								captionColumn: null,
								ordinalColumn: null,
								parentColumn: null,
								nullParentValue: null,
								table: 'customer',
								levelType: null,
								parentChild: null,
								properties: [],
								semantics: null,
								captionExpression: null,
								__id__: '0wHSfMK7Ci'
							},
							{
								name: 'Name',
								label: '客户',
								column: 'customer_id',
								uniqueMembers: null,
								nameColumn: 'fullname',
								captionColumn: null,
								ordinalColumn: null,
								parentColumn: null,
								nullParentValue: null,
								table: 'customer',
								levelType: null,
								parentChild: null,
								semantics: null,
								captionExpression: null,
								__id__: 'PAKSaiknpS',
								properties: [
									{
										propertyExpression: {
											sql: {}
										},
										name: 'Gender',
										column: 'gender'
									},
									{
										propertyExpression: {
											sql: {}
										},
										name: 'Marital Status',
										column: 'marital_status'
									},
									{
										propertyExpression: {
											sql: {}
										},
										name: 'Education',
										column: 'education'
									},
									{
										propertyExpression: {
											sql: {}
										},
										name: 'Yearly Income',
										column: 'yearly_income'
									}
								]
							}
						]
					}
				],
				column: null,
				foreignKey: null,
				type: null,
				role: null,
				defaultHierarchy: null,
				caption: null,
				keyExpression: null,
				semantics: null
			}
    ],
    cubes: [
			{
				__id__: 'a182caa2-f361-44a2-b245-d0cc314f4603',
				name: 'Sales',
				label: '销售',
        defaultMeasure: 'Sales',
				tables: [{ name: 'sales_fact' }],
				dimensions: [
					{
						__id__: '0883487e-afdc-439e-9da3-c734a7e44ea7',
						name: 'Promotions',
						foreignKey: 'promotion_id',
						type: '',
						label: '促销活动',
						hierarchies: [
							{
								__id__: 'c1ae6a6b-29e4-4995-867b-6147cf29f938',
								name: '',
								hasAll: true,
								label: null,
								allMemberName: null,
								tables: [{ name: 'promotion' }],
								primaryKey: 'promotion_id',
								levels: [
									{
										__id__: '725f187e-bf22-4f69-bc3d-ce67db86e236',
										name: 'Promotion Name',
										label: '',
										column: 'promotion_id',
										uniqueMembers: true,
										nameColumn: 'promotion_name'
									}
								]
							}
						]
					},
				],
				measures: [
					{
						__id__: '1c05abfc-56e1-46c8-a312-01a4915b1ff9',
						name: 'Sales',
						aggregator: 'sum',
						column: 'store_sales',
						caption: 'Sales'
					},
					{
						__id__: 'a1eebb49-c622-455f-b43e-f35764757e2f',
						name: 'Cost',
						aggregator: 'sum',
						caption: 'Cost',
						column: 'store_cost'
					}
				],
				dimensionUsages: [
					{
						name: 'Time',
						source: 'Time',
						__id__: '22f3cdd3-c6d6-42a1-a312-6d75c7b40d8b',
						foreignKey: 'time_id'
					},
					{
						name: 'Store',
						source: 'Store',
						__id__: 'c00de261-7501-4390-88dd-78f778f5cbda',
						foreignKey: 'store_id'
					},
					{
						name: 'Product',
						source: 'Product',
						__id__: '946add05-8830-4519-aff1-768d4aa17f49',
						foreignKey: 'product_id'
					},
					{
						name: 'Customers',
						source: 'Customers',
						__id__: '946add05-8830-4519-aff1-768d4aa17f50',
						foreignKey: 'customer_id'
					}
				],
				calculatedMembers: [
					{
						__id__: '4cebad52-3508-4365-b9cc-675be4a40aed',
						name: 'Profit',
						dimension: 'Measures',
						caption: 'Profit',
						visible: true,
						formula: '[Measures].[Sales] - [Measures].[Cost]'
					},
					{
						__id__: '52023f45-6920-4186-b99d-e5c8d1226009',
						name: 'Profit last Period',
						dimension: 'Measures',
						visible: true,
						formula: 'CoalesceEmpty((Measures.[Profit], [Time].PrevMember), Measures.[Profit])',
						caption: 'Profit last Period'
					},
					{
						__id__: '0b4d5ee8-9eb9-4cb2-a328-afa4360039ad',
						name: 'Profit Growth',
						dimension: 'Measures',
						visible: true,
						caption: 'Profit Growth',
						formula:
							'([Measures].[Profit] - [Measures].[Profit last Period]) / [Measures].[Profit last Period]'
					}
				]
			}
    ]
  }
}

export const CARTESIAN_CARDS = [
  {
    title: 'Sales Order Pie',
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      chartAnnotation: {
        chartType: {
          type: 'Pie'
        },
        dimensions: [
          {
            dimension: '[productCategory]'
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'sales'
          }
        ]
      }
    },
    chartSettings: {},
    chartOptions: {} as ChartOptions
  },
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
          },
          {
            dimension: 'Measures',
            measure: 'quantity',
            role: ChartMeasureRoleType.Size
          }
        ]
      }
    },
    chartSettings: {},
    chartOptions: {} as ChartOptions
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
    },
    chartSettings: {},
    chartOptions: {} as ChartOptions
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
    },
    chartSettings: {
      universalTransition: true
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
            dimension: 'product'
          },
          {
            dimension: 'productCategory',
            role: ChartDimensionRoleType.Stacked
          }
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
    },
    chartSettings: {
      universalTransition: true
    },
    chartOptions: {
      tooltip: {
        trigger: 'axis'
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
            dimension: 'productCategory'
          },
          {
            dimension: 'product'
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'sales'
          }
        ]
      }
    },
    chartSettings: {
      universalTransition: true
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
            dimension: 'productCategory'
          },
          {
            dimension: 'product',
            role: ChartDimensionRoleType.Category2
          }
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
    },
    chartSettings: {
      universalTransition: true
    }
  },
  {
    title: 'Sales Order Scatter',
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      chartAnnotation: {
        chartType: {
          type: 'Scatter'
        },
        dimensions: [
          {
            dimension: 'productCategory',
            role: ChartDimensionRoleType.Trellis
          },
          {
            dimension: 'product'
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'sales',
            palette: {
              name: 'PuOr'
            }
          },
          {
            dimension: 'Measures',
            measure: 'quantity'
            // role: ChartMeasureRoleType.Size
          }
        ]
      }
    },
    chartSettings: {
      universalTransition: true
    }
  },
  {
    title: 'Sales Order Sankey',
    dataSettings: {
      dataSource: 'Sales',
      entitySet: 'SalesOrder',
      chartAnnotation: {
        chartType: {
          type: 'Sankey'
        },
        dimensions: [
          {
            dimension: 'productCategory'
          },
          {
            dimension: 'product'
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'sales'
          }
        ]
      }
    },
    chartSettings: {
      universalTransition: true
    }
  }
]

export const ANALYTICAL_CARDS = [
  // ...CARTESIAN_CARDS,
  {
    title: 'Csse Covid-19 Daily',
    dataSettings: {
      dataSource: 'WASM',
      entitySet: 'Covid19Daily',
      chartAnnotation: {
        chartType: {
          type: 'Bar'
        },
        dimensions: [
          {
            dimension: '[Country]'
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Confirmed',
            formatting: {
              shortNumber: true
            }
          },
          {
            dimension: 'Measures',
            measure: 'Deaths'
          },
          {
            dimension: 'Measures',
            measure: 'CaseFatalityRatio',
            role: ChartMeasureRoleType.Axis2,
            formatting: {
              unit: '%'
            }
          }
        ]
      },
      presentationVariant: {
        sortOrder: [
          {
            by: 'Confirmed',
            order: OrderDirection.DESC
          }
        ]
      }
    },
    chartSettings: {
      universalTransition: true
    },
    chartOptions: {
      seriesStyle: {
        selectedMode: 'single'
      },
      dataZoom: {
        type: ChartDataZoomType.INSIDE
      }
    } as ChartOptions
  },
  {
    title: 'UserData Stacked Bar',
    dataSettings: {
      dataSource: 'WASM',
      entitySet: 'UserData',
      chartAnnotation: {
        chartType: {
          type: 'Bar'
        },
        dimensions: [
          {
            dimension: '[Country]',
            zeroSuppression: true
          },
          {
            dimension: '[Gender]',
            role: ChartDimensionRoleType.Stacked
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'salary',
            formatting: {
              shortNumber: true
            }
          }
        ]
      },
      presentationVariant: {
        sortOrder: [
          {
            by: 'salary',
            order: OrderDirection.DESC
          }
        ]
      }
    },
    chartSettings: {
      locale: 'zh-Hans',
      digitInfo: '0.3'
    },
    chartOptions: {
      dataZoom: {
        type: ChartDataZoomType.INSIDE
      }
    } as ChartOptions
  },
  {
    title: 'HREmployeeAttrition Stacked Bar',
    dataSettings: {
      dataSource: 'WASM',
      entitySet: 'HREmployeeAttrition',
      chartAnnotation: {
        chartType: {
          type: 'Bar'
        },
        dimensions: [
          {
            dimension: '[Department]',
            zeroSuppression: true
          },
          {
            dimension: '[Job Role]',
            role: ChartDimensionRoleType.Stacked
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'EnvironmentSatisfaction',
            formatting: {
              shortNumber: true
            }
          }
        ]
      }
      // presentationVariant: {
      //   sortOrder: [
      //     {
      //       by: 'salary',
      //       order: OrderDirection.DESC
      //     }
      //   ]
      // }
    },
    chartSettings: {},
    chartOptions: {
      dataZoom: {
        type: ChartDataZoomType.INSIDE
      }
    } as ChartOptions
  },
  {
    title: 'Country GDP',
    dataSettings: {
      dataSource: 'WASM',
      entitySet: 'CountryGDP',
      chartAnnotation: {
        chartType: {
          type: 'GeoMap',
          map: 'World',
          mapUrl: window.location.origin + '/assets/data/countries.geo.json', // `https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json`,
          projection: 'NaturalEarth1'
        },
        dimensions: [
          {
            dimension: '[Country]'
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'GDP',
            formatting: {
              shortNumber: true
            }
          }
        ]
      }
    },
    chartSettings: {},
    chartOptions: {}
  },
  {
    title: 'Csse Covid-19 Daily',
    dataSettings: {
      dataSource: 'WASM',
      entitySet: 'Covid19Daily',
      chartAnnotation: {
        chartType: {
          type: 'GeoMap',
          map: 'World',
          mapUrl: window.location.origin + '/assets/data/countries.geo.json', // `https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json`,
          projection: 'NaturalEarth1'
        },
        dimensions: [
          {
            dimension: '[Country]'
          },
          {
            dimension: 'Lat',
            role: ChartDimensionRoleType.Lat
          },
          {
            dimension: 'Long_',
            role: ChartDimensionRoleType.Long
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Confirmed',
            shapeType: 'scatter',
            formatting: {
              shortNumber: true
            }
          }
        ]
      },
      selectionVariant: {
        selectOptions: [
          {
            dimension: {
              dimension: 'Country_Region'
            },
            exclude: true,
            members: [
              {
                value: 'US'
              }
            ]
          }
        ]
      }
    },
    chartSettings: {},
    chartOptions: {}
  },
  {
    title: 'Csse Covid-19 Daily',
    dataSettings: {
      dataSource: 'WASM',
      entitySet: 'CsseCovid19Daily',
      chartAnnotation: {
        chartType: {
          type: 'GeoMap',
          map: 'World',
          mapUrl: window.location.origin + '/assets/data/countries.geo.json', // `https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json`,
          projection: 'NaturalEarth1'
        },
        dimensions: [
          {
            dimension: 'Country_Region'
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Incident_Rate',
            formatting: {
              shortNumber: true
            }
          }
        ]
      },
      selectionVariant: {
        selectOptions: [
          {
            dimension: {
              dimension: 'Country_Region'
            },
            exclude: true,
            members: [
              {
                value: 'US'
              }
            ]
          }
        ]
      }
    }
  },
  {
    title: 'Csse Covid-19 Daily',
    dataSettings: {
      dataSource: 'WASM',
      entitySet: 'CsseCovid19Daily',
      chartAnnotation: {
        chartType: {
          type: 'GeoMap',
          map: 'USA',
          mapUrl: window.location.origin + '/assets/data/us-states.json', // `https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json`,
          projection: 'AlbersUsa'
        },
        dimensions: [
          {
            dimension: 'Province_State'
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Incident_Rate',
            formatting: {
              shortNumber: true
            }
          }
        ]
      },
      selectionVariant: {
        selectOptions: [
          {
            dimension: {
              dimension: 'Country_Region'
            },
            members: [
              {
                value: 'US'
              }
            ]
          }
        ]
      }
    }
  },
  {
    title: 'Csse Covid-19 Daily',
    dataSettings: {
      dataSource: 'WASM',
      entitySet: 'CsseCovid19Daily',
      chartAnnotation: {
        chartType: {
          type: 'GeoMap',
          map: 'USA',
          mapUrl: window.location.origin + '/assets/data/us-states.json' // `https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json`
        },
        dimensions: [
          {
            dimension: 'Province_State'
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Confirmed',
            formatting: {
              shortNumber: true
            }
          }
          // {
          //   dimension: 'Measures',
          //   measure: 'Deaths'
          // },
          // {
          //   dimension: 'Measures',
          //   measure: 'Case_Fatality_Ratio',
          //   role: ChartMeasureRoleType.Axis2,
          //   formatting: {
          //     unit: '%'
          //   }
          // }
        ]
      },
      selectionVariant: {
        selectOptions: [
          {
            dimension: {
              dimension: 'Country_Region'
            },
            members: [
              {
                value: 'US'
              }
            ]
          }
        ]
      },
      presentationVariant: {
        sortOrder: [
          {
            by: 'Confirmed',
            order: OrderDirection.DESC
          }
        ]
      }
    },
    chartSettings: {
      universalTransition: true
    },
    chartOptions: {
      dataZoom: {
        type: ChartDataZoomType.INSIDE
      }
    } as ChartOptions
  },
  {
    title: 'Covid19Daily Trellis',
    dataSettings: {
      dataSource: 'WASM',
      entitySet: 'Covid19Daily',
      chartAnnotation: {
        chartType: {
          type: 'Bar'
        },
        dimensions: [
          {
            dimension: '[Country Region]',
            
          },
          {
            dimension: '[Country]',
            hierarchy: '[Country]',
            level: '[Country].[Region]',
            role: ChartDimensionRoleType.Trellis
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Confirmed',
            palette: {
              name: 'PuOr'
            },
            formatting: {
              shortNumber: true
            }
          },
          {
            dimension: 'Measures',
            measure: 'Deaths'
            // role: ChartMeasureRoleType.Size
          }
        ]
      }
    },
    chartSettings: {
      universalTransition: true
    }
  }
]
