import { assign } from './assign'
import { isArray } from './isArray'
import { isNil } from './isNil'
import { isPlainObject } from './isPlainObject'
import { isString } from './isString'

export function isBlank(value) {
  return isNil(value) || (isString(value) && !value.trim())
}

export function mergeOptions(obj1: object, ...objs: unknown[]) {
  return assign(obj1, ...objs.map((item) => omitBlank(item)))
}

/**
 * Assign target object proeprties to source object proeprties, support property type:
 * * Plain Object
 * * Array
 * * Other
 *
 * @param source
 * @param target
 * @param dpth The depth of merge
 * @returns
 */
export function assignDeepOmitBlank(source: object, target: object, dpth = 1) {
  if (isPlainObject(target)) {
    if (dpth > 0) {
      return Object.entries(target)
        .filter(([key, value]) => !isBlank(value))
        .reduce(
          (obj, [key, value]) => {
            obj[key] = assignDeepOmitBlank(source?.[key], target[key], dpth - 1)
            return obj
          },
          { ...(source ?? {}) }
        )
    } else {
      return assign(source, omitBlank(target))
    }
  } else if (isArray<object>(target) && isArray<object>(source)) {
    const result = []
    for (let index = 0; index < Math.max(target.length, source.length); index++) {
      result.push(assignDeepOmitBlank(source?.[index], target[index], dpth - 1))
    }
    return result
  } else {
    return isBlank(target) ? source : target
  }
}

export function omitBlank(obj) {
  if (Array.isArray(obj)) {
    return obj.map((value) => omitBlank(value))
  } else if (isPlainObject(obj)) {
    return Object.entries(obj)
      .filter(([, v]) => !isBlank(v))
      .reduce((r, [key, value]) => ({ ...r, [key]: omitBlank(value) }), {})
  } else {
    return obj
  }
}

/**
 * @description
 *
 * Represents a type that a Component or other object is instances of.
 *
 * An example of a `Type` is `MyCustomComponent` class, which in JavaScript is represented by
 * the `MyCustomComponent` constructor function.
 *
 * @publicApi
 */
export const Type = Function

export function isType(v: any): v is Type<any> {
  return typeof v === 'function'
}

/**
 * @description
 *
 * Represents an abstract class `T`, if applied to a concrete class it would stop being
 * instantiable.
 *
 * @publicApi
 */
export interface AbstractType<T> extends Function {
  prototype: T
}

export interface Type<T> extends Function {
  new (...args: any[]): T
}

export type Mutable<T extends { [x: string]: any }, K extends string> = {
  [P in K]: T[P]
}

/**
 * Returns a writable type version of type.
 *
 * USAGE:
 * Given:
 * ```
 * interface Person {readonly name: string}
 * ```
 *
 * We would like to get a read/write version of `Person`.
 * ```
 * const WritablePerson = Writable<Person>;
 * ```
 *
 * The result is that you can do:
 *
 * ```
 * const readonlyPerson: Person = {name: 'Marry'};
 * readonlyPerson.name = 'John'; // TypeError
 * (readonlyPerson as WritablePerson).name = 'John'; // OK
 *
 * // Error: Correctly detects that `Person` did not have `age` property.
 * (readonlyPerson as WritablePerson).age = 30;
 * ```
 */
export type Writable<T> = {
  -readonly [K in keyof T]: T[K]
}
