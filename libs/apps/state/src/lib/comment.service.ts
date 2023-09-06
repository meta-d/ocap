import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { API_PREFIX } from './constants'

export const C_API_COMMENT = API_PREFIX + '/comment'

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private httpClient = inject(HttpClient)

  createForIndicator(id: string, content: string, options?: any) {
    return this.httpClient.post(C_API_COMMENT, {
      indicatorId: id,
      content,
      options
    })
  }

  delete(id: string) {
    return this.httpClient.delete(C_API_COMMENT + `/${id}`)
  }
}
