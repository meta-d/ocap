(self.webpackChunkocap=self.webpackChunkocap||[]).push([[3170],{"./packages/angular/selection/timer/today-filter/today-filter.component.scss?ngResource":(module,__unused_webpack_exports,__webpack_require__)=>{var ___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___=__webpack_require__("./node_modules/@angular-devkit/build-angular/node_modules/css-loader/dist/runtime/noSourceMaps.js"),___CSS_LOADER_EXPORT___=__webpack_require__("./node_modules/@angular-devkit/build-angular/node_modules/css-loader/dist/runtime/api.js")(___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___);___CSS_LOADER_EXPORT___.push([module.id,":host {\n  display: flex;\n  flex-direction: column;\n}\n\n:host::ng-deep .mat-datepicker-toggle {\n  opacity: 0.8;\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 200ms;\n}\n\n:host::ng-deep .mat-datepicker-toggle:hover {\n  opacity: 1;\n}",""]),module.exports=___CSS_LOADER_EXPORT___.toString()},"./packages/angular/selection/timer/today-filter/today-filter.stories.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,actionsData:()=>actionsData,default:()=>today_filter_stories});var dist=__webpack_require__("./node_modules/@storybook/angular/dist/index.mjs"),http=__webpack_require__("./node_modules/@angular/common/fesm2022/http.mjs"),animations=__webpack_require__("./node_modules/@angular/platform-browser/fesm2022/animations.mjs"),provider=__webpack_require__("./packages/angular/mock/provider.ts"),translate=__webpack_require__("./packages/angular/mock/translate.ts"),addon_actions_dist=__webpack_require__("./node_modules/@storybook/addon-actions/dist/index.mjs"),tslib_es6=__webpack_require__("./node_modules/tslib/tslib.es6.js");var _NgmTodayFilterComponent,_NxQuarterFilterComponent,_NxMonthFilterComponent,_NxYearFilterComponent,today_filter_componentngResource=__webpack_require__("./packages/angular/selection/timer/today-filter/today-filter.component.scss?ngResource"),today_filter_componentngResource_default=__webpack_require__.n(today_filter_componentngResource),common=__webpack_require__("./node_modules/@angular/common/fesm2022/common.mjs"),core=__webpack_require__("./node_modules/@angular/core/fesm2022/core.mjs"),fesm2022_forms=__webpack_require__("./node_modules/@angular/forms/fesm2022/forms.mjs"),fesm2022_button=__webpack_require__("./node_modules/@angular/material/fesm2022/button.mjs"),fesm2022_core=__webpack_require__("./node_modules/@angular/material/fesm2022/core.mjs"),icon=__webpack_require__("./node_modules/@angular/material/fesm2022/icon.mjs"),menu=__webpack_require__("./node_modules/@angular/material/fesm2022/menu.mjs"),fesm2022_radio=__webpack_require__("./node_modules/@angular/material/fesm2022/radio.mjs"),time_filter=__webpack_require__("./packages/angular/core/models/time-filter.ts"),core_service=__webpack_require__("./packages/angular/core/services/core.service.ts"),core_core_service=__webpack_require__("./packages/angular/core/core.service.ts"),src=__webpack_require__("./packages/core/src/index.ts"),ngx_translate_core=__webpack_require__("./node_modules/@ngx-translate/core/dist/fesm2022/ngx-translate-core.mjs"),isDate=__webpack_require__("./node_modules/date-fns/isDate.mjs"),setYear=__webpack_require__("./node_modules/date-fns/setYear.mjs"),getYear=__webpack_require__("./node_modules/date-fns/getYear.mjs"),setMonth=__webpack_require__("./node_modules/date-fns/setMonth.mjs"),getMonth=__webpack_require__("./node_modules/date-fns/getMonth.mjs"),filter=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/filter.js"),datepicker_module=__webpack_require__("./packages/angular/selection/timer/datepicker/datepicker.module.ts");let NgmTodayFilterComponent=((_NgmTodayFilterComponent=class NgmTodayFilterComponent{constructor(){this.TimeGranularity=src.AYn,this.TIME_GRANULARITY_SEQUENCES=time_filter.K,this._hostClass=!0,this.coreService=(0,core.inject)(core_service.z),this.dsCoreService=(0,core.inject)(core_core_service.q),this._timeGranularity=src.AYn.Month,this.granularitySequence=0,this.date=new fesm2022_forms.NI(new Date),this.onChange=_=>{},this.onTouched=()=>{}}get granularity(){return this._timeGranularity}set granularity(value){this._timeGranularity=value,this.dsCoreService.setTimeGranularity(value)}ngOnChanges({defaultValue}){if(defaultValue&&defaultValue.currentValue){let value=this.coreService.execDateVariables(defaultValue.currentValue);value=Array.isArray(value)?value[0]:value,this.date.setValue(value),this.dsCoreService.setToday(value),this.onChange(value)}}ngOnInit(){this.date.valueChanges.pipe((0,filter.h)((value=>null!==value))).subscribe((value=>{this.dsCoreService.setToday(value),this.onChange(value)}))}writeValue(obj){(0,isDate.J)(obj)&&this.date.setValue(obj)}registerOnChange(fn){this.onChange=fn}registerOnTouched(fn){this.onTouched=fn}setDisabledState(isDisabled){isDisabled?this.date.disable():this.date.enable()}}).propDecorators={_hostClass:[{type:core.HostBinding,args:["class.ngm-today-filter"]}],granularity:[{type:core.Input}],granularitySequence:[{type:core.Input}],defaultValue:[{type:core.Input}],appearance:[{type:core.Input}],displayDensity:[{type:core.Input}]},_NgmTodayFilterComponent);NgmTodayFilterComponent=(0,tslib_es6.gn)([(0,core.Component)({standalone:!0,imports:[common.CommonModule,fesm2022_forms.u5,fesm2022_forms.UX,ngx_translate_core.aw,fesm2022_button.ot,icon.Ps,menu.Tx,fesm2022_radio.Fk,datepicker_module.e],selector:"ngm-today-filter",template:'<label class="p-1 text-sm text-ellipsis whitespace-nowrap overflow-hidden disabled:opacity-50">\n  {{ \'Ngm.TimeFilter.Today\' | translate: {Default: "Today"} }}\n</label>\n\n<ng-container [ngSwitch]="granularity">\n  <ng-container *ngSwitchCase="TimeGranularity.Year">\n    <ngm-yearpicker [formControl]="date">\n      <button ngmSuffix mat-icon-button class="ngm-actionable-opacity"\n        [matMenuTriggerFor]="granularityMenu"\n        (click)="$event.stopPropagation();$event.preventDefault();">\n        <mat-icon>more_vert</mat-icon>\n      </button>\n    </ngm-yearpicker>\n  </ng-container>\n  <ng-container *ngSwitchCase="TimeGranularity.Quarter">\n    <ngm-quarterpicker [formControl]="date">\n      <button ngmSuffix mat-icon-button class="ngm-actionable-opacity"\n        [matMenuTriggerFor]="granularityMenu"\n        (click)="$event.stopPropagation();$event.preventDefault();">\n          <mat-icon>more_vert</mat-icon>\n      </button>\n    </ngm-quarterpicker>\n  </ng-container>\n  <ng-container *ngSwitchCase="TimeGranularity.Month">\n    <ngm-monthpicker [formControl]="date">\n      <button ngmSuffix mat-icon-button class="ngm-actionable-opacity"\n        [matMenuTriggerFor]="granularityMenu"\n        (click)="$event.stopPropagation();$event.preventDefault();">\n        <mat-icon>more_vert</mat-icon>\n      </button>\n    </ngm-monthpicker>\n  </ng-container>\n\n  <ng-container *ngSwitchDefault>\n    <ngm-datepicker [formControl]="date">\n      <button ngmSuffix mat-icon-button class="ngm-actionable-opacity"\n        [matMenuTriggerFor]="granularityMenu"\n        (click)="$event.stopPropagation();$event.preventDefault();">\n          <mat-icon>more_vert</mat-icon>\n      </button>\n    </ngm-datepicker>\n  </ng-container>\n</ng-container>\n\n<mat-radio-group [(ngModel)]="granularity">\n  <mat-menu #granularityMenu="matMenu" class="ngm-formly ngm-density__compact">\n    <button mat-menu-item disableRipple *ngFor="let value of TIME_GRANULARITY_SEQUENCES[granularitySequence]"\n      (click)="$event.stopPropagation();">\n      <mat-radio-button [value]="value">\n        {{ \'Ngm.TimeFilter.\' + value | translate: {Default: value} }}\n      </mat-radio-button>\n    </button>\n  </mat-menu>\n</mat-radio-group>\n',providers:[{provide:fesm2022_forms.JU,useExisting:(0,core.forwardRef)((()=>NgmTodayFilterComponent)),multi:!0}],styles:[today_filter_componentngResource_default()]})],NgmTodayFilterComponent);let NxQuarterFilterComponent=((_NxQuarterFilterComponent=class NxQuarterFilterComponent{constructor(){this.date=new fesm2022_forms.NI(new Date),this.onChange=_=>{},this.onTouched=()=>{}}chosenYearHandler(event){const ctrlValue=this.date.value??new Date;this.date.setValue((0,setYear.M)(ctrlValue,(0,getYear.S)(event)))}chosenMonthHandler(event,datepicker){const ctrlValue=this.date.value??new Date;this.date.setValue((0,setMonth.q)(ctrlValue,(0,getMonth.j)(event))),datepicker.close(),this.onChange(this.date.value)}writeValue(obj){this.date.setValue(obj)}registerOnChange(fn){this.onChange=fn}registerOnTouched(fn){this.onTouched=fn}setDisabledState(isDisabled){isDisabled?this.date.disable():this.date.enable()}}).propDecorators={appearance:[{type:core.Input}]},_NxQuarterFilterComponent);NxQuarterFilterComponent=(0,tslib_es6.gn)([(0,core.Component)({selector:"ngm-quarter-filter",template:'<mat-form-field [appearance]="appearance?.appearance" [displayDensity]="appearance?.displayDensity">\n    <mat-label>{{ \'COMPONENTS.TIME_FILTER.TODAY\' | translate: {Default: \'Today\'} }}</mat-label>\n    <input matInput [matDatepicker]="dp" [formControl]="date" />\n    <mat-datepicker\n      #dp\n      startView="multi-year"\n      (yearSelected)="chosenYearHandler($event)"\n      (monthSelected)="chosenMonthHandler($event, dp)"\n    ></mat-datepicker>\n\n    <div matSuffix class="flex items-center">\n      <mat-datepicker-toggle class="ngm-actionable-opacity" [for]="dp"></mat-datepicker-toggle>\n      <ng-content></ng-content>\n    </div>\n  </mat-form-field> ',providers:[{provide:fesm2022_core.sG,useValue:{parse:{dateInput:"yyyy'Q'Q"},display:{dateInput:"yyyy'Q'Q",monthYearLabel:"LLL y",dateA11yLabel:"MMMM d, y",monthYearA11yLabel:"MMMM y"}}},{provide:fesm2022_forms.JU,useExisting:(0,core.forwardRef)((()=>NxQuarterFilterComponent)),multi:!0}],styles:[today_filter_componentngResource_default()]})],NxQuarterFilterComponent);let NxMonthFilterComponent=((_NxMonthFilterComponent=class NxMonthFilterComponent{constructor(){this.date=new fesm2022_forms.NI(new Date),this.onChange=_=>{},this.onTouched=()=>{}}chosenYearHandler(event){const ctrlValue=this.date.value??new Date;this.date.setValue((0,setYear.M)(ctrlValue,(0,getYear.S)(event)))}chosenMonthHandler(event,datepicker){const ctrlValue=this.date.value??new Date;this.date.setValue((0,setMonth.q)(ctrlValue,(0,getMonth.j)(event))),datepicker.close(),this.onChange(this.date.value)}writeValue(obj){this.date.setValue(obj)}registerOnChange(fn){this.onChange=fn}registerOnTouched(fn){this.onTouched=fn}setDisabledState(isDisabled){isDisabled?this.date.disable():this.date.enable()}}).propDecorators={appearance:[{type:core.Input}]},_NxMonthFilterComponent);NxMonthFilterComponent=(0,tslib_es6.gn)([(0,core.Component)({selector:"ngm-month-filter",template:'<input matInput [matDatepicker]="dp" [formControl]="date" />\n<mat-datepicker\n  #dp\n  startView="multi-year"\n  (yearSelected)="chosenYearHandler($event)"\n  (monthSelected)="chosenMonthHandler($event, dp)"\n></mat-datepicker>\n\n<div matSuffix class="abs flex items-center">\n  <mat-datepicker-toggle class="ngm-actionable-opacity" [for]="dp"/>\n  <ng-content></ng-content>\n</div>\n',providers:[{provide:fesm2022_core.sG,useValue:{parse:{dateInput:"yyyyMM"},display:{dateInput:"yyyyMM",monthYearLabel:"LLL y",dateA11yLabel:"MMMM d, y",monthYearA11yLabel:"MMMM y"}}},{provide:fesm2022_forms.JU,useExisting:(0,core.forwardRef)((()=>NxMonthFilterComponent)),multi:!0}],styles:[today_filter_componentngResource_default()]})],NxMonthFilterComponent);let NxYearFilterComponent=((_NxYearFilterComponent=class NxYearFilterComponent{constructor(){this.date=new fesm2022_forms.NI(new Date),this.onChange=_=>{},this.onTouched=()=>{}}chosenYearHandler(event,datepicker){const ctrlValue=this.date.value??new Date;this.date.setValue((0,setYear.M)(ctrlValue,(0,getYear.S)(event))),datepicker.close(),this.onChange(this.date.value)}writeValue(obj){this.date.setValue(obj)}registerOnChange(fn){this.onChange=fn}registerOnTouched(fn){this.onTouched=fn}setDisabledState(isDisabled){isDisabled?this.date.disable():this.date.enable()}}).propDecorators={appearance:[{type:core.Input}]},_NxYearFilterComponent);NxYearFilterComponent=(0,tslib_es6.gn)([(0,core.Component)({selector:"ngm-year-filter",template:'<mat-form-field [appearance]="appearance?.appearance" [displayDensity]="appearance?.displayDensity">\n    <mat-label>{{ \'COMPONENTS.TIME_FILTER.TODAY\' | translate: {Default: \'Today\'} }}</mat-label>\n    <input matInput [matDatepicker]="dp" [formControl]="date" />\n    <mat-datepicker\n      #dp\n      startView="multi-year"\n      (yearSelected)="chosenYearHandler($event, dp)"\n    ></mat-datepicker>\n\n    <div matSuffix class="flex items-center">\n      <mat-datepicker-toggle class="ngm-actionable-opacity" [for]="dp"></mat-datepicker-toggle>\n      <ng-content></ng-content>\n    </div>\n  </mat-form-field>',providers:[{provide:fesm2022_core.sG,useValue:{parse:{dateInput:"yyyy"},display:{dateInput:"yyyy",monthYearLabel:"LLL y",dateA11yLabel:"MMMM d, y",monthYearA11yLabel:"MMMM y"}}},{provide:fesm2022_forms.JU,useExisting:(0,core.forwardRef)((()=>NxYearFilterComponent)),multi:!0}],styles:[today_filter_componentngResource_default()]})],NxYearFilterComponent);const actionsData={onPinTask:(0,addon_actions_dist.aD)("onPinTask"),onArchiveTask:(0,addon_actions_dist.aD)("onArchiveTask")},today_filter_stories={title:"Selection/TodayFilter",component:NgmTodayFilterComponent,excludeStories:/.*Data$/,tags:["autodocs"],decorators:[(0,dist.applicationConfig)({providers:[(0,animations.provideAnimations)(),(0,http.h_)(),(0,provider.Y)(),(0,translate.qX)()]}),(0,dist.moduleMetadata)({declarations:[],imports:[]}),(0,dist.componentWrapperDecorator)((story=>`<div style="margin: 3em">${story}</div>`))],render:args=>({props:{...args},template:`<ngm-today-filter ${(0,dist.argsToTemplate)(args)}></ngm-today-filter>`})},Default={args:{}};Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"{\n  args: {}\n}",...Default.parameters?.docs?.source}}};const __namedExportsOrder=["actionsData","Default"]}}]);