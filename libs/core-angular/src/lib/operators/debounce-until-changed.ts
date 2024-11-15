import { Observable, OperatorFunction } from 'rxjs';

export function debounceUntilChanged<T, K extends keyof T>(dueTime: number, key?: K): OperatorFunction<T, T> {

  const isEqual = key ? (a: T, b: T) => a?.[key] === b?.[key] : (a: T, b: T) => a === b

  return (source: Observable<T>) =>
    new Observable<T>((observer) => {
      let lastValue: T;
      let timeoutId: any;

      const subscription = source.subscribe({
        next(value) {
          if (isEqual(lastValue, value)) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              observer.next(value);
            }, dueTime);
          } else {
            clearTimeout(timeoutId);
            observer.next(value);
          }
          lastValue = value;
        },
        error(err) {
          observer.error(err);
        },
        complete() {
          observer.complete();
        }
      });

      return () => {
        clearTimeout(timeoutId);
        subscription.unsubscribe();
      };
    });
}
