import { get, set } from 'money-clip'
import { clear, del, keys, UseStore } from 'idb-keyval'

export interface CacheOptions {
  version?: number,
  maxAge: number,
  level: number
}

const CACHE_OPTIONS = {level: 3}

const serializeArgs = (...args: unknown[]) => args.map((arg: unknown) => arg.toString()).join(':')

export function Cache(key: string, {maxAge, level}: CacheOptions) {
  const cacheOptions: CacheOptions = {
    version: 1,
    maxAge,
    level
  }

  return function (_: unknown, __: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = function (...args) {
      const options = typeof args[args.length - 1] === 'object' ? args[args.length - 1] : null
      const cacheKey = options ? serializeArgs(key, ...args.slice(0, args.length - 1)) : serializeArgs(key, ...args)
      
      if (cacheOptions.level <= CACHE_OPTIONS.level) {
        if (!options?.skip) {
          return get(cacheKey, cacheOptions).then((data) => {
            if (data) {
              return data
            }
    
            return method.apply(this, args).then(
              (result: unknown) => {
                if (result) {
                  set(cacheKey, result, cacheOptions)
                }
                return result
              }
            )
          })
        } else {
          return method.apply(this, args).then(
            (result: unknown) => {
              if (result) {
                set(cacheKey, result, cacheOptions)
              }
              return result
          })
        }
      }
      
      return method.apply(this, args)
    }
  }
}


export class DSCacheService {
  clearAllCache(): void {
    clear()
  }

  changeCacheLevel(level: number): void {
    CACHE_OPTIONS.level = level
  }

  getCacheLevel() {
    return CACHE_OPTIONS.level
  }

  async keys(customStore?: UseStore):  Promise<IDBValidKey[]> {
    return keys(customStore)
  }

  async clear(key: IDBValidKey, customStore?: UseStore): Promise<void> {
    return del(key, customStore)
  }
}