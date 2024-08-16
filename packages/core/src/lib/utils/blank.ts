export function nonBlank<T>(value: T): value is NonNullable<T> {
    return !!value
}