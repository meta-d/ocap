export type HierarchyTableDataType<T> = {
  levelNumber: number
  level: string
  value: T
  children: HierarchyTableDataType<T>[]
  expanded?: boolean
}
