import { CommonModule } from '@angular/common'
import { Component, ViewChild, inject, signal } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatStepper, MatStepperModule } from '@angular/material/stepper'
import { BonusTypeEnum, CurrenciesEnum, DEFAULT_TENANT, DefaultValueDateTypeEnum, LanguagesEnum, MatchValidator, TenantService } from '../../@core'
import { MatDividerModule } from '@angular/material/divider'
import { Router } from '@angular/router'


@Component({
  standalone: true,
  selector: 'ngm-tenant-details',
  templateUrl: './tenant-details.component.html',
  styleUrls: ['./tenant-details.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    MatDividerModule
  ]
})
export class TenantDetailsComponent {
  private readonly tenantService = inject(TenantService)
  private readonly _formBuilder = inject(FormBuilder)
  private readonly router = inject(Router)

  @ViewChild('stepper') stepper: MatStepper

  Languages = Object.values(LanguagesEnum)

  preferredLanguageFormGroup: FormGroup = this._formBuilder.group({ preferredLanguage: ['', [Validators.required]] })
  userFormGroup: FormGroup = this._formBuilder.group(
    {
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      organizationName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    },
    {
      validators: [MatchValidator.mustMatch('password', 'confirmPassword')]
    }
  )

  loading = signal(false)

  minlengthError() {
    return this.userFormGroup.get('password').getError('minlength')
  }

  mustMatchError() {
    return this.userFormGroup.get('confirmPassword').getError('mustMatch')
  }

  async onboard() {
    this.loading.set(true)
    try {
      const tenant = await this.tenantService.onboard({ name: DEFAULT_TENANT,
        superAdmin: {
          firstName: this.userFormGroup.get('firstName').value,
          lastName: this.userFormGroup.get('lastName').value,
          email: this.userFormGroup.get('email').value,
          hash: this.userFormGroup.get('password').value,
          preferredLanguage: this.preferredLanguageFormGroup.get('preferredLanguage').value
        },
        defaultOrganization: {
          name: this.userFormGroup.get('organizationName').value,
          preferredLanguage: this.preferredLanguageFormGroup.get('preferredLanguage').value,
          currency: CurrenciesEnum.USD,
          profile_link: '',
          imageUrl: '',
          isDefault: true,
          client_focus: '',
          defaultValueDateType: DefaultValueDateTypeEnum.TODAY,
          bonusType: BonusTypeEnum.PROFIT_BASED_BONUS,
          tenant: null
        }
      })
      this.loading.set(false)
    } catch (error) {
      this.loading.set(false)
      console.error(error)
    }

    this.stepper.next()
  }

  navigateHome() {
    this.router.navigate(['home'])
  }
}
