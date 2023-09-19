import { Component, HostBinding, OnInit } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { cloneDeep, isNil, negate } from 'lodash-es'
import { combineLatest, Observable } from 'rxjs'
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators'
import { convertConfigurationSchema, PACNotificationDestinationsService, INotificationDestination } from '../../../../@core/index'

@Component({
  selector: 'pac-edit-destination',
  templateUrl: './edit-destination.component.html',
  styleUrls: ['./edit-destination.component.scss'],
})
export class EditDestinationComponent implements OnInit {
  @HostBinding('class.ngm-dialog-container') isDialogContainer = true
  
  destination$: Observable<{
    destination: INotificationDestination
    schema: any
  }>

  pristine
  formGroup = new UntypedFormGroup({
    id: new UntypedFormControl(),
    name: new UntypedFormControl(),
    type: new UntypedFormControl(),
    icon: new UntypedFormControl(),
    options: new UntypedFormGroup({}),
  })
  get nameCtrl() {
    return this.formGroup.get('name')
  }
  get options() {
    return this.formGroup.get('options') as UntypedFormGroup
  }
  constructor(private destinationService: PACNotificationDestinationsService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.destination$ = this.route.paramMap.pipe(
      startWith(this.route.snapshot.paramMap),
      map(paramMap => paramMap.get('id')),
      switchMap((id) => {
        return combineLatest([
          this.destinationService.getOne(id).pipe(
            filter((destination) => negate(isNil)(destination.options)),
            tap((destination) => {
              this.pristine = cloneDeep(destination)
              this.formGroup.clearValidators()
              this.formGroup.reset()
              this.formGroup.patchValue(destination)
            })
          ),
          this.destinationService.getTypes(),
        ]).pipe(
          map(([destination, types]) => {
            let schema = null
            const type = types?.find((item) => item.type === destination.type)
            if (type) {
              schema = convertConfigurationSchema(type.schema)
            }
            return {
              destination,
              schema,
            }
          })
        )
      })
    )
  }

  onSave() {
    this.destinationService.create(this.formGroup.value)
  }

  onCancel() {
    this.formGroup.clearValidators()
    this.formGroup.reset(cloneDeep(this.pristine))
  }
}
