import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from "@angular/material/snack-bar";

@Component({
    selector: 'ngm-snack-notification',
    template: `<div class="flex flex-col gap-2">
    <div class="ngm-snack-notification__message text-lg">{{data?.message}}</div>
    <div class="ngm-snack-notification__description opacity-80">{{data?.description}}</div>
</div>
<button mat-icon-button class="ngm-snack-notification__close ngm-density__cosy" (click)="close()">
    <mat-icon>close</mat-icon>
</button>
`,
    styles: [
      `:host {
        display: flex;
        flex-direction: column;
        position: relative;
      }
      .ngm-snack-notification__close {
        position: absolute;
        right: -1rem;
        top: -1rem;
      }
    `,
    ],
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule
    ]
  })
export class NgmNotificationComponent {
  readonly data = inject(MAT_SNACK_BAR_DATA)
  readonly snackBarRef = inject(MatSnackBarRef<NgmNotificationComponent>)
  
  close() {
    this.snackBarRef.dismiss()
  }
}