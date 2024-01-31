import { Component, OnInit, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { DataSourceService, DataSourceTypesService } from '@metad/cloud/state'
import { AuthenticationEnum, IDataSource, IDataSourceType } from '@metad/contracts'
import { isEmpty, omit } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { BehaviorSubject, firstValueFrom } from 'rxjs'
import {
  LocalAgent,
  ServerAgent,
  ToastrService,
  convertConfigurationSchema,
  getErrorMessage
} from '../../../../@core/index'

@Component({
  selector: 'pac-data-source-creation',
  templateUrl: './creation.component.html',
  styleUrls: ['./creation.component.scss']
})
export class PACDataSourceCreationComponent implements OnInit {
  AuthenticationEnum = AuthenticationEnum

  private typesService = inject(DataSourceTypesService)
  private dataSourceService = inject(DataSourceService)
  private toastrService = inject(ToastrService)
  private translateService = inject(TranslateService)
  private data: IDataSource = inject(MAT_DIALOG_DATA, { optional: true })
  public dialogRef = inject(MatDialogRef<PACDataSourceCreationComponent>)
  private localAgent? = inject(LocalAgent, { optional: true })
  private serverAgent? = inject(ServerAgent, { optional: true })

  loading = false

  public readonly connectionTypes$ = this.typesService.types$.pipe(takeUntilDestroyed())
  public typeFormGroup = new FormGroup({
    type: new FormControl(null, [Validators.required])
  })
  get type(): IDataSourceType {
    return this.typeFormGroup.value?.type?.[0]
  }

  formGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    useLocalAgent: new FormControl(),
    authType: new FormControl<AuthenticationEnum>(null),
    options: new FormGroup({})
  })

  get nameCtrl() {
    return this.formGroup.get('name')
  }
  get options() {
    return this.formGroup.get('options') as FormGroup
  }

  model = {}
  public readonly fields$ = new BehaviorSubject([])

  private _typeFormGroupSub = this.typeFormGroup.valueChanges.subscribe(({ type }) => {
    if (!isEmpty(type)) {
      const i18n = this.translateService.instant('PAC.DataSources.Schema')
      this.fields$.next(convertConfigurationSchema(type[0].configuration, i18n))
    }
  })

  async ngOnInit() {
    if (this.data?.id) {
      const dataSource = await firstValueFrom(this.dataSourceService.getOne(this.data.id))
      this.typeFormGroup.patchValue({
        type: [dataSource.type]
      })
      this.formGroup.patchValue(omit(dataSource, 'id'))
      this.model = dataSource.options
    }
  }

  compareFn(a: IDataSourceType, b: IDataSourceType) {
    return a?.id === b?.id
  }

  async onSave() {
    if (this.formGroup.valid) {
      const result = await firstValueFrom(
        this.dataSourceService.create({
          ...this.formGroup.value,
          typeId: this.type.id
        })
      )

      this.toastrService.success('PAC.MESSAGE.CreateDataSource', { Default: 'Create data source' })
      this.dialogRef.close(result)
    }
  }

  onCancel() {
    this.dialogRef.close()
  }

  onModelChange(event) {}

  async ping() {
    const agent = this.formGroup.value.useLocalAgent ? this.localAgent : this.serverAgent
    this.loading = true
    try {
      await agent.request(
        {
          type: this.type.protocol.toUpperCase(),
          dataSource: {
            ...this.formGroup.value,
            type: this.type
          }
        },
        {
          method: 'get',
          url: 'ping',
          body: {
            ...this.formGroup.value,
            type: this.type
          }
        }
      )

      this.loading = false
      this.toastrService.success('PAC.ACTIONS.PING', { Default: 'Ping' })
    } catch (err) {
      const message = getErrorMessage(err)
      this.loading = false
      this.toastrService.error(message)
    }
  }
}
