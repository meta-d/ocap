import { CommonModule } from '@angular/common';
import { Component, computed, inject, model, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IfAnimation, XpertWorkspaceService } from 'apps/cloud/src/app/@core';
import { derivedAsync } from 'ngxtension/derived-async';
import { XpertWorkspaceMembersComponent } from '../members/members.component';
import { CdkListboxModule } from '@angular/cdk/listbox';
import { FormsModule } from '@angular/forms';
import { XpertWorkspaceModelsComponent } from '../models/models.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'xpert-workspace-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkListboxModule, TranslateModule, XpertWorkspaceModelsComponent, XpertWorkspaceMembersComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  animations: [IfAnimation]
})
export class XpertWorkspaceSettingsComponent {
  readonly workspaceService = inject(XpertWorkspaceService)

  readonly #data = inject<{id: string;}>(MAT_DIALOG_DATA)
  readonly #dialogRef = inject(MatDialogRef)

  readonly workspaceId = signal(this.#data.id)

  readonly workspace = derivedAsync(() => {
    return this.workspaceId() ? this.workspaceService.getOneById(this.workspaceId(), { relations: ['owner', 'members']}) : null
  })

  readonly owner = computed(() => this.workspace()?.owner)

  readonly selectedMenus = model<Array<'models' | 'members'>>(['members'])
  readonly menu = computed(() => this.selectedMenus()[0])

  close() {
    this.#dialogRef.close()
  }
}
