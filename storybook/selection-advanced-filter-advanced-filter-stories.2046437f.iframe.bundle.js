(self.webpackChunkocap=self.webpackChunkocap||[]).push([[910],{"./packages/angular/selection/advanced-filter/advanced-filter.component.scss?ngResource":(module,__unused_webpack_exports,__webpack_require__)=>{var ___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___=__webpack_require__("./node_modules/@angular-devkit/build-angular/node_modules/css-loader/dist/runtime/noSourceMaps.js"),___CSS_LOADER_EXPORT___=__webpack_require__("./node_modules/@angular-devkit/build-angular/node_modules/css-loader/dist/runtime/api.js")(___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___);___CSS_LOADER_EXPORT___.push([module.id,".pac-filter-tree {\n  display: flex;\n}\n\n.pac-filter-legend {\n  display: flex;\n  margin-left: auto;\n  pointer-events: none;\n}\n\n.mat-dialog-title {\n  display: flex;\n}",""]),module.exports=___CSS_LOADER_EXPORT___.toString()},"./packages/angular/selection/advanced-filter/advanced-filter.component.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{JJ:()=>NgmAdvancedFilterComponent});var asyncToGenerator=__webpack_require__("./node_modules/@angular-devkit/build-angular/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js"),tslib_es6=__webpack_require__("./node_modules/tslib/tslib.es6.js");var _NgmAdvancedFilterComponent,advanced_filter_componentngResource=__webpack_require__("./packages/angular/selection/advanced-filter/advanced-filter.component.scss?ngResource"),advanced_filter_componentngResource_default=__webpack_require__.n(advanced_filter_componentngResource),core=__webpack_require__("./node_modules/@angular/core/fesm2022/core.mjs"),dialog=__webpack_require__("./node_modules/@angular/material/fesm2022/dialog.mjs"),src=__webpack_require__("./packages/core/src/index.ts"),value_help_component=__webpack_require__("./packages/angular/controls/value-help/value-help.component.ts"),firstValueFrom=__webpack_require__("./node_modules/rxjs/dist/esm5/internal/firstValueFrom.js"),types=__webpack_require__("./packages/angular/entity/types.ts"),property_select_component=__webpack_require__("./packages/angular/entity/property-select/property-select.component.ts");class ExpressionItem{constructor(parent){this.parent=parent}}class ExpressionGroupItem extends ExpressionItem{constructor(operator,parent){super(parent),this.operator=operator,this.children=[]}}class ExpressionOperandItem extends ExpressionItem{constructor(expression,parent){super(parent),this.expression=expression}}let NgmAdvancedFilterComponent=(_NgmAdvancedFilterComponent=class NgmAdvancedFilterComponent{constructor(cdr,dialog,_viewContainerRef,data,dialogRef){this.cdr=cdr,this.dialog=dialog,this._viewContainerRef=_viewContainerRef,this.data=data,this.dialogRef=dialogRef,this.isDialogContainer=!0,this.PropertyCapacity=types.F,this.DISPLAY_BEHAVIOUR=src.CXV,this.FilterOperator=src.pgc,this.selectedExpressions=[],this.selectedGroups=[],this._dblClickDelay=200,this._preventChipClick=!1}ngOnInit(){this.entityType=this.data.entityType,this.syntax=this.data.syntax,this.data?.advancedFilter&&(this.rootGroup=convertFilter2ExpressionItem(this.data.advancedFilter,null),this.currentGroup=this.rootGroup),this.syntax===src.GYg.MDX?this.operators=function getMDXOperators(){return[src.pgc.EQ,src.pgc.NE].map((o=>({value:o,label:src.bl9[o]})))}():this.operators=function getAllOperators(){return[src.pgc.EQ,src.pgc.NE,src.pgc.BT,src.pgc.GT,src.pgc.GE,src.pgc.LT,src.pgc.LE].map((o=>({value:o,label:src.bl9[o]})))}()}get selectedDimension(){return this._selectedDimension}set selectedDimension(value){this._selectedDimension=value}get filterableColumns(){return(0,src.n6Q)(this.entityType)}getEntityProperty(name){return(0,src.ZBB)(this.entityType,name)}addCondition(parent,afterExpression){this.cancelOperandAdd();const operandItem=new ExpressionOperandItem({dimension:null,operator:null,and:!0,members:null},parent);if(afterExpression){const index=parent.children.indexOf(afterExpression);parent.children.splice(index+1,0,operandItem)}else parent.children.push(operandItem);this.enterExpressionEdit(operandItem)}addAndGroup(parent,afterExpression){this.addGroup(src.vLo.And,parent,afterExpression)}addOrGroup(parent,afterExpression){this.addGroup(src.vLo.Or,parent,afterExpression)}endGroup(groupItem){this.currentGroup=groupItem.parent}commitOperandEdit(){this.editedExpression&&(this.editedExpression.expression.dimension=this.selectedDimension,this.editedExpression.expression.operator=this.selectedCondition,this.editedExpression.expression.members=[{key:this.searchValue,value:this.searchValue}],this.editedExpression.expression.operator!==src.pgc.BT||(0,src.kKJ)(this.highValue)||this.editedExpression.expression.members.push({key:this.highValue,value:this.highValue}),this.editedExpression.inEditMode=!1,this.editedExpression=null)}cancelOperandAdd(){this.addModeExpression&&(this.addModeExpression.inAddMode=!1,this.addModeExpression=null)}cancelOperandEdit(){this.editedExpression&&(this.editedExpression.inEditMode=!1,this.editedExpression.expression.dimension||this.deleteItem(this.editedExpression),this.editedExpression=null)}operandCanBeCommitted(){return this.selectedDimension&&this.selectedCondition&&!!this.searchValue}exitOperandEdit(){this.editedExpression&&(this.operandCanBeCommitted()?this.commitOperandEdit():this.cancelOperandEdit())}isExpressionGroup(expression){return expression instanceof ExpressionGroupItem}addGroup(operator,parent,afterExpression){this.cancelOperandAdd();const groupItem=new ExpressionGroupItem(operator,parent);if(parent)if(afterExpression){const index=parent.children.indexOf(afterExpression);parent.children.splice(index+1,0,groupItem)}else parent.children.push(groupItem);else this.rootGroup=groupItem;this.addCondition(groupItem),this.currentGroup=groupItem}enterExpressionEdit(expressionItem){this.clearSelection(),this.exitOperandEdit(),this.cancelOperandAdd(),this.editedExpression&&(this.editedExpression.inEditMode=!1),expressionItem.hovered=!1,this.selectedDimension=expressionItem.expression.dimension,this.selectedCondition=expressionItem.expression.operator?expressionItem.expression.operator:null,this.searchValue=expressionItem.expression.members?.[0]?.value,this.highValue=expressionItem.expression.members?.[1]?.value,expressionItem.inEditMode=!0,this.editedExpression=expressionItem,this.cdr.detectChanges(),this.selectedDimension||this.columnSelect.focus()}getPropertyByName(path){return this.filterableColumns.find((item=>item.name===path))}clearSelection(){for(const group of this.selectedGroups)group.selected=!1;this.selectedGroups=[];for(const expr of this.selectedExpressions)expr.selected=!1;this.selectedExpressions=[],this.toggleContextMenu()}enterExpressionAdd(expressionItem){this.clearSelection(),this.exitOperandEdit(),this.addModeExpression&&(this.addModeExpression.inAddMode=!1),expressionItem.inAddMode=!0,this.addModeExpression=expressionItem,expressionItem.selected&&this.toggleExpression(expressionItem)}onToggleExpression(expressionItem){this.exitOperandEdit(),this.toggleExpression(expressionItem)}toggleExpression(expressionItem){if(expressionItem.selected=!expressionItem.selected,expressionItem.selected)this.selectedExpressions.push(expressionItem);else{const index=this.selectedExpressions.indexOf(expressionItem);this.selectedExpressions.splice(index,1),this.deselectParentRecursive(expressionItem)}}toggleContextMenu(){const contextualGroup=this.findSingleSelectedGroup();(contextualGroup||this.selectedExpressions.length>1)&&(this.contextualGroup=contextualGroup,contextualGroup&&(this.filteringLogics=[{label:this.resourceStrings?.igx_grid_filter_operator_and,selected:contextualGroup.operator===src.vLo.And},{label:this.resourceStrings?.igx_grid_filter_operator_or,selected:contextualGroup.operator===src.vLo.Or}]))}findSingleSelectedGroup(){for(const group of this.selectedGroups){if(this.selectedExpressions.every((op=>this.isInsideGroup(op,group))))return group}return null}isInsideGroup(item,group){return!!item&&(item.parent===group||this.isInsideGroup(item.parent,group))}deleteItem(expressionItem){if(!expressionItem.parent)return this.rootGroup=null,void(this.currentGroup=null);expressionItem===this.currentGroup&&(this.currentGroup=this.currentGroup.parent);const children=expressionItem.parent.children,index=children.indexOf(expressionItem);children.splice(index,1),children.length||this.deleteItem(expressionItem.parent)}onChipRemove(expressionItem){this.deleteItem(expressionItem)}onChipClick(expressionItem){this._clickTimer=setTimeout((()=>{this._preventChipClick||this.onToggleExpression(expressionItem),this._preventChipClick=!1}),this._dblClickDelay)}onChipDblClick(expressionItem){clearTimeout(this._clickTimer),this._preventChipClick=!0,this.enterExpressionEdit(expressionItem)}getConditionFriendlyName(name){return this.resourceStrings?.[`igx_grid_filter_${name}`]||name}getConditionList(){return this.selectedDimension?function getFilterConditionByProperty(dim){return Object.keys(src.pgc)}(this.selectedDimension):[]}onGroupClick(groupItem){this.toggleGroup(groupItem)}toggleGroup(groupItem){this.exitOperandEdit(),this.currentGroup=groupItem}toggleGroupRecursive(groupItem,selected){}deselectParentRecursive(expressionItem){}invokeClick(eventArgs){"Enter"!==eventArgs.key&&" "!==eventArgs.key&&"Spacebar"!==eventArgs.key||(eventArgs.preventDefault(),eventArgs.currentTarget.click())}context(expression,afterExpression){return{$implicit:expression,afterExpression}}onClearButtonClick(event){this.rootGroup=null}onChipSelectionEnd(){const contextualGroup=this.findSingleSelectedGroup();(contextualGroup||this.selectedExpressions.length>1)&&(this.contextualGroup=contextualGroup)}getConditionByFilterOperator(operator){return{iconName:"contains",isUnary:!0}}openValueHelp(dimension){var _this=this;return(0,asyncToGenerator.Z)((function*(){return(0,firstValueFrom.z)(_this.dialog.open(value_help_component.v,{viewContainerRef:_this._viewContainerRef,data:{dataSettings:_this.data.dataSettings,dimension,options:{initialLevel:1,searchable:!0,showAllMember:!1}}}).afterClosed())}))()}openLowValueHelp(dimension){var _this2=this;return(0,asyncToGenerator.Z)((function*(){const slicer=yield _this2.openValueHelp(dimension);slicer&&(_this2.searchValue=slicer.members?.[0]?.value)}))()}openHighValueHelp(dimension){var _this3=this;return(0,asyncToGenerator.Z)((function*(){const slicer=yield _this3.openValueHelp(dimension);slicer&&(_this3.highValue=slicer.members?.[0]?.value)}))()}onApply(){this.dialogRef.close(convertExpressionItem2Filter(this.rootGroup))}isDate(value){return"[object Date]"===Object.prototype.toString.call(value)}},_NgmAdvancedFilterComponent.ctorParameters=()=>[{type:core.ChangeDetectorRef},{type:dialog.uw},{type:core.ViewContainerRef},{type:void 0,decorators:[{type:core.Optional},{type:core.Inject,args:[dialog.WI]}]},{type:dialog.so,decorators:[{type:core.Optional}]}],_NgmAdvancedFilterComponent.propDecorators={isDialogContainer:[{type:core.HostBinding,args:["class.ngm-dialog-container"]}],syntax:[{type:core.Input}],entitySet:[{type:core.Input}],entityType:[{type:core.Input}],resourceStrings:[{type:core.Input}],columnSelect:[{type:core.ViewChild,args:["columnSelect",{read:property_select_component.$}]}]},_NgmAdvancedFilterComponent);function convertExpressionItem2Filter(item){return item instanceof ExpressionGroupItem?{filteringLogic:item.operator,children:item.children.map((item=>convertExpressionItem2Filter(item)))}:item instanceof ExpressionOperandItem?item.expression:null}function convertFilter2ExpressionItem(iFilter,parent){if((0,src.wMY)(iFilter)){const exGroupItem=new ExpressionGroupItem(iFilter.filteringLogic,parent);return exGroupItem.children=iFilter.children.map((item=>convertFilter2ExpressionItem(item,exGroupItem))),exGroupItem}return new ExpressionOperandItem(iFilter,parent)}NgmAdvancedFilterComponent=(0,tslib_es6.gn)([(0,core.Component)({selector:"ngm-advanced-filter",template:'<header mat-dialog-title cdkDrag cdkDragRootElement=".cdk-overlay-pane" cdkDragHandle>\n    <h4 class="pac-typography__h6" style="pointer-events: none;">\n        {{ \'Ngm.AdvancedFilter.Title\' | translate: {Default: \'Combination Slicer\'} }}\n    </h4>\n    <div class="pac-filter-legend">\n        <div class="pac-filter-legend__item pac-filter-legend__item--and">\n            <span>{{ \'Ngm.AdvancedFilter.AND\' | translate: {Default: \'AND\'} }}</span>\n        </div>\n        <div class="pac-filter-legend__item pac-filter-legend__item--or">\n            <span>{{ \'Ngm.AdvancedFilter.OR\' | translate: {Default: \'OR\'} }}</span>\n        </div>\n    </div>\n</header>\n\n<mat-dialog-content class="mat-typography">\n    <ng-container *ngIf="!rootGroup">\n        <div class="flex gap-2">\n            <button #addRootAndGroupButton mat-stroked-button color="accent" ngmAppearance="dashed"\n                (click)="addAndGroup()"\n            >\n                <mat-icon>add</mat-icon>\n                <span>"{{ \'Ngm.AdvancedFilter.AND\' | translate: {Default: \'AND\'} }}" {{ \'Ngm.AdvancedFilter.GROUP\' | translate: {Default: \'GROUP\'} }}</span>\n            </button>\n\n            <button mat-stroked-button color="accent" ngmAppearance="dashed" (click)="addOrGroup()">\n                <mat-icon>add</mat-icon>\n                <span>"{{ \'Ngm.AdvancedFilter.OR\' | translate: {Default: \'OR\'} }}" {{ \'Ngm.AdvancedFilter.GROUP\' | translate: {Default: \'GROUP\'} }}</span>\n            </button>\n        </div>\n        \n        <div class="pac-filter-empty">\n            <h6 class="pac-filter-empty__title">\n                {{ \'Ngm.AdvancedFilter.Tips\' | translate: {Default: \'Start with creating a group of conditions linked with "And" or "Or"\'} }}\n            </h6>\n        </div>\n    </ng-container>\n\n    <ng-template #filterOperandTemplate let-expressionItem>\n        <div *ngIf="!expressionItem.inEditMode"\n            class="pac-filter-tree__expression-item"\n            (mouseenter)="expressionItem.hovered = true"\n            (mouseleave)="expressionItem.hovered = false"\n            >\n\n            <mat-chip-listbox >\n                <mat-chip-option [value]="expressionItem" [selected]="expressionItem.selected" removable selectable\n                    (removed)="onChipRemove(expressionItem)">\n                    <mat-chip-avatar>\n                        <button mat-icon-button displayDensity="cosy" (click)="enterExpressionEdit(expressionItem)">\n                            <mat-icon fontSet="material-icons-outlined">edit</mat-icon>\n                        </button>\n                    </mat-chip-avatar>\n                    <span class="pac-filter-tree__expression-column">{{ expressionItem.columnHeader || expressionItem.expression.dimension?.dimension }}</span>\n                    <span class="pac-filter-tree__expression-condition">\n                        {{ getConditionFriendlyName(expressionItem.expression.operator) }}\n                    </span>\n                    <span >\n                        {{ isDate(expressionItem.expression.members?.[0].value) ? (expressionItem.expression.members?.[0].value | date) : expressionItem.expression.members?.[0].value }}\n                    </span>\n                    <span *ngIf="expressionItem.expression.operator === FilterOperator.BT">\n                        =>\n                        {{ isDate(expressionItem.expression.members?.[1]?.value) ? (expressionItem.expression.members?.[1]?.value | date) : expressionItem.expression.members?.[1]?.value }}\n                    </span>\n\n                    <button matChipRemove>\n                        <mat-icon>cancel</mat-icon>\n                    </button>\n                </mat-chip-option>\n              </mat-chip-listbox>\n\n            <div class="pac-filter-tree__expression-actions"\n                *ngIf="(expressionItem.selected && selectedExpressions.length === 1) || expressionItem.hovered">\n            </div>\n        </div>\n\n        <div *ngIf="expressionItem.inEditMode"\n             #editingInputsContainer\n             class="pac-filter-tree__inputs flex gap-2"\n            >\n\n            <ngm-property-select #columnSelect floatLabel="always" displayDensity="cosy"\n                required\n                [entityType]="entityType"\n                [capacities]="[PropertyCapacity.Dimension]"\n                [ngModel]="selectedDimension"\n                (ngModelChange)="selectedDimension=$event">\n            </ngm-property-select>\n\n            <mat-form-field appearance="fill" floatLabel="always" displayDensity="cosy">\n                <mat-label>\n                    {{ \'Ngm.AdvancedFilter.Operator\' | translate: {Default: \'Operator\'} }}\n                </mat-label>\n                <mat-select required [(ngModel)]="selectedCondition"\n                    [disabled]="!selectedDimension">\n                  <mat-option *ngFor="let operator of operators" [value]="operator.value">\n                    <span class="pac-grid__filtering-dropdown-text">{{operator.label}}</span>\n                  </mat-option>\n                </mat-select>\n            </mat-form-field>\n            \n            <mat-form-field *ngIf="selectedDimension" appearance="fill" floatLabel="always" displayDensity="cosy">\n                <mat-label>{{ \'Ngm.AdvancedFilter.Value\' | translate: {Default: \'Value\'} }}</mat-label>\n                <input matInput [(ngModel)]="searchValue" [disabled]="!selectedDimension" required>\n                <button mat-icon-button matSuffix [disabled]="!selectedDimension" (click)="openLowValueHelp(selectedDimension)">\n                    <mat-icon>help_outline</mat-icon>\n                </button>\n            </mat-form-field>\n\n            <mat-form-field *ngIf="selectedDimension && selectedCondition === FilterOperator.BT" appearance="fill" floatLabel="always" displayDensity="cosy">\n                <mat-label>{{ \'Ngm.AdvancedFilter.Value\' | translate: {Default: \'Value\'} }}</mat-label>\n                <input matInput [(ngModel)]="highValue" [disabled]="!selectedDimension" required>\n                <button mat-icon-button matSuffix [disabled]="!selectedDimension" (click)="openHighValueHelp(selectedDimension)">\n                    <mat-icon>help_outline</mat-icon>\n                </button>\n            </mat-form-field>\n\n            <div class="pac-filter-tree__inputs-actions">\n                <button mat-icon-button color="primary"\n                        [disabled]="!operandCanBeCommitted()"\n                        (click)="commitOperandEdit()">\n                    <mat-icon>check</mat-icon>\n                </button>\n                <button mat-icon-button ngmAppearance="danger"\n                        (click)="cancelOperandEdit()">\n                    <mat-icon>close</mat-icon>\n                </button>\n            </div>\n        </div>\n    </ng-template>\n    \n    <ng-template #addExpressionsTemplate let-expressionItem let-afterExpression="afterExpression">\n        <button #addConditionButton\n            mat-stroked-button color="accent" ngmAppearance="dashed"\n                [disabled]="!!editedExpression"\n                (click)="addCondition(expressionItem, afterExpression)"\n        >\n            <mat-icon>add</mat-icon>\n            <span>{{ \'Ngm.AdvancedFilter.Condition\' | translate: {Default: \'Condition\'} }}</span>\n        </button>\n\n        <button mat-stroked-button color="accent" ngmAppearance="dashed"\n                [disabled]="!!editedExpression"\n                (click)="addAndGroup(expressionItem, afterExpression)">\n                <mat-icon>add</mat-icon>\n            <span>{{ \'Ngm.AdvancedFilter.AddGroup\' | translate: {Default: \'"ADD" GROUP\'} }}</span>\n        </button>\n\n        <button mat-stroked-button color="accent" ngmAppearance="dashed"\n                [disabled]="!!editedExpression"\n                (click)="addOrGroup(expressionItem, afterExpression)">\n            <mat-icon>add</mat-icon>\n            <span>{{ \'Ngm.AdvancedFilter.OrGroup\' | translate: {Default: \'"OR" GROUP\'} }}</span>\n        </button>\n    </ng-template>\n\n    <ng-template #expressionTreeTemplate let-expressionItem>\n        <div class="pac-filter-tree">\n            <div tabindex="0"\n                 class="pac-filter-tree__line"\n                 [ngClass]="{\n                    \'pac-filter-tree__line--and\': expressionItem.operator === 0,\n                    \'pac-filter-tree__line--or\': expressionItem.operator === 1,\n                    \'pac-filter-tree__line--selected\': expressionItem.selected\n                 }"\n                 (keydown)="invokeClick($event)"\n                 (click)="onGroupClick(expressionItem)"\n            ></div>\n\n            <div class="pac-filter-tree__expression">\n                <ng-container *ngFor="let expr of expressionItem.children">\n                    <ng-container *ngTemplateOutlet="isExpressionGroup(expr) ? expressionTreeTemplate : filterOperandTemplate; context: context(expr)"></ng-container>\n                </ng-container>\n                <div *ngIf="currentGroup === expressionItem" class="pac-filter-tree__buttons flex gap-4"\n                    #currentGroupButtonsContainer\n                >\n                    <ng-container *ngTemplateOutlet="addExpressionsTemplate; context: context(expressionItem)"></ng-container>\n                    <button mat-stroked-button color="accent" \n                            *ngIf="expressionItem !== rootGroup"\n                            [disabled]="!!editedExpression || expressionItem.children.length < 2"\n                            (click)="endGroup(expressionItem)">\n                        <span>{{ \'Ngm.AdvancedFilter.EndGroup\' | translate: {Default: \'END GROUP\'} }}</span>\n                    </button>\n\n                    <button mat-stroked-button color="accent" ngmAppearance="danger"\n                            *ngIf="expressionItem !== rootGroup"\n                            [disabled]="!!editedExpression"\n                            (click)="onChipRemove(expressionItem)">\n                        <span>{{ \'Ngm.AdvancedFilter.DeleteGroup\' | translate: {Default: \'DELETE GROUP\'} }}</span>\n                    </button>\n                </div>\n            </div>\n        </div>\n\n    </ng-template>\n\n    <ng-container *ngIf="rootGroup">\n        <ng-container *ngTemplateOutlet="expressionTreeTemplate; context: context(rootGroup)"></ng-container>\n    </ng-container>\n\n</mat-dialog-content>\n<mat-dialog-actions>\n    <button mat-button (click)="onClearButtonClick($event)">\n        {{ \'Ngm.Common.Clear\' | translate: {Default: \'Clear\'} }}\n    </button>\n    <div ngmButtonGroup>\n        <button mat-button mat-dialog-close>{{ \'Ngm.Common.Cancel\' | translate: {Default: \'Cancel\'} }}</button>\n        <button mat-raised-button color="accent" (click)="onApply()" cdkFocusInitial>{{ \'Ngm.Common.Apply\' | translate: {Default: \'Apply\'} }}</button>\n    </div>\n</mat-dialog-actions>\n',host:{class:"ngm-advanced-filter"},styles:[advanced_filter_componentngResource_default()]}),(0,tslib_es6.w6)("design:paramtypes",[core.ChangeDetectorRef,dialog.uw,core.ViewContainerRef,Object,dialog.so])],NgmAdvancedFilterComponent)},"./packages/angular/selection/advanced-filter/advanced-filter.stories.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,actionsData:()=>actionsData,default:()=>advanced_filter_stories});var dist=__webpack_require__("./node_modules/@storybook/angular/dist/index.mjs"),http=__webpack_require__("./node_modules/@angular/common/fesm2022/http.mjs"),animations=__webpack_require__("./node_modules/@angular/platform-browser/fesm2022/animations.mjs"),provider=__webpack_require__("./packages/angular/mock/provider.ts"),translate=__webpack_require__("./packages/angular/mock/translate.ts"),addon_actions_dist=__webpack_require__("./node_modules/@storybook/addon-actions/dist/index.mjs"),advanced_filter_component=__webpack_require__("./packages/angular/selection/advanced-filter/advanced-filter.component.ts"),tslib_es6=__webpack_require__("./node_modules/tslib/tslib.es6.js"),drag_drop=__webpack_require__("./node_modules/@angular/cdk/fesm2022/drag-drop.mjs"),common=__webpack_require__("./node_modules/@angular/common/fesm2022/common.mjs"),core=__webpack_require__("./node_modules/@angular/core/fesm2022/core.mjs"),fesm2022_forms=__webpack_require__("./node_modules/@angular/forms/fesm2022/forms.mjs"),fesm2022_button=__webpack_require__("./node_modules/@angular/material/fesm2022/button.mjs"),chips=__webpack_require__("./node_modules/@angular/material/fesm2022/chips.mjs"),dialog=__webpack_require__("./node_modules/@angular/material/fesm2022/dialog.mjs"),form_field=__webpack_require__("./node_modules/@angular/material/fesm2022/form-field.mjs"),icon=__webpack_require__("./node_modules/@angular/material/fesm2022/icon.mjs"),input=__webpack_require__("./node_modules/@angular/material/fesm2022/input.mjs"),fesm2022_select=__webpack_require__("./node_modules/@angular/material/fesm2022/select.mjs"),button_group_directive=__webpack_require__("./packages/angular/core/directives/button-group.directive.ts"),displayDensity=__webpack_require__("./packages/angular/core/directives/displayDensity.ts"),appearance=__webpack_require__("./packages/angular/core/directives/appearance.ts"),entity_module=__webpack_require__("./packages/angular/entity/entity.module.ts"),ngx_translate_core=__webpack_require__("./node_modules/@ngx-translate/core/dist/fesm2022/ngx-translate-core.mjs");let NgmAdvancedFilterModule=class NgmAdvancedFilterModule{};NgmAdvancedFilterModule=(0,tslib_es6.gn)([(0,core.NgModule)({declarations:[advanced_filter_component.JJ],imports:[common.CommonModule,fesm2022_forms.u5,drag_drop._t,dialog.Is,fesm2022_button.ot,icon.Ps,form_field.lN,fesm2022_select.LD,input.c,chips.Hi,ngx_translate_core.aw,button_group_directive.d,displayDensity.Z,appearance.A,entity_module.Q],exports:[advanced_filter_component.JJ]})],NgmAdvancedFilterModule);const actionsData={onPinTask:(0,addon_actions_dist.aD)("onPinTask"),onArchiveTask:(0,addon_actions_dist.aD)("onArchiveTask")},advanced_filter_stories={title:"Selection/AdvancedFilter",component:advanced_filter_component.JJ,excludeStories:/.*Data$/,tags:["autodocs"],decorators:[(0,dist.applicationConfig)({providers:[(0,animations.provideAnimations)(),(0,http.h_)(),(0,provider.Y)(),(0,translate.qX)()]}),(0,dist.moduleMetadata)({declarations:[],imports:[NgmAdvancedFilterModule]}),(0,dist.componentWrapperDecorator)((story=>`<div style="margin: 3em">${story}</div>`))],render:args=>({props:{...args},template:`<ngm-advanced-filter ${(0,dist.argsToTemplate)(args)}></ngm-advanced-filter>`})},Default={args:{}};Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"{\n  args: {}\n}",...Default.parameters?.docs?.source}}};const __namedExportsOrder=["actionsData","Default"]}}]);