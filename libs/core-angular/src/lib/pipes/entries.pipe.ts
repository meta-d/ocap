import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'entries'
})
export class EntriesPipe implements PipeTransform {

  transform<T>(value: T, args?: any): [keyof T, any][] {
    return Object.entries(value) as [keyof T, any][]
  }

}
