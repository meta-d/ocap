import { AfterViewInit, Component, ViewChild } from '@angular/core'
import { MatTabGroup } from '@angular/material/tabs'
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core'

@Component({
  selector: 'pac-formly-tab-group',
  templateUrl: './tab-group.component.html',
  styleUrls: ['./tab-group.component.scss'],
  host: {
    class: 'pac-formly-tab-group'
  }
})
export class PACFormlyTabGroupComponent extends FieldType implements AfterViewInit {
  @ViewChild('tabGroup') tabGroup: MatTabGroup

  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   this.tabGroup.realignInkBar()
    // }, 1000);
  }

  isValid(field: FormlyFieldConfig) {
    if (field.key) {
      return field.formControl?.valid
    }

    return field.fieldGroup?.every((f) => this.isValid(f))
  }
}
