import { isString, upperCase } from 'lodash'

//
export type OrderBy = {
  by: string
  order: OrderDirection
}

export enum OrderDirection {
  ASC  = 'ASC',
  DESC = 'DESC',
}

/**
 * 对非结构化的 orderby 字符串进行解构, 支持中间有空格的字段名称
 * 
 * `"[ZCALMONTH                     Z_H_MONTH_01] desc"` to `["[ZCALMONTH                     Z_H_MONTH_01]", "DESC"]`
 */
export function deconstructOrderby(orderby: OrderBy): {
  by: string
  order: OrderDirection
} {
  if (isString(orderby)) {
    // TODO: 需要整理重构
    const parts = orderby.trim().split(' ')
    let order = null
    let field = null
    if (upperCase(parts[parts.length - 1]) === 'ASC') {
      order = OrderDirection.ASC
      field = parts
        .slice(0, parts.length - 1)
        .join(' ')
        .trim()
    } else if (upperCase(parts[parts.length - 1]) === 'DESC') {
      order = OrderDirection.DESC
      field = parts
        .slice(0, parts.length - 1)
        .join(' ')
        .trim()
    } else {
      field = orderby.trim()
    }

    return {
      by: field,
      order
    }
  }

  return orderby
}
