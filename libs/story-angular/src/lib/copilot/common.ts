import { first, from, map, of, switchMap, throwError } from 'rxjs'

export function checkDefaultEntity(copilot) {
  const { storyService, entityType } = copilot
  return entityType ? of(copilot) : from(storyService.openDefultDataSettings()).pipe(
    switchMap((result: any) => {
      if (result && result.dataSource && result.entities?.[0]) {
        return storyService.selectEntityType({ dataSource: result.dataSource, entitySet: result.entities[0] }).pipe(
          first(),
          map((entityType) => ({
            ...copilot,
            entityType,
            dataSource: result.dataSource
          }))
        )
      } else {
        return throwError(() => new Error(`请先选择数据集`))
      }
    })
  )
}
