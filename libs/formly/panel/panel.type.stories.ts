import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { MetadFormlyPanelModule } from './panel.module';
import { MetadFormlyPanelComponent } from './panel.type';


export default {
  title: 'Material/Panel',
  component: MetadFormlyPanelComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatButtonModule,
        FormlyModule.forRoot(),
        FormlyMaterialModule,
        MetadFormlyPanelModule,
      ],
    }),
  ],
} as Meta<MetadFormlyPanelComponent>;

const Template: Story<any> = (args: MetadFormlyPanelComponent) => ({
  props: args,
  template: `<formly-form [form]="form" [fields]="schema" [model]="model"></formly-form>
<button mat-button [disabled]="form.invalid">Submit</button>
<div>Result:</div>
<pre>{{form.value | json}}</pre>`,
});

function fieldGroup() {
  return [
    {
      key: 'show',
      type: 'checkbox',
      templateOptions: {
        label: 'Is Show',
      },
    },
    {
      key: 'type',
      type: 'select',
      templateOptions: {
        label: 'Type',
        options: [
          { value: 'value', label: 'Value' },
          { value: 'category', label: 'Category' },
        ],
      },
    },
  ]
}

export const Primary = Template.bind({});
Primary.args = {
  form: new FormGroup({}),
  model: {},
  schema: [
    {
      key: 'value',
      wrappers: ['panel'],
      templateOptions: {
        label: 'Panel Type',
        padding: true
      },
      fieldGroup: fieldGroup(),
    },
  ],
};
