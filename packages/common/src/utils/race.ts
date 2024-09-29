export async function race(time: number, runner: Promise<any>) {
  return Promise.race([
    runner,
    new Promise((resolve, reject) => {
      // Reject after 5 seconds
      setTimeout(() => reject(new Error('Request timed out')), time)
    })
  ])
}
