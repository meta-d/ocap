import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'pac-not-found',
  styleUrls: ['./not-found.component.scss'],
  templateUrl: './not-found.component.html',
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule
  ]
})
export class NotFoundComponent {
  readonly #router = inject(Router)

  goToHome() {
    this.#router.navigate(['/home'])
  }
}
