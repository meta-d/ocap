import React, { useState } from 'react';
import { AddTodo } from './add-todo/add-todo';
import { useObservable } from '@ngneat/use-observable';
import {
  TodosProps,
  Todo,
} from '@metad/ocap-core';
import { TodoItem } from './todo/todo';
import { Filters } from './filters/filters';
import { createState, select, Store, withProps } from '@ngneat/elf';
import { addEntities, deleteEntities, selectAllEntitiesApply, updateEntities, withEntities } from '@ngneat/elf-entities';
import { switchMap } from 'rxjs';

const { state, config } = createState(
  withProps<TodosProps>({ filter: 'ALL' }),
  withEntities<Todo>()
);

export function Todos() {
  const [store] = useState(()=> new Store({ name: 'todos', state, config }));
  const filter$ = store.pipe(select(({ filter }) => filter));
  const [todos] = useObservable(
    filter$.pipe(
      switchMap((filter) => {
        return store.pipe(
          selectAllEntitiesApply({
            filterEntity({ completed }) {
              if (filter === 'ALL') return true;
              return filter === 'COMPLETED' ? completed : !completed;
            },
          })
        );
      })
    )
  );

  const updateTodosFilter = (filter: TodosProps['filter']) => {
    store.update((state) => ({
      ...state,
      filter,
    }));
  }

  const addTodo = (text: Todo['text']) => {
    store.update(
      addEntities({
        id: Math.random().toFixed(5),
        text,
        completed: false,
      })
    );
  }

  const deleteTodo = (id: Todo['id']) => {
    store.update(deleteEntities(id));
  }

  const updateTodoCompleted = (id: Todo['id']) => {
    store.update(
      updateEntities(id, (todo) => ({
        ...todo,
        completed: !todo.completed,
      }))
    );
  }

  return (
    <div>
      <Filters onChange={updateTodosFilter} />

      <AddTodo onAdd={addTodo} />

      <section className="mt-3">
        {todos.map((todo) => (
          <TodoItem
            {...todo}
            key={todo.id}
            onClick={updateTodoCompleted}
            onDelete={deleteTodo}
          />
        ))}
      </section>
    </div>
  );
}
