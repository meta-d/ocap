// import axios, { AxiosResponse } from 'axios'
// import { from, of } from 'rxjs'
// import { map, switchMap } from 'rxjs/operators'
// import { retryBackoff } from './utils'

// const RETRY_BACKOFF = retryBackoff({
//   initialInterval: 1000,
//   maxInterval: 10000,
//   maxRetries: 10
// })

// export function refreshQueryStatus(job) {
//   return of(1)
//     .pipe(
//       switchMap(() => from(axios.get(`/api/jobs/${job.id}`))),
//       map((response: AxiosResponse) => response.data),
//       switchMap(({ job }: {job: Job}) => {
//         if (job.status === ExecutionStatus.DONE) {
//           return from(axios.get(`/api/query_results/${job.query_result_id}`))
//             .pipe(map(({data}) => data))
//         } else if (job.status === ExecutionStatus.FAILED) {
//           return of({error: job.error})
//         }
//         throw `loop job status`
//       }),
//       RETRY_BACKOFF,
//     )
// }

// export function loopJob(job) {
//   return of(1)
//     .pipe(
//       switchMap(() => from(axios.get(`/api/jobs/${job.id}`))),
//       map((response: AxiosResponse) => response.data),
//       map(({ job }: {job: Job}) => {
//         if (job.status === ExecutionStatus.DONE) {
//           return job.result
//           // return httpClient.get(`/api/query_results/${job.query_result_id}`)
//         } else if (job.status === ExecutionStatus.FAILED) {
//           return {error: job.error}
//         }
//         throw `loop job status`
//       }),
//       RETRY_BACKOFF,
//     )
// }

// export enum ExecutionStatus {
//   UNKOWN,
//   WAITING,
//   PROCESSING,
//   DONE,
//   FAILED,
// }

// export interface Job {
//   status: ExecutionStatus
//   query_result_id: number
//   result: any
//   error?: any
// }
