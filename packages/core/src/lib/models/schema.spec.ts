import { buildSchema, parseSchema, Schema } from './schema'

const SCHEMA = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Schema>
  <Cube name="Sales">
    <Table name="sales_fact_1997"/>
    <Dimension name="Gender" foreignKey="customer_id">
      <Hierarchy hasAll="true" allMemberName="All Genders" primaryKey="customer_id">
        <Table name="customer"/>
        <Level name="Gender" column="gender" uniqueMembers="true"/>
      </Hierarchy>
    </Dimension>
    <Dimension name="Time" foreignKey="time_id">
      <Hierarchy hasAll="false" primaryKey="time_id">
        <Table name="time_by_day"/>
        <Level name="Year" column="the_year" type="Numeric" uniqueMembers="true"/>
        <Level name="Quarter" column="quarter" uniqueMembers="false"/>
        <Level name="Month" column="month_of_year" type="Numeric" uniqueMembers="false">
          <CaptionExpression>
            <SQL dialect="generic">time_by_day.the_year + time_by_day.the_month</SQL>
          </CaptionExpression>
        </Level>
      </Hierarchy>
    </Dimension>
    <Measure name="Unit Sales" column="unit_sales" aggregator="sum" formatString="#,###"/>
    <Measure name="Store Sales" column="store_sales" aggregator="sum" formatString="#,###.##"/>
    <Measure name="Store Cost" column="store_cost" aggregator="sum" formatString="#,###.00"/>
    <CalculatedMember name="Profit" dimension="Measures">
      <Formula>[Measures].[Store Sales] - [Measures].[Store Cost]</Formula>
      <CalculatedMemberProperty name="FORMAT_STRING" value="$#,##0.00"/>
    </CalculatedMember>
  </Cube>
</Schema>`

describe('MDX Schema', () => {
  beforeEach(() => {})

  it('#toXML', () => {
    const schema: Schema = {
      Cube: [
        {
          name: 'Sales',
          Table: [
            {
              name: 'sales_fact_1997',
            }
          ],
          Dimension: [
            {
              name: 'Gender',
              foreignKey: 'customer_id',
              Hierarchy: [
                {
                  hasAll: true,
                  allMemberName: 'All Genders',
                  primaryKey: 'customer_id',
                  Table: [
                    {
                      name: 'customer',
                    }
                  ],
                  Level: [
                    {
                      name: 'Gender',
                      column: 'gender',
                      uniqueMembers: true,
                    },
                  ],
                },
              ],
            },
            {
              name: 'Time',
              foreignKey: 'time_id',
              Hierarchy: [
                {
                  hasAll: false,
                  primaryKey: 'time_id',
                  Table: [
                    {
                      name: 'time_by_day',
                    }
                  ],
                  Level: [
                    {
                      name: 'Year',
                      column: 'the_year',
                      type: 'Numeric',
                      uniqueMembers: true,
                    },
                    {
                      name: 'Quarter',
                      column: 'quarter',
                      uniqueMembers: false,
                    },
                    {
                      name: 'Month',
                      column: 'month_of_year',
                      type: 'Numeric',
                      uniqueMembers: false,
                      CaptionExpression: [
                        {
                          SQL: [
                            {
                              dialect: "generic",
                              _: "time_by_day.the_year + time_by_day.the_month"
                            }
                          ]
                        }
                      ]
                    },
                  ],
                },
              ],
            },
          ],
          Measure: [
            {
              name: 'Unit Sales',
              column: 'unit_sales',
              aggregator: 'sum',
              formatString: '#,###',
            },
            {
              name: 'Store Sales',
              column: 'store_sales',
              aggregator: 'sum',
              formatString: '#,###.##',
            },
            {
              name: 'Store Cost',
              column: 'store_cost',
              aggregator: 'sum',
              formatString: '#,###.00',
            },
          ],
          CalculatedMember: [
            {
              name: 'Profit',
              dimension: 'Measures',
              Formula: ['[Measures].[Store Sales] - [Measures].[Store Cost]'],
              CalculatedMemberProperty: [
                {
                  name: 'FORMAT_STRING',
                  value: '$#,##0.00',
                },
              ],
            },
          ],
        },
      ],
    }

    // parseSchema(SCHEMA).subscribe(result => {
    //   console.warn(result)
    // })

    const str = buildSchema(schema)
    console.warn(str)

    expect(str).toEqual(SCHEMA)

    parseSchema(str).subscribe(result => {
      console.warn(result)
      expect(result).toEqual({
        Schema: schema
      })
    })
  })
  
})
