"use strict";(self.webpackChunkocap=self.webpackChunkocap||[]).push([[2597,5465],{"./packages/angular/controls/smart-filter/smart-filter.component.stories.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{AppearanceOutline:()=>AppearanceOutline,DensityCompact:()=>DensityCompact,Disabled:()=>Disabled,Prefix:()=>Prefix,Primary:()=>Primary,SelectionTypeMultiple:()=>SelectionTypeMultiple,Suffix:()=>Suffix,Width:()=>Width,WidthCompact:()=>WidthCompact,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_ocap_ocap_node_modules_angular_devkit_build_angular_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_12__=__webpack_require__("./node_modules/@angular-devkit/build-angular/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js"),_angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/@angular/platform-browser/fesm2022/animations.mjs"),_angular_material_icon__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/@angular/material/fesm2022/icon.mjs"),_metad_ocap_angular_core__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./packages/angular/core/core.module.ts"),_metad_ocap_angular_core__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__("./packages/angular/core/i18n/missing-tanslation.ts"),_metad_ocap_angular_core__WEBPACK_IMPORTED_MODULE_9__=__webpack_require__("./packages/angular/core/core.service.ts"),_metad_ocap_angular_core__WEBPACK_IMPORTED_MODULE_10__=__webpack_require__("./packages/angular/core/types.ts"),_metad_ocap_angular_core__WEBPACK_IMPORTED_MODULE_13__=__webpack_require__("./packages/angular/core/directives/displayDensity.ts"),_metad_ocap_core__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./packages/core/src/index.ts"),_ngx_translate_core__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("./node_modules/@ngx-translate/core/fesm2020/ngx-translate-core.mjs"),_storybook_angular__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@storybook/angular/dist/index.mjs"),_mock_agent_mock_service__WEBPACK_IMPORTED_MODULE_11__=__webpack_require__("./packages/angular/mock/agent-mock.service.ts"),_controls_module__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./packages/angular/controls/controls.module.ts");const __WEBPACK_DEFAULT_EXPORT__={title:"SmartFilter",component:__webpack_require__("./packages/angular/controls/smart-filter/smart-filter.component.ts").O,tags:["autodocs"],decorators:[(0,_storybook_angular__WEBPACK_IMPORTED_MODULE_1__.moduleMetadata)({imports:[_angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_3__.BrowserAnimationsModule,_angular_material_icon__WEBPACK_IMPORTED_MODULE_4__.Ps,_controls_module__WEBPACK_IMPORTED_MODULE_5__.E,_metad_ocap_angular_core__WEBPACK_IMPORTED_MODULE_6__.A.forRoot(),_ngx_translate_core__WEBPACK_IMPORTED_MODULE_7__.aw.forRoot({missingTranslationHandler:{provide:_ngx_translate_core__WEBPACK_IMPORTED_MODULE_7__.gC,useClass:_metad_ocap_angular_core__WEBPACK_IMPORTED_MODULE_8__.l}})],providers:[_metad_ocap_angular_core__WEBPACK_IMPORTED_MODULE_9__.q,{provide:_metad_ocap_angular_core__WEBPACK_IMPORTED_MODULE_10__.fH,useClass:_mock_agent_mock_service__WEBPACK_IMPORTED_MODULE_11__.c,multi:!0},{provide:_metad_ocap_angular_core__WEBPACK_IMPORTED_MODULE_10__.OF,useValue:{type:"SQL",factory:(_ref=(0,_home_runner_work_ocap_ocap_node_modules_angular_devkit_build_angular_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_12__.Z)((function*(){const{SQLDataSource}=yield __webpack_require__.e(9593).then(__webpack_require__.bind(__webpack_require__,"./packages/sql/src/index.ts"));return SQLDataSource})),function factory(){return _ref.apply(this,arguments)})},multi:!0},{provide:_metad_ocap_angular_core__WEBPACK_IMPORTED_MODULE_10__.ET,useValue:{name:"Sales",type:"SQL",agentType:_metad_ocap_core__WEBPACK_IMPORTED_MODULE_0__.buO.Browser,settings:{ignoreUnknownProperty:!0},schema:{cubes:[{name:"SalesOrder",tables:[{name:"SalesOrder"}],dimensions:[{name:"product",caption:"productName"},{name:"Department",caption:"DepartmentName"}]}]}},multi:!0}]})]};var _ref;const Primary={args:{dataSettings:{dataSource:"Sales",entitySet:"SalesOrder3s"},dimension:{dimension:"Department",displayBehaviour:_metad_ocap_core__WEBPACK_IMPORTED_MODULE_0__.CXV.auto},options:{}}},DensityCompact={args:{dataSettings:{dataSource:"Sales",entitySet:"SalesOrder3s"},dimension:{dimension:"Department"},options:{},displayDensity:_metad_ocap_angular_core__WEBPACK_IMPORTED_MODULE_13__.A.compact}},SelectionTypeMultiple={args:{dataSettings:{dataSource:"Sales",entitySet:"SalesOrder3s"},dimension:{dimension:"Department"},options:{multiple:!0},appearance:{displayDensity:_metad_ocap_angular_core__WEBPACK_IMPORTED_MODULE_13__.A.compact}}},AppearanceOutline={args:{dataSettings:{dataSource:"Sales",entitySet:"SalesOrder3s"},dimension:{dimension:"Department"},options:{selectionType:_metad_ocap_core__WEBPACK_IMPORTED_MODULE_0__.ucB.Multiple},appearance:{appearance:"outline"}}},render=args=>({props:args,styles:[".ngm-smart-filter {\n      width: 100px;\n    }"]}),Width={render,args:{dataSettings:{dataSource:"Sales",entitySet:"SalesOrder3s"},dimension:{dimension:"Department"},options:{selectionType:_metad_ocap_core__WEBPACK_IMPORTED_MODULE_0__.ucB.Multiple}}},WidthCompact={render,args:{dataSettings:{dataSource:"Sales",entitySet:"SalesOrder3s"},dimension:{dimension:"Department"},options:{selectionType:_metad_ocap_core__WEBPACK_IMPORTED_MODULE_0__.ucB.Multiple},appearance:{displayDensity:_metad_ocap_angular_core__WEBPACK_IMPORTED_MODULE_13__.A.compact}}},Disabled={render,args:{dataSettings:{dataSource:"Sales",entitySet:"SalesOrder3s"},dimension:{dimension:"Department"},options:{},disabled:!0}},Prefix={render:args=>({props:args,template:'\n<ngm-smart-filter [dataSettings]="dataSettings" [dimension]="dimension" [options]="options">\n    <div ngmPrefix>\n      <mat-icon>search</mat-icon>\n    </div>\n</ngm-smart-filter>\n    '}),args:{dataSettings:{dataSource:"Sales",entitySet:"SalesOrder3s"},dimension:{dimension:"Department"},options:{}}},Suffix={render:args=>({props:args,template:'\n<ngm-smart-filter [dataSettings]="dataSettings" [dimension]="dimension" [options]="options">\n    <div ngmSuffix>\n      <mat-icon>search</mat-icon>\n    </div>\n</ngm-smart-filter>\n    '}),args:{dataSettings:{dataSource:"Sales",entitySet:"SalesOrder3s"},dimension:{dimension:"Department"},options:{}}}},"./packages/angular/controls/smart-filter/smart-filter.mdx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{default:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/react/jsx-runtime.js"),_home_runner_work_ocap_ocap_node_modules_storybook_addon_docs_dist_shims_mdx_react_shim__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@mdx-js/react/lib/index.js"),_storybook_blocks__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/@storybook/blocks/dist/index.mjs"),_smart_filter_component_stories__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./packages/angular/controls/smart-filter/smart-filter.component.stories.ts");function _createMdxContent(props){const _components=Object.assign({h1:"h1"},(0,_home_runner_work_ocap_ocap_node_modules_storybook_addon_docs_dist_shims_mdx_react_shim__WEBPACK_IMPORTED_MODULE_2__.ah)(),props.components);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.Fragment,{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_storybook_blocks__WEBPACK_IMPORTED_MODULE_3__.h_,{title:"SmartFilter/Docs",of:_smart_filter_component_stories__WEBPACK_IMPORTED_MODULE_4__}),"\n",(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h1,{id:"smart-filter",children:"Smart Filter"}),"\n",(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_storybook_blocks__WEBPACK_IMPORTED_MODULE_3__.sq,{}),"\n",(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_storybook_blocks__WEBPACK_IMPORTED_MODULE_3__.oG,{id:"smartfilter--primary"}),"\n",(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_storybook_blocks__WEBPACK_IMPORTED_MODULE_3__.ZX,{})]})}const __WEBPACK_DEFAULT_EXPORT__=function MDXContent(props={}){const{wrapper:MDXLayout}=Object.assign({},(0,_home_runner_work_ocap_ocap_node_modules_storybook_addon_docs_dist_shims_mdx_react_shim__WEBPACK_IMPORTED_MODULE_2__.ah)(),props.components);return MDXLayout?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(MDXLayout,Object.assign({},props,{children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_createMdxContent,props)})):_createMdxContent(props)}}}]);