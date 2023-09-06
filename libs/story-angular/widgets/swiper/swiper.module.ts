import { CommonModule } from '@angular/common'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { IsNilPipe } from '@metad/core'
import { PlaceholderAddComponent } from '@metad/story/story'
import { WidgetAnalyticalCardModule } from '@metad/story/widgets/analytical-card'
import { WidgetAnalyticalGridModule } from '@metad/story/widgets/analytical-grid'
import { AccountingIndicatorCardModule } from '@metad/story/widgets/indicator-card'
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
export class NxWidgetSwiperModule {
  static forRoot(): ModuleWithProviders<NxWidgetSwiperModule> {
    return {
      ngModule: NxWidgetSwiperModule,
      providers: [
        // {
        //   provide: STORY_WIDGET_COMPONENT,
        //   useValue: {
        //     type: 'Swiper',
        //     component: NxWidgetSwiperComponent,
        //     mapping: ['title', 'options'],
        //     menu: [
        //       {
        //         icon: 'edit',
        //         action: 'edit',
        //         label: 'Edit Input Control'
        //       }
        //     ],
        //     icon: 'swipe',
        //     label: '滑动卡片组'
        //   },
        //   multi: true
        // },
        // {
        //   provide: STORY_DESIGNER_COMPONENT,
        //   useValue: {
        //     type: 'Swiper',
        //     component: NxComponentSettingsComponent,
        //     schema: SwiperSchemaService
        //   },
        //   multi: true
        // }
      ]
    }
  }
}
