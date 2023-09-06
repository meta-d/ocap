import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { Component, TemplateRef, ViewChild, inject } from '@angular/core'
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router } from '@angular/router'
import { IModelRole } from '@metad/contracts'
import { cloneDeep } from '@metad/ocap-core'
import { uuid } from 'apps/cloud/src/app/@core'
import { firstValueFrom } from 'rxjs'
import { AccessControlStateService } from './access-control.service'

@Component({
  selector: 'pac-model-access-control',
  templateUrl: 'access-control.component.html',
  providers: [AccessControlStateService],
  host: {
    class: 'pac-model-access-control'
  },
  styles: [
    `
      :host {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
    `
  ]
})
export class AccessControlComponent {
  private accessControlState = inject(AccessControlStateService)
  private _dialog = inject(MatDialog)
  private route = inject(ActivatedRoute)
  private router = inject(Router)

  @ViewChild('creatTmpl') creatTmpl: TemplateRef<any>

  creatFormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, this.forbiddenNameValidator()]),
    type: new FormControl(),
    options: new FormControl()
  })
  get name() {
    return this.creatFormGroup.get('name')
  }

  role: IModelRole

  get roles() {
    return this.accessControlState.roles
  }

  trackByKey(index: number, item: IModelRole) {
    return item.key
  }

  async openCreate() {
    await firstValueFrom(this._dialog.open(this.creatTmpl).afterClosed())
  }

  async onCreate() {
    const key = uuid()
    this.accessControlState.addRole({
      ...this.creatFormGroup.value,
      key
    } as IModelRole)
    this.router.navigate([key], { relativeTo: this.route })
    this.creatFormGroup.reset()
  }

  remove(role: IModelRole) {
    this.accessControlState.removeRole(role.key)
    if (this.roles.length) {
      this.router.navigate([this.roles[0].key], { relativeTo: this.route })
    } else {
      this.router.navigate(['overview'], { relativeTo: this.route })
    }
  }

  drop(event: CdkDragDrop<IModelRole[]>) {
    this.accessControlState.moveRoleInArray(event)
  }

  forbiddenNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const index = this.roles?.findIndex((item) => item.name === control.value)
      const forbidden = index > -1
      return forbidden ? { forbiddenName: { value: control.value } } : null
    }
  }

  async duplicate(role: IModelRole) {
    this.creatFormGroup.setValue({
      name: role.name,
      type: role.type,
      options: cloneDeep(role.options)
    })
    await this.openCreate()
  }
}
