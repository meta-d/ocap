import { inject, Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import { XpertStudioApiService } from './xpert-api.service';

@Injectable()
export class SelectionService {
  readonly apiService = inject(XpertStudioApiService)

  private selection: Subject<ISelectionEvent> = new Subject<ISelectionEvent>();

  public get selection$(): Observable<ISelectionEvent> {
    return this.selection.asObservable();
  }

  private column: string | null = null;

  private tables: string[] = [];

  public singleNode$ = this.selection$.pipe(
    map((event) => event.tables?.[0] ? this.apiService.getNode(event.tables[0]) : null)
  )

  public setColumn(table: string, column: string | null): void {
    this.tables = [table];
    this.column = column;
    this.selection.next({ tables: this.tables, column: this.column });
  }

  public setTables(tables: string[]): void {
    this.tables = tables;
    this.column = null;
    this.selection.next({ tables: this.tables, column: this.column });
  }

  public reset(): void {
    this.tables = [];
    this.column = null;
    this.selection.next({ tables: this.tables, column: this.column });
  }

  public getColumn(): string | null {
    return this.column;
  }
}

export interface ISelectionEvent {
  nodes?: string[];

  tables: string[];
  column: string | null;
}
