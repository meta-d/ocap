export function uniqBy<T>(arr: T[], fn: string | any) {
    if (typeof fn === 'string') {
        return arr.filter((element, index) => arr.findIndex((step) => element[fn] === step[fn]) === index)
    }
    return arr.filter((element, index) => arr.findIndex((step) => fn(element, step)) === index)
}
