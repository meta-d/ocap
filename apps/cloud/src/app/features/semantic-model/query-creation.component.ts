import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { Component, HostBinding, OnInit } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatSelectModule } from '@angular/material/select'
import { ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { ModelsService } from '@metad/cloud/state'
import { firstValueFrom } from 'rxjs'
import { ModelQueryService, uuid } from '../../@core'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    DragDropModule,
    MatButtonModule,
    MatInputModule,
    MatProgressBarModule,

    MatSelectModule,

    ButtonGroupDirective,
    DensityDirective
  ],
  selector: 'pac-query-creation',
  template: `<header mat-dialog-title cdkDrag cdkDragRootElement=".cdk-overlay-pane" cdkDragHandle>
      <h4 style="pointer-events: none;">
        {{ 'PAC.MODEL.CreateQuery' | translate: { Default: 'Create Query' } }}
      </h4>
    </header>

    <div mat-dialog-content>
      <form class="flex flex-col justify-start items-stretch" 
        [formGroup]="formGroup" (ngSubmit)="create()">
        <mat-form-field appearance="fill" floatLabel="always">
          <mat-label>
            {{ 'PAC.KEY_WORDS.Name' | translate: { Default: 'Name' } }}
          </mat-label>
          <input matInput formControlName="name" placeholder="{{ 'PAC.MODEL.QueryName' | translate: { Default: 'Short name of query' } }}" />
        </mat-form-field>

        <mat-form-field appearance="fill" floatLabel="always">
          <mat-label>
            {{ 'PAC.KEY_WORDS.Model' | translate: { Default: 'Model' } }}
          </mat-label>
          <mat-select formControlName="modelId"
            placeholder="{{
              'PAC.MODEL.QueryBaseModelPlaceholder' | translate: { Default: 'Which model space do you want query' }
            }}?"
          >
            <mat-option *ngFor="let model of models$ | async" [value]="model.id">
              {{ model.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <button type="submit"></button>
      </form>
    </div>

    <div mat-dialog-actions>
      <div ngmButtonGroup>
        <button mat-stroked-button mat-dialog-close cdkFocusInitial>
          {{ 'PAC.ACTIONS.CANCEL' | translate: { Default: 'Cancel' } }}
        </button>
      </div>

      <div ngmButtonGroup>
        <button mat-raised-button color="accent" [disabled]="formGroup.invalid" (click)="create()">
          {{ 'PAC.ACTIONS.CREATE' | translate: { Default: 'Create' } }}
        </button>
      </div>
    </div> `,
  styles: [``],
  providers: []
})
export class QueryCreationDialogComponent implements OnInit {
  @HostBinding('class.ngm-dialog-container') isDialogContainer = true

  formGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    modelId: new FormControl(null, [Validators.required]),
  })
  public readonly models$ = this.modelsService.getMy()
  constructor(
    public dialogRef: MatDialogRef<QueryCreationDialogComponent>,
    private modelsService: ModelsService,
    private modelQueryService: ModelQueryService
  ) {}

  ngOnInit(): void {}

  async create() {
    if (!this.formGroup.invalid) {
      const query = await firstValueFrom(
        this.modelQueryService.create({
          ...this.formGroup.value,
          key: uuid(),
        })
      )

      this.dialogRef.close(query)
    }
  }
}
