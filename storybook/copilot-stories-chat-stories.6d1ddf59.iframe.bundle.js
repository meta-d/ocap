"use strict";(self.webpackChunkocap=self.webpackChunkocap||[]).push([[31],{"./packages/angular/copilot/stories/chat.stories.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{CustomEngine:()=>CustomEngine,CustomNgmCopilotEngine:()=>CustomNgmCopilotEngine,NgmSBCopilotUserComponent:()=>NgmSBCopilotUserComponent,Primary:()=>Primary,Size:()=>Size,default:()=>chat_stories});var asyncToGenerator=__webpack_require__("./node_modules/@angular-devkit/build-angular/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js"),classPrivateFieldInitSpec=__webpack_require__("./node_modules/@angular-devkit/build-angular/node_modules/@babel/runtime/helpers/esm/classPrivateFieldInitSpec.js"),tslib_es6=__webpack_require__("./node_modules/tslib/tslib.es6.js"),common=__webpack_require__("./node_modules/@angular/common/fesm2022/common.mjs"),http=__webpack_require__("./node_modules/@angular/common/fesm2022/http.mjs"),core=__webpack_require__("./node_modules/@angular/core/fesm2022/core.mjs"),animations=__webpack_require__("./node_modules/@angular/platform-browser/fesm2022/animations.mjs"),src=__webpack_require__("./packages/copilot/src/index.ts"),core_module=__webpack_require__("./packages/angular/core/core.module.ts"),dist=__webpack_require__("./node_modules/@storybook/angular/dist/index.mjs");let nanoid=(size=21)=>crypto.getRandomValues(new Uint8Array(size)).reduce(((id,byte)=>id+=(byte&=63)<36?byte.toString(36):byte<62?(byte-26).toString(36).toUpperCase():byte>62?"-":"_"),"");var ngx_markdown=__webpack_require__("./node_modules/ngx-markdown/fesm2022/ngx-markdown.mjs"),of=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/observable/of.js"),translate=__webpack_require__("./packages/angular/mock/translate.ts"),logger=__webpack_require__("./packages/angular/mock/logger.ts"),chat_component=__webpack_require__("./packages/angular/copilot/chat/chat.component.ts"),inject_copilot_command=__webpack_require__("./packages/angular/copilot/hooks/inject-copilot-command.ts"),engine_service=__webpack_require__("./packages/angular/copilot/services/engine.service.ts"),client_copilot_service=__webpack_require__("./packages/angular/copilot/services/client-copilot.service.ts"),ai_dist=__webpack_require__("./node_modules/ai/dist/index.mjs");let NgmSBCopilotService=class NgmSBCopilotService extends client_copilot_service.x{chat({sendExtraMessageFields,onResponse,onFinish,onError,credentials,headers,body,generateId=ai_dist.x0}={},chatRequest,{options,data}={},{abortController}){return(0,asyncToGenerator.Z)((function*(){return console.log("Calling chat in NgmSBCopilotService class",body),{id:generateId(),content:"Calling chat in NgmSBCopilotService class",role:"assistant"}}))()}};var _myCommand,_saveCommand,_noExampleCommand;NgmSBCopilotService=(0,tslib_es6.gn)([(0,core.Injectable)()],NgmSBCopilotService);let StorybookCopilotEngine=class StorybookCopilotEngine extends engine_service.S{};StorybookCopilotEngine=(0,tslib_es6.gn)([(0,core.Injectable)()],StorybookCopilotEngine);let NgmSBCopilotUserComponent=(_myCommand=new WeakMap,_saveCommand=new WeakMap,_noExampleCommand=new WeakMap,class NgmSBCopilotUserComponent{constructor(){var _ref;(0,classPrivateFieldInitSpec.Z)(this,_myCommand,{writable:!0,value:(0,inject_copilot_command.K)({name:"c",description:"Create a user",examples:["Create a user name Tiven, age 18"],systemPrompt:()=>"Create a user by prompt",implementation:(_ref=(0,asyncToGenerator.Z)((function*(args){return console.log("Created user"),{id:nanoid(),content:"创建执行成功",role:src.eV.Info}})),function implementation(_x){return _ref.apply(this,arguments)})})}),(0,classPrivateFieldInitSpec.Z)(this,_saveCommand,{writable:!0,value:(0,inject_copilot_command.K)({name:"s",description:"Save the user",examples:["Save a user name Tiven, age 18"],systemPrompt:()=>"Save a user by prompt"})}),(0,classPrivateFieldInitSpec.Z)(this,_noExampleCommand,{writable:!0,value:(0,inject_copilot_command.K)({name:"n",description:"New a user",systemPrompt:()=>"New a user by prompt"})})}});NgmSBCopilotUserComponent=(0,tslib_es6.gn)([(0,core.Component)({standalone:!0,changeDetection:core.ChangeDetectionStrategy.OnPush,selector:"ngm-sb-copilot-user",template:"<h1>Create a user</h1>",imports:[common.CommonModule],styles:[""]})],NgmSBCopilotUserComponent);const chat_stories={title:"Copilot/Chat",component:chat_component.q,decorators:[(0,dist.applicationConfig)({providers:[(0,animations.provideAnimations)(),(0,http.h_)(),(0,translate.qX)(translate.zd),(0,core.importProvidersFrom)(core_module.A),(0,logger.j)(),(0,ngx_markdown.ri)()]}),(0,dist.moduleMetadata)({imports:[common.CommonModule,chat_component.q,NgmSBCopilotUserComponent],providers:[{provide:src.yY,useClass:NgmSBCopilotService},{provide:engine_service.S,useClass:StorybookCopilotEngine},{provide:client_copilot_service.x.CopilotConfigFactoryToken,useFactory:()=>()=>Promise.resolve({enabled:!0,apiKey:"st-xxxxxx"})}]})]},Primary={args:{welcomeTitle:"Welcome to My AI Copilot"}},Size={render:args=>({props:args,template:`<ngm-copilot-chat ${(0,dist.argsToTemplate)(args)} class="h-[500px] w-[300px] shadow-lg rounded-lg m-4" style="height: 500px;"></ngm-copilot-chat>`}),args:{welcomeTitle:"Welcome to My AI Copilot"},parameters:{background:{default:"dark"},actions:{argTypesRegex:"^conversations.*"}}},CustomNgmCopilotEngine={render:args=>({props:args,template:`\n<div>\n  <ngm-sb-copilot-user></ngm-sb-copilot-user>\n  <ngm-copilot-chat ${(0,dist.argsToTemplate)(args)} class="h-[500px] w-[300px] shadow-lg rounded-lg m-4" style="height: 500px;"></ngm-copilot-chat>\n</div>`}),args:{welcomeTitle:"Welcome to My AI Copilot"}};const CustomEngine={args:{copilotEngine:new class StorybookCustomCopilotEngine{constructor(){this.name="Storybook custom engine",this.aiOptions={model:"",messages:[]},this.prompts=["/d {name} {age}"],this.conversations=[]}registerCommand(area,command){throw new Error("Method not implemented.")}unregisterCommand(area,name){throw new Error("Method not implemented.")}deleteMessage(message){throw new Error("Method not implemented.")}updateConversations(fn){throw new Error("Method not implemented.")}process(data,options){if("/d {name} {age}"===data.prompt){const name=options?.action||"John",age=options?.action||"18";return(0,of.of)(`My name is ${name}, I am ${age} years old.`)}return(0,of.of)("Non")}preprocess(prompt,options){}postprocess(prompt,choices){throw new Error("Method not implemented.")}upsertMessage(message){}clear(){this.conversations=[]}}}};Primary.parameters={...Primary.parameters,docs:{...Primary.parameters?.docs,source:{originalSource:"{\n  args: {\n    welcomeTitle: 'Welcome to My AI Copilot'\n  }\n}",...Primary.parameters?.docs?.source}}},Size.parameters={...Size.parameters,docs:{...Size.parameters?.docs,source:{originalSource:"{\n  render: args => ({\n    props: args,\n    template: `<ngm-copilot-chat ${argsToTemplate(args)} class=\"h-[500px] w-[300px] shadow-lg rounded-lg m-4\" style=\"height: 500px;\"></ngm-copilot-chat>`\n  }),\n  args: {\n    welcomeTitle: 'Welcome to My AI Copilot'\n  },\n  parameters: {\n    background: {\n      default: 'dark'\n    },\n    actions: {\n      argTypesRegex: '^conversations.*'\n    }\n  }\n}",...Size.parameters?.docs?.source}}},CustomNgmCopilotEngine.parameters={...CustomNgmCopilotEngine.parameters,docs:{...CustomNgmCopilotEngine.parameters?.docs,source:{originalSource:'{\n  render: args => ({\n    props: args,\n    template: `\n<div>\n  <ngm-sb-copilot-user></ngm-sb-copilot-user>\n  <ngm-copilot-chat ${argsToTemplate(args)} class="h-[500px] w-[300px] shadow-lg rounded-lg m-4" style="height: 500px;"></ngm-copilot-chat>\n</div>`\n  }),\n  args: {\n    welcomeTitle: \'Welcome to My AI Copilot\'\n  }\n}',...CustomNgmCopilotEngine.parameters?.docs?.source}}},CustomEngine.parameters={...CustomEngine.parameters,docs:{...CustomEngine.parameters?.docs,source:{originalSource:"{\n  args: {\n    copilotEngine: new StorybookCustomCopilotEngine()\n  }\n}",...CustomEngine.parameters?.docs?.source}}}}}]);