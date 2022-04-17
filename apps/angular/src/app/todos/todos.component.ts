import { Component, OnInit } from '@angular/core';
import { addTodo, visibleTodos$ } from '@metad/ocap-core';

@Component({
  selector: 'metad-ocap-todos',
  templateUrl: 'todos.component.html',
})
export class TodosComponent implements OnInit {
  visibleTodos$ = visibleTodos$;

  task = '';
  constructor() {}

  ngOnInit() {
  }

  addTask() {
    addTodo(this.task);
    this.task = '';
  }
}
