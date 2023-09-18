import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonGroupDirective } from '@metad/ocap-angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { LanguageSelectorComponent, MaterialModule, SharedModule } from '../../../@shared';
import { EmailTemplatesRoutingModule } from './email-templates-routing.module';
import { EmailTemplatesComponent } from './email-templates.component';
import { NgmSelectComponent } from '@metad/ocap-angular/common';


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		EmailTemplatesRoutingModule,
		TranslateModule,

		SharedModule,
		MaterialModule,

		LanguageSelectorComponent,
		
		MonacoEditorModule.forRoot(),
		
		ButtonGroupDirective,
		NgmSelectComponent
	],
	providers: [],
	declarations: [EmailTemplatesComponent]
})
export class EmailTemplatesModule {}
