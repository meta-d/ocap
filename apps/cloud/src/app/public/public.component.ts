import { Component } from '@angular/core'

@Component({
  selector: 'metad-ocap-public',
  templateUrl: 'public.component.html',
  styles: [`:host {
    display: flex;
    flex: 1;
    height: 100%;
    overflow: auto;
}
`]
})
export class PublicComponent {
}
