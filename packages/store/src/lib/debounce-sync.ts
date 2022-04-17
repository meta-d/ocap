import {
  asapScheduler,
  MonoTypeOperatorFunction,
  Observable,
  Subscription,
} from 'rxjs';

export function debounceSync<T>(): MonoTypeOperatorFunction<T> {
  return (source) =>
    new Observable<T>((observer) => {
      let actionSubscription: Subscription | undefined;
      let actionValue: T | undefined;
      const rootSubscription = new Subscription();
      rootSubscription.add(
        source.subscribe({
          complete: () => {
            if (actionSubscription) {
              observer.next(actionValue);
            }
            observer.complete();
          },
          error: (error) => {
            observer.error(error);
          },
          next: (value) => {
            actionValue = value;
            if (!actionSubscription) {
              actionSubscription = asapScheduler.schedule(() => {
                observer.next(actionValue);
                actionSubscription = undefined;
              });
              rootSubscription.add(actionSubscription);
            }
          },
        })
      );
      return rootSubscription;
    });
}
