import { CommonModule } from "@angular/common";
import { Component, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { NgmDesignerFormComponent, NxDesignerModule, STORY_DESIGNER_SCHEMA } from "@metad/story/designer";
import { TranslateModule } from "@ngx-translate/core";
import { ReferenceLineSchemaService } from "../schemas";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";


@Component({
    standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      MatButtonModule,
      MatIconModule,
      TranslateModule,
  
      NxDesignerModule,
      NgmDesignerFormComponent
    ],
    selector: 'ngm-reference-line',
    template: `<ngm-designer-form class="w-full" [formControl]="formControl"></ngm-designer-form>`,
    styles: [`:host {padding: 0;}`],
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        multi: true,
        useExisting: forwardRef(() => NgmReferenceLineComponent)
      },
      {
        provide: STORY_DESIGNER_SCHEMA,
        useClass: ReferenceLineSchemaService
      },
    ]
  })
  export class NgmReferenceLineComponent implements ControlValueAccessor {
    formControl = new FormControl({referenceLines: []})

    private valueSub = this.formControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
        this.onChange?.(value.referenceLines)
    })

    onChange: (input: any) => void
    onTouched: () => void
  
    writeValue(obj: any): void {
      if (obj) {
        this.formControl.patchValue({referenceLines: obj})
      }
    }
    registerOnChange(fn: any): void {
      this.onChange = fn
    }
    registerOnTouched(fn: any): void {
      this.onTouched = fn
    }
    setDisabledState?(isDisabled: boolean): void {
      isDisabled ? this.formControl.disable() : this.formControl.enable()
    }
  }