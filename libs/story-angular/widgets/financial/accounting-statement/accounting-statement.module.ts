import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTableModule } from '@angular/material/table'
import { MatTooltipModule } from '@angular/material/tooltip'
import { LetDirective } from '@ngrx/component'
import { TranslateModule } from '@ngx-translate/core'
import { ComponentCoreModule } from '@metad/components/core'
import { NxSelectionModule } from '@metad/components/selection'
import { PlaceholderAddComponent } from '@metad/story/story'
import { AccountingStatementComponent } from './accounting-statement.component'
import { DensityDirective } from '@metad/ocap-angular/core'

@NgModule({
  imports: [
    CommonModule,
    LetDirective,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTableModule,

    TranslateModule,

    NxSelectionModule,
    ComponentCoreModule,
    PlaceholderAddComponent,
    DensityDirective
  ],
  exports: [AccountingStatementComponent],
  declarations: [AccountingStatementComponent],
  providers: []
})
export class AccountingStatementModule {
}
