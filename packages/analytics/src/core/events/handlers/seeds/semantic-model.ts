export const SEMANTIC_MODEL_NAME = 'Demo - FoodMart Model'
export const SEMANTIC_MODEL = {
	schema: {
		name: SEMANTIC_MODEL_NAME,
		dimensions: [
			{
				__id__: '590d2e4a-ef71-49e4-b53f-36100cc5b004',
				name: 'Time',
				caption: '日历',
				semantics: {
					semantic: 'Calendar'
				},
				hierarchies: [
					{
						__id__: 'cfdc9bab-46e4-4220-8cdf-44f1b5c7145c',
						name: '',
						caption: '日历',
						hasAll: true,
						primaryKey: 'time_id',
						tables: [{ name: 'time_by_day' }],
						levels: [
							{
								__id__: 'c3dc9239-8729-40bb-8e28-1c0a05d29834',
								column: 'the_year',
								name: 'Year',
								type: 'Integer',
								caption: '年',
								uniqueMembers: true,
								nameColumn: null,
								parentColumn: null,
								nullParentValue: null,
								levelType: 'TimeYears',
								semantics: {
									semantic: 'Calendar.Year',
									formatter: '[yyyy]'
								}
							},
							{
								__id__: 'b5a0d2b8-c853-4480-bbaa-59a073b53047',
								column: 'quarter',
								name: 'Quarter',
								caption: '季度',
								uniqueMembers: null,
								nameColumn: null,
								parentColumn: null,
								nullParentValue: null,
								levelType: 'TimeQuarters',
								semantics: {
									semantic: 'Calendar.Quarter',
									formatter: "[yyyy].['Q'Q]"
								},
								captionColumn: null,
								ordinalColumn: null,
								captionExpression: {
									sql: { dialect: 'generic', _: '"the_year" || "quarter"' }
								}
							},
							{
								__id__: 'cc0f564e-73ef-4761-bac7-2daa83cb7487',
								column: 'month_of_year',
								type: 'Integer',
								name: 'Month',
								caption: '月',
								nameColumn: null,
								uniqueMembers: null,
								parentColumn: null,
								nullParentValue: null,
								levelType: 'TimeMonths',
								semantics: {
									semantic: 'Calendar.Month',
									formatter: "[yyyy].['Q'Q].[M]"
								},
								captionColumn: 'the_month',
								ordinalColumn: 'month_of_year',
								captionExpression: {
									sql: { dialect: 'generic', _: '"the_year"::varchar || "month_of_year"::varchar' }
								}
							},
							{
								__id__: 'a8f5b556-e278-42ba-8b8d-fcfdab8538c2',
								column: 'the_date',
								name: 'Day',
								caption: '日期',
								uniqueMembers: true,
								nameColumn: null,
								parentColumn: null,
								nullParentValue: null,
								levelType: 'TimeDays',
								semantics: {
									semantic: 'Calendar.Day',
									formatter: "[yyyy].['Q'Q].[M].[yyyy-MM-dd]"
								}
							}
						]
					},
					{
						__id__: '121096fb-bf4e-42c4-a776-c52c87fcf73c',
						caption: '周日历',
						hasAll: true,
						name: 'Weekly',
						allMemberName: null,
						tables: [{ name: 'time_by_day' }],
						primaryKey: 'time_id',
						levels: [
							{
								__id__: '651b5863-ade3-4e97-a384-f9d778550927',
								column: 'the_year',
								type: 'Integer',
								name: 'Year',
								caption: '年',
								uniqueMembers: true,
								nameColumn: null,
								captionColumn: null,
								parentColumn: null,
								nullParentValue: null,
								levelType: 'TimeYears',
								semantics: { semantic: 'Calendar.Year' }
							},
							{
								__id__: '3a35e9a2-b908-404a-bb11-8ba8404b1cfd',
								column: 'week_of_year',
								type: 'Integer',
								name: 'Week',
								caption: '周',
								uniqueMembers: null,
								nameColumn: null,
								captionColumn: null,
								parentColumn: null,
								nullParentValue: null,
								levelType: 'TimeWeeks',
								semantics: {
									semantic: 'Calendar.Week',
									formatter: '[yyyy].[W]'
								}
							},
							{
								__id__: '381b0a26-dbc1-41bb-bc5d-d9c61c17d9f0',
								column: 'day_of_month',
								type: 'Integer',
								name: 'Day',
								caption: '日',
								uniqueMembers: null,
								nameColumn: null,
								captionColumn: null,
								parentColumn: null,
								nullParentValue: null,
								levelType: 'TimeDays',
								semantics: {
									semantic: 'Calendar.Day',
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
				caption: '产品',
				hierarchies: [
					{
						__id__: '8531da03-2485-4281-ba4f-678c0fb25e15',
						caption: '产品',
						hasAll: true,
						primaryKey: 'product_id',
						tables: [{ name: 'product' }],
						levels: [
							{
								__id__: '1e8f6622-6ce2-4187-8ae6-0be581614804',
								column: 'brand_name',
								properties: [],
								name: 'Brand Name',
								caption: '品牌',
								uniqueMembers: true,
								__Attributes__: {},
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
											SQL: { dialect: null, _: null }
										},
										column: 'SKU',
										name: 'SKU'
									},
									{
										propertyExpression: {
											SQL: { dialect: null, _: null }
										},
										column: 'gross_weight',
										name: 'Gross Weight'
									},
									{
										propertyExpression: {
											SQL: { dialect: null, _: null }
										},
										column: 'shelf_width',
										name: 'Shelf Width'
									}
								],
								name: 'Product',
								caption: '产品',
								nameColumn: 'product_name',
								__Attributes__: {},
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
				__id__: 'd42ab7ff-83ed-42ee-9a18-035cea416f43',
				name: 'Warehouse',
				caption: '仓库',
				hierarchies: [
					{
						__id__: 'c26e9041-d05e-42b4-9128-8809f67dfc5a',
						name: '',
						caption: '仓库',
						hasAll: true,
						primaryKey: 'warehouse_id',
						tables: [{ name: 'warehouse' }],
						levels: [
							{
								__id__: '8377e87e-f586-4a50-b831-c685ac4fdb7b',
								column: 'warehouse_country',
								name: 'Country',
								caption: '国家',
								uniqueMembers: true
							},
							{
								__id__: '292de9d4-fd9b-486a-8fa0-b62ae350711c',
								column: 'warehouse_state_province',
								name: 'StateProvince',
								caption: '州省',
								uniqueMembers: true
							},
							{
								__id__: 'a5ab4179-2074-41c3-8cfc-e019b2d23583',
								column: 'warehouse_city',
								name: 'City',
								caption: '城市',
								uniqueMembers: true
							},
							{
								__id__: 'b0252993-0845-4d4d-b0d2-c32f9ea2f18d',
								column: 'warehouse_id',
								name: 'Warehouse',
								caption: '仓库',
								uniqueMembers: true,
								nameColumn: 'warehouse_name'
							}
						]
					}
				]
			},
			{
				__id__: 'c70e3ede-a2ab-4218-a4b7-8153d9a46743',
				name: 'Account',
				caption: '科目',
				hierarchies: [
					{
						__id__: '2404428d-4fcc-4ef8-9917-ecc852ed0de3',
						caption: '科目',
						hasAll: true,
						primaryKey: 'account_id',
						tables: [{ name: 'account' }],
						levels: [
							{
								__id__: '38ba3fc8-2fc6-4795-a8a0-5362d167e111',
								column: 'account_id',
								type: 'Integer',
								name: 'account',
								caption: '科目',
								uniqueMembers: true,
								parentColumn: 'account_parent',
								captionColumn: null,
								nameColumn: null,
								ordinalColumn: null,
								nullParentValue: '',
								properties: []
							}
						]
					}
				]
			},
			{
				__id__: '5680a42a-1829-4805-a4bc-43dd8aa7a7a9',
				name: 'Employees',
				caption: '员工',
				hierarchies: [
					{
						__id__: '7d4d7c03-9f0e-40ed-b8b8-b36710a2649a',
						caption: '员工',
						hasAll: true,
						primaryKey: 'employee_id',
						tables: [{ name: 'employee' }],
						levels: [
							{
								__id__: 'f6affcb1-64c9-4427-9238-2f7247ee66ac',
								column: 'employee_id',
								name: 'employee',
								caption: '员工',
								captionColumn: null,
								parentColumn: 'supervisor_id',
								semantics: { parentChild: true },
								uniqueMembers: true,
								nameColumn: 'full_name',
								ordinalColumn: null,
								nullParentValue: '0'
							}
						]
					}
				]
			},
			{
				__id__: 'eb021021-67d9-47de-8064-00aa3c48406d',
				name: 'Store',
				caption: '门店',
				hierarchies: [
					{
						__id__: 'dfeac13b-25c7-4965-897a-e3360daca284',
						caption: '门店',
						hasAll: true,
						primaryKey: 'store_id',
						tables: [{ name: 'store' }],
						levels: [
							{
								__id__: '8d722b98-890d-4da6-a02c-ff4dd06c765a',
								column: 'store_country',
								name: 'Store Country',
								caption: '国家',
								uniqueMembers: true
							},
							{
								__id__: 'f938b36a-52d1-4ec4-b366-7783ebd219b7',
								column: 'store_state',
								name: 'Store State',
								caption: '州',
								uniqueMembers: true
							},
							{
								__id__: '26d29c49-1ce4-497e-b875-6c5cb59f8563',
								column: 'store_city',
								name: 'Store City',
								caption: '城市'
							},
							{
								__id__: 'f55d7ed2-9b7d-446c-a310-031aac140d9d',
								column: 'store_name',
								name: 'Store Name',
								caption: '门店',
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
				caption: '客户',
				hierarchies: [
					{
						__id__: 'CPUm6y9CDL',
						caption: '客户',
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
								caption: '国家',
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
								keyExpression: null,
								captionExpression: null,
								parentExpression: null,
								Closure: null,
								__id__: 'rdPa4d4P4T'
							},
							{
								name: 'State Province',
								caption: '省市',
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
								keyExpression: null,
								captionExpression: null,
								parentExpression: null,
								Closure: null,
								__id__: 'hwEWWvzK60'
							},
							{
								name: 'City',
								caption: '城市',
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
								keyExpression: null,
								captionExpression: null,
								parentExpression: null,
								Closure: null,
								__id__: '0wHSfMK7Ci'
							},
							{
								name: 'Name',
								caption: '客户',
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
								keyExpression: null,
								captionExpression: null,
								parentExpression: null,
								Closure: null,
								__id__: 'PAKSaiknpS',
								properties: [
									{
										propertyExpression: {
											SQL: {}
										},
										name: 'Gender',
										column: 'gender'
									},
									{
										propertyExpression: {
											SQL: {}
										},
										name: 'Marital Status',
										column: 'marital_status'
									},
									{
										propertyExpression: {
											SQL: {}
										},
										name: 'Education',
										column: 'education'
									},
									{
										propertyExpression: {
											SQL: {}
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
				keyExpression: null,
				semantics: null
			}
		],
		cubes: [
			{
				__id__: 'a182caa2-f361-44a2-b245-d0cc314f4603',
				name: 'Sales',
				caption: '销售',
				tables: [{ name: 'sales_fact' }],
				dimensions: [
					{
						__id__: '0883487e-afdc-439e-9da3-c734a7e44ea7',
						name: 'Promotions',
						foreignKey: 'promotion_id',
						type: '',
						caption: '促销活动',
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
										caption: '',
										column: 'promotion_id',
										uniqueMembers: true,
										nameColumn: 'promotion_name'
									}
								]
							}
						]
					}
				],
				measures: [
					{
						__id__: '1c05abfc-56e1-46c8-a312-01a4915b1ff9',
						name: 'Sales',
						caption: '销售额',
						aggregator: 'sum',
						column: 'store_sales'
					},
					{
						__id__: 'a1eebb49-c622-455f-b43e-f35764757e2f',
						name: 'Cost',
						caption: '成本',
						aggregator: 'sum',
						column: 'store_cost'
					},
					{
						__id__: 'tXFwyszO5i',
						name: 'Promotion Sales',
						aggregator: 'sum',
						caption: '活动销售额',
						measureExpression: {
							sql: {
								dialect: 'postgres',
								content: 'case when sales_fact.promotion_id = 0 then 0 else sales_fact.store_sales end'
							}
						}
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
						calculatedProperties: [],
						caption: '利润',
						visible: true,
						formula: '[Measures].[Sales] - [Measures].[Cost]'
					},
					{
						__id__: '52023f45-6920-4186-b99d-e5c8d1226009',
						name: 'Profit last Period',
						dimension: 'Measures',
						visible: false,
						calculatedProperties: [],
						formula: 'CoalesceEmpty((Measures.[Profit], [Time].PrevMember), Measures.[Profit])'
					},
					{
						__id__: '0b4d5ee8-9eb9-4cb2-a328-afa4360039ad',
						name: 'Profit Growth',
						dimension: 'Measures',
						visible: true,
						calculatedProperties: [],
						caption: '利润增长率',
						formula:
							'([Measures].[Profit] - [Measures].[Profit last Period]) / [Measures].[Profit last Period]'
					}
				]
			},
			{
				__id__: 'a77b056a-552c-4d39-962b-221f5c858da7',
				name: 'Inventory',
				caption: '库存',
				tables: [{ name: 'inventory_fact' }],
				dimensions: [
					{
						__id__: 'f2feeccc-8301-4e53-9be5-31df7ecb1448',
						name: 'Time',
						foreignKey: 'time_id',
						type: 'TimeDimension',
						caption: '时间',
						semantics: {
							semantic: 'Calendar'
						},
						hierarchies: [
							{
								__id__: 'b4a9282e-382e-4d19-8337-fbe1409f7dd8',
								name: '',
								hasAll: true,
								label: null,
								allMemberName: null,
								tables: [{ name: 'time_by_day' }],
								primaryKey: 'time_id',
								levels: [
									{
										__id__: '830f513f-4029-4411-b8c4-df3efa7a1eef',
										name: 'Year',
										caption: '年',
										column: 'the_year',
										uniqueMembers: true,
										nameColumn: null,
										parentColumn: null,
										nullParentValue: null,
										levelType: 'TimeYears',
										semantics: {
											semantic: 'Calendar.Year',
											formatter: '[yyyy]'
										}
									},
									{
										__id__: 'b5a0d2b8-c853-4480-bbaa-59a073b53048',
										column: 'quarter',
										name: 'Quarter',
										caption: '季度',
										levelType: 'TimeQuarters',
										semantics: {
											semantic: 'Calendar.Quarter',
											formatter: "[yyyy].['Q'Q]"
										},
										captionExpression: {
											sql: { dialect: 'generic', _: '"the_year" || "quarter"' }
										}
									},
									{
										__id__: '1d4b0bfd-ebcb-4574-82a7-d58c6349e4b5',
										name: 'Month',
										caption: '月',
										column: 'month_of_year',
										uniqueMembers: false,
										nameColumn: null,
										parentColumn: null,
										nullParentValue: null,
										levelType: 'TimeMonths',
										semantics: {
											semantic: 'Calendar.Month',
											formatter: `[yyyy].['Q'Q].[M]`
										},
										captionExpression: {
											sql: {
												dialect: 'generic',
												_: '"the_year"::varchar || "month_of_year"::varchar'
											}
										}
									},
									{
										__id__: 'd4ae3f67-d762-496d-b56e-12ab2cee480e',
										name: 'Day',
										caption: '日',
										column: 'the_date',
										uniqueMembers: true,
										nameColumn: null,
										parentColumn: null,
										nullParentValue: null,
										levelType: 'TimeDays',
										semantics: {
											semantic: 'Calendar.Day',
											formatter: `[yyyy].['Q'Q].[M].[yyyy-MM-dd]`
										}
									}
								]
							}
						]
					}
				],
				measures: [
					{
						name: 'sales',
						caption: '销售额',
						column: 'warehouse_sales',
						aggregator: 'sum',
						__id__: '54f6d38d-f780-41a9-9c2c-4111a9423576'
					},
					{
						__id__: 'a22c2960-4746-464c-8a33-f255d204151b',
						name: 'Ordered',
						caption: '订购',
						aggregator: 'sum',
						column: 'units_ordered'
					},
					{
						__id__: '6b6c5aca-3c57-4dbd-baaf-0b9888b1a633',
						name: 'Shipped',
						caption: '发货',
						aggregator: 'sum',
						column: 'units_shipped'
					},
					{
						__id__: 'c9f6a312-5908-4942-bbff-ba9194a1a338',
						name: 'Cost',
						caption: '成本',
						aggregator: 'sum',
						column: 'warehouse_cost'
					}
				],
				calculatedMembers: [
					{
						__id__: 'f5c8e630-ed79-4432-8bdd-ce3479e90850',
						name: 'm',
						dimension: 'Measures',
						calculatedProperties: [],
						formula: '[Measures].[sales] * 100',
						visible: true,
						caption: 'Cent'
					}
				],
				dimensionUsages: [
					{
						name: 'Warehouse',
						source: 'Warehouse',
						__id__: '19864189-7e95-44e9-950a-9da7e62505b8',
						foreignKey: 'warehouse_id'
					},
					{
						name: 'Store',
						source: 'Store',
						__id__: '539973a1-3d75-4738-bfc0-2ad9f5f8a3af',
						foreignKey: 'store_id'
					},
					{
						name: 'Product',
						source: 'Product',
						__id__: '4ccb979c-e11b-44ba-a0d3-9e27533e72cc',
						foreignKey: 'product_id'
					}
				]
			},
			{
				__id__: '4972d1a3-f713-47fd-8d33-f8d90acd8d60',
				name: 'Expense',
				caption: '费用',
				tables: [{ name: 'expense_fact' }],
				dimensionUsages: [
					{
						name: 'Account',
						source: 'Account',
						__id__: '10775431-034c-481d-85ac-de1b5cac5d9d',
						foreignKey: 'account_id'
					},
					{
						name: 'Store',
						source: 'Store',
						__id__: 'bf9e06b1-155b-4208-b41e-8fae7c4bc3f9',
						foreignKey: 'store_id'
					},
					{
						name: 'Time',
						source: 'Time',
						__id__: 'c22c3f8c-3447-427b-9c25-a7fd6281e956',
						foreignKey: 'time_id'
					}
				],
				measures: [
					{
						__id__: 'd51d0563-a927-4754-927a-40f9ed262bff',
						name: 'amount',
						aggregator: 'sum',
						column: 'amount',
						caption: '金额'
					}
				],
				dimensions: [
					{
						__id__: '9e686fc4-c702-4246-8822-3eb94d099fb3',
						name: 'category',
						foreignKey: 'category_id',
						caption: '类别',
						hierarchies: [
							{
								__id__: '64c0e6de-f2ad-4d67-b52f-a7ec5cddd30b',
								name: '',
								hasAll: true,
								label: null,
								allMemberName: null,
								tables: [{ name: 'category' }],
								primaryKey: 'category_id',
								levels: [
									{
										__id__: 'b2a15318-b113-4d8f-84e3-0a973f2dc1c9',
										name: 'category',
										properties: [],
										caption: '类别',
										uniqueMembers: true,
										column: 'category_id',
										captionColumn: 'category_description'
									}
								]
							}
						]
					}
				]
			},
			{
				__id__: 'd791fd41-3fd1-4fbc-a314-e93e74d68b28',
				name: 'HR',
				caption: '薪资',
				tables: [{ name: 'salary' }],
				dimensionUsages: [
					{
						name: 'Employees',
						source: 'Employees',
						__id__: 'aff96c37-798d-4236-9484-967d39ff8b88',
						foreignKey: 'employee_id'
					}
				],
				measures: [
					{
						__id__: '2beb617e-2363-4ddd-99d2-3165410799fb',
						name: 'Salary',
						aggregator: 'sum',
						column: 'salary_paid',
						caption: '薪水',
						formatString: 'Currency'
					}
				]
			}
		],
		virtualCubes: [
			{
				__id__: 'ev73xNTHbb',
				name: 'Warehouse and Sales',
				caption: '仓库销售',
				cubeUsages: [
					{
						cubeName: 'Sales',
						ignoreUnrelatedDimensions: true
					},
					{
						cubeName: 'Inventory',
						ignoreUnrelatedDimensions: true
					},
					{
						cubeName: 'Expense',
						ignoreUnrelatedDimensions: null
					}
				],
				virtualCubeDimensions: [
					{
						name: 'Customers',
						label: '客户',
						cubeName: 'Sales'
					},
					{
						name: 'Product',
						label: '产品',
						cubeName: 'Sales',
						__shared__: true
					},
					{
						name: 'Store',
						label: '门店',
						cubeName: 'Sales',
						__shared__: true
					},
					{
						name: 'Time',
						label: '日历',
						cubeName: 'Sales',
						__shared__: true
					},
					{
						name: 'Warehouse',
						label: '仓库',
						cubeName: 'Inventory'
					}
				],
				virtualCubeMeasures: [
					{
						name: '[Measures].[Cost]',
						label: '成本',
						cubeName: 'Sales',
						visible: true
					},
					{
						name: '[Measures].[Sales]',
						label: '销售额',
						cubeName: 'Sales',
						visible: true
					},
					{
						name: '[Measures].[Ordered]',
						label: '订购',
						cubeName: 'Inventory',
						visible: true
					},
					{
						name: '[Measures].[Shipped]',
						label: '发货',
						cubeName: 'Inventory',
						visible: true
					},
					{
						name: '[Measures].[Profit]',
						label: '利润',
						cubeName: 'Sales',
						visible: true
					},
					{
						name: '[Measures].[amount]',
						label: 'Amount',
						cubeName: 'Expense',
						visible: true
					}
				],
				calculatedMembers: [
					{
						name: 'Profit Per Unit Shipped',
						dimension: 'Measures',
						formula: '[Measures].[Profit] / [Measures].[Shipped]',
						caption: '发货单位利润'
					}
				]
			}
		]
	}
}

export const SEMANTIC_MODEL_ROLES = [
	{
		index: 0,
		key: 'QdysHCJVDQ',
		name: 'Administrator',
		options: {
			schemaGrant: {
				cubeGrants: [],
				access: 'all'
			}
		}
	},
	{
		index: 1,
		key: '9YDebwXNbH',
		name: 'California manager',
		options: {
			schemaGrant: {
				cubeGrants: [
					{
						cube: 'Sales',
						caption: '销售',
						access: 'custom',
						hierarchyGrants: [
							{
								hierarchy: '[Customers]',
								access: 'custom',
								memberGrants: [
									{
										member: '[Customers].[Mexico].[DF]',
										caption: 'DF',
										access: 'all'
									},
									{
										member: '[Customers].[Mexico].[Guerrero]',
										caption: 'Guerrero',
										access: 'all'
									},
									{
										member: '[Customers].[Mexico].[Mexico]',
										caption: 'Mexico',
										access: 'all'
									},
									{
										member: '[Customers].[United States].[CA]',
										caption: 'CA',
										access: 'none'
									}
								],
								topLevel: '[Customers].[(All)]',
								bottomLevel: '[Customers].[State Province]'
							},
							{
								hierarchy: '[Time]',
								access: 'all',
								memberGrants: []
							},
							{
								hierarchy: '[Measures]',
								access: 'custom',
								memberGrants: [
									{
										member: '[Measures].[Sales]',
										caption: 'Sales',
										access: 'all'
									},
									{
										member: '[Measures].[Cost]',
										caption: 'Cost',
										access: 'all'
									}
								]
							},
							{
								hierarchy: '[Product]',
								access: 'custom',
								memberGrants: [
									{
										member: '[Product].[Jeffers]',
										caption: 'Jeffers',
										access: 'all'
									}
								]
							},
							{
								hierarchy: '[Store]',
								caption: '门店',
								access: 'custom',
								memberGrants: [
									{
										member: '[Store].[USA]',
										caption: 'USA',
										access: 'none'
									}
								],
								topLevel: '[Store].[(All)]',
								topLevelCaption: 'Store [(All)]',
								bottomLevel: '[Store].[Store State]',
								bottomLevelCaption: '州'
							},
							{
								hierarchy: '[Promotions]',
								caption: '促销活动',
								access: 'custom',
								memberGrants: []
							}
						]
					},
					{
						cube: 'Inventory',
						access: 'all',
						hierarchyGrants: []
					}
				],
				access: 'custom'
			}
		}
	}
]

export const ENTITY_SALES = 'Sales'
export const ENTITY_INVENTORY = 'Inventory'
