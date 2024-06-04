"use strict";(self.webpackChunkocap=self.webpackChunkocap||[]).push([[8141],{"./node_modules/lodash-es/_assignValue.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var _baseAssignValue_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/lodash-es/_baseAssignValue.js"),_eq_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/lodash-es/eq.js"),hasOwnProperty=Object.prototype.hasOwnProperty;const __WEBPACK_DEFAULT_EXPORT__=function assignValue(object,key,value){var objValue=object[key];hasOwnProperty.call(object,key)&&(0,_eq_js__WEBPACK_IMPORTED_MODULE_0__.Z)(objValue,value)&&(void 0!==value||key in object)||(0,_baseAssignValue_js__WEBPACK_IMPORTED_MODULE_1__.Z)(object,key,value)}},"./node_modules/lodash-es/_baseAssignValue.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var _defineProperty_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/lodash-es/_defineProperty.js");const __WEBPACK_DEFAULT_EXPORT__=function baseAssignValue(object,key,value){"__proto__"==key&&_defineProperty_js__WEBPACK_IMPORTED_MODULE_0__.Z?(0,_defineProperty_js__WEBPACK_IMPORTED_MODULE_0__.Z)(object,key,{configurable:!0,enumerable:!0,value,writable:!0}):object[key]=value}},"./node_modules/lodash-es/_defineProperty.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var _getNative_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/lodash-es/_getNative.js");const __WEBPACK_DEFAULT_EXPORT__=function(){try{var func=(0,_getNative_js__WEBPACK_IMPORTED_MODULE_0__.Z)(Object,"defineProperty");return func({},"",{}),func}catch(e){}}()},"./node_modules/lodash-es/_overRest.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>_overRest});const _apply=function apply(func,thisArg,args){switch(args.length){case 0:return func.call(thisArg);case 1:return func.call(thisArg,args[0]);case 2:return func.call(thisArg,args[0],args[1]);case 3:return func.call(thisArg,args[0],args[1],args[2])}return func.apply(thisArg,args)};var nativeMax=Math.max;const _overRest=function overRest(func,start,transform){return start=nativeMax(void 0===start?func.length-1:start,0),function(){for(var args=arguments,index=-1,length=nativeMax(args.length-start,0),array=Array(length);++index<length;)array[index]=args[start+index];index=-1;for(var otherArgs=Array(start+1);++index<start;)otherArgs[index]=args[index];return otherArgs[start]=transform(array),_apply(func,this,otherArgs)}}},"./node_modules/lodash-es/_setToString.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>_setToString});const lodash_es_constant=function constant(value){return function(){return value}};var _defineProperty=__webpack_require__("./node_modules/lodash-es/_defineProperty.js"),identity=__webpack_require__("./node_modules/lodash-es/identity.js");const _baseSetToString=_defineProperty.Z?function(func,string){return(0,_defineProperty.Z)(func,"toString",{configurable:!0,enumerable:!1,value:lodash_es_constant(string),writable:!0})}:identity.Z;var nativeNow=Date.now;const _setToString=function shortOut(func){var count=0,lastCalled=0;return function(){var stamp=nativeNow(),remaining=16-(stamp-lastCalled);if(lastCalled=stamp,remaining>0){if(++count>=800)return arguments[0]}else count=0;return func.apply(void 0,arguments)}}(_baseSetToString)},"./node_modules/ngx-logger/fesm2020/ngx-logger.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{f9:()=>LoggerModule,Kf:()=>NGXLogger,_z:()=>NgxLoggerLevel});var http=__webpack_require__("./node_modules/@angular/common/fesm2022/http.mjs"),core=__webpack_require__("./node_modules/@angular/core/fesm2022/core.mjs"),of=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/observable/of.js"),BehaviorSubject=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/BehaviorSubject.js"),isObservable=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/util/isObservable.js"),throwError=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/observable/throwError.js"),timer=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/observable/timer.js"),filter=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/filter.js"),map=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/map.js"),lift=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/util/lift.js"),OperatorSubscriber=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js"),identity=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/util/identity.js"),innerFrom=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/observable/innerFrom.js");var shareReplay=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/shareReplay.js"),catchError=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/catchError.js"),concatMap=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/concatMap.js"),take=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/take.js"),charToInteger={},integerToChar={};function decode(string){for(var result=[],shift=0,value=0,i=0;i<string.length;i+=1){var integer=charToInteger[string[i]];if(void 0===integer)throw new Error("Invalid character ("+string[i]+")");var hasContinuationBit=32&integer;if(value+=(integer&=31)<<shift,hasContinuationBit)shift+=5;else{var shouldNegate=1&value;value>>>=1,shouldNegate?result.push(0===value?-2147483648:-value):result.push(value),value=shift=0}}return result}"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".split("").forEach((function(char,i){charToInteger[char]=i,integerToChar[i]=char}));var common=__webpack_require__("./node_modules/@angular/common/fesm2022/common.mjs");class NGXLoggerConfigEngine{constructor(config){this.config=this._clone(config)}get level(){return this.config.level}get serverLogLevel(){return this.config.serverLogLevel}updateConfig(config){this.config=this._clone(config)}partialUpdateConfig(partialConfig){partialConfig&&Object.keys(partialConfig).forEach((configParamKey=>{this.config[configParamKey]=partialConfig[configParamKey]}))}getConfig(){return this._clone(this.config)}_clone(object){const cloneConfig={level:null};return Object.keys(object).forEach((key=>{cloneConfig[key]=object[key]})),cloneConfig}}class NGXLoggerConfigEngineFactory{provideConfigEngine(config){return new NGXLoggerConfigEngine(config)}}class NGXLoggerMapperService{constructor(httpBackend){this.httpBackend=httpBackend,this.sourceMapCache=new Map,this.logPositionCache=new Map}getLogPosition(config,metadata){const stackLine=this.getStackLine(config);if(!stackLine)return(0,of.of)({fileName:"",lineNumber:0,columnNumber:0});const logPosition=this.getLocalPosition(stackLine);if(!config.enableSourceMaps)return(0,of.of)(logPosition);const sourceMapLocation=this.getSourceMapLocation(stackLine);return this.getSourceMap(sourceMapLocation,logPosition)}getStackLine(config){const error=new Error;try{throw error}catch(e){try{let defaultProxy=4;return error.stack.split("\n")[0].includes(".js:")||(defaultProxy+=1),error.stack.split("\n")[defaultProxy+(config.proxiedSteps||0)]}catch(e){return null}}}getLocalPosition(stackLine){const positionStartIndex=stackLine.lastIndexOf("/");let positionEndIndex=stackLine.indexOf(")");positionEndIndex<0&&(positionEndIndex=void 0);const dataArray=stackLine.substring(positionStartIndex+1,positionEndIndex).split(":");return 3===dataArray.length?{fileName:dataArray[0],lineNumber:+dataArray[1],columnNumber:+dataArray[2]}:{fileName:"unknown",lineNumber:0,columnNumber:0}}getTranspileLocation(stackLine){let locationStartIndex=stackLine.indexOf("(");locationStartIndex<0&&(locationStartIndex=stackLine.lastIndexOf("@"),locationStartIndex<0&&(locationStartIndex=stackLine.lastIndexOf(" ")));let locationEndIndex=stackLine.indexOf(")");return locationEndIndex<0&&(locationEndIndex=void 0),stackLine.substring(locationStartIndex+1,locationEndIndex)}getSourceMapLocation(stackLine){const file=this.getTranspileLocation(stackLine),mapFullPath=file.substring(0,file.lastIndexOf(":"));return mapFullPath.substring(0,mapFullPath.lastIndexOf(":"))+".map"}getMapping(sourceMap,position){let sourceFileIndex=0,sourceCodeLine=0,sourceCodeColumn=0;const lines=sourceMap.mappings.split(";");for(let lineIndex=0;lineIndex<lines.length;lineIndex++){let generatedCodeColumn=0;const columns=lines[lineIndex].split(",");for(let columnIndex=0;columnIndex<columns.length;columnIndex++){const decodedSection=decode(columns[columnIndex]);if(decodedSection.length>=4&&(generatedCodeColumn+=decodedSection[0],sourceFileIndex+=decodedSection[1],sourceCodeLine+=decodedSection[2],sourceCodeColumn+=decodedSection[3]),lineIndex===position.lineNumber){if(generatedCodeColumn===position.columnNumber)return{fileName:sourceMap.sources[sourceFileIndex],lineNumber:sourceCodeLine,columnNumber:sourceCodeColumn};if(columnIndex+1===columns.length)return{fileName:sourceMap.sources[sourceFileIndex],lineNumber:sourceCodeLine,columnNumber:0}}}}return{fileName:"unknown",lineNumber:0,columnNumber:0}}getSourceMap(sourceMapLocation,distPosition){const req=new http.aW("GET",sourceMapLocation),distPositionKey=`${distPosition.fileName}:${distPosition.lineNumber}:${distPosition.columnNumber}`;if(this.logPositionCache.has(distPositionKey))return this.logPositionCache.get(distPositionKey);this.sourceMapCache.has(sourceMapLocation)||(this.httpBackend?this.sourceMapCache.set(sourceMapLocation,this.httpBackend.handle(req).pipe((0,filter.h)((e=>e instanceof http.Zn)),(0,map.U)((httpResponse=>httpResponse.body)),function retry(configOrCount){var config;void 0===configOrCount&&(configOrCount=1/0);var _a=(config=configOrCount&&"object"==typeof configOrCount?configOrCount:{count:configOrCount}).count,count=void 0===_a?1/0:_a,delay=config.delay,_b=config.resetOnSuccess,resetOnSuccess=void 0!==_b&&_b;return count<=0?identity.y:(0,lift.e)((function(source,subscriber){var innerSub,soFar=0,subscribeForRetry=function(){var syncUnsub=!1;innerSub=source.subscribe((0,OperatorSubscriber.x)(subscriber,(function(value){resetOnSuccess&&(soFar=0),subscriber.next(value)}),void 0,(function(err){if(soFar++<count){var resub_1=function(){innerSub?(innerSub.unsubscribe(),innerSub=null,subscribeForRetry()):syncUnsub=!0};if(null!=delay){var notifier="number"==typeof delay?(0,timer.H)(delay):(0,innerFrom.Xf)(delay(err,soFar)),notifierSubscriber_1=(0,OperatorSubscriber.x)(subscriber,(function(){notifierSubscriber_1.unsubscribe(),resub_1()}),(function(){subscriber.complete()}));notifier.subscribe(notifierSubscriber_1)}else resub_1()}else subscriber.error(err)}))),syncUnsub&&(innerSub.unsubscribe(),innerSub=null,subscribeForRetry())};subscribeForRetry()}))}(3),(0,shareReplay.d)(1))):(console.error("NGXLogger : Can't get sourcemap because HttpBackend is not provided. You need to import HttpClientModule"),this.sourceMapCache.set(sourceMapLocation,(0,of.of)(null))));const logPosition$=this.sourceMapCache.get(sourceMapLocation).pipe((0,map.U)((sourceMap=>sourceMap?this.getMapping(sourceMap,distPosition):distPosition)),(0,catchError.K)((()=>(0,of.of)(distPosition))),(0,shareReplay.d)(1));return this.logPositionCache.set(distPositionKey,logPosition$),logPosition$}}NGXLoggerMapperService.ɵfac=function NGXLoggerMapperService_Factory(t){return new(t||NGXLoggerMapperService)(core["ɵɵinject"](http.jN,8))},NGXLoggerMapperService.ɵprov=core["ɵɵdefineInjectable"]({token:NGXLoggerMapperService,factory:NGXLoggerMapperService.ɵfac}),("undefined"==typeof ngDevMode||ngDevMode)&&core["ɵsetClassMetadata"](NGXLoggerMapperService,[{type:core.Injectable}],(function(){return[{type:http.jN,decorators:[{type:core.Optional}]}]}),null);class NGXLoggerMetadataService{constructor(datePipe){this.datePipe=datePipe}computeTimestamp(config){const defaultTimestamp=()=>(new Date).toISOString();return config.timestampFormat?this.datePipe?this.datePipe.transform(new Date,config.timestampFormat):(console.error("NGXLogger : Can't use timeStampFormat because DatePipe is not provided. You need to provide DatePipe"),defaultTimestamp()):defaultTimestamp()}getMetadata(level,config,message,additional){const metadata={level,additional};return metadata.message=message&&"function"==typeof message?message():message,metadata.timestamp=this.computeTimestamp(config),metadata}}NGXLoggerMetadataService.ɵfac=function NGXLoggerMetadataService_Factory(t){return new(t||NGXLoggerMetadataService)(core["ɵɵinject"](common.DatePipe,8))},NGXLoggerMetadataService.ɵprov=core["ɵɵdefineInjectable"]({token:NGXLoggerMetadataService,factory:NGXLoggerMetadataService.ɵfac}),("undefined"==typeof ngDevMode||ngDevMode)&&core["ɵsetClassMetadata"](NGXLoggerMetadataService,[{type:core.Injectable}],(function(){return[{type:common.DatePipe,decorators:[{type:core.Optional}]}]}),null);class NGXLoggerRulesService{shouldCallWriter(level,config,message,additional){return!config.disableConsoleLogging&&level>=config.level}shouldCallServer(level,config,message,additional){return!!config.serverLoggingUrl&&level>=config.serverLogLevel}shouldCallMonitor(level,config,message,additional){return this.shouldCallWriter(level,config,message,additional)||this.shouldCallServer(level,config,message,additional)}}NGXLoggerRulesService.ɵfac=function NGXLoggerRulesService_Factory(t){return new(t||NGXLoggerRulesService)},NGXLoggerRulesService.ɵprov=core["ɵɵdefineInjectable"]({token:NGXLoggerRulesService,factory:NGXLoggerRulesService.ɵfac}),("undefined"==typeof ngDevMode||ngDevMode)&&core["ɵsetClassMetadata"](NGXLoggerRulesService,[{type:core.Injectable}],null,null);class NGXLoggerServerService{constructor(httpBackend,ngZone){this.httpBackend=httpBackend,this.ngZone=ngZone,this.serverCallsQueue=[],this.flushingQueue=new BehaviorSubject.X(!1)}ngOnDestroy(){this.flushingQueue&&(this.flushingQueue.complete(),this.flushingQueue=null),this.addToQueueTimer&&(this.addToQueueTimer.unsubscribe(),this.addToQueueTimer=null)}secureErrorObject(err){return err?.stack}secureAdditionalParameters(additional){return null==additional?null:additional.map(((next,idx)=>{try{return next instanceof Error?this.secureErrorObject(next):("object"==typeof next&&JSON.stringify(next),next)}catch(e){return`The additional[${idx}] value could not be parsed using JSON.stringify().`}}))}secureMessage(message){try{if(message instanceof Error)return this.secureErrorObject(message);"string"!=typeof message&&(message=JSON.stringify(message,null,2))}catch(e){message='The provided "message" value could not be parsed with JSON.stringify().'}return message}alterHttpRequest(httpRequest){return httpRequest}logOnServer(url,logContent,options){if(!this.httpBackend)return console.error("NGXLogger : Can't log on server because HttpBackend is not provided. You need to import HttpClientModule"),(0,of.of)(null);let defaultRequest=new http.aW("POST",url,logContent,options||{}),finalRequest=(0,of.of)(defaultRequest);const alteredRequest=this.alterHttpRequest(defaultRequest);return(0,isObservable.b)(alteredRequest)?finalRequest=alteredRequest:alteredRequest?finalRequest=(0,of.of)(alteredRequest):console.warn("NGXLogger : alterHttpRequest returned an invalid request. Using default one instead"),finalRequest.pipe((0,concatMap.b)((req=>req?this.httpBackend.handle(req):(console.warn("NGXLogger : alterHttpRequest returned an invalid request (observable). Using default one instead"),this.httpBackend.handle(defaultRequest)))),(0,filter.h)((e=>e instanceof http.Zn)),(0,map.U)((httpResponse=>httpResponse.body)))}customiseRequestBody(metadata){return metadata}flushQueue(config){this.flushingQueue.next(!0),this.addToQueueTimer&&(this.addToQueueTimer.unsubscribe(),this.addToQueueTimer=null),this.serverCallsQueue&&this.serverCallsQueue.length>0&&this.sendToServerAction(this.serverCallsQueue,config),this.serverCallsQueue=[],this.flushingQueue.next(!1)}sendToServerAction(metadata,config){let requestBody;const secureMetadata=pMetadata=>{const securedMetadata={...pMetadata};return securedMetadata.additional=this.secureAdditionalParameters(securedMetadata.additional),securedMetadata.message=this.secureMessage(securedMetadata.message),securedMetadata};Array.isArray(metadata)?(requestBody=[],metadata.forEach((m=>{requestBody.push(secureMetadata(m))}))):requestBody=secureMetadata(metadata),requestBody=this.customiseRequestBody(requestBody);const headers=config.customHttpHeaders||new http.WM;headers.has("Content-Type")||headers.set("Content-Type","application/json");const logOnServerAction=()=>{this.logOnServer(config.serverLoggingUrl,requestBody,{headers,params:config.customHttpParams||new http.LE,responseType:config.httpResponseType||"json",withCredentials:config.withCredentials||!1}).pipe((0,catchError.K)((err=>(console.error("NGXLogger: Failed to log on server",err),(0,throwError._)(err))))).subscribe()};if(!0===config.serverCallsOutsideNgZone){if(!this.ngZone)return void console.error("NGXLogger: NgZone is not provided and serverCallsOutsideNgZone is set to true");this.ngZone.runOutsideAngular(logOnServerAction)}else logOnServerAction()}sendToServer(metadata,config){if((!config.serverCallsBatchSize||config.serverCallsBatchSize<=0)&&(!config.serverCallsTimer||config.serverCallsTimer<=0))return void this.sendToServerAction(metadata,config);const addLogToQueueAction=()=>{this.serverCallsQueue.push({...metadata}),config.serverCallsBatchSize&&this.serverCallsQueue.length>config.serverCallsBatchSize&&this.flushQueue(config),config.serverCallsTimer>0&&!this.addToQueueTimer&&(this.addToQueueTimer=(0,timer.H)(config.serverCallsTimer).subscribe((_=>{this.flushQueue(config)})))};!0===this.flushingQueue.value?this.flushingQueue.pipe((0,filter.h)((fq=>!1===fq)),(0,take.q)(1)).subscribe((_=>{addLogToQueueAction()})):addLogToQueueAction()}}NGXLoggerServerService.ɵfac=function NGXLoggerServerService_Factory(t){return new(t||NGXLoggerServerService)(core["ɵɵinject"](http.jN,8),core["ɵɵinject"](core.NgZone,8))},NGXLoggerServerService.ɵprov=core["ɵɵdefineInjectable"]({token:NGXLoggerServerService,factory:NGXLoggerServerService.ɵfac}),("undefined"==typeof ngDevMode||ngDevMode)&&core["ɵsetClassMetadata"](NGXLoggerServerService,[{type:core.Injectable}],(function(){return[{type:http.jN,decorators:[{type:core.Optional}]},{type:core.NgZone,decorators:[{type:core.Optional}]}]}),null);var NgxLoggerLevel;!function(NgxLoggerLevel){NgxLoggerLevel[NgxLoggerLevel.TRACE=0]="TRACE",NgxLoggerLevel[NgxLoggerLevel.DEBUG=1]="DEBUG",NgxLoggerLevel[NgxLoggerLevel.INFO=2]="INFO",NgxLoggerLevel[NgxLoggerLevel.LOG=3]="LOG",NgxLoggerLevel[NgxLoggerLevel.WARN=4]="WARN",NgxLoggerLevel[NgxLoggerLevel.ERROR=5]="ERROR",NgxLoggerLevel[NgxLoggerLevel.FATAL=6]="FATAL",NgxLoggerLevel[NgxLoggerLevel.OFF=7]="OFF"}(NgxLoggerLevel||(NgxLoggerLevel={}));const DEFAULT_COLOR_SCHEME=["purple","teal","gray","gray","red","red","red"];class NGXLoggerWriterService{constructor(platformId){this.platformId=platformId,this.prepareMetaStringFuncs=[this.getTimestampToWrite,this.getLevelToWrite,this.getFileDetailsToWrite,this.getContextToWrite],this.isIE=(0,common.isPlatformBrowser)(platformId)&&navigator&&navigator.userAgent&&!(-1===navigator.userAgent.indexOf("MSIE")&&!navigator.userAgent.match(/Trident\//)&&!navigator.userAgent.match(/Edge\//)),this.logFunc=this.isIE?this.logIE.bind(this):this.logModern.bind(this)}getTimestampToWrite(metadata,config){return metadata.timestamp}getLevelToWrite(metadata,config){return NgxLoggerLevel[metadata.level]}getFileDetailsToWrite(metadata,config){return!0===config.disableFileDetails?"":`[${metadata.fileName}:${metadata.lineNumber}:${metadata.columnNumber}]`}getContextToWrite(metadata,config){return config.context?`{${config.context}}`:""}prepareMetaString(metadata,config){let metaString="";return this.prepareMetaStringFuncs.forEach((prepareMetaStringFunc=>{const metaItem=prepareMetaStringFunc(metadata,config);metaItem&&(metaString=metaString+" "+metaItem)})),metaString.trim()}getColor(metadata,config){const configColorScheme=config.colorScheme??DEFAULT_COLOR_SCHEME;if(metadata.level!==NgxLoggerLevel.OFF)return configColorScheme[metadata.level]}logIE(metadata,config,metaString){const additional=metadata.additional||[];switch(metadata.level){case NgxLoggerLevel.WARN:console.warn(`${metaString} `,metadata.message,...additional);break;case NgxLoggerLevel.ERROR:case NgxLoggerLevel.FATAL:console.error(`${metaString} `,metadata.message,...additional);break;case NgxLoggerLevel.INFO:console.info(`${metaString} `,metadata.message,...additional);break;default:console.log(`${metaString} `,metadata.message,...additional)}}logModern(metadata,config,metaString){const color=this.getColor(metadata,config),additional=metadata.additional||[];switch(metadata.level){case NgxLoggerLevel.WARN:console.warn(`%c${metaString}`,`color:${color}`,metadata.message,...additional);break;case NgxLoggerLevel.ERROR:case NgxLoggerLevel.FATAL:console.error(`%c${metaString}`,`color:${color}`,metadata.message,...additional);break;case NgxLoggerLevel.INFO:console.info(`%c${metaString}`,`color:${color}`,metadata.message,...additional);break;case NgxLoggerLevel.DEBUG:console.debug(`%c${metaString}`,`color:${color}`,metadata.message,...additional);break;default:console.log(`%c${metaString}`,`color:${color}`,metadata.message,...additional)}}writeMessage(metadata,config){const metaString=this.prepareMetaString(metadata,config);this.logFunc(metadata,config,metaString)}}NGXLoggerWriterService.ɵfac=function NGXLoggerWriterService_Factory(t){return new(t||NGXLoggerWriterService)(core["ɵɵinject"](core.PLATFORM_ID))},NGXLoggerWriterService.ɵprov=core["ɵɵdefineInjectable"]({token:NGXLoggerWriterService,factory:NGXLoggerWriterService.ɵfac}),("undefined"==typeof ngDevMode||ngDevMode)&&core["ɵsetClassMetadata"](NGXLoggerWriterService,[{type:core.Injectable}],(function(){return[{type:void 0,decorators:[{type:core.Inject,args:[core.PLATFORM_ID]}]}]}),null);class NGXLogger{constructor(config,configEngineFactory,metadataService,ruleService,mapperService,writerService,serverService){this.metadataService=metadataService,this.ruleService=ruleService,this.mapperService=mapperService,this.writerService=writerService,this.serverService=serverService,this.configEngine=configEngineFactory.provideConfigEngine(config)}get level(){return this.configEngine.level}get serverLogLevel(){return this.configEngine.serverLogLevel}trace(message,...additional){this._log(NgxLoggerLevel.TRACE,message,additional)}debug(message,...additional){this._log(NgxLoggerLevel.DEBUG,message,additional)}info(message,...additional){this._log(NgxLoggerLevel.INFO,message,additional)}log(message,...additional){this._log(NgxLoggerLevel.LOG,message,additional)}warn(message,...additional){this._log(NgxLoggerLevel.WARN,message,additional)}error(message,...additional){this._log(NgxLoggerLevel.ERROR,message,additional)}fatal(message,...additional){this._log(NgxLoggerLevel.FATAL,message,additional)}setCustomHttpHeaders(headers){const config=this.getConfigSnapshot();config.customHttpHeaders=headers,this.updateConfig(config)}setCustomParams(params){const config=this.getConfigSnapshot();config.customHttpParams=params,this.updateConfig(config)}setWithCredentialsOptionValue(withCredentials){const config=this.getConfigSnapshot();config.withCredentials=withCredentials,this.updateConfig(config)}registerMonitor(monitor){this._loggerMonitor=monitor}updateConfig(config){this.configEngine.updateConfig(config)}partialUpdateConfig(partialConfig){this.configEngine.partialUpdateConfig(partialConfig)}getConfigSnapshot(){return this.configEngine.getConfig()}flushServerQueue(){this.serverService.flushQueue(this.getConfigSnapshot())}_log(level,message,additional=[]){const config=this.configEngine.getConfig(),shouldCallWriter=this.ruleService.shouldCallWriter(level,config,message,additional),shouldCallServer=this.ruleService.shouldCallServer(level,config,message,additional),shouldCallMonitor=this.ruleService.shouldCallMonitor(level,config,message,additional);if(!shouldCallWriter&&!shouldCallServer&&!shouldCallMonitor)return;const metadata=this.metadataService.getMetadata(level,config,message,additional);this.mapperService.getLogPosition(config,metadata).pipe((0,take.q)(1)).subscribe((logPosition=>{logPosition&&(metadata.fileName=logPosition.fileName,metadata.lineNumber=logPosition.lineNumber,metadata.columnNumber=logPosition.columnNumber),shouldCallMonitor&&this._loggerMonitor&&this._loggerMonitor.onLog(metadata,config),shouldCallWriter&&this.writerService.writeMessage(metadata,config),shouldCallServer&&this.serverService.sendToServer(metadata,config)}))}}NGXLogger.ɵfac=function NGXLogger_Factory(t){return new(t||NGXLogger)(core["ɵɵinject"]("TOKEN_LOGGER_CONFIG"),core["ɵɵinject"]("TOKEN_LOGGER_CONFIG_ENGINE_FACTORY"),core["ɵɵinject"]("TOKEN_LOGGER_METADATA_SERVICE"),core["ɵɵinject"]("TOKEN_LOGGER_RULES_SERVICE"),core["ɵɵinject"]("TOKEN_LOGGER_MAPPER_SERVICE"),core["ɵɵinject"]("TOKEN_LOGGER_WRITER_SERVICE"),core["ɵɵinject"]("TOKEN_LOGGER_SERVER_SERVICE"))},NGXLogger.ɵprov=core["ɵɵdefineInjectable"]({token:NGXLogger,factory:NGXLogger.ɵfac,providedIn:"root"}),("undefined"==typeof ngDevMode||ngDevMode)&&core["ɵsetClassMetadata"](NGXLogger,[{type:core.Injectable,args:[{providedIn:"root"}]}],(function(){return[{type:void 0,decorators:[{type:core.Inject,args:["TOKEN_LOGGER_CONFIG"]}]},{type:void 0,decorators:[{type:core.Inject,args:["TOKEN_LOGGER_CONFIG_ENGINE_FACTORY"]}]},{type:void 0,decorators:[{type:core.Inject,args:["TOKEN_LOGGER_METADATA_SERVICE"]}]},{type:void 0,decorators:[{type:core.Inject,args:["TOKEN_LOGGER_RULES_SERVICE"]}]},{type:void 0,decorators:[{type:core.Inject,args:["TOKEN_LOGGER_MAPPER_SERVICE"]}]},{type:void 0,decorators:[{type:core.Inject,args:["TOKEN_LOGGER_WRITER_SERVICE"]}]},{type:void 0,decorators:[{type:core.Inject,args:["TOKEN_LOGGER_SERVER_SERVICE"]}]}]}),null);class CustomNGXLoggerService{constructor(logger,configEngineFactory,metadataService,ruleService,mapperService,writerService,serverService){this.logger=logger,this.configEngineFactory=configEngineFactory,this.metadataService=metadataService,this.ruleService=ruleService,this.mapperService=mapperService,this.writerService=writerService,this.serverService=serverService}create(config,serverService,logMonitor,mapperService){return this.getNewInstance({config,serverService,logMonitor,mapperService})}getNewInstance(params){const logger=new NGXLogger(params?.config??this.logger.getConfigSnapshot(),params?.configEngineFactory??this.configEngineFactory,params?.metadataService??this.metadataService,params?.ruleService??this.ruleService,params?.mapperService??this.mapperService,params?.writerService??this.writerService,params?.serverService??this.serverService);return params?.partialConfig&&logger.partialUpdateConfig(params.partialConfig),params?.logMonitor&&logger.registerMonitor(params.logMonitor),logger}}CustomNGXLoggerService.ɵfac=function CustomNGXLoggerService_Factory(t){return new(t||CustomNGXLoggerService)(core["ɵɵinject"](NGXLogger),core["ɵɵinject"]("TOKEN_LOGGER_CONFIG_ENGINE_FACTORY"),core["ɵɵinject"]("TOKEN_LOGGER_METADATA_SERVICE"),core["ɵɵinject"]("TOKEN_LOGGER_RULES_SERVICE"),core["ɵɵinject"]("TOKEN_LOGGER_MAPPER_SERVICE"),core["ɵɵinject"]("TOKEN_LOGGER_WRITER_SERVICE"),core["ɵɵinject"]("TOKEN_LOGGER_SERVER_SERVICE"))},CustomNGXLoggerService.ɵprov=core["ɵɵdefineInjectable"]({token:CustomNGXLoggerService,factory:CustomNGXLoggerService.ɵfac,providedIn:"root"}),("undefined"==typeof ngDevMode||ngDevMode)&&core["ɵsetClassMetadata"](CustomNGXLoggerService,[{type:core.Injectable,args:[{providedIn:"root"}]}],(function(){return[{type:NGXLogger},{type:void 0,decorators:[{type:core.Inject,args:["TOKEN_LOGGER_CONFIG_ENGINE_FACTORY"]}]},{type:void 0,decorators:[{type:core.Inject,args:["TOKEN_LOGGER_METADATA_SERVICE"]}]},{type:void 0,decorators:[{type:core.Inject,args:["TOKEN_LOGGER_RULES_SERVICE"]}]},{type:void 0,decorators:[{type:core.Inject,args:["TOKEN_LOGGER_MAPPER_SERVICE"]}]},{type:void 0,decorators:[{type:core.Inject,args:["TOKEN_LOGGER_WRITER_SERVICE"]}]},{type:void 0,decorators:[{type:core.Inject,args:["TOKEN_LOGGER_SERVER_SERVICE"]}]}]}),null);class LoggerModule{static forRoot(config,customProvider){if(customProvider||(customProvider={}),customProvider.configProvider){if("TOKEN_LOGGER_CONFIG"!==customProvider.configProvider.provide)throw new Error(`Wrong injection token for configProvider, it should be TOKEN_LOGGER_CONFIG and you used ${customProvider.configProvider.provide}`)}else customProvider.configProvider={provide:"TOKEN_LOGGER_CONFIG",useValue:config||{}};if(customProvider.configEngineFactoryProvider){if("TOKEN_LOGGER_CONFIG_ENGINE_FACTORY"!==customProvider.configEngineFactoryProvider.provide)throw new Error(`Wrong injection token for configEngineFactoryProvider, it should be 'TOKEN_LOGGER_CONFIG_ENGINE_FACTORY' and you used '${customProvider.configEngineFactoryProvider.provide}'`)}else customProvider.configEngineFactoryProvider={provide:"TOKEN_LOGGER_CONFIG_ENGINE_FACTORY",useClass:NGXLoggerConfigEngineFactory};if(customProvider.metadataProvider){if("TOKEN_LOGGER_METADATA_SERVICE"!==customProvider.metadataProvider.provide)throw new Error(`Wrong injection token for metadataProvider, it should be 'TOKEN_LOGGER_METADATA_SERVICE' and you used '${customProvider.metadataProvider.provide}'`)}else customProvider.metadataProvider={provide:"TOKEN_LOGGER_METADATA_SERVICE",useClass:NGXLoggerMetadataService};if(customProvider.ruleProvider){if("TOKEN_LOGGER_RULES_SERVICE"!==customProvider.ruleProvider.provide)throw new Error(`Wrong injection token for ruleProvider, it should be 'TOKEN_LOGGER_RULES_SERVICE' and you used '${customProvider.ruleProvider.provide}'`)}else customProvider.ruleProvider={provide:"TOKEN_LOGGER_RULES_SERVICE",useClass:NGXLoggerRulesService};if(customProvider.mapperProvider){if("TOKEN_LOGGER_MAPPER_SERVICE"!==customProvider.mapperProvider.provide)throw new Error(`Wrong injection token for mapperProvider, it should be 'TOKEN_LOGGER_MAPPER_SERVICE' and you used '${customProvider.mapperProvider.provide}'`)}else customProvider.mapperProvider={provide:"TOKEN_LOGGER_MAPPER_SERVICE",useClass:NGXLoggerMapperService};if(customProvider.writerProvider){if("TOKEN_LOGGER_WRITER_SERVICE"!==customProvider.writerProvider.provide)throw new Error(`Wrong injection token for writerProvider, it should be 'TOKEN_LOGGER_WRITER_SERVICE' and you used '${customProvider.writerProvider.provide}'`)}else customProvider.writerProvider={provide:"TOKEN_LOGGER_WRITER_SERVICE",useClass:NGXLoggerWriterService};if(customProvider.serverProvider){if("TOKEN_LOGGER_SERVER_SERVICE"!==customProvider.serverProvider.provide)throw new Error(`Wrong injection token for serverProvider, it should be 'TOKEN_LOGGER_SERVER_SERVICE' and you used '${customProvider.writerProvider.provide}'`)}else customProvider.serverProvider={provide:"TOKEN_LOGGER_SERVER_SERVICE",useClass:NGXLoggerServerService};return{ngModule:LoggerModule,providers:[NGXLogger,customProvider.configProvider,customProvider.configEngineFactoryProvider,customProvider.metadataProvider,customProvider.ruleProvider,customProvider.mapperProvider,customProvider.writerProvider,customProvider.serverProvider,CustomNGXLoggerService]}}static forChild(){return{ngModule:LoggerModule}}}LoggerModule.ɵfac=function LoggerModule_Factory(t){return new(t||LoggerModule)},LoggerModule.ɵmod=core["ɵɵdefineNgModule"]({type:LoggerModule,imports:[common.CommonModule]}),LoggerModule.ɵinj=core["ɵɵdefineInjector"]({imports:[[common.CommonModule]]}),("undefined"==typeof ngDevMode||ngDevMode)&&core["ɵsetClassMetadata"](LoggerModule,[{type:core.NgModule,args:[{imports:[common.CommonModule]}]}],null,null)}}]);