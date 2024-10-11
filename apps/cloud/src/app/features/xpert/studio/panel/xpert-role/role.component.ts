import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { FFlowModule } from '@foblex/flow'
import { IXpertRole } from '@metad/contracts'
import { convertToUrlPath, XpertRoleService } from 'apps/cloud/src/app/@core'
import { AvatarComponent, MaterialModule } from 'apps/cloud/src/app/@shared'
import { derivedAsync } from 'ngxtension/derived-async'
import { map } from 'rxjs'
import { XpertStudioApiService } from '../../domain'
import { getXpertRoleKey } from '../../domain/types'
import { XpertStudioPanelRoleToolsetComponent } from './toolset/toolset.component'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  selector: 'xpert-studio-panel-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FFlowModule,
    MaterialModule,
    FormsModule,
    TranslateModule,
    AvatarComponent,
    XpertStudioPanelRoleToolsetComponent
  ],
  host: {
    tabindex: '-1',
    '[class.selected]': 'isSelected',
    '(contextmenu)': 'emitSelectionChangeEvent($event)'
  }
})
export class XpertStudioPanelRoleComponent {
  readonly elementRef = inject(ElementRef)
  readonly apiService = inject(XpertStudioApiService)
  readonly xpertService = inject(XpertRoleService)

  readonly xpertRole = input<IXpertRole>()
  readonly calcName = signal('')
  readonly toolsets = computed(() => this.xpertRole()?.toolsets)
  readonly name = computed(() => this.xpertRole()?.name)

  private get hostElement(): HTMLElement {
    return this.elementRef.nativeElement
  }

  private validatedNames = derivedAsync(() => {
    return this.xpertService
      .validateName(this.name())
      .pipe(map((items) => items.filter((item) => item.id !== this.xpertRole().id)))
  })
  readonly nameError = computed(() => !!this.validatedNames()?.length)

  constructor() {
    effect(() => {
      console.log(this.nameError())
    })
  }

  protected emitSelectionChangeEvent(event: MouseEvent): void {
    this.hostElement.focus()
    event.preventDefault()
    // this.selectionService.setColumn(this.tableId, this.column.id);
  }

  onNameChange(event: string) {
    this.apiService.updateXpertRole(getXpertRoleKey(this.xpertRole()), { name: event })
  }
  onTitleChange(event: string) {
    this.apiService.updateXpertRole(getXpertRoleKey(this.xpertRole()), {
      title: event
    })
    this.calcName.set(convertToUrlPath(event))
  }
  onDescChange(event: string) {
    this.apiService.updateXpertRole(getXpertRoleKey(this.xpertRole()), { description: event })
  }
  onBlur() {
    if (!this.xpertRole().name) {
      this.apiService.updateXpertRole(getXpertRoleKey(this.xpertRole()), { name: this.calcName() })
    }
    this.apiService.reload()
  }
}
