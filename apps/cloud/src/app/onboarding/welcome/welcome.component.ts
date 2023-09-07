import { Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { Router } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'

@Component({
  standalone: true,
  selector: 'ngm-onboarding-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  imports: [MatButtonModule, TranslateModule]
})
export class WelcomeComponent {
  private translate = inject(TranslateService)
  private router = inject(Router)
  private route = inject(Router)

  navigateTenant() {
    this.router.navigate(['onboarding', 'tenant'])
  }
}
