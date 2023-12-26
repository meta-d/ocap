import { Component, forwardRef } from '@angular/core'
import { NG_VALUE_ACCESSOR } from '@angular/forms'
import { MDXEditorComponent } from '../mdx/mdx.component'

@Component({
  selector: 'ngm-editor-mdx-member',
  templateUrl: './mdx-member.component.html',
  styleUrls: ['./mdx-member.component.scss'],
  host: {
    class: 'ngm-editor-mdx-member'
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
