import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card';
import { PublicRoutingModule } from './public-routing.module';

import { PublicComponent } from './public.component';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PublicRoutingModule,
        AnalyticalCardModule
    ],
    exports: [],
    declarations: [PublicComponent],
    providers: [],
})
export class PublicModule { }
