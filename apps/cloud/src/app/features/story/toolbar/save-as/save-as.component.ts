// import { CommonModule } from '@angular/common'
// import { Component, Inject, OnInit } from '@angular/core'
// import { FormsModule } from '@angular/forms'
// import { MAT_DIALOG_DATA } from '@angular/material/dialog'
// import { TranslateModule } from '@ngx-translate/core'
// import { MaterialModule } from 'apps/cloud/src/app/@shared'

// export interface StorySaveAsData {
//   name?: string
//   description?: string
// }

// @Component({
//   standalone: true,
//   imports: [
//     CommonModule,
//     MaterialModule,
//     FormsModule,
//     TranslateModule
//   ],
//   selector: 'nx-story-save-as',
//   templateUrl: './save-as.component.html',
//   styles: [``],
//   host: {
//     class: 'nx-dialog-container'
//   }
// })
// export class StorySaveAsComponent implements OnInit {
//   model: StorySaveAsData = {}
//   constructor(@Inject(MAT_DIALOG_DATA) public data: StorySaveAsData) {
//     this.model = {
//       ...this.data
//     }
//   }

//   ngOnInit(): void {
//     //
//   }
// }
