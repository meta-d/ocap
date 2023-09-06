import { ComponentPortal } from '@angular/cdk/portal'
import { ChangeDetectorRef, Component, inject } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { filter } from 'rxjs/operators'
import { NxSettingsPanelService } from '../settings-panel/settings-panel.service'

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'pac-designer-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  host: {
    class: 'pac-designer-panel'
  }
})
export class DesignerPanelComponent {
  private designerService = inject(NxSettingsPanelService)
  private _cdr = inject(ChangeDetectorRef)

  settingsPortal: ComponentPortal<unknown>
  
  // Subscribers
  private _settingsComponentSub = this.designerService.settingsComponent$
    .pipe(filter(Boolean))
    .subscribe(({ settingsPortals, drawer, title }) => {
      this._cdr.markForCheck()
      this._cdr.detectChanges()
    })
}
