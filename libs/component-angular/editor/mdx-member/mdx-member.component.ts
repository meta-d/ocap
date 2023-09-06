import { Component, forwardRef } from '@angular/core'
import { NG_VALUE_ACCESSOR } from '@angular/forms'
import { UntilDestroy } from '@ngneat/until-destroy'
import { MDXEditorComponent } from '../mdx/mdx.component'

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'nx-editor-mdx-member',
  templateUrl: './mdx-member.component.html',
  styleUrls: ['./mdx-member.component.scss'],
  host: {
    class: 'nx-editor-mdx-member'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MDXMemberEditorComponent)
    }
  ]
})
export class MDXMemberEditorComponent extends MDXEditorComponent {}
