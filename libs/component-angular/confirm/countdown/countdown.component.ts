import { Component, HostBinding } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'
import { CountdownConfig, CountdownEvent, CountdownTimer } from '@metad/components/countdown'

@Component({
  selector: 'pac-countdown-confirmation',
  templateUrl: 'countdown.component.html',
  styles: [
    `
      .center {
        align-items: center;
        width: 350px;
      }
    `
  ],
  providers: [CountdownTimer]
})
export class CountdownConfirmationComponent {
  recordType: string
  isEnabled: boolean
  countDownConfig: CountdownConfig = { leftTime: 5 }

  @HostBinding('class.nx-dialog-container') isDialogContainer = true

  constructor(protected dialogRef: MatDialogRef<CountdownConfirmationComponent>) {}

  handleActionEvent(e: CountdownEvent) {
    if (e.action === 'done') {
      this.dialogRef.close('continue')
    }
  }

  close() {
    this.dialogRef.close()
  }

  continue() {
    this.dialogRef.close('continue')
  }
}
