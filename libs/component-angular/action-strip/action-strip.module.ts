import { NgModule } from '@angular/core'
import {
	IgxActionStripComponent,
	IgxActionStripMenuItemDirective
} from './action-strip.component'
import { CommonModule } from '@angular/common'
// import {
// 	IgxButtonModule,
// 	IgxDropDownModule,
// 	IgxIconModule,
// 	IgxRippleModule,
// 	IgxToggleModule
// } from 'igniteui-angular'

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxActionStripComponent, IgxActionStripMenuItemDirective],
    exports: [IgxActionStripComponent, IgxActionStripMenuItemDirective],
    imports: [
        CommonModule,
        // IgxDropDownModule,
        // IgxToggleModule,
        // IgxButtonModule,
        // IgxIconModule,
        // IgxRippleModule
    ]
})
export class NxActionStripModule {}
