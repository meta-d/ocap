"use strict";(self.webpackChunkocap=self.webpackChunkocap||[]).push([[2968],{"./packages/angular/copilot/stories/not-enabled.stories.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Primary:()=>Primary,__namedExportsOrder:()=>__namedExportsOrder,default:()=>not_enabled_stories});var common=__webpack_require__("./node_modules/@angular/common/fesm2022/common.mjs"),http=__webpack_require__("./node_modules/@angular/common/fesm2022/http.mjs"),core=__webpack_require__("./node_modules/@angular/core/fesm2022/core.mjs"),animations=__webpack_require__("./node_modules/@angular/platform-browser/fesm2022/animations.mjs"),core_module=__webpack_require__("./packages/angular/core/core.module.ts"),dist=__webpack_require__("./node_modules/@storybook/angular/dist/index.mjs"),ngx_markdown=__webpack_require__("./node_modules/ngx-markdown/fesm2022/ngx-markdown.mjs"),translate=__webpack_require__("./packages/angular/mock/translate.ts"),logger=__webpack_require__("./packages/angular/mock/logger.ts"),chat_component=__webpack_require__("./packages/angular/copilot/chat/chat.component.ts"),engine_service=__webpack_require__("./packages/angular/copilot/services/engine.service.ts");const not_enabled_stories={title:"Copilot/NotEnabled",component:chat_component.qg,decorators:[(0,dist.applicationConfig)({providers:[(0,animations.provideAnimations)(),(0,http.h_)(),(0,translate.qX)(translate.zd),(0,core.importProvidersFrom)(core_module.A),(0,core.importProvidersFrom)(ngx_markdown.JP.forRoot()),function provideClientCopilot(factory){return[engine_service.S]}(),(0,logger.j)()]}),(0,dist.moduleMetadata)({imports:[common.CommonModule,chat_component.qg],providers:[]})]},Primary={args:{title:"Primary",welcomeTitle:"Welcome to My AI Copilot",welcomeSubTitle:"Your AI Copilot"}};Primary.parameters={...Primary.parameters,docs:{...Primary.parameters?.docs,source:{originalSource:"{\n  args: {\n    title: 'Primary',\n    welcomeTitle: 'Welcome to My AI Copilot',\n    welcomeSubTitle: 'Your AI Copilot'\n  }\n}",...Primary.parameters?.docs?.source}}};const __namedExportsOrder=["Primary"]}}]);