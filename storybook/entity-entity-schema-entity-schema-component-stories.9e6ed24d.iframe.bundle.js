(self.webpackChunkocap=self.webpackChunkocap||[]).push([[4347],{"./packages/angular/i18n/zhHans.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{q:()=>ZhHans});const ZhHans={Ngm:{Common:{Cancel:"取消",Apply:"应用",Search:"搜索",Select:"选择",Search_Placeholder:"请输入关键词",DisplayBehaviour_Description:"描述",DisplayBehaviour_DescriptionID:"描述 ID",DisplayBehaviour_IDDescription:"ID 描述",DisplayBehaviour_ID:"ID",DisplayBehaviour_Auto:"自动",SelectionType_Single:"单选",SelectionType_Multiple:"多选",Presentation_Flat:"平铺",Presentation_Hierarchy:"层级",HierarchySelectionMode_Individual:"单个",HierarchySelectionMode_SelfDescendants:"自己和后代",HierarchySelectionMode_DescendantsOnly:"只后代",HierarchySelectionMode_SelfChildren:"自己和子代",HierarchySelectionMode_ChildrenOnly:"只子代",Measures:"度量",None:"无",Default:"默认"},Controls:{ValueHelp:{Title:"为{{value}}设置过滤器",AvailableMembers:"可选成员",DisplayBehaviour:"展现形式",SelectedMembers:"选中成员",ClearSelection:"清空选择",ShowUnbookedMembers:"显示未分配成员",ShowAllMember:"显示‘所有’成员",ShowOnlyLeaves:"只显示叶子节点",ExcludeSelectedMembers:"排除选中成员",SelectionType:"选择类型",Presentation:"展现形式",HierarchySelectionMode:"层级选择模式",Hierarchy:"层次结构"}},AnalyticalCard:{Screenshot:"截图",DataDownload:"下载数据",Refresh:"刷新",DrillDown:"下钻",DrillLevel:"层级下钻",DrillDimension:"维度下钻",LinkAnalysis:"联动筛选",DataEmpty:"数据为空"},AnalyticalGrid:{DataDownload:"下载数据",SORT:"排序",MOVE:"移动",ASCENDING:"正序",DESCENDGING:"倒序",MOVELEFT:"向左",MOVERIGHT:"向右",Search:"搜索",SelectAll:"选择所有",Pin:"固定"},Entity:{SelectEntities:"选择数据集"},EntitySchema:{Parameters:"参数",Measures:"度量",Properties:"属性"},Formula:{Editor:{EditFormula:"编辑公式",Format:"格式化",Help:"帮助"}}}}},"./node_modules/lodash-es/_baseFlatten.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>_baseFlatten});var _arrayPush=__webpack_require__("./node_modules/lodash-es/_arrayPush.js"),_Symbol=__webpack_require__("./node_modules/lodash-es/_Symbol.js"),isArguments=__webpack_require__("./node_modules/lodash-es/isArguments.js"),isArray=__webpack_require__("./node_modules/lodash-es/isArray.js"),spreadableSymbol=_Symbol.Z?_Symbol.Z.isConcatSpreadable:void 0;const _isFlattenable=function isFlattenable(value){return(0,isArray.Z)(value)||(0,isArguments.Z)(value)||!!(spreadableSymbol&&value&&value[spreadableSymbol])};const _baseFlatten=function baseFlatten(array,depth,predicate,isStrict,result){var index=-1,length=array.length;for(predicate||(predicate=_isFlattenable),result||(result=[]);++index<length;){var value=array[index];depth>0&&predicate(value)?depth>1?baseFlatten(value,depth-1,predicate,isStrict,result):(0,_arrayPush.Z)(result,value):isStrict||(result[result.length]=value)}return result}},"./packages/angular/entity/entity-schema/entity-schema.component.stories.ts.css?ngResource!=!./node_modules/@angular-devkit/build-angular/node_modules/@ngtools/webpack/src/loaders/inline-resource.js?data=Lm1hdC1kcmF3ZXItY29udGFpbmVyIHtoZWlnaHQ6IDUwMHB4O30%3D!./packages/angular/entity/entity-schema/entity-schema.component.stories.ts":(module,__unused_webpack_exports,__webpack_require__)=>{var ___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___=__webpack_require__("./node_modules/css-loader/dist/runtime/noSourceMaps.js"),___CSS_LOADER_EXPORT___=__webpack_require__("./node_modules/css-loader/dist/runtime/api.js")(___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___);___CSS_LOADER_EXPORT___.push([module.id,".mat-drawer-container {height: 500px;}",""]),module.exports=___CSS_LOADER_EXPORT___.toString()},"./packages/angular/entity/entity-schema/entity-schema.component.scss?ngResource":(module,__unused_webpack_exports,__webpack_require__)=>{var ___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___=__webpack_require__("./node_modules/css-loader/dist/runtime/noSourceMaps.js"),___CSS_LOADER_EXPORT___=__webpack_require__("./node_modules/css-loader/dist/runtime/api.js")(___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___);___CSS_LOADER_EXPORT___.push([module.id,":host {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n}\n\n.mat-tree-node {\n  min-height: 30px;\n}\n.mat-tree-node .mat-mdc-icon-button.mat-mdc-button-base {\n  --mdc-icon-button-state-layer-size: 30px;\n  padding: 0;\n}\n\n.ngm-display-behaviour {\n  flex: 1;\n  overflow: hidden;\n}",""]),module.exports=___CSS_LOADER_EXPORT___.toString()},"./packages/angular/entity/entity-schema/entity-schema.component.stories.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Primary:()=>Primary,SelectedHierarchy:()=>SelectedHierarchy,default:()=>entity_schema_entity_schema_component_stories});var asyncToGenerator=__webpack_require__("./node_modules/@angular-devkit/build-angular/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js"),tslib_es6=__webpack_require__("./node_modules/tslib/tslib.es6.js"),entity_schema_component_stories=__webpack_require__("./packages/angular/entity/entity-schema/entity-schema.component.stories.ts.css?ngResource!=!./node_modules/@angular-devkit/build-angular/node_modules/@ngtools/webpack/src/loaders/inline-resource.js?data=Lm1hdC1kcmF3ZXItY29udGFpbmVyIHtoZWlnaHQ6IDUwMHB4O30%3D!./packages/angular/entity/entity-schema/entity-schema.component.stories.ts"),entity_schema_component_stories_default=__webpack_require__.n(entity_schema_component_stories),drag_drop=__webpack_require__("./node_modules/@angular/cdk/fesm2022/drag-drop.mjs"),core=__webpack_require__("./node_modules/@angular/core/fesm2022/core.mjs"),common=__webpack_require__("./node_modules/@angular/common/fesm2022/common.mjs"),sidenav=__webpack_require__("./node_modules/@angular/material/fesm2022/sidenav.mjs"),animations=__webpack_require__("./node_modules/@angular/platform-browser/fesm2022/animations.mjs"),missing_tanslation=__webpack_require__("./packages/angular/core/i18n/missing-tanslation.ts"),core_module=__webpack_require__("./packages/angular/core/core.module.ts"),types=__webpack_require__("./packages/angular/core/types.ts"),core_service=__webpack_require__("./packages/angular/core/core.service.ts"),agent_mock_service=__webpack_require__("./packages/angular/mock/agent-mock.service.ts"),src=__webpack_require__("./packages/core/src/index.ts"),ngx_translate_core=__webpack_require__("./node_modules/@ngx-translate/core/fesm2020/ngx-translate-core.mjs"),dist=__webpack_require__("./node_modules/@storybook/angular/dist/index.mjs"),of=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/observable/of.js"),zhHans=__webpack_require__("./packages/angular/i18n/zhHans.ts");var entity_schema_componentngResource=__webpack_require__("./packages/angular/entity/entity-schema/entity-schema.component.scss?ngResource"),entity_schema_componentngResource_default=__webpack_require__.n(entity_schema_componentngResource),scrolling=__webpack_require__("./node_modules/@angular/cdk/fesm2022/scrolling.mjs"),tree=__webpack_require__("./node_modules/@angular/cdk/fesm2022/tree.mjs"),fesm2022_forms=__webpack_require__("./node_modules/@angular/forms/fesm2022/forms.mjs"),fesm2022_button=__webpack_require__("./node_modules/@angular/material/fesm2022/button.mjs"),fesm2022_checkbox=__webpack_require__("./node_modules/@angular/material/fesm2022/checkbox.mjs"),form_field=__webpack_require__("./node_modules/@angular/material/fesm2022/form-field.mjs"),icon=__webpack_require__("./node_modules/@angular/material/fesm2022/icon.mjs"),input=__webpack_require__("./node_modules/@angular/material/fesm2022/input.mjs"),progress_spinner=__webpack_require__("./node_modules/@angular/material/fesm2022/progress-spinner.mjs"),tooltip=__webpack_require__("./node_modules/@angular/material/fesm2022/tooltip.mjs"),fesm2022_tree=__webpack_require__("./node_modules/@angular/material/fesm2022/tree.mjs"),common_module=__webpack_require__("./packages/angular/common/common.module.ts"),ngneat_until_destroy=__webpack_require__("./node_modules/@ngneat/until-destroy/fesm2020/ngneat-until-destroy.mjs"),isEmpty=__webpack_require__("./node_modules/lodash-es/isEmpty.js"),_baseFlatten=__webpack_require__("./node_modules/lodash-es/_baseFlatten.js"),_arrayMap=__webpack_require__("./node_modules/lodash-es/_arrayMap.js"),_baseIteratee=__webpack_require__("./node_modules/lodash-es/_baseIteratee.js"),_baseMap=__webpack_require__("./node_modules/lodash-es/_baseMap.js"),isArray=__webpack_require__("./node_modules/lodash-es/isArray.js");const lodash_es_map=function map(collection,iteratee){return((0,isArray.Z)(collection)?_arrayMap.Z:_baseMap.Z)(collection,(0,_baseIteratee.Z)(iteratee,3))};const lodash_es_flatMap=function flatMap(collection,iteratee){return(0,_baseFlatten.Z)(lodash_es_map(collection,iteratee),1)};var EntityCapacity,EntitySchemaType,_class,Subject=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/Subject.js"),BehaviorSubject=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/BehaviorSubject.js"),distinctUntilChanged=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/distinctUntilChanged.js"),filter=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/filter.js"),switchMap=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/switchMap.js"),takeUntil=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/takeUntil.js"),shareReplay=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/shareReplay.js"),operators_map=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/map.js"),merge=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/observable/merge.js"),combineLatestWith=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/combineLatestWith.js"),startWith=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/startWith.js"),first=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/first.js"),tap=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/operators/tap.js");!function(EntityCapacity){EntityCapacity.Dimension="Dimension",EntityCapacity.Hierarchy="Hierarchy",EntityCapacity.Measure="Measure",EntityCapacity.Indicator="Indicator",EntityCapacity.Calculation="Calculation",EntityCapacity.Parameter="Parameter"}(EntityCapacity||(EntityCapacity={})),function(EntitySchemaType){EntitySchemaType.Entity="Entity",EntitySchemaType.Dimension="Dimension",EntitySchemaType.Hierarchy="Hierarchy",EntitySchemaType.Level="Level",EntitySchemaType.IMeasure="IMeasure",EntitySchemaType.Member="Member",EntitySchemaType.Parameters="Parameters",EntitySchemaType.Parameter="Parameter",EntitySchemaType.Properties="Properties",EntitySchemaType.Field="Field"}(EntitySchemaType||(EntitySchemaType={}));class EntitySchemaFlatNode{constructor(item,level=1,expandable=!1,isLoading=!1,children=null,error=null){this.item=item,this.level=level,this.expandable=expandable,this.isLoading=isLoading,this.children=children,this.error=error}}class EntitySchemaDataSource{get dataSourceName(){return this.dataSourceName$.value}set dataSourceName(value){this.dataSourceName$.next(value)}get data(){return this.dataChange.value}set data(value){this._treeControl.dataNodes=value,this.dataChange.next(value)}constructor(_treeControl,dsCoreService,translateService,capacities){this._treeControl=_treeControl,this.dsCoreService=dsCoreService,this.translateService=translateService,this.capacities=capacities,this.destroy$=new Subject.x,this.dataChange=new BehaviorSubject.X([]),this.searchControl=new fesm2022_forms.NI,this.dataSourceName$=new BehaviorSubject.X(null),this.dataSource$=this.dataSourceName$.pipe((0,distinctUntilChanged.x)(),(0,filter.h)((value=>!!value)),(0,switchMap.w)((name=>this.dsCoreService.getDataSource(name))),(0,takeUntil.R)(this.destroy$),(0,shareReplay.d)(1)),this.entity$=new BehaviorSubject.X(null),this.entityService$=this.entity$.pipe((0,distinctUntilChanged.x)(),(0,filter.h)((value=>!!value)),(0,switchMap.w)((name=>this.dataSource$.pipe((0,operators_map.U)((dataSource=>dataSource.createEntityService(name)))))),(0,takeUntil.R)(this.destroy$),(0,shareReplay.d)(1))}connect(collectionViewer){return this._treeControl.expansionModel.changed.subscribe((change=>{(change.added||change.removed)&&this.handleTreeControl(change)})),(0,merge.T)(collectionViewer.viewChange,this.dataChange).pipe((0,combineLatestWith.V)(this.searchControl.valueChanges.pipe((0,startWith.O)(null),(0,distinctUntilChanged.x)())),(0,operators_map.U)((([,text])=>this.data.filter((node=>node.item.type===EntitySchemaType.Entity||node.item.type===EntitySchemaType.Dimension||node.item.type===EntitySchemaType.Parameters||!text||node.item.caption?.toLowerCase().includes(text.toLowerCase())||node.item.name.toLowerCase().includes(text.toLowerCase()))))))}disconnect(collectionViewer){this.destroy$.next(),this.destroy$.complete()}handleTreeControl(change){change.added&&change.added.forEach((node=>this.toggleNode(node,!0))),change.removed&&change.removed.slice().reverse().forEach((node=>this.toggleNode(node,!1)))}toggleNode(node,expand){const index=this.data.indexOf(node);if(expand)node.children?(this.data.splice(index+1,0,...node.children),this.dataChange.next(this.data)):node.isLoading||(node.isLoading=!0,this.getChildren(node).pipe((0,takeUntil.R)(this.destroy$)).subscribe({next:children=>{const index=this.data.indexOf(node);if(index<0)return;if(!children?.length)return node.isLoading=!1,this.data.splice(index,1,{...node,expandable:!1}),void this.dataChange.next(this.data);const nodes=children.map((name=>new EntitySchemaFlatNode(name,node.level+1,name.type===EntitySchemaType.Member?!!name.children?.length:name.type!==EntitySchemaType.IMeasure)));this.data.splice(index+1,0,...nodes),node.isLoading=!1,this.dataChange.next(this.data)},error:err=>{let error;error="string"==typeof err?err:err instanceof Error?err?.message:err?.error instanceof Error?err?.error?.message:err,node.isLoading=!1,this.data.splice(index,1,{...node,expandable:!1,error}),this.dataChange.next(this.data)}}));else{let count=0;for(let i=index+1;i<this.data.length&&this.data[i].level>node.level;i++,count++);node.children=this.data.splice(index+1,count),this.dataChange.next(this.data)}}getChildren(node){if(node.item.type===EntitySchemaType.Entity)return this.entityType?.name===node.item.name?(0,of.of)(this.getEntityTypeChildren(this.entityType)):(this.entity$.next(node.item.name),this.dataSource$.pipe((0,switchMap.w)((dataSource=>dataSource.selectEntityType(node.item.name))),(0,first.P)(),(0,tap.b)((entityType=>{if(!(0,src.OCY)(entityType))throw entityType;this.entityType=entityType,node.item.caption=this.entityType?.caption})),(0,filter.h)(src.OCY),(0,operators_map.U)((value=>this.getEntityTypeChildren(value)))));if(node.item.type===EntitySchemaType.Dimension){const item=node.item,hierarchies=item.hierarchies;return(0,isEmpty.Z)(hierarchies)?(0,isEmpty.Z)(item.members)?this.entityService$.pipe((0,switchMap.w)((entityService=>entityService.selectMembers({dimension:node.item.name}))),(0,first.P)(),(0,operators_map.U)((members=>members.map((item=>({...item,type:EntitySchemaType.Member,name:item.memberKey,caption:item.memberCaption})))))):(0,of.of)(item.members):(0,of.of)(hierarchies.map((item=>({...item,type:EntitySchemaType.Hierarchy}))))}if(node.item.type===EntitySchemaType.Hierarchy){const levels=node.item.levels;if(!(0,isEmpty.Z)(levels)){const properties=lodash_es_flatMap(node.item.levels,(level=>level.properties)).map((item=>({...item,type:EntitySchemaType.Field}))),propertiesCaption=this.getTranslation("Ngm.EntitySchema.Properties",{Default:"Properties"});return(0,of.of)([...levels.map((item=>({...item,type:EntitySchemaType.Level}))),...properties.length?[{name:"",caption:propertiesCaption,members:properties,type:EntitySchemaType.Properties}]:[]])}}else{if(node.item.type===EntitySchemaType.Level){const item=node.item;return this.entityService$.pipe((0,switchMap.w)((entityService=>entityService.selectMembers({dimension:item.dimension,hierarchy:item.hierarchy}))),(0,first.P)(),(0,operators_map.U)((members=>(0,src.LC)(members,src.Dbq,{startLevel:item.levelNumber}).map((item=>({...item,type:EntitySchemaType.Member,name:item.raw.memberUniqueName}))))))}if(node.item.type===EntitySchemaType.Member){const members=node.item.children;return(0,of.of)(members?.map((item=>({...item,type:EntitySchemaType.Member,name:item.raw.memberUniqueName})))??[])}if(node.item.members)return(0,of.of)(node.item.members)}return(0,of.of)([])}getEntityTypeChildren(entityType){const dimensions=this.hasCapability(EntityCapacity.Dimension)?(0,src.n6Q)(entityType):[],measures=(0,src.wqS)(entityType).filter((measure=>(0,src.sT)(measure)?this.hasCapability(EntityCapacity.Indicator):(0,src.ewE)(measure)?this.hasCapability(EntityCapacity.Calculation):this.hasCapability(EntityCapacity.Measure))).map((item=>({...item,type:EntitySchemaType.IMeasure}))),parameters=(0,src.fOg)(entityType).map((item=>({...item,type:EntitySchemaType.Parameter}))),parametersCaption=this.getTranslation("Ngm.EntitySchema.Parameters",{Default:"Parameters"}),measuresCaption=this.getTranslation("Ngm.EntitySchema.Measures",{Default:"Measures"}),nodes=[...dimensions.map((item=>({...item,type:EntitySchemaType.Dimension,hierarchies:entityType.semantics===src.CwT.table?null:item.hierarchies})))];return this.hasCapability(EntityCapacity.Measure)&&nodes.push(...entityType.semantics===src.CwT.aggregate?[{name:(0,src.eD2)(src.QPo),caption:measuresCaption,type:EntitySchemaType.Dimension,members:measures}]:measures),this.hasCapability(EntityCapacity.Parameter)&&parameters.length&&nodes.push({name:"parameters",caption:parametersCaption,type:EntitySchemaType.Parameters,members:parameters}),nodes}hasCapability(capability){return this.capacities?.includes(capability)}getTranslation(key,params){let t="";return this.translateService.get(key,params).subscribe((value=>{t=value})),t}}let NgmEntitySchemaComponent=((_class=class NgmEntitySchemaComponent{constructor(){this.EntitySchemaType=EntitySchemaType,this._isEntitySchemaComponent=!0,this.translateService=(0,core.inject)(ngx_translate_core.sK),this._dsCoreService=(0,core.inject)(core_service.q,{optional:!0}),this.getLevel=node=>node.level,this.isExpandable=node=>node.expandable,this.hasChild=(_,_nodeData)=>_nodeData.expandable}get searchControl(){return this.dataSource.searchControl}ngOnInit(){if(this.dsCoreService&&(this._dsCoreService=this.dsCoreService),this.treeControl=new tree.C2(this.getLevel,this.isExpandable),this.dataSource=new EntitySchemaDataSource(this.treeControl,this._dsCoreService,this.translateService,this.capacities),this.dataSource.data=[],this.dataSettings.entitySet){this.dataSource.dataSourceName=this.dataSettings.dataSource;const rootNode=new EntitySchemaFlatNode({type:EntitySchemaType.Entity,name:this.dataSettings.entitySet,caption:this.dataSettings.entitySet},0,!0);this.dataSource.data=[rootNode]}}ngOnChanges({dataSettings}){dataSettings?.currentValue?.entitySet&&this.dataSource&&(this.dataSource.dataSourceName=dataSettings.currentValue.dataSource)}}).propDecorators={_isEntitySchemaComponent:[{type:core.HostBinding,args:["class.ngm-entity-schema"]}],dsCoreService:[{type:core.Input}],dataSettings:[{type:core.Input}],appearance:[{type:core.Input}],selectedHierarchy:[{type:core.Input}],capacities:[{type:core.Input}]},_class);var entity_schema_component_stories_class;NgmEntitySchemaComponent=(0,tslib_es6.gn)([(0,ngneat_until_destroy.c)(),(0,core.Component)({standalone:!0,imports:[common.CommonModule,fesm2022_forms.UX,fesm2022_tree.dp,form_field.lN,input.c,icon.Ps,fesm2022_button.ot,drag_drop._t,scrolling.Cl,ngx_translate_core.aw,fesm2022_checkbox.p9,progress_spinner.Cq,tooltip.AV,common_module.N,core_module.A],changeDetection:core.ChangeDetectionStrategy.OnPush,selector:"ngm-entity-schema",template:'<mat-tree [dataSource]="dataSource" [treeControl]="treeControl">\n  <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding matTreeNodePaddingIndent="20"\n    cdkDrag\n    [cdkDragData]="node.item"\n    [class.selected]="selectedHierarchy && (\n      node.item.name === selectedHierarchy || node.item.hierarchy === selectedHierarchy || node.item.raw?.hierarchy === selectedHierarchy)"\n    draggable="true"\n  >\n    <button mat-icon-button disabled displayDensity="compact">\n      <mat-icon *ngIf="node.error" color="warn" fontSet="material-icons-round"\n        [matTooltip]="node.error">\n        warning_amber\n      </mat-icon>\n    </button>\n\n    <div class="ngm-entity-schema__type">{{node.item.type?.[0]}}</div>\n    <ngm-display-behaviour [option]="{value: node.item.name, caption: node.item.caption ?? node.item.label}"\n      [highlight]="searchControl.value">\n    </ngm-display-behaviour>\n    <div class="ngm-entity-schema__drag-placeholder" *cdkDragPlaceholder></div>\n  </mat-tree-node>\n  <mat-tree-node *matTreeNodeDef="let node; when: hasChild" matTreeNodePadding matTreeNodePaddingIndent="20" class="group"\n    cdkDrag\n    [cdkDragData]="node.item"\n    [class.selected]="selectedHierarchy && (\n      node.item.name === selectedHierarchy || node.item.hierarchy === selectedHierarchy || node.item.raw?.hierarchy === selectedHierarchy)"\n    draggable="true"\n  >\n    <button *ngIf="!node.isLoading" mat-icon-button\n            [attr.aria-label]="\'Toggle \' + node.item" matTreeNodeToggle>\n      <mat-icon class="mat-icon-rtl-mirror" fontSet="material-icons-round">\n        {{treeControl.isExpanded(node) ? \'arrow_drop_down\' : \'arrow_right\'}}\n      </mat-icon>\n    </button>\n    <mat-spinner *ngIf="node.isLoading" class="m-2" strokeWidth="1" diameter="15"></mat-spinner>\n\n    <div class="ngm-entity-schema__type">{{node.item.type?.[0]}}</div>\n\n    <ngm-display-behaviour class="flex-1" [option]="{value: node.item.name, caption: node.item.caption ?? node.item.label}"\n      [highlight]="searchControl.value">\n    </ngm-display-behaviour>\n\n    <ngm-search *ngIf="node.item.type === EntitySchemaType.Entity" class="w-0 overflow-hidden group-hover:w-auto"\n      displayDensity="cosy"\n      [formControl]="searchControl">\n    </ngm-search>\n\n    <div class="ngm-entity-schema__drag-placeholder" *cdkDragPlaceholder></div>\n  </mat-tree-node>\n</mat-tree>\n',styles:[entity_schema_componentngResource_default()]})],NgmEntitySchemaComponent);let DragComponent=((entity_schema_component_stories_class=class DragComponent{constructor(){this.drops=[]}drop(event){this.drops.push(event.item.data)}}).propDecorators={dataSettings:[{type:core.Input}]},entity_schema_component_stories_class);DragComponent=(0,tslib_es6.gn)([(0,core.Component)({standalone:!0,imports:[common.CommonModule,sidenav.SJ,drag_drop._t,NgmEntitySchemaComponent],selector:"ngm-story-component-drag",template:'<mat-drawer-container class="example-container" autosize cdkDropListGroup>\n  <mat-drawer mode="side" opened cdkDropList >\n    <ngm-entity-schema [dataSettings]="dataSettings"></ngm-entity-schema>\n    <ngm-entity-schema [dataSettings]="{\n      dataSource: dataSettings.dataSource,\n      entitySet: \'sales_fact\'\n    }"></ngm-entity-schema>\n  </mat-drawer>\n  <mat-drawer-content cdkDropList [cdkDropListData]="drops" (cdkDropListDropped)="drop($event)">\n    <ul>\n      <li *ngFor="let item of drops">\n        {{item.entity}}/{{item.name || item.raw.memberKey}}/{{item.type}}/{{item.dataType}}/{{item.dbType}}\n      </li>\n    </ul>\n  </mat-drawer-content>\n</mat-drawer-container>',styles:[entity_schema_component_stories_default()]})],DragComponent);const entity_schema_entity_schema_component_stories={title:"NgmEntitySchemaComponent",decorators:[(0,dist.applicationConfig)({providers:[(0,animations.provideAnimations)(),(0,core.importProvidersFrom)(ngx_translate_core.aw.forRoot({missingTranslationHandler:{provide:ngx_translate_core.gC,useClass:missing_tanslation.l},loader:{provide:ngx_translate_core.Zw,useClass:class CustomLoader{getTranslation(lang){return(0,of.of)(zhHans.q)}}},defaultLanguage:"zh-Hans"})),(0,core.importProvidersFrom)(core_module.A),{provide:types.fH,useClass:agent_mock_service.c,multi:!0},{provide:types.OF,useValue:{type:"SQL",factory:(_ref=(0,asyncToGenerator.Z)((function*(){const{SQLDataSource}=yield __webpack_require__.e(9593).then(__webpack_require__.bind(__webpack_require__,"./packages/sql/src/index.ts"));return SQLDataSource})),function factory(){return _ref.apply(this,arguments)})},multi:!0},{provide:types.ET,useValue:{name:"Sales",type:"SQL",agentType:src.buO.Browser,settings:{ignoreUnknownProperty:!0},schema:{cubes:[agent_mock_service.n]}},multi:!0}]}),(0,dist.moduleMetadata)({imports:[animations.BrowserAnimationsModule,sidenav.SJ,drag_drop._t,NgmEntitySchemaComponent,DragComponent],providers:[core_service.q]})]};var _ref;const Primary={args:{dataSettings:{dataSource:"Sales",entitySet:"SalesOrder"}}},SelectedHierarchy=(args=>({props:args})).bind({});SelectedHierarchy.args={dataSettings:{dataSource:"Sales",entitySet:"SalesOrder"},selectedHierarchy:"[Product]"},Primary.parameters={...Primary.parameters,docs:{...Primary.parameters?.docs,source:{originalSource:"{\n  args: {\n    dataSettings: {\n      dataSource: 'Sales',\n      entitySet: 'SalesOrder'\n    }\n  }\n}",...Primary.parameters?.docs?.source}}},SelectedHierarchy.parameters={...SelectedHierarchy.parameters,docs:{...SelectedHierarchy.parameters?.docs,source:{originalSource:"(args: NgmEntitySchemaComponent) => ({\n  props: args\n})",...SelectedHierarchy.parameters?.docs?.source}}}}}]);