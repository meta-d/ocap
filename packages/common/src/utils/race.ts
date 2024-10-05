export async function race<T>(time: number, runner: Promise<T> | (() => Promise<T>)) {
  return Promise.race([
    runner instanceof Promise ? runner : typeof runner === 'function' ? runner() : undefined,
    new Promise<T>((resolve, reject) => {
      // Reject after 5 seconds
      setTimeout(() => reject(new TimeoutError('Request timed out')), time)
    })
  ])
}

export class TimeoutError extends Error {
  //
}
