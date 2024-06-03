import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IsNilPipe } from '@metad/core'
import { PlaceholderAddComponent } from '@metad/story/story'
import { WidgetAnalyticalCardModule } from '@metad/story/widgets/analytical-card'
import { WidgetAnalyticalGridModule } from '@metad/story/widgets/analytical-grid'
import { AccountingIndicatorCardModule } from '@metad/story/widgets/indicator-card'
import { TranslateModule } from '@ngx-translate/core'
import { SwiperModule } from 'swiper/angular'
import { NxWidgetSwiperComponent } from './swiper.component'

@NgModule({
  declarations: [NxWidgetSwiperComponent],
  imports: [
    CommonModule,
    TranslateModule,
    IsNilPipe,
    SwiperModule,
    AccountingIndicatorCardModule,
    WidgetAnalyticalCardModule,
    WidgetAnalyticalGridModule,
    PlaceholderAddComponent
  ],
  exports: [NxWidgetSwiperComponent]
})
export class NxWidgetSwiperModule {}
