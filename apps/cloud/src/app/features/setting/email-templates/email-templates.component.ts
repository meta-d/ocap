import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	OnDestroy,
	SecurityContext,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
	EmailTemplateNameEnum,
	IOrganization,
	LanguagesEnum,
	LanguagesMap
} from '@metad/contracts';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { isEqual } from 'lodash-es';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { EmailTemplateService, Store, ToastrService } from '../../../@core/services';
import { TranslationBaseComponent } from '../../../@shared';

@UntilDestroy({ checkProperties: true })
@Component({
	templateUrl: './email-templates.component.html',
	styleUrls: ['./email-templates.component.scss']
})
export class EmailTemplatesComponent
	extends TranslationBaseComponent
	implements AfterViewInit, OnDestroy {

	previewEmail: SafeHtml;
	previewSubject: SafeHtml;
	organization: IOrganization;

	templateNames: string[] = Object.values(EmailTemplateNameEnum);
	subject$: Subject<any> = new Subject();

	readonly form: FormGroup = EmailTemplatesComponent.buildForm(this.fb);
	static buildForm(fb: FormBuilder): FormGroup {
		return fb.group({
			name: [EmailTemplateNameEnum.WELCOME_USER],
			languageCode: [LanguagesEnum.English],
			subject: ['', [Validators.required, Validators.maxLength(60)]],
			mjml: ['', Validators.required]
		});
	}

	private _templateSub = this.subject$
		.pipe(
			debounceTime(500),
			tap(() => this.getTemplate()),
			untilDestroyed(this)
		)
		.subscribe();
	private _selectedOrganizationSub = combineLatest([this.store.selectedOrganization$, this.store.preferredLanguage$])
		.pipe(
			distinctUntilChanged(isEqual),
			filter(([organization, language]) => !!language),
			tap(([organization, language]) => {
				this.organization = organization;
				this.form.patchValue({ languageCode: LanguagesMap[language] ?? language });
			}),
			tap(() => this.subject$.next(true)),
			untilDestroyed(this)
		)
		.subscribe();
	constructor(
		private readonly sanitizer: DomSanitizer,
		private readonly store: Store,
		private readonly fb: FormBuilder,
		private readonly toastrService: ToastrService,
		private readonly emailTemplateService: EmailTemplateService,
		private _cdr: ChangeDetectorRef
	) {
		super();
	}

	ngAfterViewInit() {
		this.form.get('subject').valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((value) => {
			this.onSubjectChange(value)
		})
		this.form.get('mjml').valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((value) => {
			this.onEmailChange(value)
		})

		// this.themeService
		// 	.getJsTheme()
		// 	.pipe(untilDestroyed(this))
		// 	.subscribe(
		// 		({
		// 			name
		// 		}: {
		// 			name: 'dark' | 'cosmic' | 'corporate' | 'default';
		// 		}) => {
		// 			switch (name) {
		// 				case 'dark':
		// 				case 'cosmic':
		// 					this.emailEditor.setTheme('tomorrow_night');
		// 					this.subjectEditor.setTheme('tomorrow_night');
		// 					break;
		// 				default:
		// 					this.emailEditor.setTheme('sqlserver');
		// 					this.subjectEditor.setTheme('sqlserver');
		// 					break;
		// 			}
		// 		}
		// 	);

		const editorOptions = {
			enableBasicAutocompletion: true,
			enableLiveAutocompletion: true,
			printMargin: false,
			showLineNumbers: true,
			tabSize: 2
		};

		// this.emailEditor.getEditor().setOptions(editorOptions);
		// this.subjectEditor
		// 	.getEditor()
		// 	.setOptions({ ...editorOptions, maxLines: 2 });
	}

	async getTemplate() {
		
		try {
			const { tenantId } = this.store.user;
			const { id: organizationId } = this.organization ?? {}
			const {
				languageCode = LanguagesEnum.English,
				name = EmailTemplateNameEnum.WELCOME_USER
			} = this.form.value;		
			const result = await this.emailTemplateService.getTemplate({
				languageCode,
				name,
				organizationId,
				tenantId
			})

			this.form.patchValue({
				subject: result.subject,
				mjml: result.template,
			})
			this.form.markAsPristine()
			const {
				html: email
			} = await this.emailTemplateService.generateTemplatePreview(
				result.template
			);
			const {
				html: subject
			} = await this.emailTemplateService.generateTemplatePreview(
				result.subject
			);
			this.previewEmail = this.sanitizer.bypassSecurityTrustHtml(email);

			this.previewSubject = this.sanitizer.sanitize(
				SecurityContext.HTML,
				subject
			);
		} catch (error) {
			this.form.patchValue({
				subject: '',
				mjml: '',
			})
			this.form.markAsPristine()
			this.toastrService.danger(error);
		}
	}

	async onSubjectChange(code: string) {
		// this.form.get('subject').setValue(code);
		const {
			html
		} = await this.emailTemplateService.generateTemplatePreview(code);
		this.previewSubject = this.sanitizer.bypassSecurityTrustHtml(html);
		this._cdr.detectChanges()
	}

	async onEmailChange(code: string) {
		// this.form.get('mjml').setValue(code);
		const {
			html
		} = await this.emailTemplateService.generateTemplatePreview(code);
		this.previewEmail = this.sanitizer.bypassSecurityTrustHtml(html);
		this._cdr.detectChanges()
	}

	selectedLanguage(event) {
		this.form.patchValue({ 
			languageCode: event.code 
		});
	}

	async submitForm() {
		try {
			const { tenantId } = this.store.user;
			const { id: organizationId } = this.organization ?? {};
			await this.emailTemplateService.saveEmailTemplate({
				...this.form.value,
				organizationId,
				tenantId
			});

			this.form.markAsPristine()
			this._cdr.detectChanges()
			
			this.toastrService.success('TOASTR.MESSAGE.EMAIL_TEMPLATE_SAVED', {
				templateName: this.getTranslation(
					'EMAIL_TEMPLATES_PAGE.TEMPLATE_NAMES.' +
						this.form.get('name').value
				),
				Default: 'Email Template saved'
			})
		} catch (error) {
			this.toastrService.danger(error)
		}
	}

	ngOnDestroy() {}
}
