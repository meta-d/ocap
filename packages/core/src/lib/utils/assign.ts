export function assign(source, ...params: any[]) {
  return Object.assign(source ?? {}, ...params.map((item) => item ?? {}))
}
