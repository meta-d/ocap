import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { NxFlexLayoutComponent } from './flex-layout/flex-layout.component'


@NgModule({
  declarations: [
    NxFlexLayoutComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  exports: [
    NxFlexLayoutComponent
  ],
})
export class NxStoryResponsiveModule {}
