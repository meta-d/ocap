import { Component, HostBinding } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'metad-formly-panel-wrapper',
  template: `
<div class="metad-formly__title">{{ to?.label }}</div>
<div class="card-body">
  <ng-container #fieldComponent></ng-container>
</div>
`,
  styles: [
    `:host {
display: flex;
flex-direction: column;
flex: 1;
max-width: 100%;
margin-top: 1rem;
}
:host.metad-formly__panel-padding {
  padding: 0 1.5rem;
}`
  ],
  host: {
    class: 'metad-formly__panel-wrapper'
  }
})
export class MetadFormlyPanelComponent extends FieldWrapper {
  @HostBinding('class.metad-formly__nested-area') nestedArea = true
  @HostBinding('class.metad-formly__panel-padding')
  get isPadding() {
    return this.to?.padding
  }
}
