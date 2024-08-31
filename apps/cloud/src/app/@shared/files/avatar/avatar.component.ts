import { CommonModule } from '@angular/common'
import { Component, input } from '@angular/core'

@Component({
    standalone: true,
    selector: 'pac-avatar',
    template: `<img class="" [src]="imageUrl() || '/assets/images/avatar-default.svg'" [alt]="alt()" />`,
    styles: [`:host {
  display: flex;
  justify-content: center;
  align-items: center;
}`],
    imports: [CommonModule]
})
export class AvatarComponent {
  readonly imageUrl = input.required<string>()
  readonly alt = input<string>()
}
