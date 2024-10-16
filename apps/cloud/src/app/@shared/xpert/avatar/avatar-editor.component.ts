import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, effect, forwardRef, inject, input, output, signal } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { AppearanceDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { ScreenshotService } from '../../../@core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'xpert-avatar-editor',
  templateUrl: './avatar-editor.component.html',
  styles: [``],
  imports: [CommonModule, MatIconModule, CdkMenuModule, TranslateModule, DensityDirective, AppearanceDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => XpertAvatarEditorComponent)
    }
  ]
})
export class XpertAvatarEditorComponent implements ControlValueAccessor  {

  private readonly screenshotService = inject(ScreenshotService)

  readonly imageUrl = input<string>()
  readonly imageUrlChange = output<string | null>()

  readonly value = signal<string | null>(null)
  readonly disabled = signal<boolean>(false)

  private onChange: (value: string | null) => void
  private onTouched: (value: string | null) => void

  constructor() {
    effect(() => {
      this.value.set(this.imageUrl())
    }, { allowSignalWrites: true })
  }

  writeValue(obj: any): void {
    this.value.set(obj)
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled)
  }

  async uploadAvatar(event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    const screenshot = await this.uploadScreenshot(file!)
    this.value.set(screenshot.url)
    this.imageUrlChange.emit(this.value())
    this.onChange?.(this.value())
  }

  async uploadScreenshot(fileUpload: File) {
    const formData = new FormData()
    formData.append('file', fileUpload)
    return await firstValueFrom(this.screenshotService.create(formData))
  }

  async remove() {
    this.value.set(null)
    this.imageUrlChange.emit(null)
    this.onChange?.(null)
  }
}
