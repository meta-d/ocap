import isEmpty from 'lodash/isEmpty'

export function OrderBy(orders: string[]) {
  return isEmpty(orders) ? '' : `ORDER BY ${orders.join(', ')}`
}

export function Cast(field: string, type: string) {
  return `CAST(${field} AS ${type})`
}