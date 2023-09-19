import { Component, HostBinding, Inject, Input, OnInit, ViewChild } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ITag, IUser } from '@metad/contracts'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { TranslateModule } from '@ngx-translate/core'
import { Store } from '../../../@core/services/store.service'
import { BasicInfoFormComponent, UserFormsModule } from '../forms'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { ToastrService } from '../../../@core'

@Component({
  standalone: true,
  imports: [
		FormsModule,
		MatDialogModule,
		MatIconModule,
		MatButtonModule,
		DragDropModule,
		TranslateModule,
    ButtonGroupDirective,
    
		UserFormsModule
	],
  selector: 'pac-user-mutation',
  templateUrl: './user-mutation.component.html',
  styleUrls: ['./user-mutation.component.scss']
})
export class UserMutationComponent implements OnInit {
  @HostBinding('class.ngm-dialog-container') isDialogContainer = true

  @ViewChild('userBasicInfo')
  userBasicInfo: BasicInfoFormComponent
  tags: ITag[]
  selectedTags: any

  @Input() public isAdmin: boolean
  @Input() public isSuperAdmin: boolean

  constructor(
    protected dialogRef: MatDialogRef<UserMutationComponent>,
    protected store: Store,
    @Inject(MAT_DIALOG_DATA)
    private data: {isAdmin: boolean, isSuperAdmin: boolean},
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.data.isAdmin
    this.isSuperAdmin = this.data.isSuperAdmin
  }
  selectedTagsEvent(ev) {
    this.tags = ev
  }

  closeDialog(user: IUser = null) {
    this.dialogRef.close({ user })
  }

  async add() {
    try {
      const organization = this.store.selectedOrganization
      const user = await this.userBasicInfo.registerUser(
        organization?.id,
        this.store.userId
      )
      this.closeDialog(user)
    } catch (error) {
      this.toastrService.danger(error);
    }
  }
}
