import { Dimension, Measure } from '../types'

export interface AnalyticsAnnotation {
  rows: Array<Dimension | Measure>
  columns: Array<Dimension | Measure>
}
