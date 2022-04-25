import { isNil } from 'lodash'
import { C_MEASURES } from '../types'
import { CalculatedMember } from './schema'
  
export const isCalculatedMember = (toBe): toBe is CalculatedMember =>
  (!isNil((toBe as CalculatedMember)?.dimension) || !isNil((toBe as CalculatedMember)?.hierarchy)) && !isNil((toBe as CalculatedMember)?.formula)

export function formatCalculatedMemberName(member: CalculatedMember) {
  if (member.dimension === C_MEASURES) {
    return `[Measures].[${member.name}]`
  }
  return `${member.hierarchy || member.dimension}.[${member.name}]`
}

export function serializeUniqueName(dimension: string, hierarchy?: string, level?: string) {
  const name = (!!hierarchy && dimension !== hierarchy) ? `[${dimension}.${hierarchy}]` : `[${dimension}]`
  if (level) {
    return `${name}.[${level}]`
  }
  return name
}

// export function buildSchema(input: Schema): string {
//   console.warn(input)
//   const schema = cloneDeepWith(cloneDeep(input), (value: any, key, object) => {
//     if (isObject(value) && !isArray(value) && key !== '$') {
//       forIn(value, (v, key) => {
//         if (isString(key) && key !== '_') {
//           if (key.startsWith('__') && key.endsWith('__')) {
//             delete value[key]
//           } else if (camelCase(key) === key) {
//             value['$'] = value['$'] || {}
//             value['$'][key] = v
//             delete value[key]
//           }
//         }
//       })
//     }
//   })

//   console.warn(schema)

//   const builder = new xml2js.Builder()
//   return builder.buildObject({
//     Schema: schema,
//   })
// }

// function parseBooleans(str) {
//   if (/^(?:true|false)$/i.test(str)) {
//     str = str.toLowerCase() === 'true'
//   }
//   return str
// }

// export function parseSchema(input: string) {
//   // const parser = xml2js.Parser({ parseBooleans: true })
//   return new Observable((observabler) => {
//     xml2js.parseString(
//       input,
//       { valueProcessors: [parseBooleans], attrValueProcessors: [parseBooleans] },
//       (err, result) => {
//         if (err) {
//           return observabler.error(err)
//         }

//         result = cloneDeepWith(result, (value: any, key, object) => {
//           // if (value === 'true') {
//           //   return true
//           // }
//           // if (value === 'false') {
//           //   return false
//           // }
//           if (isObject(value) && !isArray(value) && key !== '$') {
//             forIn(value, (v, key) => {
//               if (key === '$') {
//                 forIn(v, (attr, name) => {
//                   value[name] = attr
//                 })

//                 delete value[key]
//               }
//             })
//           }
//         })

//         observabler.next(result)
//         observabler.complete()
//       }
//     )
//   })
// }
