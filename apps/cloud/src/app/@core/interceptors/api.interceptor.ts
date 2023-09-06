import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { API_PREFIX } from '@metad/cloud/state'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'

const baseUrl = environment.API_BASE_URL

@Injectable()
export class APIInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (baseUrl && request.url.startsWith(`${API_PREFIX}`)) {
      const url = baseUrl + request.url
      // console.log(`API Request: ${request.url} -> ${url}`);
      request = request.clone({
        url: url
      })
    }
    return next.handle(request)
  }
}
