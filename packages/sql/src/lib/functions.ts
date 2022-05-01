import { isEmpty } from "lodash";

export function OrderBy(orders: string[]) {
    return isEmpty(orders) ? '' : `ORDER BY ${orders.join(', ')}`
}