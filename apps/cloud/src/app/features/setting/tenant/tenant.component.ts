import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-settings-tenant',
  templateUrl: 'tenant.component.html',
  styles: [
    `
      :host {
        max-width: 100%;
        max-height: 100%;
        display: flex;
        flex-direction: column;
        flex: 1;
      }
    `
  ]
})
export class PACTenantComponent implements OnInit {
  ngOnInit(): void {
  }

}
