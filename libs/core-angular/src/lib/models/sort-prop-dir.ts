export interface SortPropDir {
  dir: SortDirection
  prop: ColumnProp
}
export enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}
export type ColumnProp = string | number
