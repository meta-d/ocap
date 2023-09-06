import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { IStorageFile } from '@metad/contracts'
import { API_PREFIX } from '@metad/cloud/state'

export const C_API_STORAGEFILE = API_PREFIX + '/storage-file'

@Injectable({
  providedIn: 'root'
})
export class StorageFileService {
  private readonly httpClient = inject(HttpClient)

  create(input: FormData, options?) {
    return this.httpClient.post<IStorageFile>(C_API_STORAGEFILE, input, options)
  }

  update(id: string, input) {
    return this.httpClient.put(`${C_API_STORAGEFILE}/${id}`, input)
  }

  delete(id: string) {
    return this.httpClient.delete(`${C_API_STORAGEFILE}/${id}`)
  }
}
