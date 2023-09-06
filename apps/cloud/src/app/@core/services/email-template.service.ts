import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import {
  ICustomizableEmailTemplate,
  ICustomizeEmailTemplateFindInput,
  IEmailTemplate,
  IEmailTemplateFindInput,
  IEmailTemplateSaveInput
} from '@metad/contracts'
import { API_PREFIX } from '@metad/cloud/state'
import { firstValueFrom } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {
  constructor(private http: HttpClient) {}

  getAll(
    relations?: string[],
    findInput?: IEmailTemplateFindInput
  ): Promise<{ items: IEmailTemplate[]; total: number }> {
    const data = JSON.stringify({ relations, findInput })
    return firstValueFrom(
      this.http.get<{ items: IEmailTemplate[]; total: number }>(`${API_PREFIX}/email-template`, {
        params: { data }
      })
    )
  }
  getTemplate(findInput?: ICustomizeEmailTemplateFindInput): Promise<ICustomizableEmailTemplate> {
    const data = JSON.stringify({ findInput })
    return firstValueFrom(
      this.http.get<ICustomizableEmailTemplate>(`${API_PREFIX}/email-template/template`, {
        params: { data }
      })
    )
  }

  generateTemplatePreview(data: string): Promise<{ html: string }> {
    return firstValueFrom(
      this.http.post<{ html: string }>(`${API_PREFIX}/email-template/template/preview`, {
        data
      })
    )
  }

  saveEmailTemplate(data: IEmailTemplateSaveInput): Promise<ICustomizableEmailTemplate> {
    return firstValueFrom(
      this.http.post<ICustomizableEmailTemplate>(`${API_PREFIX}/email-template/template/save`, {
        data
      })
    )
  }

}
