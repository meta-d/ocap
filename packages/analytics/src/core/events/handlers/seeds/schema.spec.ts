import * as MDX from '../../../../model/mdx/schema'
import { buildSchema, convertSchemaToXmla } from '../../../../model/mdx/helper'
import { SEMANTIC_MODEL } from './semantic-model'

const SCHEMA = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Schema name="Sales Schema">
  <Dimension name="Gender" foreignKey="customer_id">
    <Hierarchy name="" hasAll="true" allMemberName="All Genders" primaryKey="customer_id">
      <Table name="customer"/>
      <Level name="Gender" column="gender" uniqueMembers="true"/>
    </Hierarchy>
  </Dimension>
  <Cube name="Sales">
    <Table name="sales_fact"/>
    <DimensionUsage name="Gender" source="Gender" foreignKey="customer_id"/>
    <Dimension name="Gender" foreignKey="customer_id">
      <Hierarchy name="" hasAll="true" allMemberName="All Genders" primaryKey="customer_id">
        <Table name="customer"/>
        <Level name="Gender" column="gender" uniqueMembers="true"/>
      </Hierarchy>
    </Dimension>
    <Dimension name="Time" foreignKey="time_id">
      <Hierarchy name="" hasAll="false" primaryKey="time_id">
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
    <CalculatedMember name="Profit" dimension="Measures" formula="[Measures].[Store Sales] - [Measures].[Store Cost]">
      <CalculatedMemberProperty name="FORMAT_STRING" value="$#,##0.00"/>
    </CalculatedMember>
  </Cube>
</Schema>`

describe('MDX Schema', () => {
  beforeEach(() => {
    //
  })

  it('#toXML', () => {
    const schema: MDX.Schema = convertSchemaToXmla(null, SEMANTIC_MODEL.schema)

    const str = buildSchema(schema)
    console.warn(str)
    expect(str).toEqual(SCHEMA)
  })
  
})
