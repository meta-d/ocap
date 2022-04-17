import { IFilter, ISlicer } from "../types"

/**
 */
export interface SelectionVariant {
  id?: string
  text?: string
  parameters?: {
    [key: string]: any
  }
  selectOptions?: Array<ISlicer | IFilter | string>
  /**
   * Filter string for query part of URL, without `$filter=`
   * @todo
   */
  filterExpression?: string
}