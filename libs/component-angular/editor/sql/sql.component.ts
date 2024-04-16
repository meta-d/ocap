// @ts-nocheck

import { Component, forwardRef, input, Input, OnInit } from '@angular/core'
import { NG_VALUE_ACCESSOR } from '@angular/forms'
import { nonNullable } from '@metad/core'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { filter } from 'rxjs/operators'
import { format } from 'sql-formatter'
import { BaseEditorDirective } from '../editor.directive'
import { createInfoProvider } from '../providers/index'

@Component({
  selector: 'ngm-editor-sql',
  templateUrl: './sql.component.html',
  styleUrls: ['./sql.component.scss'],
  host: {
    class: 'ngm-editor-sql'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SQLEditorComponent)
    },
    {
      provide: BaseEditorDirective,
      useExisting: SQLEditorComponent
    }
  ]
})
export class SQLEditorComponent extends BaseEditorDirective implements OnInit {
  readonly entityType = input<EntityType>()

  // EntityType
  @Input() get entitySets() {
    return this._entitySets$.value
  }
  set entitySets(value) {
    this._entitySets$.next(value)
  }
  private _entitySets$ = new BehaviorSubject<Array<EntitySet>>(null)

  // EntityType
  // @Input() get entityType() {
  //   return this._entityType$.value
  // }
  // set entityType(value) {
  //   this._entityType$.next(value)
  // }
  // private _entityType$ = new BehaviorSubject<EntityType>(null)

  languageId = 'sql'

  ngOnInit(): void {
    // 要使用 `monaco.languages.` 进行调用, 不能使用 `languages.`
    combineLatest([
      this.editor$.pipe(filter(nonNullable)),
      this._entitySets$,
      // this._entityType$.pipe(filter(nonNullable))
    ]).subscribe(([editor, entitySets]) => {
      this.dispose()

      // define a document formatting provider
      // then you contextmenu will add an "Format Document" action
      this._providers.push(
        monaco.languages.registerDocumentFormattingEditProvider(this.languageId, {
          provideDocumentFormattingEdits(model, options) {
            const formatted = format(model.getValue(), {
              indent: ' '.repeat(options.tabSize)
            })
            return [
              {
                range: model.getFullModelRange(),
                text: formatted
              }
            ]
          }
        })
      )

      // define a range formatting provider
      // select some codes and right click those codes
      // you contextmenu will have an "Format Selection" action
      this._providers.push(
        monaco.languages.registerDocumentRangeFormattingEditProvider(this.languageId, {
          provideDocumentRangeFormattingEdits(model, range, options) {
            const formatted = format(model.getValueInRange(range), {
              indent: ' '.repeat(options.tabSize)
            })
            return [
              {
                range: range,
                text: formatted
              }
            ]
          }
        })
      )

      if (entitySets) {
        this._providers.push(
          monaco.languages.registerCompletionItemProvider(this.languageId, createInfoProvider(entitySets))
        )
      }

      // this._providers.push(monaco.languages.registerCompletionItemProvider(this.languageId, createHierarchyProvider(entityType)))
      // this._providers.push(monaco.languages.registerCompletionItemProvider(this.languageId, createSuffixProvider(entityType)))
      // this._providers.push(monaco.languages.registerSignatureHelpProvider(this.languageId, createSignatureHelpProvider()))
      // this._providers.push(monaco.languages.registerHoverProvider(this.languageId, createHoverProvider(entityType)))

      // this._providers.push(
      //   monaco.languages.registerDocumentSemanticTokensProvider('plaintext', createDocumentSemanticTokensProvider(entityType))
      // )
    })
  }
}
