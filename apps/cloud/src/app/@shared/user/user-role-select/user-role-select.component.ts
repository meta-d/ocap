import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, ElementRef, Inject, Input, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ISelectOption } from '@metad/ocap-angular/core'
import { UsersService } from '@metad/cloud/state'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'
import { MatInputModule } from '@angular/material/input'
import {MatChipsModule} from '@angular/material/chips'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon'
import { SharedModule } from '../../shared.module'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { catchError, debounceTime, EMPTY, filter, of, switchMap, tap } from 'rxjs'
import { IUser } from '../../../@core'
import { userLabel } from '../../pipes'

@Component({
  standalone: true,
  imports: [
    SharedModule,
    
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatDialogModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,

    TranslateModule,

    ButtonGroupDirective,

    NgmCommonModule
  ],
  selector: 'pac-user-role-select',
  templateUrl: 'user-role-select.component.html',
  styleUrls: ['user-role-select.component.scss']
})
export class UserRoleSelectComponent {
  separatorKeysCodes: number[] = [ENTER, COMMA]
  userLabel = userLabel

  @Input() single: boolean

  role = null
  users: IUser[] = []
  loading = false
  searchControl = new FormControl()
  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>

  public readonly users$ = this.searchControl.valueChanges.pipe(
    debounceTime(500),
    filter((value) => typeof value === 'string'),
    switchMap((text) => {
      if (text.trim()) {
        this.loading = true
        return this.userService.search(text).pipe(
          catchError((err) => {
            this.loading = false
            return EMPTY
          })
        )
      }
      return of([])
    }),
    tap((items) => (this.loading = false)),
  )

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { role: string; roles: ISelectOption[], single?: boolean },
    private _dialogRef: MatDialogRef<UserRoleSelectComponent>,
    private userService: UsersService,
  ) {
    this.role = data?.role
    this.single = this.data?.single
  }

  displayWith(user: IUser) {
    if (user === null) {
      return null
    }
    return user.fullName || user.firstName + user.firstName || user.email
  }

  remove(user: IUser): void {
    const index = this.users.indexOf(user)

    if (index >= 0) {
      this.users.splice(index, 1)
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (event.option.value && !this.users.find((item) => item.id === event.option.value.id)) {
      if (this.single) {
        this.users = [event.option.value]
      } else {
        this.users.push(event.option.value)
      }
    }
    this.userInput.nativeElement.value = ''
    this.searchControl.setValue(null)
  }

  onApply() {
    this._dialogRef.close({
      role: this.role,
      users: this.users
    })
  }
}
