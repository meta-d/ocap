import { CommonModule } from '@angular/common'
import { Component, ViewChild, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatRadioModule } from '@angular/material/radio'
import { MatStepper, MatStepperModule } from '@angular/material/stepper'
import { Router } from '@angular/router'
import { DataSourceService, DataSourceTypesService } from '@metad/cloud/state'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { omit } from '@metad/ocap-core'
import { FormlyModule } from '@ngx-formly/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { BehaviorSubject, combineLatest, firstValueFrom, map, startWith } from 'rxjs'
import {
  AuthStrategy,
  BonusTypeEnum,
  CurrenciesEnum,
  DEFAULT_TENANT,
  DefaultValueDateTypeEnum,
  IDataSourceType,
  IOrganization,
  LanguagesEnum,
  MatchValidator,
  OrganizationsService,
  ServerAgent,
  TenantService,
  ToastrService,
  convertConfigurationSchema,
  getErrorMessage
} from '../../@core'

@Component({
  standalone: true,
  selector: 'ngm-tenant-details',
  templateUrl: './tenant-details.component.html',
  styleUrls: ['./tenant-details.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatStepperModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    FormlyModule,

    NgmCommonModule
  ]
})
export class TenantDetailsComponent {
  private readonly tenantService = inject(TenantService)
  private readonly typesService = inject(DataSourceTypesService)
  private readonly dataSourceService = inject(DataSourceService)
  private readonly organizationsService = inject(OrganizationsService)
  private readonly serverAgent? = inject(ServerAgent, { optional: true })
  private readonly authStrategy = inject(AuthStrategy)
  private readonly _formBuilder = inject(FormBuilder)
  private readonly router = inject(Router)
  private readonly translateService = inject(TranslateService)
  private readonly toastrService = inject(ToastrService)

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
  demoFormGroup: FormGroup = this._formBuilder.group({
    source: ['github', Validators.required]
  })

  dataSourceTypeFormGroup: FormGroup = this._formBuilder.group({
    type: [null, [Validators.required]],
    name: [null, [Validators.required]]
  })
  get type() {
    return this.dataSourceTypeFormGroup.get('type').value?.[0]
  }

  defaultOrganization = signal<IOrganization>(null)

  loading = signal(false)
  tenantCompleted = signal(false)
  demoError = signal<string>(null)
  demoCompleted = signal(false)
  connectionCompleted = signal(false)

  searchControl = new FormControl()
  private readonly dataSourceTypes$ = new BehaviorSubject<IDataSourceType[]>([])
  public readonly filteredDataSourceTypes = toSignal(
    combineLatest([this.dataSourceTypes$, this.searchControl.valueChanges.pipe(startWith(''))]).pipe(
      map(([types, search]) =>
        search ? types.filter((type) => type.name.toLowerCase().includes(search.toLowerCase())) : types
      )
    )
  )

  formlyFields = toSignal(
    combineLatest([
      this.translateService.stream('PAC.DataSources.Schema'),
      this.dataSourceTypeFormGroup.get('type').valueChanges
    ]).pipe(map(([i18n, type]) => convertConfigurationSchema(type[0].configuration, i18n)))
  )

  model = {}

  minlengthError() {
    return this.userFormGroup.get('password').getError('minlength')
  }

  mustMatchError() {
    return this.userFormGroup.get('confirmPassword').getError('mustMatch')
  }

  dataSourceNameError() {
    return this.dataSourceTypeFormGroup.get('name').getError('required')
  }

  async onboard() {
    this.loading.set(true)
    try {
      const tenant = await this.tenantService.onboard({
        name: DEFAULT_TENANT,
        superAdmin: {
          firstName: this.userFormGroup.get('firstName').value,
          lastName: this.userFormGroup.get('lastName').value,
          email: this.userFormGroup.get('email').value,
          hash: this.userFormGroup.get('password').value,
          preferredLanguage: this.preferredLanguageFormGroup.get('preferredLanguage').value[0]
        },
        defaultOrganization: {
          name: this.userFormGroup.get('organizationName').value,
          preferredLanguage: this.preferredLanguageFormGroup.get('preferredLanguage').value[0],
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

      this.tenantCompleted.set(true)
      this.loading.set(false)
      this.defaultOrganization.set(tenant.organizations[0])
    } catch (error) {
      this.loading.set(false)
      this.toastrService.error(getErrorMessage(error))
      return
    }

    this.stepper.next()
    await this.afterOnboard()
  }

  async afterOnboard() {
    await firstValueFrom(
      this.authStrategy.login({
        email: this.userFormGroup.get('email').value,
        password: this.userFormGroup.get('password').value
      })
    )

    this.dataSourceTypes$.next(await firstValueFrom(this.typesService.getAll()))
  }

  async generateDemo() {
    try {
      this.demoError.set(null)
      this.loading.set(true)
      await firstValueFrom(
        this.organizationsService.demo(this.defaultOrganization().id, {
          source: this.demoFormGroup.get('source').value
        })
      )

      this.toastrService.success('PAC.Onboarding.GenerateDemoSuccess', {
        Default: 'Demo data & samples generated successfully!'
      })
      this.demoCompleted.set(true)
      this.loading.set(false)
      this.stepper.next()
    } catch (error) {
      this.loading.set(false)
      const errorText = getErrorMessage(error)
      this.demoError.set(errorText)
      this.toastrService.error(errorText)
    }
  }

  navigateHome() {
    this.router.navigate(['home'])
  }

  compareTypeFn(a: IDataSourceType, b: IDataSourceType) {
    return a?.id === b?.id
  }

  onModelChange(event) {
    // console.log(event)
  }

  async connectDatabase() {
    this.loading.set(true)
    const dataSource = {
      name: this.dataSourceTypeFormGroup.value.name,
      type: this.type,
      options: {
        ...omit(this.dataSourceTypeFormGroup.value, 'type', 'name')
      }
    }
    try {
      await this.serverAgent.request(
        {
          type: this.type.protocol.toUpperCase(),
          dataSource: {
            ...this.dataSourceTypeFormGroup.value,
            typeId: this.type.id
          }
        },
        {
          method: 'get',
          url: 'ping',
          body: dataSource
        }
      )

      this.toastrService.success('PAC.ACTIONS.PING', { Default: 'Ping' })

      // Create datadource
      this.dataSourceService
      const result = await firstValueFrom(this.dataSourceService.create(dataSource))
      this.toastrService.success('PAC.MESSAGE.CreateDataSource', { Default: 'Create data source' })
      this.loading.set(false)
      this.connectionCompleted.set(true)
      this.stepper.next()
    } catch (err) {
      const message = getErrorMessage(err)
      this.loading.set(false)
      this.toastrService.error(message)
    }
  }
}
