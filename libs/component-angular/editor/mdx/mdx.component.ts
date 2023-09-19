// @ts-nocheck

import { Component, forwardRef, Input } from '@angular/core'
import { NG_VALUE_ACCESSOR } from '@angular/forms'
import { nonNullable } from '@metad/core'
import { EntityType } from '@metad/ocap-core'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { filter, tap } from 'rxjs/operators'
import { BaseEditorDirective } from '../editor.directive'
import {
  conf,
  createHierarchyProvider,
  createHoverProvider,
  createParameterProvider,
  createSignatureHelpProvider,
  createSuffixProvider,
  functionProposals,
  language
} from '../providers/index'

@Component({
  selector: 'ngm-editor-mdx',
  templateUrl: './mdx.component.html',
  styleUrls: ['./mdx.component.scss'],
  host: {
    class: 'ngm-editor-mdx'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MDXEditorComponent)
    }
  ]
})
export class MDXEditorComponent extends BaseEditorDirective {
  // EntityType
  @Input() get entityType() {
    return this._entityType$.value
  }
  set entityType(value) {
    this._entityType$.next(value)
  }
  private _entityType$ = new BehaviorSubject<EntityType>(null)

  languageId = 'mdx'

  ngOnInit(): void {
    // 要使用 `monaco.languages.` 进行调用, 不能使用 `languages.`
    combineLatest([
      this.editor$.pipe(
        filter(nonNullable),
        tap((editor) => {
          monaco.languages.register({
            id: this.languageId,
            extensions: ['.mdx'],
            aliases: ['MDX']
          })

          monaco.languages.setMonarchTokensProvider(this.languageId, language)
          monaco.languages.setLanguageConfiguration(this.languageId, conf)
        })
      ),
      this._entityType$.pipe(filter(nonNullable))
    ]).subscribe(([editor, entityType]) => {
      this.dispose()

      // // SQL formatter 对 MDX 格式化效果不理想
      // this._providers.push(
      //   monaco.languages.registerDocumentFormattingEditProvider(this.languageId, {
      //     provideDocumentFormattingEdits(model, options) {
      //       const formatted = format(model.getValue(), {
      //         indent: ' '.repeat(options.tabSize)
      //       })
      //       return [
      //         {
      //           range: model.getFullModelRange(),
      //           text: formatted
      //         }
      //       ]
      //     }
      //   })
      // )

      this._providers.push(monaco.languages.registerCompletionItemProvider(this.languageId, functionProposals))
      this._providers.push(
        monaco.languages.registerCompletionItemProvider(this.languageId, createParameterProvider(entityType))
      )
      this._providers.push(
        monaco.languages.registerCompletionItemProvider(this.languageId, createHierarchyProvider(entityType))
      )
      this._providers.push(
        monaco.languages.registerCompletionItemProvider(this.languageId, createSuffixProvider(entityType))
      )
      this._providers.push(
        monaco.languages.registerSignatureHelpProvider(this.languageId, createSignatureHelpProvider())
      )
      this._providers.push(monaco.languages.registerHoverProvider(this.languageId, createHoverProvider(entityType)))

      // this._providers.push(
      //   monaco.languages.registerDocumentSemanticTokensProvider('plaintext', createDocumentSemanticTokensProvider(entityType))
      // )
    })
  }
}
