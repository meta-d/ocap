import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { AppearanceDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NgmDndDirective } from '@metad/core'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    AppearanceDirective,
    DensityDirective,
    NgmDndDirective
  ],
  selector: 'pac-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  @Input() files: File[] = []

  @Input() get multiple() {
    return this._multiple
  }
  set multiple(value: boolean | string) {
    this._multiple = coerceBooleanProperty(value)
  }
  private _multiple = false

  @Output() filesChange = new EventEmitter()

  ngOnInit(): void {}

  /**
   * on file drop handler
   */
  async onFileDropped(event) {
    await this.uploadStorageFile(event)
  }

  /**
   * handle file from browsing
   */
  async fileBrowseHandler(event) {
    await this.uploadStorageFile(event.files)
  }

  async uploadStorageFile(files: FileList) {
    this.files.push(...Array.from(files))

    this.filesChange.emit(this.files)
  }

  removeFile(index: number) {
    this.files.splice(index, 1)
    this.files = [...this.files]
    this.filesChange.emit(this.files)
  }
}
