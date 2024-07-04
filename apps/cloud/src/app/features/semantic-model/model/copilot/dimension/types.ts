import { PropertyDimension } from "@metad/ocap-core";

export const DimensionCommandName = 'dimension'
export const DIMENSION_MODELER_NAME = 'DimensionModeler'

export function timeLevelFormatter() {
    return `If you are creating a time dimension, the semantic formatter in time level is date-fns format string to format date to the time dimension member key.
For examples: 
if the time dimension table field value of every levels:
    - year: '2024'
    - quarter: 'Q1'
    - month: '2024-01'
then the dimension member key of month level is [2024].[Q1].[2024-01]
so the formmater of 
  year level: "[yyyy]"
  quarter level is the year formatter concat quarter formatter equal: "[yyyy].['Q'Q]"
  month level is the year formatter concat quarter formatter concat month formatter equal: "[yyyy].['Q'Q].[yyyy-MM]".

if the time dimension table field value of every levels:
    - year: 'FY2024'
    - quarter: 'FY2024 Q1'
    - month: '202401'
then the dimension member key of month level is [FY2024].[FY2024 Q1].[202401]
so the formmater of 
  year level: "['FY'yyyy]"
  quarter level is the year formatter concat quarter formatter equal: "['FY'yyyy].['FY'yyyy 'Q'Q]"
  month level is the year formatter concat quarter formatter concat month formatter equal: "['FY'yyyy].['FY'yyyy 'Q'Q].[yyyyMM]".

The value of the specific time level can refer to the level keyColumn field name and the given table records.
`
  }

export function markdownSharedDimensions(dimensions: PropertyDimension[]) {
  return dimensions.map((dimension) => `- name: ${dimension.name}
  caption: ${dimension.caption || ''}
  table: ${dimension.hierarchies[0].tables[0]?.name || ''}
  primaryKey: ${dimension.hierarchies[0].primaryKey}  
`).join('\n')
}