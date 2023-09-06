import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { MatAutocomplete } from '@angular/material/autocomplete'
import { MatChipInputEvent } from '@angular/material/chips'
import { ActivatedRoute } from '@angular/router'
import { isNotEmpty, nonNullable } from '@metad/core'
import { isNil, isString } from 'lodash-es'
import { asyncScheduler, BehaviorSubject, EMPTY, Observable, Subject } from 'rxjs'
import { catchError, debounceTime, filter, map, startWith, switchMap, withLatestFrom } from 'rxjs/operators'
import { InsightService } from '../../../@core'
import { AppService } from '../../../app.service'
import { PACInsightBoardService } from '../insight.service'

@Component({
  selector: 'pac-insight-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  host: {
    class: 'pac-insight-board',
  },
  providers: [PACInsightBoardService],
})
export class PACInsgihtBoardComponent implements OnInit {
  @Input() show: boolean

  stories$ = this.boardService.stories$
  // filterContainer = new NxFilterContainer()

  searchControl = new UntypedFormControl()
  filteredOptions: Observable<any[]>
  keyWords: any[] = []
  // selectable = true
  // removable = true
  // addOnBlur = true
  separatorKeysCodes: number[] = [ENTER, COMMA]
  
  @ViewChild('questionInput') questionInput: ElementRef<HTMLInputElement>
  @ViewChild('boardBody') boardBody: ElementRef<HTMLInputElement>
  @ViewChild(MatAutocomplete) autoComplete: MatAutocomplete

  autoCompleteOpen$ = new BehaviorSubject(false)
  enter$ = new Subject<void>()
  // model: any
  constructor(
    public appService: AppService,
    public boardService: PACInsightBoardService,
    public insightService: InsightService,
    private readonly _route: ActivatedRoute,
    private readonly _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._route.queryParams.subscribe((params) => {
      console.warn(params)
      if (params.modelId) {
        this.boardService.createStory(params as any)
      }
    })

    this.filteredOptions = this.searchControl.valueChanges.pipe(
      filter(nonNullable),
      filter(value => isString(value)),
      startWith(''),
      debounceTime(500),
      switchMap(statement => {
        console.warn(statement)
        return this.insightService.suggests(this.keyWords.map(item => item.word).join('')+statement)
          .pipe(catchError((err, caught) => EMPTY))
      }),
      map((suggests) => {
        console.warn(suggests)
        return suggests
      })
    )

    this.enter$.pipe(
      withLatestFrom(this.autoCompleteOpen$),
      filter(([,open]) => !open)
    ).subscribe(() => {
      this.confirm()
    })
  }

  close(event) {
    this.appService.toggleInsight()
  }

  remove(item) {
    this.boardService.removeStory(item)
  }

  onQuestionSelected(event) {
    if (event?.option) {
      this.autoCompleteOpen$.next(true)
      this.setQuestion(event.option.value)
    }

    // this.questionInput.nativeElement.value = '';
    // this.searchControl.setValue(null);

    // this.boardService.createStory({ modelId: 'ab340a89-4d70-4b91-bb9b-045f9186f2f2' })
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      // this.fruits.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.searchControl.setValue(null);
  }

  setQuestion(option) {
    this.keyWords = option
    this.questionInput.nativeElement.value = '';
    this.searchControl.setValue(null);
  }

  onQuestionBackspace(event) {
    // console.warn(event)
    // console.warn(event.target.selectionStart)
    event.stopPropagation()
    event.preventDefault()
    const selectionStart = event.target.selectionStart
    let result = ''
    if (isNil(this.questionInput.nativeElement.value) || this.questionInput.nativeElement.value === '') {
      if(isNotEmpty(this.keyWords)) {
        const keyword = this.keyWords[this.keyWords.length - 1]
        this.keyWords = this.keyWords.slice(0, this.keyWords.length - 1)
        result = keyword.word.slice(0, -1)
      }

    } else {
      const text = this.questionInput.nativeElement.value
      result = text.slice(0, selectionStart - 1) + text.slice(selectionStart, text.length)
    }

    this.questionInput.nativeElement.value = result
    this.searchControl.setValue(result)

    asyncScheduler.schedule(() => {
      this.questionInput.nativeElement.focus()
      this.questionInput.nativeElement.setSelectionRange(selectionStart - 1, selectionStart - 1)
    })
  }

  onAutoCompClose(event) {
    // 让 closed 状态事件晚于 enter 事件
    asyncScheduler.schedule(() => {
      this.autoCompleteOpen$.next(false)
    })
  }

  onEnter(event) {
    this.enter$.next()
  }

  onSearch(event) {
    this.enter$.next()
    // this.confirm()
  }

  confirm() {

    this.boardService.addStory(this.keyWords)

    // this.boardService.createStory({
    //   ...this.model,
    //   modelId: 'ab340a89-4d70-4b91-bb9b-045f9186f2f2',
    //   keyWords: this.keyWords
    // })

    this.questionInput.nativeElement.value = ''
    this.searchControl.setValue(null)
    this.keyWords = []

    asyncScheduler.schedule(() => {
      this.boardBody.nativeElement.scrollTo({
        top: this.boardBody.nativeElement.scrollHeight - this.boardBody.nativeElement.clientHeight
      })
    }, 200)
  }
}
