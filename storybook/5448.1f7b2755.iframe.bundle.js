"use strict";(self.webpackChunkocap=self.webpackChunkocap||[]).push([[5448],{"./node_modules/@angular/material/fesm2022/progress-spinner.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Cq:()=>MatProgressSpinnerModule});var _class,_class2,_angular_core__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/@angular/core/fesm2022/core.mjs"),_angular_common__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@angular/common/fesm2022/common.mjs"),_angular_material_core__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@angular/material/fesm2022/core.mjs");const _c0=["determinateSpinner"];function _class_ng_template_0_Template(rf,ctx){if(1&rf&&(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnamespaceSVG"](),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0,"svg",11),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1,"circle",12),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()),2&rf){const ctx_r0=_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵattribute"]("viewBox",ctx_r0._viewBox()),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵstyleProp"]("stroke-dasharray",ctx_r0._strokeCircumference(),"px")("stroke-dashoffset",ctx_r0._strokeCircumference()/2,"px")("stroke-width",ctx_r0._circleStrokeWidth(),"%"),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵattribute"]("r",ctx_r0._circleRadius())}}const MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS=new _angular_core__WEBPACK_IMPORTED_MODULE_0__.InjectionToken("mat-progress-spinner-default-options",{providedIn:"root",factory:function MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS_FACTORY(){return{diameter:BASE_SIZE}}});const BASE_SIZE=100;class MatProgressSpinner{get color(){return this._color||this._defaultColor}set color(value){this._color=value}constructor(_elementRef,animationMode,defaults){this._elementRef=_elementRef,this._defaultColor="primary",this._value=0,this._diameter=BASE_SIZE,this._noopAnimations="NoopAnimations"===animationMode&&!!defaults&&!defaults._forceAnimations,this.mode="mat-spinner"===_elementRef.nativeElement.nodeName.toLowerCase()?"indeterminate":"determinate",defaults&&(defaults.color&&(this.color=this._defaultColor=defaults.color),defaults.diameter&&(this.diameter=defaults.diameter),defaults.strokeWidth&&(this.strokeWidth=defaults.strokeWidth))}get value(){return"determinate"===this.mode?this._value:0}set value(v){this._value=Math.max(0,Math.min(100,v||0))}get diameter(){return this._diameter}set diameter(size){this._diameter=size||0}get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(value){this._strokeWidth=value||0}_circleRadius(){return(this.diameter-10)/2}_viewBox(){const viewBox=2*this._circleRadius()+this.strokeWidth;return`0 0 ${viewBox} ${viewBox}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return"determinate"===this.mode?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}}(_class=MatProgressSpinner).ɵfac=function _class_Factory(t){return new(t||_class)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_0__.ElementRef),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_0__.ANIMATION_MODULE_TYPE,8),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS))},_class.ɵcmp=_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({type:_class,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function _class_Query(rf,ctx){if(1&rf&&_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵviewQuery"](_c0,5),2&rf){let _t;_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵqueryRefresh"](_t=_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵloadQuery"]())&&(ctx._determinateCircle=_t.first)}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function _class_HostBindings(rf,ctx){2&rf&&(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵattribute"]("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow","determinate"===ctx.mode?ctx.value:null)("mode",ctx.mode),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMap"]("mat-"+ctx.color),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵstyleProp"]("width",ctx.diameter,"px")("height",ctx.diameter,"px")("--mdc-circular-progress-size",ctx.diameter+"px")("--mdc-circular-progress-active-indicator-width",ctx.diameter+"px"),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("_mat-animation-noopable",ctx._noopAnimations)("mdc-circular-progress--indeterminate","indeterminate"===ctx.mode))},inputs:{color:"color",mode:"mode",value:["value","value",_angular_core__WEBPACK_IMPORTED_MODULE_0__.numberAttribute],diameter:["diameter","diameter",_angular_core__WEBPACK_IMPORTED_MODULE_0__.numberAttribute],strokeWidth:["strokeWidth","strokeWidth",_angular_core__WEBPACK_IMPORTED_MODULE_0__.numberAttribute]},exportAs:["matProgressSpinner"],standalone:!0,features:[_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵInputTransformsFeature"],_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵStandaloneFeature"]],decls:14,vars:11,consts:[["circle",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["determinateSpinner",""],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function _class_Template(rf,ctx){if(1&rf&&(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0,_class_ng_template_0_Template,2,8,"ng-template",null,0,_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplateRefExtractor"]),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2,"div",1,2),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnamespaceSVG"](),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4,"svg",3),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](5,"circle",4),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()(),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnamespaceHTML"](),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6,"div",5)(7,"div",6)(8,"div",7),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainer"](9,8),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"](),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10,"div",9),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainer"](11,8),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"](),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12,"div",10),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainer"](13,8),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()()()),2&rf){const _r1=_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵreference"](1);_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵattribute"]("viewBox",ctx._viewBox()),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵstyleProp"]("stroke-dasharray",ctx._strokeCircumference(),"px")("stroke-dashoffset",ctx._strokeDashOffset(),"px")("stroke-width",ctx._circleStrokeWidth(),"%"),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵattribute"]("r",ctx._circleRadius()),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngTemplateOutlet",_r1),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngTemplateOutlet",_r1),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2),_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngTemplateOutlet",_r1)}},dependencies:[_angular_common__WEBPACK_IMPORTED_MODULE_1__.NgTemplateOutlet],styles:["@keyframes mdc-circular-progress-container-rotate{to{transform:rotate(360deg)}}@keyframes mdc-circular-progress-spinner-layer-rotate{12.5%{transform:rotate(135deg)}25%{transform:rotate(270deg)}37.5%{transform:rotate(405deg)}50%{transform:rotate(540deg)}62.5%{transform:rotate(675deg)}75%{transform:rotate(810deg)}87.5%{transform:rotate(945deg)}100%{transform:rotate(1080deg)}}@keyframes mdc-circular-progress-color-1-fade-in-out{from{opacity:.99}25%{opacity:.99}26%{opacity:0}89%{opacity:0}90%{opacity:.99}to{opacity:.99}}@keyframes mdc-circular-progress-color-2-fade-in-out{from{opacity:0}15%{opacity:0}25%{opacity:.99}50%{opacity:.99}51%{opacity:0}to{opacity:0}}@keyframes mdc-circular-progress-color-3-fade-in-out{from{opacity:0}40%{opacity:0}50%{opacity:.99}75%{opacity:.99}76%{opacity:0}to{opacity:0}}@keyframes mdc-circular-progress-color-4-fade-in-out{from{opacity:0}65%{opacity:0}75%{opacity:.99}90%{opacity:.99}to{opacity:0}}@keyframes mdc-circular-progress-left-spin{from{transform:rotate(265deg)}50%{transform:rotate(130deg)}to{transform:rotate(265deg)}}@keyframes mdc-circular-progress-right-spin{from{transform:rotate(-265deg)}50%{transform:rotate(-130deg)}to{transform:rotate(-265deg)}}.mdc-circular-progress{display:inline-flex;position:relative;direction:ltr;line-height:0;transition:opacity 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-circular-progress__determinate-container,.mdc-circular-progress__indeterminate-circle-graphic,.mdc-circular-progress__indeterminate-container,.mdc-circular-progress__spinner-layer{position:absolute;width:100%;height:100%}.mdc-circular-progress__determinate-container{transform:rotate(-90deg)}.mdc-circular-progress__indeterminate-container{font-size:0;letter-spacing:0;white-space:nowrap;opacity:0}.mdc-circular-progress__determinate-circle-graphic,.mdc-circular-progress__indeterminate-circle-graphic{fill:rgba(0,0,0,0)}.mdc-circular-progress__determinate-circle{transition:stroke-dashoffset 500ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-circular-progress__gap-patch{position:absolute;top:0;left:47.5%;box-sizing:border-box;width:5%;height:100%;overflow:hidden}.mdc-circular-progress__gap-patch .mdc-circular-progress__indeterminate-circle-graphic{left:-900%;width:2000%;transform:rotate(180deg)}.mdc-circular-progress__circle-clipper{display:inline-flex;position:relative;width:50%;height:100%;overflow:hidden}.mdc-circular-progress__circle-clipper .mdc-circular-progress__indeterminate-circle-graphic{width:200%}.mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic{left:-100%}.mdc-circular-progress--indeterminate .mdc-circular-progress__determinate-container{opacity:0}.mdc-circular-progress--indeterminate .mdc-circular-progress__indeterminate-container{opacity:1}.mdc-circular-progress--indeterminate .mdc-circular-progress__indeterminate-container{animation:mdc-circular-progress-container-rotate 1568.2352941176ms linear infinite}.mdc-circular-progress--indeterminate .mdc-circular-progress__spinner-layer{animation:mdc-circular-progress-spinner-layer-rotate 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--indeterminate .mdc-circular-progress__color-1{animation:mdc-circular-progress-spinner-layer-rotate 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both,mdc-circular-progress-color-1-fade-in-out 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--indeterminate .mdc-circular-progress__color-2{animation:mdc-circular-progress-spinner-layer-rotate 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both,mdc-circular-progress-color-2-fade-in-out 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--indeterminate .mdc-circular-progress__color-3{animation:mdc-circular-progress-spinner-layer-rotate 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both,mdc-circular-progress-color-3-fade-in-out 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--indeterminate .mdc-circular-progress__color-4{animation:mdc-circular-progress-spinner-layer-rotate 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both,mdc-circular-progress-color-4-fade-in-out 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-left .mdc-circular-progress__indeterminate-circle-graphic{animation:mdc-circular-progress-left-spin 1333ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic{animation:mdc-circular-progress-right-spin 1333ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--closed{opacity:0}.mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,.mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic{stroke:var(--mdc-circular-progress-active-indicator-color)}@media screen and (forced-colors: active),(-ms-high-contrast: active){.mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,.mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic{stroke:CanvasText}}.mat-mdc-progress-spinner circle{stroke-width:var(--mdc-circular-progress-active-indicator-width)}@media screen and (forced-colors: active),(-ms-high-contrast: active){.mat-mdc-progress-spinner .mdc-circular-progress--four-color .mdc-circular-progress__color-1 .mdc-circular-progress__indeterminate-circle-graphic{stroke:CanvasText}}@media screen and (forced-colors: active),(-ms-high-contrast: active){.mat-mdc-progress-spinner .mdc-circular-progress--four-color .mdc-circular-progress__color-2 .mdc-circular-progress__indeterminate-circle-graphic{stroke:CanvasText}}@media screen and (forced-colors: active),(-ms-high-contrast: active){.mat-mdc-progress-spinner .mdc-circular-progress--four-color .mdc-circular-progress__color-3 .mdc-circular-progress__indeterminate-circle-graphic{stroke:CanvasText}}@media screen and (forced-colors: active),(-ms-high-contrast: active){.mat-mdc-progress-spinner .mdc-circular-progress--four-color .mdc-circular-progress__color-4 .mdc-circular-progress__indeterminate-circle-graphic{stroke:CanvasText}}.mat-mdc-progress-spinner .mdc-circular-progress{width:var(--mdc-circular-progress-size) !important;height:var(--mdc-circular-progress-size) !important}.mat-mdc-progress-spinner{display:block;overflow:hidden;line-height:0}.mat-mdc-progress-spinner._mat-animation-noopable,.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__determinate-circle{transition:none}.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-circle-graphic,.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__spinner-layer,.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container{animation:none}.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container circle{stroke-dasharray:0 !important}.cdk-high-contrast-active .mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic,.cdk-high-contrast-active .mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle{stroke:currentColor;stroke:CanvasText}"],encapsulation:2,changeDetection:0}),("undefined"==typeof ngDevMode||ngDevMode)&&_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](MatProgressSpinner,[{type:_angular_core__WEBPACK_IMPORTED_MODULE_0__.Component,args:[{selector:"mat-progress-spinner, mat-spinner",exportAs:"matProgressSpinner",host:{role:"progressbar",class:"mat-mdc-progress-spinner mdc-circular-progress",tabindex:"-1","[class]":'"mat-" + color',"[class._mat-animation-noopable]":"_noopAnimations","[class.mdc-circular-progress--indeterminate]":'mode === "indeterminate"',"[style.width.px]":"diameter","[style.height.px]":"diameter","[style.--mdc-circular-progress-size]":'diameter + "px"',"[style.--mdc-circular-progress-active-indicator-width]":'diameter + "px"',"[attr.aria-valuemin]":"0","[attr.aria-valuemax]":"100","[attr.aria-valuenow]":'mode === "determinate" ? value : null',"[attr.mode]":"mode"},changeDetection:_angular_core__WEBPACK_IMPORTED_MODULE_0__.ChangeDetectionStrategy.OnPush,encapsulation:_angular_core__WEBPACK_IMPORTED_MODULE_0__.ViewEncapsulation.None,standalone:!0,imports:[_angular_common__WEBPACK_IMPORTED_MODULE_1__.NgTemplateOutlet],template:'<ng-template #circle>\n  <svg [attr.viewBox]="_viewBox()" class="mdc-circular-progress__indeterminate-circle-graphic"\n       xmlns="http://www.w3.org/2000/svg" focusable="false">\n    <circle [attr.r]="_circleRadius()"\n            [style.stroke-dasharray.px]="_strokeCircumference()"\n            [style.stroke-dashoffset.px]="_strokeCircumference() / 2"\n            [style.stroke-width.%]="_circleStrokeWidth()"\n            cx="50%" cy="50%"/>\n  </svg>\n</ng-template>\n\n\x3c!--\n  All children need to be hidden for screen readers in order to support ChromeVox.\n  More context in the issue: https://github.com/angular/components/issues/22165.\n--\x3e\n<div class="mdc-circular-progress__determinate-container" aria-hidden="true" #determinateSpinner>\n  <svg [attr.viewBox]="_viewBox()" class="mdc-circular-progress__determinate-circle-graphic"\n       xmlns="http://www.w3.org/2000/svg" focusable="false">\n    <circle [attr.r]="_circleRadius()"\n            [style.stroke-dasharray.px]="_strokeCircumference()"\n            [style.stroke-dashoffset.px]="_strokeDashOffset()"\n            [style.stroke-width.%]="_circleStrokeWidth()"\n            class="mdc-circular-progress__determinate-circle"\n            cx="50%" cy="50%"/>\n  </svg>\n</div>\n\x3c!--TODO: figure out why there are 3 separate svgs--\x3e\n<div class="mdc-circular-progress__indeterminate-container" aria-hidden="true">\n  <div class="mdc-circular-progress__spinner-layer">\n    <div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left">\n      <ng-container [ngTemplateOutlet]="circle"></ng-container>\n    </div>\n    <div class="mdc-circular-progress__gap-patch">\n      <ng-container [ngTemplateOutlet]="circle"></ng-container>\n    </div>\n    <div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right">\n      <ng-container [ngTemplateOutlet]="circle"></ng-container>\n    </div>\n  </div>\n</div>\n',styles:["@keyframes mdc-circular-progress-container-rotate{to{transform:rotate(360deg)}}@keyframes mdc-circular-progress-spinner-layer-rotate{12.5%{transform:rotate(135deg)}25%{transform:rotate(270deg)}37.5%{transform:rotate(405deg)}50%{transform:rotate(540deg)}62.5%{transform:rotate(675deg)}75%{transform:rotate(810deg)}87.5%{transform:rotate(945deg)}100%{transform:rotate(1080deg)}}@keyframes mdc-circular-progress-color-1-fade-in-out{from{opacity:.99}25%{opacity:.99}26%{opacity:0}89%{opacity:0}90%{opacity:.99}to{opacity:.99}}@keyframes mdc-circular-progress-color-2-fade-in-out{from{opacity:0}15%{opacity:0}25%{opacity:.99}50%{opacity:.99}51%{opacity:0}to{opacity:0}}@keyframes mdc-circular-progress-color-3-fade-in-out{from{opacity:0}40%{opacity:0}50%{opacity:.99}75%{opacity:.99}76%{opacity:0}to{opacity:0}}@keyframes mdc-circular-progress-color-4-fade-in-out{from{opacity:0}65%{opacity:0}75%{opacity:.99}90%{opacity:.99}to{opacity:0}}@keyframes mdc-circular-progress-left-spin{from{transform:rotate(265deg)}50%{transform:rotate(130deg)}to{transform:rotate(265deg)}}@keyframes mdc-circular-progress-right-spin{from{transform:rotate(-265deg)}50%{transform:rotate(-130deg)}to{transform:rotate(-265deg)}}.mdc-circular-progress{display:inline-flex;position:relative;direction:ltr;line-height:0;transition:opacity 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-circular-progress__determinate-container,.mdc-circular-progress__indeterminate-circle-graphic,.mdc-circular-progress__indeterminate-container,.mdc-circular-progress__spinner-layer{position:absolute;width:100%;height:100%}.mdc-circular-progress__determinate-container{transform:rotate(-90deg)}.mdc-circular-progress__indeterminate-container{font-size:0;letter-spacing:0;white-space:nowrap;opacity:0}.mdc-circular-progress__determinate-circle-graphic,.mdc-circular-progress__indeterminate-circle-graphic{fill:rgba(0,0,0,0)}.mdc-circular-progress__determinate-circle{transition:stroke-dashoffset 500ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-circular-progress__gap-patch{position:absolute;top:0;left:47.5%;box-sizing:border-box;width:5%;height:100%;overflow:hidden}.mdc-circular-progress__gap-patch .mdc-circular-progress__indeterminate-circle-graphic{left:-900%;width:2000%;transform:rotate(180deg)}.mdc-circular-progress__circle-clipper{display:inline-flex;position:relative;width:50%;height:100%;overflow:hidden}.mdc-circular-progress__circle-clipper .mdc-circular-progress__indeterminate-circle-graphic{width:200%}.mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic{left:-100%}.mdc-circular-progress--indeterminate .mdc-circular-progress__determinate-container{opacity:0}.mdc-circular-progress--indeterminate .mdc-circular-progress__indeterminate-container{opacity:1}.mdc-circular-progress--indeterminate .mdc-circular-progress__indeterminate-container{animation:mdc-circular-progress-container-rotate 1568.2352941176ms linear infinite}.mdc-circular-progress--indeterminate .mdc-circular-progress__spinner-layer{animation:mdc-circular-progress-spinner-layer-rotate 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--indeterminate .mdc-circular-progress__color-1{animation:mdc-circular-progress-spinner-layer-rotate 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both,mdc-circular-progress-color-1-fade-in-out 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--indeterminate .mdc-circular-progress__color-2{animation:mdc-circular-progress-spinner-layer-rotate 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both,mdc-circular-progress-color-2-fade-in-out 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--indeterminate .mdc-circular-progress__color-3{animation:mdc-circular-progress-spinner-layer-rotate 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both,mdc-circular-progress-color-3-fade-in-out 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--indeterminate .mdc-circular-progress__color-4{animation:mdc-circular-progress-spinner-layer-rotate 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both,mdc-circular-progress-color-4-fade-in-out 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-left .mdc-circular-progress__indeterminate-circle-graphic{animation:mdc-circular-progress-left-spin 1333ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic{animation:mdc-circular-progress-right-spin 1333ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--closed{opacity:0}.mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,.mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic{stroke:var(--mdc-circular-progress-active-indicator-color)}@media screen and (forced-colors: active),(-ms-high-contrast: active){.mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,.mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic{stroke:CanvasText}}.mat-mdc-progress-spinner circle{stroke-width:var(--mdc-circular-progress-active-indicator-width)}@media screen and (forced-colors: active),(-ms-high-contrast: active){.mat-mdc-progress-spinner .mdc-circular-progress--four-color .mdc-circular-progress__color-1 .mdc-circular-progress__indeterminate-circle-graphic{stroke:CanvasText}}@media screen and (forced-colors: active),(-ms-high-contrast: active){.mat-mdc-progress-spinner .mdc-circular-progress--four-color .mdc-circular-progress__color-2 .mdc-circular-progress__indeterminate-circle-graphic{stroke:CanvasText}}@media screen and (forced-colors: active),(-ms-high-contrast: active){.mat-mdc-progress-spinner .mdc-circular-progress--four-color .mdc-circular-progress__color-3 .mdc-circular-progress__indeterminate-circle-graphic{stroke:CanvasText}}@media screen and (forced-colors: active),(-ms-high-contrast: active){.mat-mdc-progress-spinner .mdc-circular-progress--four-color .mdc-circular-progress__color-4 .mdc-circular-progress__indeterminate-circle-graphic{stroke:CanvasText}}.mat-mdc-progress-spinner .mdc-circular-progress{width:var(--mdc-circular-progress-size) !important;height:var(--mdc-circular-progress-size) !important}.mat-mdc-progress-spinner{display:block;overflow:hidden;line-height:0}.mat-mdc-progress-spinner._mat-animation-noopable,.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__determinate-circle{transition:none}.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-circle-graphic,.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__spinner-layer,.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container{animation:none}.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container circle{stroke-dasharray:0 !important}.cdk-high-contrast-active .mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic,.cdk-high-contrast-active .mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle{stroke:currentColor;stroke:CanvasText}"]}]}],(()=>[{type:_angular_core__WEBPACK_IMPORTED_MODULE_0__.ElementRef},{type:void 0,decorators:[{type:_angular_core__WEBPACK_IMPORTED_MODULE_0__.Optional},{type:_angular_core__WEBPACK_IMPORTED_MODULE_0__.Inject,args:[_angular_core__WEBPACK_IMPORTED_MODULE_0__.ANIMATION_MODULE_TYPE]}]},{type:void 0,decorators:[{type:_angular_core__WEBPACK_IMPORTED_MODULE_0__.Inject,args:[MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS]}]}]),{color:[{type:_angular_core__WEBPACK_IMPORTED_MODULE_0__.Input}],_determinateCircle:[{type:_angular_core__WEBPACK_IMPORTED_MODULE_0__.ViewChild,args:["determinateSpinner"]}],mode:[{type:_angular_core__WEBPACK_IMPORTED_MODULE_0__.Input}],value:[{type:_angular_core__WEBPACK_IMPORTED_MODULE_0__.Input,args:[{transform:_angular_core__WEBPACK_IMPORTED_MODULE_0__.numberAttribute}]}],diameter:[{type:_angular_core__WEBPACK_IMPORTED_MODULE_0__.Input,args:[{transform:_angular_core__WEBPACK_IMPORTED_MODULE_0__.numberAttribute}]}],strokeWidth:[{type:_angular_core__WEBPACK_IMPORTED_MODULE_0__.Input,args:[{transform:_angular_core__WEBPACK_IMPORTED_MODULE_0__.numberAttribute}]}]});const MatSpinner=MatProgressSpinner;class MatProgressSpinnerModule{}(_class2=MatProgressSpinnerModule).ɵfac=function _class2_Factory(t){return new(t||_class2)},_class2.ɵmod=_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({type:_class2,imports:[_angular_common__WEBPACK_IMPORTED_MODULE_1__.CommonModule,MatProgressSpinner,MatSpinner],exports:[MatProgressSpinner,MatSpinner,_angular_material_core__WEBPACK_IMPORTED_MODULE_2__.BQ]}),_class2.ɵinj=_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({imports:[_angular_common__WEBPACK_IMPORTED_MODULE_1__.CommonModule,_angular_material_core__WEBPACK_IMPORTED_MODULE_2__.BQ]}),("undefined"==typeof ngDevMode||ngDevMode)&&_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](MatProgressSpinnerModule,[{type:_angular_core__WEBPACK_IMPORTED_MODULE_0__.NgModule,args:[{imports:[_angular_common__WEBPACK_IMPORTED_MODULE_1__.CommonModule,MatProgressSpinner,MatSpinner],exports:[MatProgressSpinner,MatSpinner,_angular_material_core__WEBPACK_IMPORTED_MODULE_2__.BQ]}]}],null,null)},"./node_modules/@ngneat/until-destroy/fesm2020/ngneat-until-destroy.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{c:()=>UntilDestroy,t:()=>untilDestroyed});var rxjs__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/Subject.js"),rxjs__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/Subscription.js"),rxjs__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/observable/from.js"),rxjs__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/observable/empty.js"),_angular_core__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/@angular/core/fesm2022/core.mjs"),rxjs_operators__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js"),rxjs_operators__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/takeUntil.js"),process=__webpack_require__("./node_modules/process/browser.js");const NG_PIPE_DEF=_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵNG_PIPE_DEF"];const DESTROY=Symbol("__destroy"),DECORATOR_APPLIED=Symbol("__decoratorApplied");function getSymbol(destroyMethodName){return"string"==typeof destroyMethodName?Symbol(`__destroy__${destroyMethodName}`):DESTROY}function createSubjectOnTheInstance(instance,symbol){instance[symbol]||(instance[symbol]=new rxjs__WEBPACK_IMPORTED_MODULE_1__.x)}function completeSubjectOnTheInstance(instance,symbol){instance[symbol]&&(instance[symbol].next(),instance[symbol].complete(),instance[symbol]=null)}function unsubscribe(property){property instanceof rxjs__WEBPACK_IMPORTED_MODULE_2__.w0&&property.unsubscribe()}function decorateNgOnDestroy(ngOnDestroy,options){return function(){if(ngOnDestroy&&ngOnDestroy.call(this),completeSubjectOnTheInstance(this,getSymbol()),options.arrayName&&function unsubscribeIfPropertyIsArrayLike(property){Array.isArray(property)&&property.forEach(unsubscribe)}(this[options.arrayName]),options.checkProperties)for(const property in this)options.blackList?.includes(property)||unsubscribe(this[property])}}function UntilDestroy(options={}){return type=>{!function isPipe(target){return!!target[NG_PIPE_DEF]}(type)?function decorateProviderDirectiveOrComponent(type,options){type.prototype.ngOnDestroy=decorateNgOnDestroy(type.prototype.ngOnDestroy,options)}(type,options):function decoratePipe(type,options){const def=type.ɵpipe;def.onDestroy=decorateNgOnDestroy(def.onDestroy,options)}(type,options),function markAsDecorated(type){type.prototype[DECORATOR_APPLIED]=!0}(type)}}const CLEANUP=7,CheckerHasBeenSet=Symbol("CheckerHasBeenSet");function setupSubjectUnsubscribedChecker(instance,destroy$){instance[CheckerHasBeenSet]||function isAngularInTestMode(){return"undefined"!=typeof __karma__&&!!__karma__||"undefined"!=typeof jasmine&&!!jasmine||"undefined"!=typeof jest&&!!jest||"undefined"!=typeof Mocha&&!!Mocha||void 0!==process&&"[object process]"===Object.prototype.toString.call(process)}()||(runOutsideAngular((()=>(0,rxjs__WEBPACK_IMPORTED_MODULE_3__.D)(Promise.resolve()).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.z)((()=>{let lContext;try{lContext=(0,_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵgetLContext"])(instance)}catch{lContext=null}const lView=lContext?.lView;if(null==lView)return rxjs__WEBPACK_IMPORTED_MODULE_5__.E;const lCleanup=lView[CLEANUP]||(lView[CLEANUP]=[]),cleanupHasBeenExecuted$=new rxjs__WEBPACK_IMPORTED_MODULE_1__.x;return lCleanup.push((function untilDestroyedLCleanup(){runOutsideAngular((()=>{cleanupHasBeenExecuted$.next(),cleanupHasBeenExecuted$.complete()}))})),cleanupHasBeenExecuted$})),(0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.z)((()=>Promise.resolve()))).subscribe((()=>{(destroy$.observed??destroy$.observers.length>0)&&console.warn(function createMessage(instance){return`\n  The ${instance.constructor.name} still has subscriptions that haven't been unsubscribed.\n  This may happen if the class extends another class decorated with @UntilDestroy().\n  The child class implements its own ngOnDestroy() method but doesn't call super.ngOnDestroy().\n  Let's look at the following example:\n  @UntilDestroy()\n  @Directive()\n  export abstract class BaseDirective {}\n  @Component({ template: '' })\n  export class ConcreteComponent extends BaseDirective implements OnDestroy {\n    constructor() {\n      super();\n      someObservable$.pipe(untilDestroyed(this)).subscribe();\n    }\n    ngOnDestroy(): void {\n      // Some logic here...\n    }\n  }\n  The BaseDirective.ngOnDestroy() will not be called since Angular will call ngOnDestroy()\n  on the ConcreteComponent, but not on the BaseDirective.\n  One of the solutions is to declare an empty ngOnDestroy method on the BaseDirective:\n  @UntilDestroy()\n  @Directive()\n  export abstract class BaseDirective {\n    ngOnDestroy(): void {}\n  }\n  @Component({ template: '' })\n  export class ConcreteComponent extends BaseDirective implements OnDestroy {\n    constructor() {\n      super();\n      someObservable$.pipe(untilDestroyed(this)).subscribe();\n    }\n    ngOnDestroy(): void {\n      // Some logic here...\n      super.ngOnDestroy();\n    }\n  }\n  `}(instance))})))),instance[CheckerHasBeenSet]=!0)}function runOutsideAngular(fn){const Zone=_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵglobal"].Zone;return!!Zone&&"function"==typeof Zone.root?.run?Zone.root.run(fn):fn()}const NG_DEV_MODE="undefined"==typeof ngDevMode||ngDevMode;function untilDestroyed(instance,destroyMethodName){return source=>{const symbol=getSymbol(destroyMethodName);"string"==typeof destroyMethodName?function overrideNonDirectiveInstanceMethod(instance,destroyMethodName,symbol){const originalDestroy=instance[destroyMethodName];if(NG_DEV_MODE&&"function"!=typeof originalDestroy)throw new Error(`${instance.constructor.name} is using untilDestroyed but doesn't implement ${destroyMethodName}`);createSubjectOnTheInstance(instance,symbol),instance[destroyMethodName]=function(){originalDestroy.apply(this,arguments),completeSubjectOnTheInstance(this,symbol),instance[destroyMethodName]=originalDestroy}}(instance,destroyMethodName,symbol):(NG_DEV_MODE&&function ensureClassIsDecorated(instance){const prototype=Object.getPrototypeOf(instance);if(!(DECORATOR_APPLIED in prototype))throw new Error("untilDestroyed operator cannot be used inside directives or components or providers that are not decorated with UntilDestroy decorator")}(instance),createSubjectOnTheInstance(instance,symbol));const destroy$=instance[symbol];return NG_DEV_MODE&&setupSubjectUnsubscribedChecker(instance,destroy$),source.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_6__.R)(destroy$))}}}}]);