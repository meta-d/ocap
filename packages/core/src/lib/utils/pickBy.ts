export function pickBy(object, predicate = (v) => v) {
  return Object.assign({},
    ...Object.entries(object)
      .filter(([, v]) => predicate(v))
      .map(([k, v]) => ({ [k]: v }))
  )
}
