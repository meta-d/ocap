import { HttpClient } from '@angular/common/http'
import { Component } from '@angular/core'

@Component({
  selector: 'metad-ocap-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // title$ = this.httpClient.get<{ message: string }>('/api').pipe(map((res) => res.message))

  // show = false
  // cards = [
  //   ...MAP_CARDS,
  //   // ...CARTESIAN_CARDS
  // ]
  constructor(private httpClient: HttpClient) {}
}
