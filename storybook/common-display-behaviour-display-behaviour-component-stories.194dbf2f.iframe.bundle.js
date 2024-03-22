(self.webpackChunkocap=self.webpackChunkocap||[]).push([[1060],{"./packages/angular/common/display-behaviour/display-behaviour.component.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{o:()=>NgmDisplayBehaviourComponent});var tslib_es6=__webpack_require__("./node_modules/tslib/tslib.es6.js");var _class,display_behaviour_componentngResource=__webpack_require__("./packages/angular/common/display-behaviour/display-behaviour.component.scss?ngResource"),display_behaviour_componentngResource_default=__webpack_require__.n(display_behaviour_componentngResource),common=__webpack_require__("./node_modules/@angular/common/fesm2022/common.mjs"),core=__webpack_require__("./node_modules/@angular/core/fesm2022/core.mjs"),icon=__webpack_require__("./node_modules/@angular/material/fesm2022/icon.mjs"),negate=__webpack_require__("./node_modules/lodash-es/negate.js"),lodash_es_isNil=__webpack_require__("./node_modules/lodash-es/isNil.js"),isEqual=__webpack_require__("./node_modules/lodash-es/isEqual.js"),isEmpty=__webpack_require__("./node_modules/lodash-es/isEmpty.js"),includes=__webpack_require__("./node_modules/lodash-es/includes.js"),filter=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/filter.js");(0,negate.Z)(lodash_es_isNil.Z),(0,filter.h)((0,negate.Z)(lodash_es_isNil.Z)),(0,negate.Z)(isEqual.Z),(0,negate.Z)(isEmpty.Z);var KEYCODES,KEYS;!function(KEYCODES){KEYCODES[KEYCODES.ENTER=13]="ENTER",KEYCODES[KEYCODES.SPACE=32]="SPACE",KEYCODES[KEYCODES.ESCAPE=27]="ESCAPE",KEYCODES[KEYCODES.LEFT_ARROW=37]="LEFT_ARROW",KEYCODES[KEYCODES.UP_ARROW=38]="UP_ARROW",KEYCODES[KEYCODES.RIGHT_ARROW=39]="RIGHT_ARROW",KEYCODES[KEYCODES.DOWN_ARROW=40]="DOWN_ARROW",KEYCODES[KEYCODES.F2=113]="F2",KEYCODES[KEYCODES.TAB=9]="TAB",KEYCODES[KEYCODES.CTRL=17]="CTRL",KEYCODES[KEYCODES.Z=90]="Z",KEYCODES[KEYCODES.Y=89]="Y",KEYCODES[KEYCODES.X=88]="X",KEYCODES[KEYCODES.BACKSPACE=8]="BACKSPACE",KEYCODES[KEYCODES.DELETE=46]="DELETE",KEYCODES[KEYCODES.INPUT_METHOD=229]="INPUT_METHOD"}(KEYCODES||(KEYCODES={})),function(KEYS){KEYS.ENTER="Enter",KEYS.SPACE=" ",KEYS.SPACE_IE="Spacebar",KEYS.ESCAPE="Escape",KEYS.ESCAPE_IE="Esc",KEYS.LEFT_ARROW="ArrowLeft",KEYS.LEFT_ARROW_IE="Left",KEYS.UP_ARROW="ArrowUp",KEYS.UP_ARROW_IE="Up",KEYS.RIGHT_ARROW="ArrowRight",KEYS.RIGHT_ARROW_IE="Right",KEYS.DOWN_ARROW="ArrowDown",KEYS.DOWN_ARROW_IE="Down",KEYS.F2="F2",KEYS.TAB="Tab",KEYS.SEMICOLON=";",KEYS.HOME="Home",KEYS.END="End"}(KEYS||(KEYS={}));let PlatformUtil=((_class=class PlatformUtil{constructor(platformId){this.platformId=platformId,this.isBrowser=(0,common.isPlatformBrowser)(this.platformId),this.isIOS=this.isBrowser&&/iPad|iPhone|iPod/.test(navigator.userAgent)&&!("MSStream"in window)}}).ctorParameters=()=>[{type:Object,decorators:[{type:core.Inject,args:[core.PLATFORM_ID]}]}],_class);PlatformUtil=(0,tslib_es6.gn)([(0,core.Injectable)({providedIn:"root"}),(0,tslib_es6.w6)("design:paramtypes",[Object])],PlatformUtil);const NAVIGATION_KEYS=new Set(["down","up","left","right","arrowdown","arrowup","arrowleft","arrowright","home","end","space","spacebar"," "]);new Set("right down arrowright arrowdown".split(" ")),new Set("left up arrowleft arrowup".split(" ")),new Set([...Array.from(NAVIGATION_KEYS),"tab","enter","f2","escape","esc"]);function splitByHighlight(text,highlight){if(highlight&&text){const keywords=highlight.split(/\s+/g),matchs=String(text).match(new RegExp(`(${keywords.join("|")})`,"ig")),results=String(text).split(new RegExp(`(${keywords.join("|")})`,"i"));if(results?.length>1)return results.map((value=>(0,includes.Z)(matchs,value)?{match:!0,value}:{value}))}return[{value:text}]}var display_behaviour_component_class,src=__webpack_require__("./packages/core/src/index.ts");let NgmDisplayBehaviourComponent=((display_behaviour_component_class=class NgmDisplayBehaviourComponent{constructor(){this.DISPLAY_BEHAVIOUR=src.CXV,this.isDisplayBehaviour=!0,this.value=[],this.text=[],this.default=[]}get isDescriptionAndId(){return this.displayBehaviour===src.CXV.descriptionAndId}get isIdAndDescription(){return this.displayBehaviour===src.CXV.idAndDescription}get isDescriptionOnly(){return this.displayBehaviour===src.CXV.descriptionOnly}get isAuto(){return this.displayBehaviour===src.CXV.auto||!this.displayBehaviour}get noLabel(){return!(this.option?.caption||this.option?.label)}ngOnInit(){this.value=splitByHighlight(this.option.key??this.option.value,this.highlight),this.text=splitByHighlight(this.option.caption||this.option.label,this.highlight),this.default=splitByHighlight(this.option.caption||this.option.label||this.option.value,this.highlight)}ngOnChanges({highlight,option}){(highlight||option)&&(this.value=splitByHighlight(this.option.key??this.option.value,this.highlight),this.text=splitByHighlight(this.option.caption||this.option.label,this.highlight),this.default=splitByHighlight(this.option.caption||this.option.label||(this.option.key??this.option.value),this.highlight))}}).propDecorators={displayBehaviour:[{type:core.Input}],excludeSelected:[{type:core.HostBinding,args:["class.ngm-display-behaviour__exclude-selected"]},{type:core.Input}],option:[{type:core.Input}],highlight:[{type:core.Input}],isDisplayBehaviour:[{type:core.HostBinding,args:["class.ngm-display-behaviour"]}],isDescriptionAndId:[{type:core.HostBinding,args:["class.ngm-display-behaviour__descriptionAndId"]}],isIdAndDescription:[{type:core.HostBinding,args:["class.ngm-display-behaviour__idAndDescription"]}],isDescriptionOnly:[{type:core.HostBinding,args:["class.ngm-display-behaviour__descriptionOnly"]}],isAuto:[{type:core.HostBinding,args:["class.ngm-display-behaviour__auto"]}],noLabel:[{type:core.HostBinding,args:["class.ngm-display-behaviour__no-label"]}]},display_behaviour_component_class);NgmDisplayBehaviourComponent=(0,tslib_es6.gn)([(0,core.Component)({standalone:!0,changeDetection:core.ChangeDetectionStrategy.OnPush,selector:"ngm-display-behaviour",template:'<ng-container [ngSwitch]="displayBehaviour">\n  <ng-container *ngSwitchCase="DISPLAY_BEHAVIOUR.descriptionAndId">\n    <span class="ngm-display-behaviour__option-text" [title]="option.caption || option.label">\n      <span [ngClass]="item.match ? \'ngm-display-behaviour__highlight\' : \'\'" *ngFor="let item of text">{{\n        item.value\n      }}</span>\n    </span>\n    <span class="ngm-display-behaviour__option-value" [title]="option.key ?? option.value">\n      <span [ngClass]="item.match ? \'ngm-display-behaviour__highlight\' : \'\'" *ngFor="let item of value">{{\n        item.value\n      }}</span>\n    </span>\n  </ng-container>\n  <ng-container *ngSwitchCase="DISPLAY_BEHAVIOUR.descriptionOnly">\n    <span class="ngm-display-behaviour__option-text" [title]="option.caption || option.label">\n      <span [ngClass]="item.match ? \'ngm-display-behaviour__highlight\' : \'\'" *ngFor="let item of text">{{\n        item.value\n      }}</span>\n    </span>\n  </ng-container>\n  <ng-container *ngSwitchCase="DISPLAY_BEHAVIOUR.idOnly">\n    <span class="ngm-display-behaviour__option-value" [title]="option.key ?? option.value">\n      <span [ngClass]="item.match ? \'ngm-display-behaviour__highlight\' : \'\'" *ngFor="let item of value">{{\n        item.value\n      }}</span>\n    </span>\n  </ng-container>\n  <ng-container *ngSwitchCase="DISPLAY_BEHAVIOUR.idAndDescription">\n    <span class="ngm-display-behaviour__option-value" [title]="option.key ?? option.value">\n      <span [ngClass]="item.match ? \'ngm-display-behaviour__highlight\' : \'\'" *ngFor="let item of value">{{\n        item.value\n      }}</span>\n    </span>\n    <span class="ngm-display-behaviour__option-text" [title]="option.caption || option.label">\n      <span [ngClass]="item.match ? \'ngm-display-behaviour__highlight\' : \'\'" *ngFor="let item of text">{{\n        item.value\n      }}</span>\n    </span>\n  </ng-container>\n\n  <ng-container *ngSwitchDefault>\n    <span class="ngm-display-behaviour__option-text" [title]="option.caption || option.label">\n      <span [ngClass]="item.match ? \'ngm-display-behaviour__highlight\' : \'\'" *ngFor="let item of text">{{\n        item.value\n      }}</span>\n    </span>\n    <span class="ngm-display-behaviour__option-value" [title]="option.key ?? option.value">\n      <span [ngClass]="item.match ? \'ngm-display-behaviour__highlight\' : \'\'" *ngFor="let item of value">{{\n        item.value\n      }}</span>\n    </span>\n  </ng-container>\n\n  <mat-icon *ngIf="option.selected" class="ngm-display-behaviour__selected" color="accent">done</mat-icon>\n</ng-container>\n',imports:[common.CommonModule,icon.Ps],styles:[display_behaviour_componentngResource_default()]})],NgmDisplayBehaviourComponent)},"./node_modules/css-loader/dist/runtime/api.js":module=>{"use strict";module.exports=function(cssWithMappingToString){var list=[];return list.toString=function toString(){return this.map((function(item){var content="",needLayer=void 0!==item[5];return item[4]&&(content+="@supports (".concat(item[4],") {")),item[2]&&(content+="@media ".concat(item[2]," {")),needLayer&&(content+="@layer".concat(item[5].length>0?" ".concat(item[5]):""," {")),content+=cssWithMappingToString(item),needLayer&&(content+="}"),item[2]&&(content+="}"),item[4]&&(content+="}"),content})).join("")},list.i=function i(modules,media,dedupe,supports,layer){"string"==typeof modules&&(modules=[[null,modules,void 0]]);var alreadyImportedModules={};if(dedupe)for(var k=0;k<this.length;k++){var id=this[k][0];null!=id&&(alreadyImportedModules[id]=!0)}for(var _k=0;_k<modules.length;_k++){var item=[].concat(modules[_k]);dedupe&&alreadyImportedModules[item[0]]||(void 0!==layer&&(void 0===item[5]||(item[1]="@layer".concat(item[5].length>0?" ".concat(item[5]):""," {").concat(item[1],"}")),item[5]=layer),media&&(item[2]?(item[1]="@media ".concat(item[2]," {").concat(item[1],"}"),item[2]=media):item[2]=media),supports&&(item[4]?(item[1]="@supports (".concat(item[4],") {").concat(item[1],"}"),item[4]=supports):item[4]="".concat(supports)),list.push(item))}},list}},"./node_modules/css-loader/dist/runtime/noSourceMaps.js":module=>{"use strict";module.exports=function(i){return i[1]}},"./packages/angular/common/display-behaviour/display-behaviour.component.scss?ngResource":(module,__unused_webpack_exports,__webpack_require__)=>{var ___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___=__webpack_require__("./node_modules/css-loader/dist/runtime/noSourceMaps.js"),___CSS_LOADER_EXPORT___=__webpack_require__("./node_modules/css-loader/dist/runtime/api.js")(___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___);___CSS_LOADER_EXPORT___.push([module.id,'@charset "UTF-8";\n:host {\n  display: flex;\n  place-content: center space-between;\n  align-items: center;\n  white-space: nowrap;\n}\n:host.ngm-display-behaviour__exclude-selected {\n  text-decoration-line: line-through;\n}\n:host.ngm-display-behaviour__auto:hover .ngm-display-behaviour__option-value {\n  flex: 1;\n}\n:host.ngm-display-behaviour__auto.ngm-display-behaviour__no-label .ngm-display-behaviour__option-text {\n  flex: 0;\n}\n:host.ngm-display-behaviour__auto.ngm-display-behaviour__no-label .ngm-display-behaviour__option-value {\n  flex: 1;\n}\n:host.ngm-display-behaviour__auto .ngm-display-behaviour__option-text {\n  flex: 1;\n}\n:host.ngm-display-behaviour__auto .ngm-display-behaviour__option-value {\n  flex: 0;\n  margin-left: 0.25em;\n  font-size: 0.85em;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  text-align: right;\n}\n:host.ngm-display-behaviour__idAndDescription .ngm-display-behaviour__option-value {\n  margin-right: 1em;\n}\n:host.ngm-display-behaviour__idAndDescription .ngm-display-behaviour__option-text {\n  font-style: italic;\n  /* 因为有斜体和 hidden,避免字的尾部被隐藏 */\n  padding: 0 0.25em;\n  font-size: 0.85em;\n}\n:host.ngm-display-behaviour__descriptionAndId.ngm-display-behaviour__no-label .ngm-display-behaviour__option-text {\n  flex: 0;\n}\n:host.ngm-display-behaviour__descriptionAndId .ngm-display-behaviour__option-text {\n  flex: 1;\n  margin-right: 1em;\n}\n:host.ngm-display-behaviour__descriptionAndId .ngm-display-behaviour__option-value {\n  flex: 1;\n  margin-left: 0.25em;\n  /* descriptionAndId 中 value 作为辅助信息字体大小显示小一号 */\n  font-size: 0.85em;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  text-align: right;\n}\n:host.ngm-display-behaviour__descriptionOnly .ngm-display-behaviour__option-text {\n  flex: 1;\n}\n:host.ngm-display-behaviour__descriptionOnly .ngm-display-behaviour__option-value {\n  flex: 0;\n}\n:host .ngm-display-behaviour__option-text {\n  max-width: 100%;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n:host .ngm-display-behaviour__selected.mat-icon {\n  margin-right: 0;\n}',""]),module.exports=___CSS_LOADER_EXPORT___.toString()},"./packages/angular/common/display-behaviour/display-behaviour.component.stories.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{DescriptionAndId:()=>DescriptionAndId,Primary:()=>Primary,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _storybook_angular__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/@storybook/angular/dist/index.mjs"),_metad_ocap_core__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/core/src/index.ts"),_display_behaviour_component__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./packages/angular/common/display-behaviour/display-behaviour.component.ts");const __WEBPACK_DEFAULT_EXPORT__={title:"NgmDisplayBehaviourComponent",component:_display_behaviour_component__WEBPACK_IMPORTED_MODULE_2__.o,decorators:[(0,_storybook_angular__WEBPACK_IMPORTED_MODULE_0__.moduleMetadata)({imports:[_display_behaviour_component__WEBPACK_IMPORTED_MODULE_2__.o]}),(0,_storybook_angular__WEBPACK_IMPORTED_MODULE_0__.componentWrapperDecorator)((story=>`<div style="width: 400px; margin: 3em">${story}</div>`))]},Primary={args:{option:{value:1,label:"A"}}},DescriptionAndId={args:{option:{value:1,label:"A"},displayBehaviour:_metad_ocap_core__WEBPACK_IMPORTED_MODULE_1__.CXV.descriptionAndId}};Primary.parameters={...Primary.parameters,docs:{...Primary.parameters?.docs,source:{originalSource:"{\n  args: {\n    option: {\n      value: 1,\n      label: 'A'\n    }\n  }\n}",...Primary.parameters?.docs?.source}}},DescriptionAndId.parameters={...DescriptionAndId.parameters,docs:{...DescriptionAndId.parameters?.docs,source:{originalSource:"{\n  args: {\n    option: {\n      value: 1,\n      label: 'A'\n    },\n    displayBehaviour: DisplayBehaviour.descriptionAndId\n  }\n}",...DescriptionAndId.parameters?.docs?.source}}}}}]);