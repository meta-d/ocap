import { HttpClient } from '@angular/common/http'
import { Component } from '@angular/core'
import { map } from 'rxjs/operators'

@Component({
  selector: 'metad-ocap-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title$ = this.httpClient.get<{ message: string }>('/api').pipe(map((res) => res.message))

  constructor(private httpClient: HttpClient) {}
}
