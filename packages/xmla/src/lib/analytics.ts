// import { MDXQuery } from './types/index'

// export function generateAnalyticsDetails(query: MDXQuery) {
//   const analytics = {elements: {}} as AnalyticsDetailsAnnotation

//   query.rows.forEach(item => {
//     if (item.displayHierarchy) {
//       analytics.elements[item.dimension] = {
//         query: {
//           elementHierarchy: {
//             parent: `${item.hierarchy || item.dimension}.PARENT_UNIQUE_NAME`
//           }
//         }
//       } as AnalyticsElement
//     }
//   })

//   return analytics
// }
