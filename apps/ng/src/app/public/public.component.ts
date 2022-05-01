import { Component } from '@angular/core'
import { CARTESIAN_CARDS, MAP_CARDS } from '../types'

@Component({
  selector: 'metad-ocap-public',
  templateUrl: 'public.component.html',
  styles: [`:host {display: flex; flex: 1;}
metad-analytical-card {
  height: 350px;
  border-radius: 6px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}
`]
})
export class PublicComponent {
  cards = [
    ...MAP_CARDS,
    ...CARTESIAN_CARDS
  ]
}
