import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { Router } from '@angular/router'
import { ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { map, startWith, switchMap, withLatestFrom } from 'rxjs/operators'
import { DefaultProject, IProject, ProjectService, Store, ToastrService } from '../../../@core'
import { InlineSearchComponent } from '../../../@shared'
import { ProjectCreationComponent } from './creation/creation.component'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatInputModule,
    TranslateModule,
    DensityDirective,
    ButtonGroupDirective,
    InlineSearchComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-header-project',
  templateUrl: `./project.component.html`,
})
export class ProjectSelectorComponent {

  private projectService = inject(ProjectService)
  private translateService = inject(TranslateService)

  // @ViewChild('creation') creation: TemplateRef<ElementRef>

  form = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    description: new FormControl(null, []),
  })

  searchControl = new FormControl('')

  private dialogRef: MatDialogRef<ElementRef<any>, any>

  public readonly projects$ = this.projectService.onRefresh().pipe(
    switchMap(() => this.projectService.getMy()),
    switchMap(async (items) => {
      const defaultName = await firstValueFrom(this.translateService.get('PAC.Project.DefaultProject', {Default: 'Default'}))
      return [
        {
          ...DefaultProject,
          name: defaultName
        },
        ...items
      ]
    }),
    switchMap((items) => this.searchControl.valueChanges.pipe(
      startWith(''),
      map((value) => value?.trim().toLowerCase()),
      map((value) => value ? items.filter((item) => item.name.toLowerCase().includes(value)) : items),
    )),
  )

  public readonly project$ = this.store.selectedProject$.pipe(
    withLatestFrom(this.translateService.get('PAC.Project.DefaultProject', {Default: 'Default'})),
    map(([project, defaultName]) => project ?? {...DefaultProject, name: defaultName}),
  )

  private deletedSub = this.projectService.deleted$.pipe(takeUntilDestroyed()).subscribe(async (id) => {
    if (this.store.selectedProject?.id === id) {
      const defaultName = await firstValueFrom(this.translateService.get('PAC.Project.DefaultProject', {Default: 'Default'}))
      // Select default project
      this.selectProject({
        ...DefaultProject,
        name: defaultName
      })
    }
  })
  
  constructor(private store: Store, private _dialog: MatDialog, private _toastrService: ToastrService, private _router: Router,) {}

  selectProject(project: IProject) {
    this.store.selectedProject = project
  }

  async createProject() {
    const newProject = await firstValueFrom(this._dialog.open(ProjectCreationComponent, {}).afterClosed())
    if (newProject) {
      const userId = this.store.user.id
      try {
        const project = await firstValueFrom(this.projectService.create({
          ...newProject,
          models: newProject.models.map((model) => ({id: model.id})),
          ownerId: userId
        }))
        this.store.selectedProject = project
        this._router.navigate(['/project'])
      } catch(err: any) {
        this._toastrService.error(err.message)
      }
    }
  }

}
