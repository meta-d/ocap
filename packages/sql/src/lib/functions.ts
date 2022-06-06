import isEmpty from 'lodash/isEmpty'

export function OrderBy(orders: string[]) {
  return isEmpty(orders) ? '' : `ORDER BY ${orders.join(', ')}`
}
