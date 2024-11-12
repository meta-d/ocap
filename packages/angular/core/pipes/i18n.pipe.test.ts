import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TestBed } from '@angular/core/testing';
import { NgmI18nPipe } from './i18n.pipe';

describe('NgmI18nPipe', () => {
  let pipe: NgmI18nPipe;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({})
      ],
      providers: [
        TranslateService,
        NgmI18nPipe
      ]
    });

    translateService = TestBed.inject(TranslateService);
    pipe = TestBed.inject(NgmI18nPipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the same string if input is a string', () => {
    const result = pipe.transform('Hello');
    expect(result).toBe('Hello');
  });

  it('should return null if input is null', () => {
    const result = pipe.transform(null);
    expect(result).toBeNull();
  });

  it('should return the input value if it is neither a string nor an object', () => {
    const result = pipe.transform(123);
    expect(result).toBe(123);
  });
});
