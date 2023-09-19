// import { Component, forwardRef, Input, OnDestroy } from '@angular/core'
// import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
// import { EntityType } from '@metad/ocap-core'
// import { assign, isNil, negate } from 'lodash-es'
// import { BehaviorSubject, combineLatest } from 'rxjs'
// import { filter, map } from 'rxjs/operators'
// import { conf, language } from '../mdx'
// import {
//   createDocumentSemanticTokensProvider,
//   createHierarchyProvider,
//   createHoverProvider,
//   createSignatureHelpProvider,
//   createSuffixProvider,
//   functionProposals,
// } from '../mdx-language-providers'

// const languageId = 'mdx'


// /**
//  * @deprecated
//  */
// @Component({
//   selector: 'ngm-calculated-member',
//   templateUrl: './calculated-member.component.html',
//   styleUrls: ['./calculated-member.component.scss'],
//   host: {
//     class: 'ngm-calculated-member',
//   },
//   providers: [
//     {
//       provide: NG_VALUE_ACCESSOR,
//       multi: true,
//       useExisting: forwardRef(() => CalculatedMemberComponent),
//     },
//   ],
// })
// export class CalculatedMemberComponent implements ControlValueAccessor, OnDestroy {
//   // EntityType
//   @Input() get entityType() {
//     return this._entityType$.value
//   }
//   set entityType(value) {
//     this._entityType$.next(value)
//   }
//   private _entityType$ = new BehaviorSubject<EntityType>(null)

//   // CodeEditor options
//   @Input() get options() {
//     return this._options$.value
//   }
//   set options(value) {
//     this._options$.next(value)
//   }
//   private _options$ = new BehaviorSubject({})

//   // CodeEditor
//   get editor() {
//     return this.editor$.value
//   }
//   private editor$ = new BehaviorSubject<editor.ICodeEditor>(null)

//   private defaultOptions = {
//     theme: 'vs',
//     language: languageId,
//     automaticLayout: true
//   }
//   public editorOptions$ = this._options$.pipe(map(options => assign({}, this.defaultOptions, options)))

//   statement: string = ''

//   private _providers = []
//   private _onChange: any

//   ngOnInit() {
//     combineLatest([
//       this.editor$.pipe(filter(negate(isNil))),
//       this._entityType$.pipe(filter(negate(isNil)))
//     ]).subscribe(([editor, entityType]) => {
      
//       this.dispose()

//       this._providers.push(languages.registerCompletionItemProvider(languageId, functionProposals))
//       this._providers.push(languages.registerCompletionItemProvider(languageId, createHierarchyProvider(entityType)))
//       this._providers.push(languages.registerCompletionItemProvider(languageId, createSuffixProvider(entityType)))
//       this._providers.push(languages.registerSignatureHelpProvider(languageId, createSignatureHelpProvider()))
//       this._providers.push(languages.registerHoverProvider(languageId, createHoverProvider(entityType)))
    
//       this._providers.push(
//         languages.registerDocumentSemanticTokensProvider('plaintext', createDocumentSemanticTokensProvider(entityType))
//       )
//     })
//   }

//   onModelChange(event) {
//     this._onChange?.(this.statement)
//   }

//   writeValue(obj: any): void {
//     this.statement = obj
//   }
//   registerOnChange(fn: any): void {
//     this._onChange = fn
//   }
//   registerOnTouched(fn: any): void {}
//   setDisabledState?(isDisabled: boolean): void {}

//   onFunctionClick(item) {
//     let selection = this.editor.getSelection()
//     const id = { major: 1, minor: 1 }
//     const text = item.insertText
//     const op = { identifier: id, range: selection, text: text, forceMoveMarkers: true }
//     this.editor.executeEdits('my-function', [op])
//     selection = this.editor.getSelection()
//     this.editor.setPosition({
//       lineNumber: selection.positionLineNumber,
//       column: selection.positionColumn - 1,
//     })
//     this.editor.focus()
//   }

//   onInit(editor: any) {
//     languages.register({
//       id: languageId,
//       extensions: ['.mdx'],
//       aliases: ['MDX'],
//     })

//     languages.setMonarchTokensProvider(languageId, language)
//     languages.setLanguageConfiguration(languageId, conf)
//     this.editor$.next(editor)
//   }

//   onResized(event) {
//     this.editor?.layout()
//   }

//   dispose() {
//     this._providers.forEach((provider) => provider.dispose())
//   }
  
//   ngOnDestroy(): void {
//     this.dispose()
//   }
// }
