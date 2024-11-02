import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { NgmDensityDirective } from '@metad/ocap-angular/core'

@Component({
  standalone: true,
  imports: [
    CommonModule
  ],
  selector: 'ngm-spin',
  templateUrl: 'spin.component.html',
  styleUrls: ['spin.component.scss'],
  hostDirectives: [
    {
        directive: NgmDensityDirective,
        inputs: [ 'small', 'large' ]
    }
  ]
})
export class NgmSpinComponent {
    
}