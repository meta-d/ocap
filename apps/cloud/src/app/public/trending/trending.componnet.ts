import { Component } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'pac-public-trending',
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.scss']
})
export class TrendingComponent {
    
}
