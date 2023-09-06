export function negate(callbackFn) {
    return (...params) => !callbackFn(...params)
}