"use strict";(self.webpackChunkocap=self.webpackChunkocap||[]).push([[514],{"./packages/angular/selection/slicers/slicers.stories.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,Editable:()=>Editable,__namedExportsOrder:()=>__namedExportsOrder,actionsData:()=>actionsData,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _storybook_angular__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/@storybook/angular/dist/index.mjs"),_angular_common_http__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/@angular/common/fesm2022/http.mjs"),_angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/@angular/platform-browser/fesm2022/animations.mjs"),_metad_ocap_angular_mock__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./packages/angular/mock/provider.ts"),_metad_ocap_angular_mock__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./packages/angular/mock/translate.ts"),_metad_ocap_angular_mock__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__("./packages/angular/mock/agent-mock.service.ts"),_storybook_addon_actions__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@storybook/addon-actions/dist/index.mjs"),_slicers_component__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./packages/angular/selection/slicers/slicers.component.ts"),_selection_module__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("./packages/angular/selection/selection.module.ts");const actionsData={onPinTask:(0,_storybook_addon_actions__WEBPACK_IMPORTED_MODULE_1__.aD)("onPinTask"),onArchiveTask:(0,_storybook_addon_actions__WEBPACK_IMPORTED_MODULE_1__.aD)("onArchiveTask")},__WEBPACK_DEFAULT_EXPORT__={title:"Selection/Slicers",component:_slicers_component__WEBPACK_IMPORTED_MODULE_2__.H,excludeStories:/.*Data$/,tags:["autodocs"],decorators:[(0,_storybook_angular__WEBPACK_IMPORTED_MODULE_0__.applicationConfig)({providers:[(0,_angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_3__.provideAnimations)(),(0,_angular_common_http__WEBPACK_IMPORTED_MODULE_4__.h_)(),(0,_metad_ocap_angular_mock__WEBPACK_IMPORTED_MODULE_5__.Y)(),(0,_metad_ocap_angular_mock__WEBPACK_IMPORTED_MODULE_6__.qX)()]}),(0,_storybook_angular__WEBPACK_IMPORTED_MODULE_0__.moduleMetadata)({declarations:[],imports:[_selection_module__WEBPACK_IMPORTED_MODULE_7__.T]}),(0,_storybook_angular__WEBPACK_IMPORTED_MODULE_0__.componentWrapperDecorator)((story=>`<div style="margin: 3em">${story}</div>`))],render:args=>({props:{...args},template:`<ngm-slicers ${(0,_storybook_angular__WEBPACK_IMPORTED_MODULE_0__.argsToTemplate)(args)}></ngm-slicers>`})},Default={args:{slicers:[{dimension:{dimension:"A"},members:[{key:"1",caption:"A"},{key:"2",caption:"B"}]}]}},Editable={args:{editable:!0,slicers:[{dimension:{dimension:"A"},members:[{key:"1",caption:"A"},{key:"2",caption:"B"}]}],dataSettings:{dataSource:_metad_ocap_angular_mock__WEBPACK_IMPORTED_MODULE_5__.T,entitySet:_metad_ocap_angular_mock__WEBPACK_IMPORTED_MODULE_8__.fJ}}};Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"{\n  args: {\n    slicers: [{\n      dimension: {\n        dimension: 'A'\n      },\n      members: [{\n        key: '1',\n        caption: 'A'\n      }, {\n        key: '2',\n        caption: 'B'\n      }]\n    }]\n  }\n}",...Default.parameters?.docs?.source}}},Editable.parameters={...Editable.parameters,docs:{...Editable.parameters?.docs,source:{originalSource:"{\n  args: {\n    editable: true,\n    slicers: [{\n      dimension: {\n        dimension: 'A'\n      },\n      members: [{\n        key: '1',\n        caption: 'A'\n      }, {\n        key: '2',\n        caption: 'B'\n      }]\n    }],\n    dataSettings: {\n      dataSource: MODEL_KEY,\n      entitySet: CUBE_SALES_ORDER_NAME\n    }\n  }\n}",...Editable.parameters?.docs?.source}}};const __namedExportsOrder=["actionsData","Default","Editable"]}}]);